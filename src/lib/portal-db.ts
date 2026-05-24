// === Portal DB helpers ===
// Server-side queries voor /portaal/* pagina's. Geven enkel data terug van
// de huidige ingelogde klant (filtering op user.id).

import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type PortalDossier = {
  id: string
  ref: string | null
  type: 'verkoop' | 'verhuur' | 'koop_zoeker' | 'huur_zoeker'
  status: 'open' | 'in_behandeling' | 'onder_optie' | 'verkocht' | 'verhuurd' | 'geannuleerd'
  propertyAddress: string | null
  propertyCity: string | null
  askingPrice: number | null
  openedAt: string
  closedAt: string | null
  notes: string | null
  appointmentsCount: number
  sharedDocumentsCount: number
}

type Result<T> = { items: T[]; error?: string }

export async function getMyDossiers(userId: string): Promise<Result<PortalDossier>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dossiers')
    .select('*')
    .eq('client_id', userId)
    .order('opened_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const rows = (data ?? []) as Array<{
    id: string; type: PortalDossier['type']; status: PortalDossier['status'];
    property_address: string | null; property_city: string | null;
    asking_price: number | null; reference: string | null;
    opened_at: string; closed_at: string | null; notes: string | null;
  }>

  if (rows.length === 0) return { items: [] }

  const dossierIds = rows.map((r) => r.id)
  const { data: appts } = await admin.from('appointments').select('dossier_id').in('dossier_id', dossierIds)
  const { data: docs } = await admin
    .from('documents')
    .select('dossier_id, shared_with_client')
    .in('dossier_id', dossierIds)
    .eq('shared_with_client', true)

  const apptByDossier = new Map<string, number>()
  ;(appts ?? []).forEach((r: { dossier_id: string }) => {
    apptByDossier.set(r.dossier_id, (apptByDossier.get(r.dossier_id) ?? 0) + 1)
  })
  const docByDossier = new Map<string, number>()
  ;(docs ?? []).forEach((r: { dossier_id: string }) => {
    docByDossier.set(r.dossier_id, (docByDossier.get(r.dossier_id) ?? 0) + 1)
  })

  const items: PortalDossier[] = rows.map((d) => ({
    id: d.id,
    ref: d.reference,
    type: d.type,
    status: d.status,
    propertyAddress: d.property_address,
    propertyCity: d.property_city,
    askingPrice: d.asking_price,
    openedAt: d.opened_at,
    closedAt: d.closed_at,
    notes: d.notes,
    appointmentsCount: apptByDossier.get(d.id) ?? 0,
    sharedDocumentsCount: docByDossier.get(d.id) ?? 0,
  }))
  return { items }
}

export async function getMyDossier(userId: string, dossierId: string): Promise<PortalDossier | null> {
  const { items } = await getMyDossiers(userId)
  return items.find((d) => d.id === dossierId) ?? null
}

export type PortalDocument = {
  id: string
  name: string
  category: string
  storagePath: string
  sizeBytes: number | null
  mimeType: string | null
  uploadedAt: string
}

export async function getSharedDocumentsForDossier(userId: string, dossierId: string): Promise<Result<PortalDocument>> {
  const admin = createAdminClient()

  // Verifieer dat dossier van deze klant is
  const { data: dossier } = await admin
    .from('dossiers')
    .select('client_id')
    .eq('id', dossierId)
    .single()
  if (!dossier || (dossier as { client_id: string }).client_id !== userId) {
    return { items: [], error: 'Geen toegang tot dit dossier.' }
  }

  const { data, error } = await admin
    .from('documents')
    .select('*')
    .eq('dossier_id', dossierId)
    .eq('shared_with_client', true)
    .order('created_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items: PortalDocument[] = ((data ?? []) as Array<{
    id: string; name: string; category: string; storage_path: string;
    size_bytes: number | null; mime_type: string | null; created_at: string;
  }>).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    storagePath: r.storage_path,
    sizeBytes: r.size_bytes,
    mimeType: r.mime_type,
    uploadedAt: r.created_at,
  }))
  return { items }
}

export type PortalAppointment = {
  id: string
  title: string
  start: string
  durationMin: number
  location: string | null
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled'
}

export type PortalStep = {
  id: string
  label: string
  status: 'pending' | 'done' | 'skipped'
  doneAt: string | null
  orderIndex: number
}

