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

export type TemplateResult = { ok: boolean; error?: string }

export async function addTemplateAction(input: { label: string; text: string }): Promise<TemplateResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const label = input.label.trim()
  const text = input.text.trim()
  if (!label || !text) return { ok: false, error: 'Naam en tekst zijn verplicht.' }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('note_templates')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
  const nextIndex = ((existing?.[0] as { order_index: number } | undefined)?.order_index ?? -1) + 1

  const { error } = await admin.from('note_templates').insert({
    label, text, order_index: nextIndex, created_by: user.id,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/instellingen')
  return { ok: true }
}

export async function updateTemplateAction(id: string, input: { label: string; text: string }): Promise<TemplateResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const label = input.label.trim()
  const text = input.text.trim()
  if (!label || !text) return { ok: false, error: 'Naam en tekst zijn verplicht.' }

  const admin = createAdminClient()
  const { error } = await admin.from('note_templates').update({ label, text }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/instellingen')
  return { ok: true }
}

export async function deleteTemplateAction(id: string): Promise<TemplateResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('note_templates').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/instellingen')
  return { ok: true }
}
