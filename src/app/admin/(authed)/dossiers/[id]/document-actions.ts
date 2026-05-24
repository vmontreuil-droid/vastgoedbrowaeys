'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'dossier-documents'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type DocCategory =
  | 'compromis' | 'schatting' | 'epc' | 'asbest' | 'stedenbouw'
  | 'plaatsbeschrijving' | 'huurcontract' | 'foto' | 'overig'

export type UploadDocResult =
  | { ok: true; documentId: string; storagePath: string }
  | { ok: false; error: string }

export async function uploadDocumentAction(
  dossierId: string,
  formData: FormData,
): Promise<UploadDocResult> {
  let user
  try {
    user = await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'Geen bestand ontvangen.' }
  if (file.size === 0) return { ok: false, error: 'Bestand is leeg.' }
  if (file.size > 25 * 1024 * 1024) {
    return { ok: false, error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 25 MB.` }
  }

  const allowedCats: DocCategory[] = ['compromis','schatting','epc','asbest','stedenbouw','plaatsbeschrijving','huurcontract','foto','overig']
  const rawCat = String(formData.get('category') ?? 'overig').trim() as DocCategory
  const category: DocCategory = allowedCats.includes(rawCat) ? rawCat : 'overig'

  const safeDossier = dossierId.replace(/[^a-zA-Z0-9-]/g, '')
  if (!safeDossier) return { ok: false, error: 'Ongeldig dossier-id.' }

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 80) || 'document'
  const filename = `${Date.now()}-${base}.${ext}`
  const storagePath = `${safeDossier}/${filename}`

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    })
  if (uploadErr) {
    return { ok: false, error: `Upload mislukt: ${uploadErr.message}` }
  }

  // Insert row in public.documents
  const { data: inserted, error: insertErr } = await admin
    .from('documents')
    .insert({
      dossier_id: dossierId,
      name: file.name,
      category,
      storage_path: storagePath,
      size_bytes: file.size,
      mime_type: file.type || null,
      uploaded_by: user.id,
    })
    .select('id')
    .single()

  if (insertErr || !inserted) {
    // Roll-back de upload
    await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    return { ok: false, error: `DB-insert mislukt: ${insertErr?.message ?? 'onbekend'}` }
  }

  revalidatePath(`/admin/dossiers/${dossierId}`)
  return { ok: true, documentId: (inserted as { id: string }).id, storagePath }
}

export type DeleteDocResult = { ok: boolean; error?: string }

export async function deleteDocumentAction(documentId: string): Promise<DeleteDocResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()

  const { data: doc, error: getErr } = await admin
    .from('documents')
    .select('id, storage_path, dossier_id')
    .eq('id', documentId)
    .single()
  if (getErr || !doc) {
    return { ok: false, error: `Document niet gevonden: ${getErr?.message ?? '404'}` }
  }
  const d = doc as { id: string; storage_path: string; dossier_id: string }

  // Verwijder storage object eerst, dan rij — zo blijven geen wees-rijen achter
  await admin.storage.from(BUCKET).remove([d.storage_path]).catch(() => {})

  const { error: delErr } = await admin.from('documents').delete().eq('id', documentId)
  if (delErr) {
    return { ok: false, error: `Verwijderen mislukt: ${delErr.message}` }
  }

  revalidatePath(`/admin/dossiers/${d.dossier_id}`)
  return { ok: true }
}

export type SignedUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

/**
 * Genereert een tijdelijke (1 uur) signed URL waarmee admin het document
 * kan downloaden/openen. Bypasst het feit dat de bucket private is.
 */
export async function getDocumentDownloadUrlAction(documentId: string): Promise<SignedUrlResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: doc, error: getErr } = await admin
    .from('documents')
    .select('storage_path, name')
    .eq('id', documentId)
    .single()
  if (getErr || !doc) return { ok: false, error: getErr?.message ?? 'Document niet gevonden' }
  const d = doc as { storage_path: string; name: string }

  const { data: signed, error: signedErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(d.storage_path, 3600, { download: d.name })

  if (signedErr || !signed) return { ok: false, error: signedErr?.message ?? 'Signed URL fout' }
  return { ok: true, url: signed.signedUrl }
}
