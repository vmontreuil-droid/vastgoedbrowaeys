'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireFullAccess, getEffectiveTeamRole } from '@/lib/permissions'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type ProductivityResult = { ok: boolean; error?: string }

/**
 * Zet jaar-target (aantal afgesloten dossiers) voor een werknemer.
 * Alleen Zaakvoerder/Webbeheerder kan dit instellen.
 */
export async function setYearlyTargetAction(
  userId: string,
  yearlyTarget: number | null,
): Promise<ProductivityResult> {
  try { await requireFullAccess() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  if (yearlyTarget !== null && (yearlyTarget < 0 || yearlyTarget > 1000 || !Number.isFinite(yearlyTarget))) {
    return { ok: false, error: 'Ongeldig doel (moet 0–1000 zijn).' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Werknemer niet gevonden.' }
  }

  const merged = {
    ...(existing.user.user_metadata || {}),
    target_yearly_dossiers: yearlyTarget,
  }
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/team')
  revalidatePath(`/admin/team/${userId}`)
  return { ok: true }
}

/**
 * Zet afwezigheid: from/until dates (ISO strings) of null om af te zetten.
 * Iedereen mag zijn eigen afwezigheid zetten; admin kan voor anderen.
 */
export async function setOutOfOfficeAction(
  userId: string,
  fromIso: string | null,
  untilIso: string | null,
  reason: string | null,
): Promise<ProductivityResult> {
  let me
  try { me = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  if (me.id !== userId) {
    const teamRole = getEffectiveTeamRole(me.user_metadata as Record<string, unknown>, me.email ?? null)
    if (teamRole !== 'zaakvoerder' && teamRole !== 'webbeheerder') {
      return { ok: false, error: 'Alleen Zaakvoerder/Webbeheerder kan afwezigheid van collega\'s instellen.' }
    }
  }

  if (fromIso && untilIso) {
    const f = new Date(fromIso).getTime()
    const u = new Date(untilIso).getTime()
    if (isNaN(f) || isNaN(u)) {
      return { ok: false, error: 'Ongeldige datums.' }
    }
    if (u < f) {
      return { ok: false, error: 'Einddatum moet na startdatum liggen.' }
    }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Werknemer niet gevonden.' }
  }

  const merged: Record<string, unknown> = { ...(existing.user.user_metadata || {}) }
  if (fromIso && untilIso) {
    merged.out_of_office_from = fromIso
    merged.out_of_office_until = untilIso
    merged.out_of_office_reason = reason?.trim() || null
  } else {
    delete merged.out_of_office_from
    delete merged.out_of_office_until
    delete merged.out_of_office_reason
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/team')
  revalidatePath(`/admin/team/${userId}`)
  return { ok: true }
}
