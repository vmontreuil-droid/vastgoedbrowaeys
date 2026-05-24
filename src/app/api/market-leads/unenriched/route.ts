import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization',
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
      type Row = { id: string; raw_user_meta_data: Record<string, unknown> | null }
      for (const r of data as Row[]) {
        if (r.raw_user_meta_data?.market_import_token === token) return { id: r.id }
      }
    }
  } catch {
    // ignore
  }
  return null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Geen token' }, { status: 401, headers: CORS_HEADERS })
  }
  const user = await findUserByToken(token)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Token niet herkend' }, { status: 401, headers: CORS_HEADERS })
  }

  const url = new URL(request.url)
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '10', 10) || 10)
  const host = url.searchParams.get('host')?.toLowerCase()

  const admin = createAdminClient()
  let query = admin
    .from('market_leads')
    .select('id, source_url, source_site')
    .is('enriched_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Optioneel filteren op site (bv. enkel immoweb-leads ophalen als
  // Stefanie op immoweb is — same-origin fetch werkt dan zeker)
  if (host) {
    query = query.ilike('source_url', `%${host}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: CORS_HEADERS })
  }

  return NextResponse.json(
    {
      ok: true,
      leads: (data ?? []).map((r: { id: string; source_url: string; source_site: string | null }) => ({
        id: r.id,
        url: r.source_url,
        site: r.source_site,
      })),
    },
    { status: 200, headers: CORS_HEADERS },
  )
}
