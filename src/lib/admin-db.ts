// === Admin DB helpers ===
// Server-side queries via service_role (bypassed RLS) voor /admin pagina's.
// Vangen errors zelf op zodat de UI niet kapot gaat als PostgREST cache nog stale is.

import 'server-only'
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
  newsletterOptOut: boolean
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
  commissionType: 'percentage' | 'fixed' | 'none'
  commissionRate: number | null
  commissionFixed: number | null
  commissionVatIncluded: boolean
  commissionNotes: string | null
  tags: string[]
  assignedTo: string | null
  assignedToName: string | null
}

/**
 * Berekent verwachte commissie op basis van type + tarieven.
 * Returnt het netto (excl. BTW) bedrag. Roep computeVatAmount() apart
 * om de BTW (21%) te krijgen.
 */
export function computeCommission(d: Pick<AdminDossier, 'commissionType' | 'commissionRate' | 'commissionFixed' | 'askingPrice'>): number {
  if (d.commissionType === 'none') return 0
  if (d.commissionType === 'percentage') {
    if (!d.askingPrice || !d.commissionRate) return 0
    return Math.round(d.askingPrice * (d.commissionRate / 100))
  }
  if (d.commissionType === 'fixed') {
    return d.commissionFixed ?? 0
  }
  return 0
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
      newsletterOptOut: u.user_metadata?.newsletter_opt_out === true,
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
        newsletterOptOut: false,
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
    commission_type?: AdminDossier['commissionType'] | null;
    commission_rate?: number | null;
    commission_fixed?: number | null;
    commission_vat_included?: boolean | null;
    commission_notes?: string | null;
    tags?: string[] | null;
    assigned_to?: string | null;
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

  // Team-namen voor assignedToName resolutie
  const teamById = new Map<string, string>()
  try {
    const { data: usersData } = await admin.auth.admin.listUsers()
    for (const u of usersData?.users ?? []) {
      if (u.user_metadata?.role !== 'admin') continue
      const first = (u.user_metadata?.first_name as string) || ''
      const last = (u.user_metadata?.last_name as string) || ''
      const name = `${first} ${last}`.trim() || u.email || ''
      teamById.set(u.id, name)
    }
  } catch {
    // Best-effort: lege namen i.p.v. crash
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
    commissionType: (d.commission_type as AdminDossier['commissionType']) ?? 'percentage',
    commissionRate: d.commission_rate ?? null,
    commissionFixed: d.commission_fixed ?? null,
    commissionVatIncluded: d.commission_vat_included === true,
    commissionNotes: d.commission_notes ?? null,
    tags: Array.isArray(d.tags) ? d.tags : [],
    assignedTo: d.assigned_to ?? null,
    assignedToName: d.assigned_to ? (teamById.get(d.assigned_to) ?? null) : null,
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

export type AdminDocument = {
  id: string
  dossierId: string
  name: string
  category: 'compromis' | 'schatting' | 'epc' | 'asbest' | 'stedenbouw' | 'plaatsbeschrijving' | 'huurcontract' | 'foto' | 'overig'
  storagePath: string
  sizeBytes: number | null
  mimeType: string | null
  uploadedBy: string | null
  createdAt: string
  sharedWithClient: boolean
}

export async function getAdminDocumentsForDossier(dossierId: string): Promise<FetchResult<AdminDocument>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('documents')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items: AdminDocument[] = ((data ?? []) as Array<{
    id: string; dossier_id: string; name: string; category: AdminDocument['category'];
    storage_path: string; size_bytes: number | null; mime_type: string | null;
    uploaded_by: string | null; created_at: string; shared_with_client: boolean | null;
  }>).map((r) => ({
    id: r.id,
    dossierId: r.dossier_id,
    name: r.name,
    category: r.category,
    storagePath: r.storage_path,
    sizeBytes: r.size_bytes,
    mimeType: r.mime_type,
    uploadedBy: r.uploaded_by,
    createdAt: r.created_at,
    sharedWithClient: r.shared_with_client === true,
  }))
  return { items }
}

export type DossierStep = {
  id: string
  dossierId: string
  label: string
  status: 'pending' | 'done' | 'skipped'
  doneAt: string | null
  orderIndex: number
  createdAt: string
}

const DEFAULT_STEPS_BY_TYPE: Record<string, string[]> = {
  verkoop:     ['Plaatsbezoek + schatting', 'Verkoopopdracht ondertekend', 'Foto-presentatie', 'Online publicatie', 'Bod onderhandelen + acceptatie', 'Compromis bij notaris', 'Aktedatum'],
  verhuur:     ['Plaatsbezoek', 'Verhuuropdracht ondertekend', 'EPC + plaatsbeschrijving', 'Online publicatie', 'Bezichtigingen', 'Kandidaat-huurder geselecteerd', 'Huurcontract'],
  koop_zoeker: ['Intake-gesprek', 'Zoekcriteria vastgelegd', 'Auto-meldingen geactiveerd', 'Eerste bezichtigingen', 'Bod uitbrengen'],
  huur_zoeker: ['Intake-gesprek', 'Zoekcriteria vastgelegd', 'Bezichtigingen', 'Huurcontract'],
}

export async function getDossierSteps(dossierId: string, dossierType?: string): Promise<FetchResult<DossierStep>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dossier_steps')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('order_index', { ascending: true })
  if (error) return { items: [], error: error.message }

  let rows = (data ?? []) as Array<{
    id: string; dossier_id: string; label: string;
    status: DossierStep['status']; done_at: string | null;
    order_index: number; created_at: string;
  }>

  // Lazy-seed: als nog geen stappen + dossier_type bekend → seed defaults
  if (rows.length === 0 && dossierType && DEFAULT_STEPS_BY_TYPE[dossierType]) {
    const defaults = DEFAULT_STEPS_BY_TYPE[dossierType]
    const insertRows = defaults.map((label, i) => ({
      dossier_id: dossierId,
      label,
      status: 'pending' as const,
      order_index: i,
    }))
    const { data: inserted } = await admin.from('dossier_steps').insert(insertRows).select('*')
    rows = (inserted ?? []) as typeof rows
  }

  const items: DossierStep[] = rows.map((r) => ({
    id: r.id,
    dossierId: r.dossier_id,
    label: r.label,
    status: r.status,
    doneAt: r.done_at,
    orderIndex: r.order_index,
    createdAt: r.created_at,
  }))
  return { items }
}

