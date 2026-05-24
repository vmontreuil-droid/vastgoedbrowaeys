import { createClient } from '@/lib/supabase/server'
import { getAdminClients, getAdminDossiers } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  actief: 'Actief',
  lead: 'Lead',
  inactief: 'Inactief',
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
  // Auth-check — alleen admins
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(req.url)
  const statusFilter = url.searchParams.get('status') ?? 'alle'
  const kindFilter = url.searchParams.get('kind') ?? 'alle'

  const [{ items: clients }, { items: dossiers }] = await Promise.all([
    getAdminClients(),
    getAdminDossiers(),
  ])

  let filtered = clients
  if (statusFilter !== 'alle') filtered = filtered.filter((c) => c.status === statusFilter)
  if (kindFilter !== 'alle') filtered = filtered.filter((c) => c.kinds.includes(kindFilter))

  // Tel dossiers per klant
  const dossiersByClient = new Map<string, number>()
  dossiers.forEach((d) => dossiersByClient.set(d.clientId, (dossiersByClient.get(d.clientId) ?? 0) + 1))

  const header = [
    'Voornaam', 'Familienaam', 'E-mail', 'Telefoon', 'Stad',
    'Status', 'Type(s)', 'Budget', 'Zoeksteden', 'Zoek-types',
    'Werknemer', 'Notitie', 'Portaal-toegang', 'Aantal dossiers',
    'Aangemaakt op',
  ]

  const rows = filtered.map((c) => [
    c.firstName,
    c.lastName,
    c.email,
    c.phone ?? '',
    c.city ?? '',
    STATUS_LABEL[c.status] ?? c.status,
    c.kinds.join(', '),
    c.budget != null ? c.budget : '',
    c.searchCity.join(', '),
    c.searchType.join(', '),
    c.agent ?? '',
    c.notes ?? '',
    c.hasAuthAccount ? 'ja' : 'nee',
    dossiersByClient.get(c.id) ?? 0,
    formatDate(c.createdAt),
  ])

  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvEscape).join(';')).join('\r\n') + '\r\n'

  const today = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="klanten-${today}.csv"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
