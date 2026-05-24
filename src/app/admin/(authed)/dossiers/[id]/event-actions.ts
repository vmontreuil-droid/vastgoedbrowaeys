'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type EventResult = { ok: boolean; error?: string }

export async function logEmailSentAction(input: {
  dossierId: string
  to: string
  subject: string
  body: string
}): Promise<EventResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('dossier_events').insert({
    dossier_id: input.dossierId,
    event_type: 'email_sent',
    title: `E-mail aan ${input.to}: ${input.subject}`,
    body: input.body,
    metadata: { to: input.to, subject: input.subject },
    created_by: user.id,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/dossiers/${input.dossierId}`)
  return { ok: true }
}

export async function addNoteAction(input: { dossierId: string; note: string }): Promise<EventResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  if (!input.note.trim()) return { ok: false, error: 'Notitie mag niet leeg zijn.' }

  const admin = createAdminClient()
  const { error } = await admin.from('dossier_events').insert({
    dossier_id: input.dossierId,
    event_type: 'note_added',
    title: 'Notitie toegevoegd',
    body: input.note.trim(),
    created_by: user.id,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/dossiers/${input.dossierId}`)
  return { ok: true }
}
