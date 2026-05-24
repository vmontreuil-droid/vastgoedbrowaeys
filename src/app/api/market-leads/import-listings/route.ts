import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { importListings } from '@/lib/scrapers/html-extractor'
import type { ScrapedListing } from '@/lib/scrapers/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

async function findUserByToken(token: string) {
  if (!token || token.length < 10) return null
  const admin = createAdminClient()
  try {
    const { data } = await admin.rpc('list_admin_users')
    if (Array.isArray(data)) {
      type Row = { id: string; email: string | null; raw_user_meta_data: Record<string, unknown> | null }
      for (const r of data as Row[]) {
        if (r.raw_user_meta_data?.market_import_token === token) {
          return { id: r.id, email: r.email }
        }
      }
    }
  } catch {
    // ignore
  }
  return null
}

type RawListing = {
  url?: string
  title?: string | null
  imageUrl?: string | null
  price?: number | string | null
  addressLine?: string | null
  // Detail-page enrichment (optioneel)
  images?: string[]
  description?: string | null
  features?: Record<string, string | number | null>
}

function deriveSourceSite(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    if (host.includes('immoweb')) return 'Immoweb'
    if (host.includes('zimmo')) return 'Zimmo'
    if (host.includes('realo')) return 'Realo'
    if (host.includes('logic-immo') || host.includes('logicimmo')) return 'Logic-Immo'
    if (host.includes('immovlan')) return 'Immo Vlaanderen'
    if (host.includes('hebbes')) return 'Hebbes'
    return host
  } catch {
    return 'Onbekend'
  }
}