export type DossierEvent = {
  id: string
  dossierId: string
  eventType: 'email_sent' | 'note_added' | 'status_changed' | 'document_uploaded' | 'document_shared' | 'appointment_created' | 'appointment_completed' | 'other'
  title: string
  body: string | null
  metadata: Record<string, unknown>
  createdBy: string | null
  createdAt: string
}

export type AdminSearchHit = {
  type: 'dossier_notes' | 'dossier_event' | 'commission_notes' | 'client_notes'
  dossierId: string | null
  dossierRef: string | null
  clientId: string | null
  clientName: string | null
  matchText: string
  fullText: string
  href: string
  createdAt: string
}

export type NoteTemplateCategory = 'algemeen' | 'verkoop' | 'verhuur' | 'koop_zoeker' | 'huur_zoeker'

export type NoteTemplate = {
  id: string
  label: string
  text: string
  category: NoteTemplateCategory
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type TeamMember = {
  id: string
  email: string
  firstName: string
  lastName: string
  title?: string
  phone?: string
  bivNumber?: string
  photoUrl?: string
  active: boolean
}

function metadataToTeamMember(
  id: string,
  email: string,
  md: Record<string, unknown> | null | undefined,
): TeamMember {
  return {
    id,
    email,
    firstName: (md?.first_name as string) || '',
    lastName: (md?.last_name as string) || '',
    title: (md?.title as string | undefined) || undefined,
    phone: (md?.phone as string | undefined) || undefined,
    bivNumber: (md?.biv_number as string | undefined) || undefined,
    photoUrl: (md?.photo_url as string | undefined) || undefined,
    active: md?.active !== false,
  }
}

function sortTeam(team: TeamMember[]): TeamMember[] {
  return team.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return a.lastName.localeCompare(b.lastName, 'nl-BE')
  })
}

