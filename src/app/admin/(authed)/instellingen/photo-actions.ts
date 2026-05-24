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

const BUCKET = 'team-photos'

export type PhotoResult =
  | { ok: true; photoUrl: string }
  | { ok: false; error: string }

export async function uploadTeamPhotoAction(
  userId: string,
  formData: FormData,
): Promise<PhotoResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'Geen bestand ontvangen.' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.` }
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { ok: false, error: `Bestandstype ${file.type} niet toegestaan. Enkel JPG, PNG, WebP.` }
  }

  const admin = createAdminClient()

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })
  if (uploadErr) {
    return { ok: false, error: `Upload mislukt: ${uploadErr.message}` }
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path)
  const photoUrl = publicUrlData.publicUrl

  // Oude foto verwijderen (vorige photo_path in user_metadata)
  const { data: existing } = await admin.auth.admin.getUserById(userId)
  const oldPath = (existing?.user?.user_metadata as Record<string, unknown> | undefined)?.photo_path as string | undefined
  if (oldPath && oldPath !== path) {
    await admin.storage.from(BUCKET).remove([oldPath]).catch(() => {})
  }

  const merged = {
    ...(existing?.user?.user_metadata || {}),
    photo_url: photoUrl,
    photo_path: path,
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (updErr) {
    // Cleanup: verwijder de net-geüploade foto als metadata-update faalt
    await admin.storage.from(BUCKET).remove([path]).catch(() => {})
    return { ok: false, error: `Opslaan metadata mislukt: ${updErr.message}` }
  }

  revalidatePath('/admin/team')
  revalidatePath('/admin/instellingen')
  return { ok: true, photoUrl }
}

export async function removeTeamPhotoAction(userId: string): Promise<{ ok: boolean; error?: string }> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'User niet gevonden.' }
  }

  const md = existing.user.user_metadata as Record<string, unknown> | undefined
  const oldPath = md?.photo_path as string | undefined
  if (oldPath) {
    await admin.storage.from(BUCKET).remove([oldPath]).catch(() => {})
  }

  const merged = { ...(md || {}) }
  delete merged.photo_url
  delete merged.photo_path

  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (updErr) return { ok: false, error: updErr.message }

  revalidatePath('/admin/team')
  revalidatePath('/admin/instellingen')
  return { ok: true }
}
