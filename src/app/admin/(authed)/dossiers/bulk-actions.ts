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

export type BulkResult = { ok: boolean; updated: number; error?: string }
export type BulkStatus = 'open' | 'in_behandeling' | 'onder_optie' | 'verkocht' | 'verhuurd' | 'geannuleerd'

export async function bulkSetDossierStatusAction(
  dossierIds: string[],
  status: BulkStatus,
): Promise<BulkResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, updated: 0, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  if (dossierIds.length === 0) return { ok: false, updated: 0, error: 'Geen dossiers geselecteerd.' }

  const admin = createAdminClient()
  const update: { status: BulkStatus; closed_at?: string | null } = { status }
  if (['verkocht', 'verhuurd', 'geannuleerd'].includes(status)) {
    update.closed_at = new Date().toISOString()
  } else {
    update.closed_at = null
  }

  const { error, count } = await admin
    .from('dossiers')
    .update(update, { count: 'exact' })
    .in('id', dossierIds)
  if (error) return { ok: false, updated: 0, error: error.message }

  // Log naar dossier_events
  await admin.from('dossier_events').insert(
    dossierIds.map((dossierId) => ({
      dossier_id: dossierId,
      event_type: 'status_changed',
      title: `Status gewijzigd naar "${status}" (bulk-actie)`,
      created_by: user.id,
    })),
  )

  revalidatePath('/admin/dossiers')
  return { ok: true, updated: count ?? dossierIds.length }
}

export async function bulkDeleteDossiersAction(dossierIds: string[]): Promise<BulkResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, updated: 0, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  if (dossierIds.length === 0) return { ok: false, updated: 0, error: 'Geen dossiers geselecteerd.' }

  const admin = createAdminClient()
  const { error, count } = await admin.from('dossiers').delete({ count: 'exact' }).in('id', dossierIds)
  if (error) return { ok: false, updated: 0, error: error.message }

  revalidatePath('/admin/dossiers')
  return { ok: true, updated: count ?? dossierIds.length }
}