/**
 * Probeert eerst de directe RPC `list_admin_users` (omzeilt de Supabase
 * Auth listUsers-call die in dit project crasht met "Database error
 * finding users"). Valt terug op admin.auth.admin.listUsers met 1 retry.
 * Bij totale fail wordt minstens `fallbackUserId` (de ingelogde admin)
 * via getUserById opgehaald zodat de pagina niet leeg is.
 */
export async function getTeamMembers(fallbackUserId?: string): Promise<FetchResult<TeamMember>> {
  const admin = createAdminClient()

  // 1) RPC-pad — werkt zolang de SQL-functie is gedeployd
  type RpcRow = {
    id: string
    email: string | null
    raw_user_meta_data: Record<string, unknown> | null
    created_at: string
  }
  try {
    const { data: rpcRows, error: rpcErr } = await admin.rpc('list_admin_users')
    if (!rpcErr && Array.isArray(rpcRows)) {
      const team: TeamMember[] = (rpcRows as RpcRow[])
        .filter((r) => r.email)
        .map((r) => metadataToTeamMember(r.id, r.email!, r.raw_user_meta_data))
      return { items: sortTeam(team) }
    }
  } catch {
    // RPC niet beschikbaar — door naar listUsers-pad
  }

  // 2) SDK-pad met retry
  async function tryListUsers() {
    return await admin.auth.admin.listUsers()
  }

  let { data, error } = await tryListUsers()
  if (error) {
    await new Promise((r) => setTimeout(r, 400))
    ;({ data, error } = await tryListUsers())
  }

  if (error) {
    // 3) Single-user fallback via getUserById
    if (fallbackUserId) {
      try {
        const { data: single } = await admin.auth.admin.getUserById(fallbackUserId)
        const u = single?.user
        if (u && u.user_metadata?.role === 'admin' && u.email) {
          return {
            items: [metadataToTeamMember(u.id, u.email, u.user_metadata as Record<string, unknown>)],
            error: `Volledige team-lijst niet beschikbaar (${error.message}). Alleen jouw account wordt getoond. Voer de list_admin_users RPC-migratie uit om dit op te lossen.`,
          }
        }
      } catch {
        // negeer — return de listUsers-error
      }
    }
    return { items: [], error: error.message }
  }

  const team: TeamMember[] = (data?.users ?? [])
    .filter((u) => u.user_metadata?.role === 'admin' && u.email)
    .map((u) => metadataToTeamMember(u.id, u.email!, u.user_metadata as Record<string, unknown>))

  return { items: sortTeam(team) }
}

