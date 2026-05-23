// === Admin DB helpers ===
// Server-side queries via service_role (bypassed RLS) voor /admin pagina's.
// Vangen errors zelf op zodat de UI niet kapot gaat als PostgREST cache nog stale is.

import { createAdminClient } from '@/lib/supabase/admin'

export type AdminClient = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  city: string | null
  role: 'client' | 'admin'
  createdAt: string
  // afgeleide velden (uit user_metadata of profiles)
  kinds: string[]
  status: 'actief' | 'inactief' | 'lead'
  agent: string | null
  notes: string | null
  budget: number | null
  searchCity: string[]
  searchType: string[]
  hasAuthAccount: boolean
}

export type AdminDossier = {
  id: string
  ref: string | null
  clientId: string
  clientName: string
  type: 'verkoop' | 'verhuur' | 'koop_zoeker' | 'huur_zoeker'
  status: 'open' | 'in_behandeling' | 'onder_optie' | 'verkocht' | 'verhuurd' | 'geannuleerd'
  propertyAddress: string | null
  propertyCity: string | null
  propertyType: string | null
  askingPrice: number | null
  openedAt: string
  closedAt: string | null
  notes: string | null
  appointmentsCount: number
  documentsCount: number
}

export type AdminAppointment = {
  id: string
  title: string
  start: string
  durationMin: number
  location: string | null
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  dossierId: string
  dossierRef: string | null
  clientName: string
}

type FetchResult<T> = { items: T[]; error?: string }

/** Klanten: auth.users met role=client + profiles als fallback */
export async function getAdminClients(): Promise<FetchResult<AdminClient>> {
  const admin = createAdminClient()

  // 1) Haal auth.users — bevat user_metadata.role + naam
  const { data: usersData, error: usersErr } = await admin.auth.admin.listUsers()
  if (usersErr) {
    return { items: [], error: `auth.listUsers: ${usersErr.message}` }
  }

  const clients: AdminClient[] = (usersData?.users ?? [])
    .filter((u) => {
      const r = u.user_metadata?.role
      return r === 'client' || r === undefined // users zonder role tellen als client
    })
    .filter((u) => u.user_metadata?.role !== 'admin')
    .map((u) => ({
      id: u.id,
      email: u.email ?? '',
      firstName: (u.user_metadata?.first_name as string) || '',
      lastName: (u.user_metadata?.last_name as string) || '',
      phone: (u.user_metadata?.phone as string) || null,
      city: (u.user_metadata?.city as string) || null,
      role: 'client' as const,
      createdAt: u.created_at || new Date().toISOString(),
      kinds: (u.user_metadata?.kinds as string[]) || [],
      status: ((u.user_metadata?.status as 'actief' | 'inactief' | 'lead') ?? 'actief'),
      agent: (u.user_metadata?.agent as string) || null,
      notes: (u.user_metadata?.notes as string) || null,
      budget: (u.user_metadata?.budget as number) || null,
      searchCity: (u.user_metadata?.search_city as string[]) || [],
      searchType: (u.user_metadata?.search_type as string[]) || [],
      hasAuthAccount: true,
    }))

  // 2) Pure profiles-rijen (zonder auth-account, gemaakt via 'klant zonder portaal')
  const knownIds = new Set(clients.map((c) => c.id))
  const { data: profilesRows, error: profilesErr } = await admin
    .from('profiles')
    .select('id, email, first_name, last_name, phone, role, created_at')
    .eq('role', 'client')

  if (!profilesErr && profilesRows) {
    for (const p of profilesRows as Array<{
      id: string; email: string; first_name: string | null; last_name: string | null;
      phone: string | null; role: string; created_at: string
    }>) {
      if (knownIds.has(p.id)) continue
      clients.push({
        id: p.id,
        email: p.email,
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        phone: p.phone,
        city: null,
        role: 'client',
        createdAt: p.created_at,
        kinds: [],
        status: 'actief',
        agent: null,
        notes: null,
        budget: null,
        searchCity: [],
        searchType: [],
        hasAuthAccount: false,
      })
    }
  }

  clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return { items: clients }
}

export async function getAdminClient(id: string): Promise<AdminClient | null> {
  const list = await getAdminClients()
  return list.items.find((c) => c.id === id) ?? null
}

