'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  requireZaakvoerder,
  countZaakvoerders,
  TEAM_ROLES,
  type TeamRole,
  getEffectiveTeamRole,
} from '@/lib/permissions'

export type RoleResult = { ok: boolean; error?: string }

export async function setTeamRoleAction(
  userId: string,
  newRole: TeamRole,
): Promise<RoleResult> {
  let me
  try { me = await requireZaakvoerder() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  if (!(TEAM_ROLES as string[]).includes(newRole)) {
    return { ok: false, error: 'Ongeldige rol.' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Werknemer niet gevonden.' }
  }

  const currentMd = (existing.user.user_metadata || {}) as Record<string, unknown>
  const currentRole = getEffectiveTeamRole(currentMd, existing.user.email ?? null)

  if (currentRole === newRole) return { ok: true }

  // Voorkom dat de laatste Zaakvoerder zichzelf downgradet
  if (currentRole === 'zaakvoerder' && newRole !== 'zaakvoerder') {
    const count = await countZaakvoerders()
    if (count <= 1) {
      return { ok: false, error: 'Kan de laatste Zaakvoerder niet downgraden — wijs eerst iemand anders aan.' }
    }
  }

  const merged = { ...currentMd, team_role: newRole }
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (updErr) return { ok: false, error: updErr.message }

  revalidatePath('/admin/team')
  return { ok: true }
}
