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

export type AssigneeResult = { ok: boolean; error?: string }

export async function setDossierAssigneeAction(
  dossierId: string,
  assigneeId: string | null,
): Promise<AssigneeResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()

  // Validatie: assignee moet bestaan en admin zijn
  if (assigneeId) {
    const { data: existing, error: getErr } = await admin.auth.admin.getUserById(assigneeId)
    if (getErr || !existing.user) {
      return { ok: false, error: 'Werknemer niet gevonden.' }
    }
    if (existing.user.user_metadata?.role !== 'admin') {
      return { ok: false, error: 'Alleen werknemers kunnen toegewezen worden.' }
    }
  }

  const { error } = await admin
    .from('dossiers')
    .update({ assigned_to: assigneeId })
    .eq('id', dossierId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/dossiers/${dossierId}`)
  revalidatePath('/admin/dossiers')
  revalidatePath('/admin/team')
  return { ok: true }
}