export async function getNoteTemplates(): Promise<FetchResult<NoteTemplate>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('note_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('order_index', { ascending: true })
  if (error) return { items: [], error: error.message }
  const items: NoteTemplate[] = ((data ?? []) as Array<{
    id: string; label: string; text: string; category: NoteTemplateCategory | null;
    order_index: number; created_at: string; updated_at: string;
  }>).map((r) => ({
    id: r.id,
    label: r.label,
    text: r.text,
    category: (r.category ?? 'algemeen') as NoteTemplateCategory,
    orderIndex: r.order_index,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
  return { items }
}

/**
 * Full-text zoeken doorheen alle vrije-tekst velden van het admin systeem:
 * dossier notities, dossier events, commissie notities, klant notities.
 * Case-insensitive substring match.
 */
export async function searchAdminNotes(query: string): Promise<AdminSearchHit[]> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const admin = createAdminClient()
  const hits: AdminSearchHit[] = []

  // 1) dossier.notes + dossier.commission_notes
  const { items: dossiers } = await getAdminDossiers()
  for (const d of dossiers) {
    if (d.notes && d.notes.toLowerCase().includes(q)) {
      hits.push({
        type: 'dossier_notes',
        dossierId: d.id,
        dossierRef: d.ref,
        clientId: d.clientId,
        clientName: d.clientName,
        matchText: snippet(d.notes, q),
        fullText: d.notes,
        href: `/admin/dossiers/${d.id}`,
        createdAt: d.openedAt,
      })
    }
    if (d.commissionNotes && d.commissionNotes.toLowerCase().includes(q)) {
      hits.push({
        type: 'commission_notes',
        dossierId: d.id,
        dossierRef: d.ref,
        clientId: d.clientId,
        clientName: d.clientName,
        matchText: snippet(d.commissionNotes, q),
        fullText: d.commissionNotes,
        href: `/admin/dossiers/${d.id}`,
        createdAt: d.openedAt,
      })
    }
  }

  // 2) dossier_events bodies
  const { data: eventsData } = await admin
    .from('dossier_events')
    .select('id, dossier_id, event_type, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)
  if (eventsData) {
    const byDossier = new Map(dossiers.map((d) => [d.id, d]))
    for (const e of (eventsData as Array<{
      id: string; dossier_id: string; event_type: string; title: string;
      body: string | null; created_at: string;
    }>)) {
      const fullText = [e.title, e.body].filter(Boolean).join(' — ')
      if (!fullText.toLowerCase().includes(q)) continue
      const dossier = byDossier.get(e.dossier_id)
      hits.push({
        type: 'dossier_event',
        dossierId: e.dossier_id,
        dossierRef: dossier?.ref ?? null,
        clientId: dossier?.clientId ?? null,
        clientName: dossier?.clientName ?? null,
        matchText: snippet(fullText, q),
        fullText,
        href: `/admin/dossiers/${e.dossier_id}`,
        createdAt: e.created_at,
      })
    }
  }

  // 3) Klant-notities uit user_metadata
  const { items: clients } = await getAdminClients()
  for (const c of clients) {
    if (c.notes && c.notes.toLowerCase().includes(q)) {
      hits.push({
        type: 'client_notes',
        dossierId: null,
        dossierRef: null,
        clientId: c.id,
        clientName: `${c.firstName} ${c.lastName}`.trim() || c.email,
        matchText: snippet(c.notes, q),
        fullText: c.notes,
        href: `/admin/klanten/${c.id}`,
        createdAt: c.createdAt,
      })
    }
  }

  hits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return hits
}

function snippet(text: string, q: string, contextChars = 80): string {
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return text.slice(0, 200)
  const start = Math.max(0, idx - contextChars)
  const end = Math.min(text.length, idx + q.length + contextChars)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return prefix + text.slice(start, end) + suffix
}

export type ClientActivityEvent = DossierEvent & {
  dossierRef: string | null
  dossierAddress: string | null
}

/**
 * Activity feed voor een klant: aggregeert alle dossier_events van al hun
 * dossiers. Gesorteerd nieuwste eerst.
 */
export async function getClientActivity(clientId: string, limit = 100): Promise<FetchResult<ClientActivityEvent>> {
  const admin = createAdminClient()
  const { data: dossiers } = await admin
    .from('dossiers')
    .select('id, reference, property_address')
    .eq('client_id', clientId)
  const dossierRows = (dossiers ?? []) as Array<{ id: string; reference: string | null; property_address: string | null }>
  const dossierIds = dossierRows.map((d) => d.id)
  if (dossierIds.length === 0) return { items: [] }

  const dossierMeta = new Map(dossierRows.map((d) => [d.id, { ref: d.reference, address: d.property_address }]))

  const { data, error } = await admin
    .from('dossier_events')
    .select('*')
    .in('dossier_id', dossierIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { items: [], error: error.message }

  const items: ClientActivityEvent[] = ((data ?? []) as Array<{
    id: string; dossier_id: string; event_type: DossierEvent['eventType'];
    title: string; body: string | null; metadata: Record<string, unknown>;
    created_by: string | null; created_at: string;
  }>).map((r) => {
    const meta = dossierMeta.get(r.dossier_id)
    return {
      id: r.id,
      dossierId: r.dossier_id,
      eventType: r.event_type,
      title: r.title,
      body: r.body,
      metadata: r.metadata ?? {},
      createdBy: r.created_by,
      createdAt: r.created_at,
      dossierRef: meta?.ref ?? null,
      dossierAddress: meta?.address ?? null,
    }
  })
  return { items }
}

export async function getDossierEvents(dossierId: string, limit = 50): Promise<FetchResult<DossierEvent>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dossier_events')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { items: [], error: error.message }
  const items: DossierEvent[] = ((data ?? []) as Array<{
    id: string; dossier_id: string; event_type: DossierEvent['eventType'];
    title: string; body: string | null; metadata: Record<string, unknown>;
    created_by: string | null; created_at: string;
  }>).map((r) => ({
    id: r.id,
    dossierId: r.dossier_id,
    eventType: r.event_type,
    title: r.title,
    body: r.body,
    metadata: r.metadata ?? {},
    createdBy: r.created_by,
    createdAt: r.created_at,
  }))
  return { items }
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

export type NotificationType = 'new_match' | 'new_document' | 'appointment_reminder' | 'dossier_update' | 'message'

export type AdminNotification = {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

export async function getAdminNotifications(limit = 200): Promise<FetchResult<AdminNotification>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { items: [], error: error.message }

  const rows = (data ?? []) as Array<{
    id: string; user_id: string; type: NotificationType; title: string;
    body: string | null; link: string | null; read_at: string | null; created_at: string;
  }>

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)))
  const userById = new Map<string, { name: string; email: string }>()
  if (userIds.length > 0) {
    const { data: profs } = await admin
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds)
    for (const p of (profs ?? []) as Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>) {
      userById.set(p.id, {
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email,
        email: p.email,
      })
    }
  }

  const items: AdminNotification[] = rows.map((r) => {
    const u = userById.get(r.user_id) ?? { name: '(onbekende klant)', email: '' }
    return {
      id: r.id,
      userId: r.user_id,
      userName: u.name,
      userEmail: u.email,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      readAt: r.read_at,
      createdAt: r.created_at,
    }
  })
  return { items }
}

