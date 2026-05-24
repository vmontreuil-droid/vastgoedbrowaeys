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

export type ActionResult = { ok: boolean; error?: string; message?: string }

export async function promoteToAdminAction(userId: string): Promise<ActionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: getErr?.message ?? 'User niet gevonden' }
  }

  const mergedMetadata = {
    ...(existing.user.user_metadata || {}),
    role: 'admin',
    active: true,
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: mergedMetadata,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/team')
  revalidatePath('/admin/team/diagnose')
  return { ok: true, message: `${existing.user.email} is nu admin.` }
}

export async function deleteUserByIdAction(userId: string): Promise<ActionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/team')
  revalidatePath('/admin/team/diagnose')
  return { ok: true, message: 'User verwijderd.' }
}
