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

export type LeadActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function markLeadReadAction(id: string, read: boolean): Promise<LeadActionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('leads').update({ read_at: read ? new Date().toISOString() : null }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/berichten')
  revalidatePath(`/admin/berichten/${id}`)
  return { ok: true }
}

export async function archiveLeadAction(id: string): Promise<LeadActionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('leads').update({ archived: true }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/berichten')
  return { ok: true, message: 'Gearchiveerd.' }
}

export async function assignLeadAction(id: string, userId: string | null): Promise<LeadActionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('leads').update({ assigned_to: userId }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/berichten/${id}`)
  return { ok: true }
}