function parsePrice(p: number | string | null | undefined): number | null {
  if (p == null) return null
  if (typeof p === 'number') return Number.isFinite(p) && p > 0 ? p : null
  const cleaned = p.replace(/[^\d]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

function parseAddressLine(line: string | null | undefined): {
  street: string | null; postcode: string | null; city: string | null
} {
  if (!line) return { street: null, postcode: null, city: null }
  const pcMatch = line.match(/\b([1-9]\d{3})\b/)
  const postcode = pcMatch ? pcMatch[1] : null
  let city: string | null = null
  let street: string | null = null
  if (postcode) {
    const after = line.split(postcode)[1]?.trim()
    if (after) {
      city = after.split(/[,·•|\n]/)[0].trim().slice(0, 60) || null
    }
    const before = line.split(postcode)[0]?.replace(/[,·•|]+$/, '').trim()
    if (before && before.length < 80) street = before
  }
  return { street, postcode, city }
}

function inferListingType(url: string, pageUrl: string): 'verkoop' | 'verhuur' | 'onbekend' {
  const all = `${url} ${pageUrl}`.toLowerCase()
  if (/te[-_]?huur|\/huur\/|\/rent|huurprijs/.test(all)) return 'verhuur'
  if (/te[-_]?koop|\/koop\/|\/sale|verkoopprijs/.test(all)) return 'verkoop'
  return 'onbekend'
}

function mapToScraped(raw: RawListing, pageUrl: string): ScrapedListing | null {
  if (!raw.url) return null
  // Skip non-listing URLs (navigatie, ads, etc.)
  if (!/\/(zoekertje|classified|te-koop|te-huur)\//.test(raw.url)) {
    // Pas alleen als de URL host wel een immo-site is
    try {
      const host = new URL(raw.url).hostname
      if (!/(immoweb|zimmo|realo|immovlan|hebbes|logic-immo)/.test(host)) return null
    } catch {
      return null
    }
  }

  const sourceSite = deriveSourceSite(raw.url)
  const addr = parseAddressLine(raw.addressLine)
  const listingType = inferListingType(raw.url, pageUrl)
  const price = parsePrice(raw.price)
  const title = raw.title?.trim()?.slice(0, 200) || null

  // Skip als we niks zinvols hebben
  if (!price && !addr.postcode && !title) return null

  // Strip enkel #anchor en tracking-params (utm_*, ref, _ga) maar behoud essentiële query
  let cleanUrl = raw.url.split('#')[0]
  try {
    const u = new URL(cleanUrl)
    const trackingPrefixes = ['utm_', 'fbclid', 'gclid', 'mc_', '_ga']
    const toDelete: string[] = []
    u.searchParams.forEach((_, key) => {
      if (trackingPrefixes.some((p) => key.toLowerCase().startsWith(p))) toDelete.push(key)
    })
    toDelete.forEach((k) => u.searchParams.delete(k))
    cleanUrl = u.href
  } catch {
    // ignore — gebruik raw
  }

  return {
    sourceUrl: cleanUrl,
    sourceSite,
    title,
    street: addr.street,
    city: addr.city,
    postcode: addr.postcode,
    price,
    propertyType: null,
    listingType,
    imageUrl: raw.imageUrl ?? null,
    agentName: null,
    isParticulier: false,
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Geen token meegestuurd.' },
      { status: 401, headers: CORS_HEADERS },
    )
  }
  const user = await findUserByToken(token)
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Token niet herkend — vernieuw in admin-paneel.' },
      { status: 401, headers: CORS_HEADERS },
    )
  }

  let body: { url?: string; listings?: RawListing[]; detail?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Ongeldige JSON.' },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const pageUrl = body.url ?? ''
  const rawListings = body.listings ?? []
  const isDetailImport = body.detail === true
  if (!Array.isArray(rawListings) || rawListings.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        message: 'Geen panden meegestuurd vanuit de bookmarklet.',
        parsed: 0, new: 0, merged: 0, skipped: 0,
      },
      { status: 200, headers: CORS_HEADERS },
    )
  }

  const scraped: ScrapedListing[] = []
  const enrichments = new Map<string, { images: string[]; description: string | null; features: Record<string, string | number | null> }>()
  const seenUrls = new Set<string>()
  for (const r of rawListings) {
    const m = mapToScraped(r, pageUrl)
    if (!m) continue
    if (seenUrls.has(m.sourceUrl)) continue
    seenUrls.add(m.sourceUrl)
    scraped.push(m)
    // Bewaar detail-data per URL als die aanwezig is
    if (r.images || r.description || r.features) {
      enrichments.set(m.sourceUrl, {
        images: Array.isArray(r.images) ? r.images.slice(0, 30) : [],
        description: typeof r.description === 'string' ? r.description.slice(0, 5000) : null,
        features: r.features ?? {},
      })
    }
  }

  if (scraped.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        message: `${rawListings.length} link(s) gevonden maar geen ervan was herkenbaar als pand. Sta je op een zoek-resultatenpagina?`,
        parsed: 0, new: 0, merged: 0, skipped: 0,
      },
      { status: 200, headers: CORS_HEADERS },
    )
  }

  const report = await importListings(scraped, user.id)

  // Detail-enrichment: update images/description/features voor elke URL
  if (enrichments.size > 0) {
    const admin = createAdminClient()
    for (const [url, enrich] of enrichments) {
      const updates: Record<string, unknown> = {
        enriched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      if (enrich.images.length > 0) updates.images = enrich.images
      if (enrich.description) updates.description = enrich.description
      if (Object.keys(enrich.features).length > 0) updates.features = enrich.features
      await admin.from('market_leads').update(updates).eq('source_url', url)
    }
  }

  const summary = isDetailImport
    ? `Pand verrijkt met ${enrichments.values().next().value?.images.length ?? 0} foto's en ${Object.keys(enrichments.values().next().value?.features ?? {}).length} kenmerken`
    : `${report.newLeads} nieuw · ${report.mergedLeads} samengevoegd · ${report.skipped} reeds bekend (${scraped.length}/${rawListings.length} herkend)`

  return NextResponse.json(
    {
      ok: true,
      message: summary,
      site: report.site,
      parsed: report.totalParsed,
      new: report.newLeads,
      merged: report.mergedLeads,
      skipped: report.skipped,
    },
    { status: 200, headers: CORS_HEADERS },
  )
}