export async function getStepsForMyDossier(userId: string, dossierId: string): Promise<Result<PortalStep>> {
  const admin = createAdminClient()
  const { data: dossier } = await admin
    .from('dossiers')
    .select('client_id')
    .eq('id', dossierId)
    .single()
  if (!dossier || (dossier as { client_id: string }).client_id !== userId) {
    return { items: [], error: 'Geen toegang tot dit dossier.' }
  }

  const { data, error } = await admin
    .from('dossier_steps')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('order_index', { ascending: true })
  if (error) return { items: [], error: error.message }

  const items: PortalStep[] = ((data ?? []) as Array<{
    id: string; label: string; status: PortalStep['status'];
    done_at: string | null; order_index: number;
  }>).map((r) => ({
    id: r.id,
    label: r.label,
    status: r.status,
    doneAt: r.done_at,
    orderIndex: r.order_index,
  }))
  return { items }
}

export type PortalAppointmentWithDossier = PortalAppointment & {
  dossierId: string
  dossierRef: string | null
  propertyAddress: string | null
}

/** Alle afspraken over alle dossiers van deze klant. */
export async function getMyAppointments(userId: string): Promise<Result<PortalAppointmentWithDossier>> {
  const admin = createAdminClient()
  const { data: dossiers, error: dossiersErr } = await admin
    .from('dossiers')
    .select('id, reference, property_address')
    .eq('client_id', userId)
  if (dossiersErr) return { items: [], error: dossiersErr.message }

  const dossierRows = (dossiers ?? []) as Array<{ id: string; reference: string | null; property_address: string | null }>
  if (dossierRows.length === 0) return { items: [] }

  const dossierMeta = new Map(dossierRows.map((d) => [d.id, { ref: d.reference, address: d.property_address }]))

  const { data, error } = await admin
    .from('appointments')
    .select('*')
    .in('dossier_id', dossierRows.map((d) => d.id))
    .order('appointment_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items: PortalAppointmentWithDossier[] = ((data ?? []) as Array<{
    id: string; dossier_id: string; title: string; appointment_at: string; duration_min: number;
    location: string | null; status: PortalAppointment['status'];
  }>).map((r) => {
    const meta = dossierMeta.get(r.dossier_id)
    return {
      id: r.id,
      title: r.title,
      start: r.appointment_at,
      durationMin: r.duration_min,
      location: r.location,
      status: r.status,
      dossierId: r.dossier_id,
      dossierRef: meta?.ref ?? null,
      propertyAddress: meta?.address ?? null,
    }
  })
  return { items }
}

export type PortalDocumentWithDossier = PortalDocument & {
  dossierId: string
  dossierRef: string | null
  propertyAddress: string | null
}

/** Alle gedeelde documenten over alle dossiers van deze klant. */
export async function getMySharedDocuments(userId: string): Promise<Result<PortalDocumentWithDossier>> {
  const admin = createAdminClient()
  const { data: dossiers, error: dossiersErr } = await admin
    .from('dossiers')
    .select('id, reference, property_address')
    .eq('client_id', userId)
  if (dossiersErr) return { items: [], error: dossiersErr.message }

  const dossierRows = (dossiers ?? []) as Array<{ id: string; reference: string | null; property_address: string | null }>
  if (dossierRows.length === 0) return { items: [] }

  const dossierMeta = new Map(dossierRows.map((d) => [d.id, { ref: d.reference, address: d.property_address }]))

  const { data, error } = await admin
    .from('documents')
    .select('*')
    .in('dossier_id', dossierRows.map((d) => d.id))
    .eq('shared_with_client', true)
    .order('created_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items: PortalDocumentWithDossier[] = ((data ?? []) as Array<{
    id: string; dossier_id: string; name: string; category: string;
    storage_path: string; size_bytes: number | null; mime_type: string | null; created_at: string;
  }>).map((r) => {
    const meta = dossierMeta.get(r.dossier_id)
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      storagePath: r.storage_path,
      sizeBytes: r.size_bytes,
      mimeType: r.mime_type,
      uploadedAt: r.created_at,
      dossierId: r.dossier_id,
      dossierRef: meta?.ref ?? null,
      propertyAddress: meta?.address ?? null,
    }
  })
  return { items }
}

export type PortalContactAgent = {
  id: string
  name: string
  email: string
  phone: string | null
  title: string | null
  photoUrl: string | null
  bivNumber: string | null
}

/** De toegewezen werknemer voor een specifiek dossier (kan null zijn). Valt
 *  terug op de zaakvoerder (Stefanie) als er niemand specifiek toegewezen is. */
