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

export type TagsResult = { ok: boolean; error?: string; tags?: string[] }

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 32)
}

export async function setDossierTagsAction(
  dossierId: string,
  tags: string[],
): Promise<TagsResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const cleaned = Array.from(
    new Set(tags.map(normalizeTag).filter((t) => t.length > 0)),
  ).slice(0, 20)

  const admin = createAdminClient()
  const { error } = await admin
    .from('dossiers')
    .update({ tags: cleaned })
    .eq('id', dossierId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/dossiers/${dossierId}`)
  revalidatePath('/admin/dossiers')
  return { ok: true, tags: cleaned }
}
