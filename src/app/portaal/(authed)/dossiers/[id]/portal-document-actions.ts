'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'dossier-documents'

export type PortalDocumentUrl =
  | { ok: true; url: string }
  | { ok: false; error: string }

/**
 * Genereert een signed URL waarmee de ingelogde klant een document kan
 * openen — maar enkel als het document hoort bij een dossier van die
 * klant EN als shared_with_client = true.
 */
export async function getMyDocumentDownloadUrlAction(documentId: string): Promise<PortalDocumentUrl> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const admin = createAdminClient()
  const { data: doc, error } = await admin
    .from('documents')
    .select('storage_path, name, dossier_id, shared_with_client')
    .eq('id', documentId)
    .single()
  if (error || !doc) return { ok: false, error: 'Document niet gevonden.' }
  const d = doc as { storage_path: string; name: string; dossier_id: string; shared_with_client: boolean | null }

  if (!d.shared_with_client) return { ok: false, error: 'Dit document is niet (meer) gedeeld.' }

  // Verifieer dat het dossier van deze klant is
  const { data: dossier } = await admin
    .from('dossiers')
    .select('client_id')
    .eq('id', d.dossier_id)
    .single()
  if (!dossier || (dossier as { client_id: string }).client_id !== user.id) {
    return { ok: false, error: 'Geen toegang tot dit document.' }
  }

  const { data: signed, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(d.storage_path, 3600, { download: d.name })

  if (signErr || !signed) return { ok: false, error: signErr?.message ?? 'Signed URL fout' }
  return { ok: true, url: signed.signedUrl }
}
