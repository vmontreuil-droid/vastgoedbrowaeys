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
}

export type ToggleResult = { ok: boolean; error?: string }

export async function adminToggleOptOutAction(userId: string, optOut: boolean): Promise<ToggleResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) return { ok: false, error: getErr?.message ?? 'Niet gevonden' }

  const merged = {
    ...(existing.user.user_metadata || {}),
    newsletter_opt_out: optOut,
    newsletter_opt_out_at: optOut ? new Date().toISOString() : null,
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, { user_metadata: merged })
  if (updErr) return { ok: false, error: updErr.message }

  revalidatePath('/admin/klanten')
  revalidatePath(`/admin/klanten/${userId}`)
  revalidatePath('/admin/nieuwsbrief')
  return { ok: true }
}
