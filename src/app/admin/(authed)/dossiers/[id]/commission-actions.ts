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

export type CommissionResult = { ok: boolean; error?: string }

export type CommissionInput = {
  dossierId: string
  type: 'percentage' | 'fixed' | 'none'
  rate: number | null
  fixed: number | null
  vatIncluded: boolean
  notes: string | null
}

export async function updateCommissionAction(input: CommissionInput): Promise<CommissionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('dossiers')
    .update({
      commission_type: input.type,
      commission_rate: input.type === 'percentage' ? input.rate : null,
      commission_fixed: input.type === 'fixed' ? input.fixed : null,
      commission_vat_included: input.vatIncluded,
      commission_notes: input.notes?.trim() || null,
    })
    .eq('id', input.dossierId)
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/dossiers/${input.dossierId}`)
  revalidatePath('/admin')
  return { ok: true }
}
