'use server'

import { createClient } from '@/lib/supabase/server'
import { diagnoseUrl, type DiagnosticInfo } from '@/lib/scrapers/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
}

const TEST_URLS = [
  { site: 'Immoweb',         url: 'https://www.immoweb.be/nl/zoeken/huis,appartement/te-koop?countries=BE&postalCodes=9667,9700&orderBy=newest' },
  { site: 'Zimmo',           url: 'https://www.zimmo.be/nl/zoeken/?status=ForSale&transactie=koop&plaats=9667,9700' },
  { site: 'Realo',           url: 'https://www.realo.be/nl/te-koop/9667' },
  { site: 'Immo Vlaanderen', url: 'https://immovlan.be/nl/vastgoed?searchtransaction=kopen&searchlocation=9667' },
  { site: 'Hebbes',          url: 'https://www.hebbes.be/vastgoed/koop?locatie=9667' },
  { site: 'Logic-Immo',      url: 'https://www.logic-immo.be/nl/kopen/zoekresultaten.html?loc=9667' },
]

export type DiagnoseResult = {
  site: string
  diag: DiagnosticInfo
}

export async function runDiagnoseAction(): Promise<DiagnoseResult[]> {
  await requireAdmin()
  const results: DiagnoseResult[] = []
  for (const { site, url } of TEST_URLS) {
    const diag = await diagnoseUrl(url)
    results.push({ site, diag })
    // Wees lief: 1s tussen requests
    await new Promise((r) => setTimeout(r, 1000))
  }
  return results
}
