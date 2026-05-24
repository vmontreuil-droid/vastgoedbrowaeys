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
  try {
    const { data, error } = await admin.auth.admin.listUsers()
    if (error || !data) return null
    for (const u of data.users) {
      if (u.user_metadata?.market_import_token === token) {
        return { id: u.id, email: u.email ?? null }
      }
    }
  } catch {
    return null
  }
  return null
}

type RawListing = {
  url?: string
  title?: string
  imageUrl?: string | null
  price?: number | string | null
  addressLine?: string | null
  street?: string | null
  postcode?: string | null
  city?: string | null
  propertyType?: string | null
  listingType?: 'verkoop' | 'verhuur' | 'onbekend'
  agentName?: string | null
  isParticulier?: boolean
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

function parseAddressLine(line: string | null | undefined): { street: string | null; postcode: string | null; city: string | null } {
  if (!line) return { street: null, postcode: null, city: null }
  const pcMatch = line.match(/\b([1-9]\d{3})\b/)
  const postcode = pcMatch ? pcMatch[1] : null
  let city: string | null = null
  let street: string | null = null
  if (postcode) {
    const after = line.split(postcode)[1]?.trim()
    if (after) {
      city = after.split(/[,·•|]/)[0].trim().slice(0, 60) || null
    }
    const before = line.split(postcode)[0]?.replace(/[,·•|]+$/, '').trim()
    if (before && before.length < 80) street = before
  }
  return { street, postcode, city }
}

function inferListingType(url: string): 'verkoop' | 'verhuur' | 'onbekend' {
  if (/te[-_]?huur|\/huur\/|\/rent/i.test(url)) return 'verhuur'
  if (/te[-_]?koop|\/koop\/|\/sale/i.test(url)) return 'verkoop'
  return 'onbekend'
}

function mapToScraped(raw: RawListing, pageUrl: string): ScrapedListing | null {
  if (!raw.url) return null
  const sourceSite = deriveSourceSite(raw.url)
  const addr = (raw.street || raw.postcode || raw.city)
    ? { street: raw.street ?? null, postcode: raw.postcode ?? null, city: raw.city ?? null }
    : parseAddressLine(raw.addressLine)
  const listingType = raw.listingType ?? inferListingType(raw.url) ?? inferListingType(pageUrl)
  const price = parsePrice(raw.price)
  const title = raw.title?.trim()?.slice(0, 200) || null
  const imageUrl = raw.imageUrl ?? null

  // Skip if we have essentially nothing useful
  if (!price && !addr.postcode && !addr.city && !title) return null

  return {
    sourceUrl: raw.url,
    sourceSite,
    title,
    street: addr.street,
    city: addr.city,
    postcode: addr.postcode,
    price,
    propertyType: raw.propertyType ?? null,
    listingType,
    imageUrl,
    agentName: raw.agentName ?? null,
    isParticulier: raw.isParticulier === true,
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Geen import-token in Authorization-header.' },
      { status: 401, headers: CORS_HEADERS },
    )
  }
  const user = await findUserByToken(token)
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Token niet herkend — regenereer in admin-paneel.' },
      { status: 401, headers: CORS_HEADERS },
    )
  }

  let body: { url?: string; listings?: RawListing[] }
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

  const scraped = rawListings
    .map((r) => mapToScraped(r, pageUrl))
    .filter((s): s is ScrapedListing => s !== null)

  if (scraped.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        message: `Browser stuurde ${rawListings.length} pand(en) maar geen ervan had voldoende info (URL + prijs/adres/titel).`,
        parsed: 0, new: 0, merged: 0, skipped: 0,
      },
      { status: 200, headers: CORS_HEADERS },
    )
  }

  const report = await importListings(scraped, user.id)

  return NextResponse.json(
    {
      ok: true,
      message: `${report.newLeads} nieuw · ${report.mergedLeads} samengevoegd · ${report.skipped} reeds bekend (${scraped.length} herkend van ${rawListings.length} gevonden)`,
      site: report.site,
      parsed: report.totalParsed,
      new: report.newLeads,
      merged: report.mergedLeads,
      skipped: report.skipped,
    },
    { status: 200, headers: CORS_HEADERS },
  )
}