/** Dossiers met geaggregeerde counts */
export async function getAdminDossiers(): Promise<FetchResult<AdminDossier>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dossiers')
    .select('*')
    .order('opened_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const dossierRows = (data ?? []) as Array<{
    id: string; client_id: string; type: AdminDossier['type']; status: AdminDossier['status'];
    property_address: string | null; property_city: string | null; property_type: string | null;
    asking_price: number | null; reference: string | null; opened_at: string;
    closed_at: string | null; notes: string | null;
  }>

  // Resolve clientName lazy via profiles + auth in één keer
  const clientIds = Array.from(new Set(dossierRows.map((d) => d.client_id)))
  const nameById = new Map<string, string>()
  if (clientIds.length > 0) {
    const { data: profs } = await admin.from('profiles').select('id, first_name, last_name, email').in('id', clientIds)
    for (const p of (profs ?? []) as Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>) {
      nameById.set(p.id, [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email)
    }
  }

  // Counts (één keer ophalen)
  const { data: appts } = await admin.from('appointments').select('dossier_id')
  const { data: docs } = await admin.from('documents').select('dossier_id')
  const apptByDossier = new Map<string, number>()
  ;(appts ?? []).forEach((r: { dossier_id: string }) => {
    apptByDossier.set(r.dossier_id, (apptByDossier.get(r.dossier_id) ?? 0) + 1)
  })
  const docByDossier = new Map<string, number>()
  ;(docs ?? []).forEach((r: { dossier_id: string }) => {
    docByDossier.set(r.dossier_id, (docByDossier.get(r.dossier_id) ?? 0) + 1)
  })

  const items: AdminDossier[] = dossierRows.map((d) => ({
    id: d.id,
    ref: d.reference,
    clientId: d.client_id,
    clientName: nameById.get(d.client_id) ?? '(onbekende klant)',
    type: d.type,
    status: d.status,
    propertyAddress: d.property_address,
    propertyCity: d.property_city,
    propertyType: d.property_type,
    askingPrice: d.asking_price,
    openedAt: d.opened_at,
    closedAt: d.closed_at,
    notes: d.notes,
    appointmentsCount: apptByDossier.get(d.id) ?? 0,
    documentsCount: docByDossier.get(d.id) ?? 0,
  }))

  return { items }
}

export async function getAdminDossier(id: string): Promise<AdminDossier | null> {
  const list = await getAdminDossiers()
  return list.items.find((d) => d.id === id) ?? null
}

/** Afspraken + join op dossier + client */
export async function getAdminAppointments(): Promise<FetchResult<AdminAppointment>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('appointments')
    .select('*')
    .order('appointment_at', { ascending: true })
  if (error) return { items: [], error: error.message }

  const rows = (data ?? []) as Array<{
    id: string; dossier_id: string; title: string; appointment_at: string;
    duration_min: number; location: string | null; notes: string | null;
    status: AdminAppointment['status'];
  }>

  const dossierIds = Array.from(new Set(rows.map((r) => r.dossier_id)))
  const dossierMeta = new Map<string, { ref: string | null; clientId: string }>()
  if (dossierIds.length > 0) {
    const { data: dossiers } = await admin.from('dossiers').select('id, reference, client_id').in('id', dossierIds)
    for (const d of (dossiers ?? []) as Array<{ id: string; reference: string | null; client_id: string }>) {
      dossierMeta.set(d.id, { ref: d.reference, clientId: d.client_id })
    }
  }
  const clientIds = Array.from(new Set(Array.from(dossierMeta.values()).map((m) => m.clientId)))
  const nameById = new Map<string, string>()
  if (clientIds.length > 0) {
    const { data: profs } = await admin.from('profiles').select('id, first_name, last_name, email').in('id', clientIds)
    for (const p of (profs ?? []) as Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>) {
      nameById.set(p.id, [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email)
    }
  }

  const items: AdminAppointment[] = rows.map((r) => {
    const meta = dossierMeta.get(r.dossier_id)
    return {
      id: r.id,
      title: r.title,
      start: r.appointment_at,
      durationMin: r.duration_min,
      location: r.location,
      status: r.status,
      notes: r.notes,
      dossierId: r.dossier_id,
      dossierRef: meta?.ref ?? null,
      clientName: (meta && nameById.get(meta.clientId)) ?? '(onbekend)',
    }
  })

  return { items }
}

export async function getAdminAppointment(id: string): Promise<AdminAppointment | null> {
  const list = await getAdminAppointments()
  return list.items.find((a) => a.id === id) ?? null
}

export type AdminLead = {
  id: string
  fromName: string
  fromEmail: string
  fromPhone: string | null
  subject: string
  body: string
  type: 'lead' | 'schatting' | 'vraag' | 'visit_request' | 'algemeen'
  relatedListing: string | null
  source: string | null
  receivedAt: string
  readAt: string | null
  assignedTo: string | null
  archived: boolean
}

