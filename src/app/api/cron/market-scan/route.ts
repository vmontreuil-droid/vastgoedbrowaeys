import { NextResponse } from 'next/server'
import { scanAllEnabledRegions } from '@/lib/scrapers/scan-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minuten — scraping kan trager zijn

/**
 * Vercel Cron endpoint — wordt dagelijks getriggerd via vercel.json.
 *
 * Vercel zet automatisch een 'Authorization: Bearer ${CRON_SECRET}'
 * header op cron-requests. We checken die. Voor manuele triggers van
 * buiten kun je dezelfde header meesturen.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const reports = await scanAllEnabledRegions()
    const totals = reports.reduce(
      (acc, r) => ({
        regions: acc.regions + 1,
        scraped: acc.scraped + r.totalScraped,
        newLeads: acc.newLeads + r.newLeads,
        mergedLeads: acc.mergedLeads + r.mergedLeads,
      }),
      { regions: 0, scraped: 0, newLeads: 0, mergedLeads: 0 },
    )

    return NextResponse.json({
      ok: true,
      runAt: new Date().toISOString(),
      totals,
      reports: reports.map((r) => ({
        region: r.regionLabel,
        scraped: r.totalScraped,
        new: r.newLeads,
        merged: r.mergedLeads,
        sites: r.perSite,
      })),
    })
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
