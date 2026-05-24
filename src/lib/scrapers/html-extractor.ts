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

  // Bestaande URLs: we refreshen metadata (foto/prijs/adres/titel) bij elke
  // klik. status/notes/contacted_at blijven onaangetast (user-data).
  const urls = listings.map((l) => l.sourceUrl)
  const { data: existingByUrl } = await admin
    .from('market_leads')
    .select('id, source_url, dedup_key, extra_source_urls, status')
    .in('source_url', urls)
  type ExistingRow = { id: string; source_url: string; dedup_key: string | null; extra_source_urls: string[]; status: string }
  const knownByUrl = new Map<string, ExistingRow>()
  for (const r of (existingByUrl ?? []) as ExistingRow[]) {
    knownByUrl.set(r.source_url, r)
  }

  const candidates = listings.filter((l) => !knownByUrl.has(l.sourceUrl))
  const candidatesWithKey = candidates.map((l) => ({ listing: l, key: dedupKey(l) }))
  const keysToCheck = candidatesWithKey
    .map((c) => c.key)
    .filter((k): k is string => k !== null)

  const existingByKey = new Map<string, ExistingRow>()
  if (keysToCheck.length > 0) {
    const { data } = await admin
      .from('market_leads')
      .select('id, source_url, dedup_key, extra_source_urls, status')
      .in('dedup_key', keysToCheck)
    for (const r of (data ?? []) as ExistingRow[]) {
      if (r.dedup_key) existingByKey.set(r.dedup_key, r)
    }
  }

  const toInsert: Array<Record<string, unknown>> = []
  const toMergeExtraUrl: Array<{ id: string; newUrl: string; existing: string[] }> = []
  const toRefresh: Array<{ id: string; listing: ScrapedListing }> = []

  // Bekende URLs → refresh metadata
  for (const l of listings) {
    const known = knownByUrl.get(l.sourceUrl)
    if (known) {
      toRefresh.push({ id: known.id, listing: l })
    }
  }

  // Nieuwe URLs → check op dedup-key (zelfde pand via andere site)
  for (const { listing, key } of candidatesWithKey) {
    if (key && existingByKey.has(key)) {
      const existing = existingByKey.get(key)!
      if (existing.extra_source_urls.includes(listing.sourceUrl)) {
        report.skipped++
      } else {
        toMergeExtraUrl.push({ id: existing.id, newUrl: listing.sourceUrl, existing: existing.extra_source_urls })
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

  if (toInsert.length > 0) {
    const { error } = await admin.from('market_leads').insert(toInsert)
    if (!error) report.newLeads = toInsert.length
  }

  // Merge extra source URLs
  for (const u of toMergeExtraUrl) {
    await admin
      .from('market_leads')
      .update({
        extra_source_urls: [...u.existing, u.newUrl],
        updated_at: new Date().toISOString(),
      })
      .eq('id', u.id)
  }

  // Refresh metadata van bekende URLs — alleen velden die uit de DOM komen,
  // status/notes/contacted_at/agent_name blijven onaangetast.
  for (const r of toRefresh) {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    // Alleen update als nieuwe waarde niet-leeg is (anders verlies je oude goede data)
    if (r.listing.title) updates.title = r.listing.title
    if (r.listing.street) updates.street = r.listing.street
    if (r.listing.city) updates.city = r.listing.city
    if (r.listing.postcode) updates.postcode = r.listing.postcode
    if (r.listing.price) updates.price = r.listing.price
    if (r.listing.propertyType) updates.property_type = r.listing.propertyType
    if (r.listing.imageUrl) updates.image_url = r.listing.imageUrl
    if (r.listing.sourceSite) updates.source_site = r.listing.sourceSite

    await admin.from('market_leads').update(updates).eq('id', r.id)
    report.skipped++ // tellen als "skipped" want geen nieuwe lead — wel gerefresht
  }

  return report
}
