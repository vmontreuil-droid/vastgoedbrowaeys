'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
}

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string }

const BUCKET = 'listing-photos'

export async function uploadListingPhotoAction(
  folderKey: string,
  formData: FormData,
): Promise<UploadResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'Geen bestand ontvangen.' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` }
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { ok: false, error: `Bestandstype ${file.type} niet toegestaan. Enkel JPG, PNG, WebP.` }
  }

  // Veilige folder-key (alleen alfanumeriek + streepje)
  const safeFolder = folderKey.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 80) || 'temp'

  // Unieke bestandsnaam
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60)
  const filename = `${Date.now()}-${baseName}.${ext}`
  const path = `${safeFolder}/${filename}`

  const admin = createAdminClient()
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

  return { ok: true, url: publicUrlData.publicUrl, path }
}

export async function deleteListingPhotoAction(path: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  if (!path || path.includes('..')) {
    return { ok: false, error: 'Ongeldig pad.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.storage.from(BUCKET).remove([path])
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
