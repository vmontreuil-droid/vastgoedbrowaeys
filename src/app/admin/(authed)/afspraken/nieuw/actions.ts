'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang — alleen beheerders.')
  }
}

export type AppointmentActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function createAppointmentAction(formData: FormData): Promise<AppointmentActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const dossierId = String(formData.get('dossier_id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const dateStr = String(formData.get('date') ?? '').trim() // YYYY-MM-DD
  const timeStr = String(formData.get('time') ?? '').trim() // HH:MM
  const durationMin = parseInt(String(formData.get('duration_min') ?? '60'), 10)
  const location = String(formData.get('location') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const status = String(formData.get('status') ?? 'planned').trim()

  if (!title) return { ok: false, error: 'Titel is verplicht.' }
  if (!dossierId) return { ok: false, error: 'Dossier-UUID is verplicht.' }
  if (!dateStr || !timeStr) return { ok: false, error: 'Datum en tijd zijn verplicht.' }

  const appointmentAt = new Date(`${dateStr}T${timeStr}:00`)
  if (Number.isNaN(appointmentAt.getTime())) {
    return { ok: false, error: 'Ongeldige datum/tijd.' }
  }

  const allowedStatus = ['planned', 'confirmed', 'completed', 'cancelled']
  if (!allowedStatus.includes(status)) {
    return { ok: false, error: 'Status is ongeldig.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('appointments').insert({
    dossier_id: dossierId,
    title,
    appointment_at: appointmentAt.toISOString(),
    duration_min: Number.isFinite(durationMin) ? durationMin : 60,
    location: location || null,
    notes: notes || null,
    status,
  })

  if (error) {
    return { ok: false, error: `Aanmaken mislukt: ${error.message}` }
  }

  revalidatePath('/admin/afspraken')
  redirect('/admin/afspraken?created=1')
}
