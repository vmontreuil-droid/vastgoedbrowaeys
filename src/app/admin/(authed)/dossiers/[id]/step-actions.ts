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

export type StepResult = { ok: boolean; error?: string }
export type StepStatus = 'pending' | 'done' | 'skipped'

export async function setStepStatusAction(stepId: string, status: StepStatus): Promise<StepResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: step, error: getErr } = await admin
    .from('dossier_steps')
    .select('id, dossier_id, label, status')
    .eq('id', stepId)
    .single()
  if (getErr || !step) return { ok: false, error: getErr?.message ?? 'Stap niet gevonden' }
  const s = step as { id: string; dossier_id: string; label: string; status: StepStatus }

  const update: { status: StepStatus; done_at: string | null } = {
    status,
    done_at: status === 'done' ? new Date().toISOString() : null,
  }

  const { error: updErr } = await admin.from('dossier_steps').update(update).eq('id', stepId)
  if (updErr) return { ok: false, error: updErr.message }

  // Log naar timeline (alleen bij 'done' transitie)
  if (status === 'done' && s.status !== 'done') {
    await admin.from('dossier_events').insert({
      dossier_id: s.dossier_id,
      event_type: 'status_changed',
      title: `Stap afgevinkt: ${s.label}`,
      created_by: user.id,
    }).then(() => {}, () => {})
  }

  revalidatePath(`/admin/dossiers/${s.dossier_id}`)
  return { ok: true }
}

export async function addStepAction(input: { dossierId: string; label: string }): Promise<StepResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const label = input.label.trim()
  if (!label) return { ok: false, error: 'Label is verplicht.' }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('dossier_steps')
    .select('order_index')
    .eq('dossier_id', input.dossierId)
    .order('order_index', { ascending: false })
    .limit(1)
  const nextIndex = ((existing?.[0] as { order_index: number } | undefined)?.order_index ?? -1) + 1

  const { error } = await admin.from('dossier_steps').insert({
    dossier_id: input.dossierId,
    label,
    status: 'pending',
    order_index: nextIndex,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/dossiers/${input.dossierId}`)
  return { ok: true }
}

export async function deleteStepAction(stepId: string): Promise<StepResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: step } = await admin
    .from('dossier_steps')
    .select('dossier_id')
    .eq('id', stepId)
    .single()
  const dossierId = (step as { dossier_id: string } | null)?.dossier_id

  const { error } = await admin.from('dossier_steps').delete().eq('id', stepId)
  if (error) return { ok: false, error: error.message }
  if (dossierId) revalidatePath(`/admin/dossiers/${dossierId}`)
  return { ok: true }
}
