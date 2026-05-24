'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type NotifResult = { ok: boolean; error?: string }

export async function markMyNotificationReadAction(id: string): Promise<NotifResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id) // safety: alleen eigen notifs
  if (error) return { ok: false, error: error.message }

  revalidatePath('/portaal')
  return { ok: true }
}

export async function markAllMyNotificationsReadAction(): Promise<NotifResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/portaal')
  return { ok: true }
}
