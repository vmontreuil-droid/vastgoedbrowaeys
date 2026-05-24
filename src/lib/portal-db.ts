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