export async function getDossierContactAgent(userId: string, dossierId: string): Promise<PortalContactAgent | null> {
  const admin = createAdminClient()
  const { data: dossier } = await admin
    .from('dossiers')
    .select('client_id, assigned_to')
    .eq('id', dossierId)
    .single()
  if (!dossier || (dossier as { client_id: string }).client_id !== userId) return null

  const assignedTo = (dossier as { assigned_to: string | null }).assigned_to
  if (!assignedTo) {
    // Fallback: Stefanie
    return getStefanieAsAgent()
  }

  const { data: userData, error: getErr } = await admin.auth.admin.getUserById(assignedTo)
  if (getErr || !userData?.user || userData.user.user_metadata?.role !== 'admin') {
    return getStefanieAsAgent()
  }

  const u = userData.user
  const md = u.user_metadata as Record<string, unknown>
  return {
    id: u.id,
    name: `${(md.first_name as string) || ''} ${(md.last_name as string) || ''}`.trim() || (u.email ?? ''),
    email: u.email ?? '',
    phone: (md.phone as string) || null,
    title: (md.title as string) || null,
    photoUrl: (md.photo_url as string) || null,
    bivNumber: (md.biv_number as string) || null,
  }
}

async function getStefanieAsAgent(): Promise<PortalContactAgent | null> {
  const admin = createAdminClient()
  try {
    const { data } = await admin.rpc('list_admin_users')
    if (Array.isArray(data)) {
      type Row = { id: string; email: string | null; raw_user_meta_data: Record<string, unknown> | null }
      const stef = (data as Row[]).find((r) => r.email === 'stephanie@vastgoedbrowaeys.be')
      if (stef) {
        const md = stef.raw_user_meta_data ?? {}
        return {
          id: stef.id,
          name: `${(md.first_name as string) || ''} ${(md.last_name as string) || ''}`.trim() || (stef.email ?? ''),
          email: stef.email ?? '',
          phone: (md.phone as string) || null,
          title: (md.title as string) || null,
          photoUrl: (md.photo_url as string) || null,
          bivNumber: (md.biv_number as string) || null,
        }
      }
    }
  } catch {
    // negeer
  }
  return {
    id: '',
    name: 'Stefanie Browaeys',
    email: 'stephanie@vastgoedbrowaeys.be',
    phone: '+32 (0)55 59 50 10',
    title: 'Zaakvoerder · Vastgoedmakelaar-bemiddelaar',
    photoUrl: null,
    bivNumber: '504.553',
  }
}

export type PortalStats = {
  openDossiers: number
  appointments: number
  documents: number
  unreadNotifications: number
}

export async function getMyStats(userId: string): Promise<PortalStats> {
  const admin = createAdminClient()
  const [
    { count: openCount },
    { count: apptCount },
    { count: docCount },
    { count: unreadNotifs },
  ] = await Promise.all([
    admin.from('dossiers').select('id', { count: 'exact', head: true })
      .eq('client_id', userId)
      .in('status', ['open', 'in_behandeling', 'onder_optie']),
    admin.from('appointments').select('dossier_id, dossiers!inner(client_id)', { count: 'exact', head: true })
      .eq('dossiers.client_id', userId)
      .gte('appointment_at', new Date().toISOString())
      .neq('status', 'cancelled') as unknown as Promise<{ count: number | null }>,
    admin.from('documents').select('dossier_id, dossiers!inner(client_id)', { count: 'exact', head: true })
      .eq('dossiers.client_id', userId)
      .eq('shared_with_client', true) as unknown as Promise<{ count: number | null }>,
    admin.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ])
  return {
    openDossiers: openCount ?? 0,
    appointments: apptCount ?? 0,
    documents: docCount ?? 0,
    unreadNotifications: unreadNotifs ?? 0,
  }
}

export async function getAppointmentsForMyDossier(userId: string, dossierId: string): Promise<Result<PortalAppointment>> {
  const admin = createAdminClient()
  const { data: dossier } = await admin
    .from('dossiers')
    .select('client_id')
    .eq('id', dossierId)
    .single()
  if (!dossier || (dossier as { client_id: string }).client_id !== userId) {
    return { items: [], error: 'Geen toegang tot dit dossier.' }
  }

  const { data, error } = await admin
    .from('appointments')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('appointment_at', { ascending: false })
  if (error) return { items: [], error: error.message }

  const items: PortalAppointment[] = ((data ?? []) as Array<{
    id: string; title: string; appointment_at: string; duration_min: number;
    location: string | null; status: PortalAppointment['status'];
  }>).map((r) => ({
    id: r.id,
    title: r.title,
    start: r.appointment_at,
    durationMin: r.duration_min,
    location: r.location,
    status: r.status,
  }))
  return { items }
}
