import { createClient } from '@/lib/supabase/server'
import { getAdminDossiers, computeCommission } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VAT_RATE = 0.21

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function GET(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(req.url)
  const statusFilter = url.searchParams.get('status') ?? 'alle'
  const fromDate = url.searchParams.get('from') // YYYY-MM-DD
  const toDate = url.searchParams.get('to')

  const { items: dossiers } = await getAdminDossiers()

  let filtered = dossiers
  if (statusFilter === 'lopend') {
    filtered = filtered.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
  } else if (statusFilter === 'gerealiseerd') {
    filtered = filtered.filter((d) => ['verkocht', 'verhuurd'].includes(d.status))
  } else if (statusFilter !== 'alle') {
    filtered = filtered.filter((d) => d.status === statusFilter)
  }
  if (fromDate) {
    const fromMs = new Date(fromDate).getTime()
    filtered = filtered.filter((d) => new Date(d.openedAt).getTime() >= fromMs)
  }
  if (toDate) {
    const toMs = new Date(toDate).getTime() + 24 * 3600 * 1000 // include het hele eind-dag
    filtered = filtered.filter((d) => new Date(d.openedAt).getTime() <= toMs)
  }

  const header = [
    'Referentie', 'Klant', 'Type', 'Status', 'Adres', 'Stad',
    'Vraagprijs/Budget', 'Geopend op', 'Afgesloten op',
    'Commissie-type', 'Commissie %', 'Commissie vast',
    'Bedrag excl BTW', 'BTW 21%', 'Totaal incl BTW',
    'BTW inbegrepen?', 'Notitie',
  ]

  const rows = filtered.map((d) => {
    const amount = computeCommission(d)
    const vat = d.commissionVatIncluded ? 0 : Math.round(amount * VAT_RATE)
    const total = d.commissionVatIncluded ? amount : amount + vat
    return [
      d.ref ?? d.id.slice(0, 8),
      d.clientName,
      TYPE_LABEL[d.type] ?? d.type,
      STATUS_LABEL[d.status] ?? d.status,
      d.propertyAddress ?? '',
      d.propertyCity ?? '',
      d.askingPrice != null ? d.askingPrice : '',
      formatDate(d.openedAt),
      formatDate(d.closedAt),
      d.commissionType,
      d.commissionType === 'percentage' ? (d.commissionRate ?? '') : '',
      d.commissionType === 'fixed' ? (d.commissionFixed ?? '') : '',
      amount,
      vat,
      total,
      d.commissionVatIncluded ? 'ja' : 'nee',
      d.commissionNotes ?? '',
    ]
  })

  // BOM + ; separator → Excel NL opent correct
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvEscape).join(';')).join('\r\n') + '\r\n'

  const today = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="commissies-${today}.csv"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
