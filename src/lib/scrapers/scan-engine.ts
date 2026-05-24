import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { scrapeImmoweb } from './immoweb'
import { scrapeZimmo } from './zimmo'
import { scrapeRealo, scrapeImmovlan, scrapeHebbes, scrapeLogicImmo } from './generic-jsonld'
import { dedupKey, type SearchRegion, type ScrapedListing } from './types'

export type ScanReport = {
  regionId: string
  regionLabel: string
  totalScraped: number
  perSite: Record<string, { ok: boolean; count: number; error?: string }>
  newLeads: number
  mergedLeads: number
  skippedDuplicates: number
}

/**
 * Scant één regio over alle adapters (Immoweb + Zimmo voor nu), merget
 * de resultaten met dedup, insertt nieuwe leads, en update bestaande
 * met extra bron-URLs als ze al gevonden waren.
 */
export async function scanRegion(region: SearchRegion): Promise<ScanReport> {
  const report: ScanReport = {
    regionId: region.id,
    regionLabel: region.label,
    totalScraped: 0,
    perSite: {},
    newLeads: 0,
    mergedLeads: 0,
    skippedDuplicates: 0,
  }

  const adapters = [scrapeImmoweb, scrapeZimmo, scrapeRealo, scrapeImmovlan, scrapeHebbes, scrapeLogicImmo]
  const allListings: ScrapedListing[] = []

  for (const adapter of adapters) {
    const res = await adapter(region)
    if (res.ok) {
      report.perSite[res.site] = { ok: true, count: res.listings.length }
      allListings.push(...res.listings)
    } else {
      report.perSite[res.site] = { ok: false, count: 0, error: res.error }
    }
  }

  report.totalScraped = allListings.length

  if (allListings.length === 0) return report

  const admin = createAdminClient()

  // 1) Bepaal welke URLs al bestaan
  const urls = allListings.map((l) => l.sourceUrl)
  const { data: existingByUrl } = await admin
    .from('market_leads')
    .select('id, source_url, dedup_key, extra_source_urls')
    .in('source_url', urls)
  const knownUrls = new Set((existingByUrl ?? []).map((r: { source_url: string }) => r.source_url))

  // 2) Bepaal dedup-keys voor nieuwe listings + check bestaande
  const candidates = allListings.filter((l) => !knownUrls.has(l.sourceUrl))
  const candidatesWithKey = candidates.map((l) => ({ listing: l, key: dedupKey(l) }))
  const keysToCheck = candidatesWithKey
    .map((c) => c.key)
    .filter((k): k is string => k !== null)

  type LeadRow = { id: string; dedup_key: string | null; extra_source_urls: string[] }
  const existingByKey = new Map<string, LeadRow>()
  if (keysToCheck.length > 0) {
    const { data } = await admin
      .from('market_leads')
      .select('id, dedup_key, extra_source_urls')
      .in('dedup_key', keysToCheck)
    for (const r of (data ?? []) as LeadRow[]) {
      if (r.dedup_key) existingByKey.set(r.dedup_key, r)
    }
  }

  // 3) Per candidate: nieuwe lead OF merge naar bestaande
  const toInsert: Array<Record<string, unknown>> = []
  const toUpdate: Array<{ id: string; newUrl: string; existing: string[] }> = []

  for (const { listing, key } of candidatesWithKey) {
    if (key && existingByKey.has(key)) {
      const existing = existingByKey.get(key)!
      if (existing.extra_source_urls.includes(listing.sourceUrl)) {
        report.skippedDuplicates++
      } else {
        toUpdate.push({ id: existing.id, newUrl: listing.sourceUrl, existing: existing.extra_source_urls })
        report.mergedLeads++
      }
      continue
    }

    toInsert.push({
      source_url: listing.sourceUrl,
      source_site: listing.sourceSite,
      title: listing.title,
      street: listing.street,
      city: listing.city,
      postcode: listing.postcode,
      price: listing.price,
      property_type: listing.propertyType,
      listing_type: listing.listingType,
      image_url: listing.imageUrl,
      is_particulier: listing.isParticulier,
      agent_name: listing.agentName,
      status: 'prospect',
      dedup_key: key,
    })
  }

  if (toInsert.length > 0) {
    const { error } = await admin.from('market_leads').insert(toInsert)
    if (!error) report.newLeads = toInsert.length
  }

  for (const u of toUpdate) {
    const nextUrls = [...u.existing, u.newUrl]
    await admin
      .from('market_leads')
      .update({ extra_source_urls: nextUrls, updated_at: new Date().toISOString() })
      .eq('id', u.id)
  }

  // 4) Update last_scan op de regio
  await admin
    .from('market_search_regions')
    .update({
      last_scan_at: new Date().toISOString(),
      last_scan_count: report.totalScraped,
      updated_at: new Date().toISOString(),
    })
    .eq('id', region.id)

  return report
}

export async function scanAllEnabledRegions(): Promise<ScanReport[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('market_search_regions')
    .select('*')
    .eq('enabled', true)

  type RegionRow = {
    id: string; label: string; postcodes: string[] | null; cities: string[] | null;
    listing_type: SearchRegion['listingType']; min_price: number | null; max_price: number | null;
    property_types: string[] | null;
  }

  const regions: SearchRegion[] = ((data ?? []) as RegionRow[]).map((r) => ({
    id: r.id,
    label: r.label,
    postcodes: r.postcodes ?? [],
    cities: r.cities ?? [],
    listingType: r.listing_type,
    minPrice: r.min_price,
    maxPrice: r.max_price,
    propertyTypes: r.property_types ?? [],
  }))

  const reports: ScanReport[] = []
  for (const region of regions) {
    reports.push(await scanRegion(region))
    // Wees lief: 2 sec tussen regio's
    await new Promise((r) => setTimeout(r, 2000))
  }
  return reports
}