export async function getAdminLeads(): Promise<FetchResult<AdminLead>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('leads')
    .select('*')
    .eq('archived', false)
    .order('received_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items = ((data ?? []) as Array<{
    id: string; from_name: string; from_email: string; from_phone: string | null;
    subject: string; body: string; type: AdminLead['type']; related_listing: string | null;
    source: string | null; received_at: string; read_at: string | null; assigned_to: string | null;
    archived: boolean;
  }>).map((r) => ({
    id: r.id,
    fromName: r.from_name,
    fromEmail: r.from_email,
    fromPhone: r.from_phone,
    subject: r.subject,
    body: r.body,
    type: r.type,
    relatedListing: r.related_listing,
    source: r.source,
    receivedAt: r.received_at,
    readAt: r.read_at,
    assignedTo: r.assigned_to,
    archived: r.archived,
  }))
  return { items }
}

export async function getAdminLead(id: string): Promise<AdminLead | null> {
  const list = await getAdminLeads()
  return list.items.find((l) => l.id === id) ?? null
}

export type AdminMetrics = {
  clientsTotal: number
  clientsActive: number
  clientsLeads: number
  dossiersOpen: number
  dossiersUnderOption: number
  appointmentsThisWeek: number
  leadsUnread: number
  leadsTotal: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [clients, dossiers, appointments, leads] = await Promise.all([
    getAdminClients(),
    getAdminDossiers(),
    getAdminAppointments(),
    getAdminLeads(),
  ])

  const now = Date.now()
  const weekMs = 7 * 24 * 3600 * 1000

  return {
    clientsTotal: clients.items.length,
    clientsActive: clients.items.filter((c) => c.status === 'actief').length,
    clientsLeads: clients.items.filter((c) => c.status === 'lead').length,
    dossiersOpen: dossiers.items.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status)).length,
    dossiersUnderOption: dossiers.items.filter((d) => d.status === 'onder_optie').length,
    appointmentsThisWeek: appointments.items.filter((a) => {
      const t = new Date(a.start).getTime()
      return t >= now && t < now + weekMs && a.status !== 'cancelled'
    }).length,
    leadsUnread: leads.items.filter((l) => !l.readAt).length,
    leadsTotal: leads.items.length,
  }
}

/**
 * Trend-data afgeleid uit DB-timestamps: leads per week + dossiers per maand,
 * etc. Voor grafieken op het overzicht.
 */
export async function getAdminTrends() {
  const [leadsRes, dossiers, appointments] = await Promise.all([
    getAdminLeads(),
    getAdminDossiers(),
    getAdminAppointments(),
  ])

  // Laatste 8 weken: leads + bezichtigingen
  const now = new Date()
  const weekStarts: Date[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    d.setHours(0, 0, 0, 0)
    weekStarts.push(d)
  }
  const weekTrend = weekStarts.map((start, idx) => {
    const end = idx < weekStarts.length - 1 ? weekStarts[idx + 1] : new Date(start.getTime() + 7 * 24 * 3600 * 1000)
    const leadsInWeek = leadsRes.items.filter((l) => {
      const t = new Date(l.receivedAt).getTime()
      return t >= start.getTime() && t < end.getTime()
    }).length
    const apptsInWeek = appointments.items.filter((a) => {
      const t = new Date(a.start).getTime()
      return t >= start.getTime() && t < end.getTime() && a.status !== 'cancelled'
    }).length
    return {
      x: `W${getWeekNumber(start)}`,
      Leads: leadsInWeek,
      Bezichtigingen: apptsInWeek,
    }
  })

  // Laatste 6 maanden: dossiers geopend per maand, per type
  const monthStarts: Date[] = []
  const monthLabels = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthStarts.push(d)
  }
  const dossierMonthly = monthStarts.map((start, idx) => {
    const end = idx < monthStarts.length - 1 ? monthStarts[idx + 1] : new Date(start.getFullYear(), start.getMonth() + 1, 1)
    const inRange = (t: string) => {
      const tm = new Date(t).getTime()
      return tm >= start.getTime() && tm < end.getTime()
    }
    return {
      x: monthLabels[start.getMonth()],
      Verkoop:       dossiers.items.filter((d) => d.type === 'verkoop'     && inRange(d.openedAt)).length,
      Verhuur:       dossiers.items.filter((d) => d.type === 'verhuur'     && inRange(d.openedAt)).length,
      'Koop-zoeker': dossiers.items.filter((d) => d.type === 'koop_zoeker' && inRange(d.openedAt)).length,
      'Huur-zoeker': dossiers.items.filter((d) => d.type === 'huur_zoeker' && inRange(d.openedAt)).length,
    }
  })

  return { weekTrend, dossierMonthly }
}

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
}
