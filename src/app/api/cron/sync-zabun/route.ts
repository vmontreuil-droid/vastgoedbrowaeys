import { NextResponse } from 'next/server'
import { syncZabunListings } from '@/lib/zabun-sync'
import { readCredentialsFromEnv, heartbeat } from '@/lib/zabun-api'

/**
 * Cron-endpoint dat Zabun-panden synchroniseert naar public.listings.
 *
 * Beveiliging: enkel aanroepbaar als CRON_SECRET in env staat en de
 * Authorization-header dezelfde waarde meestuurt (vercel-stijl).
 *
 * Vercel Cron schedule in vercel.json:
 *   { "crons": [{ "path": "/api/cron/sync-zabun", "schedule": "0 * * * *" }] }
 *
 * Handmatig testen:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" https://vastgoedbrowaeys.vercel.app/api/cron/sync-zabun
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization') ?? ''
  return header === `Bearer ${secret}`
}

export async function GET(req: Request) {
  // Vercel Cron stuurt automatisch de juiste header mee; voor manual access
  // moet je `Authorization: Bearer <CRON_SECRET>` meegeven.
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Eerst heartbeat — als de credentials niet kloppen heeft sync geen zin.
  const creds = readCredentialsFromEnv()
  if (!creds) {
    return NextResponse.json({
      ok: false,
      stage: 'credentials',
      error: 'Zabun env-variabelen ontbreken: ZABUN_API_KEY, ZABUN_CLIENT_ID, ZABUN_SERVER_ID, ZABUN_X_CLIENT_ID, ZABUN_X_USER_ID',
    }, { status: 500 })
  }

  try {
    await heartbeat(creds)
  } catch (e) {
    return NextResponse.json({
      ok: false,
      stage: 'heartbeat',
      error: e instanceof Error ? e.message : String(e),
    }, { status: 502 })
  }

  const result = await syncZabunListings()
  return NextResponse.json(result, { status: result.ok ? 200 : 207 })
}
