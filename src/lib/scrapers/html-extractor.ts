import 'server-only'
import { extractImmowebListingsFromHtml } from './immoweb'
import { extractZimmoListingsFromHtml } from './zimmo'
import { extractJsonLdListingsFromHtml } from './generic-jsonld'
import { dedupKey, type ScrapedListing } from './types'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Kies de juiste parser op basis van de URL en extraheer listings uit
 * de meegegeven HTML. Gebruikt door de bookmarklet-route — daar levert
 * de browser van Stefanie de HTML aan (geen Cloudflare-probleem).
 */
export function extractListingsFromHtml(url: string, html: string): ScrapedListing[] {
  let host = ''
  try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, '') } catch { return [] }

  if (host.includes('immoweb.be')) {
    return extractImmowebListingsFromHtml(html)
  }
  if (host.includes('zimmo.be')) {
    return extractZimmoListingsFromHtml(html, url)
  }
  if (host.includes('realo.be')) {
    return extractJsonLdListingsFromHtml(html, url, 'Realo', 'realo.be')
  }
  if (host.includes('immovlan.be')) {
    return extractJsonLdListingsFromHtml(html, url, 'Immo Vlaanderen', 'immovlan.be')
  }
  if (host.includes('hebbes.be')) {
    return extractJsonLdListingsFromHtml(html, url, 'Hebbes', 'hebbes.be')
  }
  if (host.includes('logic-immo.be') || host.includes('logicimmo.be')) {
    return extractJsonLdListingsFromHtml(html, url, 'Logic-Immo', 'logic-immo.be')
  }
  return []
}

export type ImportReport = {
  totalParsed: number
  newLeads: number
  mergedLeads: number
  skipped: number
  site: string | null
}

/**
 * Imports listings into market_leads met dedup-logica (zelfde aanpak als
 * scan-engine.ts maar dan voor handmatige bookmarklet-import).
 */
export async function importListings(
  listings: ScrapedListing[],
  importedBy: string | null,
): Promise<ImportReport> {
  const report: ImportReport = {
    totalParsed: listings.length,
    newLeads: 0,
    mergedLeads: 0,
    skipped: 0,
    site: listings[0]?.sourceSite ?? null,
  }
  if (listings.length === 0) return report

  const admin = createAdminClient()

  // Bestaande URLs
  const urls = listings.map((l) => l.sourceUrl)
  const { data: existingByUrl } = await admin
    .from('market_leads')
    .select('id, source_url, dedup_key, extra_source_urls')
    .in('source_url', urls)
  const knownUrls = new Set((existingByUrl ?? []).map((r: { source_url: string }) => r.source_url))

  const candidates = listings.filter((l) => !knownUrls.has(l.sourceUrl))
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

  const toInsert: Array<Record<string, unknown>> = []
  const toUpdate: Array<{ id: string; newUrl: string; existing: string[] }> = []

  for (const { listing, key } of candidatesWithKey) {
    if (key && existingByKey.has(key)) {
      const existing = existingByKey.get(key)!
      if (existing.extra_source_urls.includes(listing.sourceUrl)) {
        report.skipped++
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
      created_by: importedBy,
    })
  }

  report.skipped += knownUrls.size

  if (toInsert.length > 0) {
    const { error } = await admin.from('market_leads').insert(toInsert)
    if (!error) report.newLeads = toInsert.length
  }
  for (const u of toUpdate) {
    await admin
      .from('market_leads')
      .update({
        extra_source_urls: [...u.existing, u.newUrl],
        updated_at: new Date().toISOString(),
      })
      .eq('id', u.id)
  }

  return report
}