export async function getAdminUnreadNotificationCount(): Promise<number> {
  const admin = createAdminClient()
  const { count, error } = await admin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) return 0
  return count ?? 0
}

export type PortalNotification = Omit<AdminNotification, 'userId' | 'userName' | 'userEmail'>

export async function getNotificationsForUser(userId: string, limit = 30): Promise<FetchResult<PortalNotification>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { items: [], error: error.message }
  const items: PortalNotification[] = ((data ?? []) as Array<{
    id: string; type: NotificationType; title: string; body: string | null;
    link: string | null; read_at: string | null; created_at: string;
  }>).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    link: r.link,
    readAt: r.read_at,
    createdAt: r.created_at,
  }))
  return { items }
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

export type StorageStats = {
  documentsCount: number
  documentsBytes: number
  documentsByCategory: Array<{ category: string; count: number; bytes: number }>
  photosCount: number
  photosBytes: number
  photosByListingStatus: Array<{ status: string; count: number }>
  listingsWithPhotos: number
  totalBytes: number
}

/**
 * Telt documents (via public.documents rows met size_bytes) en
 * listing-photos (via storage.objects listing in 'listing-photos' bucket).
 */
export async function getStorageStats(): Promise<StorageStats> {
  const admin = createAdminClient()

  // Documenten — uit DB-rijen (snelste, size_bytes staat erin)
  let documentsCount = 0
  let documentsBytes = 0
  const byCategory = new Map<string, { count: number; bytes: number }>()
  const { data: docs } = await admin.from('documents').select('size_bytes, category')
  if (docs) {
    documentsCount = docs.length
    for (const r of (docs as Array<{ size_bytes: number | null; category: string | null }>)) {
      documentsBytes += r.size_bytes ?? 0
      const cat = r.category ?? 'overig'
      const cur = byCategory.get(cat) ?? { count: 0, bytes: 0 }
      cur.count += 1
      cur.bytes += r.size_bytes ?? 0
      byCategory.set(cat, cur)
    }
  }
  const documentsByCategory = Array.from(byCategory.entries())
    .map(([category, v]) => ({ category, count: v.count, bytes: v.bytes }))
    .sort((a, b) => b.count - a.count)

  // Foto's — uit listings.gallery counts + storage listing voor sizes
  let photosCount = 0
  let listingsWithPhotos = 0
  let photosBytes = 0
  const photosByStatusMap = new Map<string, number>()
  const { data: listings } = await admin.from('listings').select('gallery, status')
  if (listings) {
    for (const l of (listings as Array<{ gallery: string[] | null; status: string }>)) {
      const g = l.gallery ?? []
      if (g.length > 0) listingsWithPhotos++
      photosCount += g.length
      if (g.length > 0) {
        photosByStatusMap.set(l.status, (photosByStatusMap.get(l.status) ?? 0) + g.length)
      }
    }
  }
  const photosByListingStatus = Array.from(photosByStatusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  // Foto-bytes: list bucket via Storage API (één call per top-level folder)
  // Optioneel — kan duur zijn bij veel folders; lazy-evaluate door enkel root te listen
  try {
    const { data: rootFolders } = await admin.storage.from('listing-photos').list('', { limit: 1000 })
    if (rootFolders) {
      // Per folder een quick list voor sizes
      const folderListings = await Promise.all(
        rootFolders.slice(0, 50).map((f) =>
          admin.storage.from('listing-photos').list(f.name, { limit: 100 })
        ),
      )
      for (const fl of folderListings) {
        for (const obj of (fl.data ?? [])) {
          photosBytes += obj.metadata?.size ?? 0
        }
      }
    }
  } catch (e) {
    console.warn('[getStorageStats] photo size scan skipped:', e)
  }

  return {
    documentsCount,
    documentsBytes,
    documentsByCategory,
    photosCount,
    photosBytes,
    photosByListingStatus,
    listingsWithPhotos,
    totalBytes: documentsBytes + photosBytes,
  }
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
 * Gerealiseerde commissies per maand (laatste N maanden).
 * Bucketing op closed_at; alleen dossiers met status verkocht/verhuurd.
 */
export async function getCommissionHistory(months = 12): Promise<Array<{ x: string; Gerealiseerd: number; Aantal: number }>> {
  const { items: dossiers } = await getAdminDossiers()
  const now = new Date()
  const monthLabels = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  const buckets: Array<{ start: Date; end: Date; label: string }> = []
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const yearSuffix = start.getFullYear() !== now.getFullYear() ? ` '${String(start.getFullYear()).slice(-2)}` : ''
    buckets.push({ start, end, label: `${monthLabels[start.getMonth()]}${yearSuffix}` })
  }
  const closed = dossiers.filter((d) => (d.status === 'verkocht' || d.status === 'verhuurd') && d.closedAt)
  return buckets.map((b) => {
    let total = 0
    let count = 0
    for (const d of closed) {
      const closedAt = new Date(d.closedAt!).getTime()
      if (closedAt >= b.start.getTime() && closedAt < b.end.getTime()) {
        total += computeCommission(d)
        count += 1
      }
    }
    return { x: b.label, Gerealiseerd: total, Aantal: count }
  })
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
