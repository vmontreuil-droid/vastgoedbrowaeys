import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractListingsFromHtml, importListings } from '@/lib/scrapers/html-extractor'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// CORS-headers — bookmarklet draait vanuit Immoweb/Zimmo domain, dus de
// fetch is cross-origin. Allow-Origin '*' is OK omdat de auth via Bearer
// gebeurt en niet via cookies.
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
  // Probeer eerst via RPC (snel, omzeilt kapotte listUsers)
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
    // negeer, fall back op listUsers
  }
  // Fallback
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

export async function POST(request: Request) {
  // Bearer-token auth
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

  // Parse body
  let body: { url?: string; html?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Ongeldige JSON.' },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const url = (body.url ?? '').trim()
  const html = (body.html ?? '').trim()
  if (!url || !html) {
    return NextResponse.json(
      { ok: false, error: 'url en html zijn verplicht.' },
      { status: 400, headers: CORS_HEADERS },
    )
  }
  if (html.length > 5 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: 'HTML te groot (max 5 MB).' },
      { status: 413, headers: CORS_HEADERS },
    )
  }

  // Parse listings
  const listings = extractListingsFromHtml(url, html)
  if (listings.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        message: 'Geen listings herkend in deze pagina. Misschien een detail-pagina of een onbekende site?',
        parsed: 0,
        new: 0,
        merged: 0,
        skipped: 0,
      },
      { status: 200, headers: CORS_HEADERS },
    )
  }

  const report = await importListings(listings, user.id)

  return NextResponse.json(
    {
      ok: true,
      message: `${report.newLeads} nieuw · ${report.mergedLeads} samengevoegd · ${report.skipped} reeds bekend (van ${report.totalParsed} herkend)`,
      site: report.site,
      parsed: report.totalParsed,
      new: report.newLeads,
      merged: report.mergedLeads,
      skipped: report.skipped,
    },
    { status: 200, headers: CORS_HEADERS },
  )
}
