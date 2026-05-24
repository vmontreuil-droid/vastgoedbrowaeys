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

export type NotifResult = { ok: boolean; error?: string }

export async function markNotificationReadAction(id: string, read = true): Promise<NotifResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/notificaties')
  revalidatePath('/admin')
  return { ok: true }
}

export async function markAllNotificationsReadAction(): Promise<NotifResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/notificaties')
  revalidatePath('/admin')
  return { ok: true }
}

export async function deleteNotificationAction(id: string): Promise<NotifResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('notifications').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/notificaties')
  return { ok: true }
}
