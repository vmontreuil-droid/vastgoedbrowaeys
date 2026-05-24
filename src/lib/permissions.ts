import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type TeamRole = 'zaakvoerder' | 'makelaar' | 'assistent'

export const TEAM_ROLES: TeamRole[] = ['zaakvoerder', 'makelaar', 'assistent']

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  zaakvoerder: 'Zaakvoerder',
  makelaar: 'Makelaar',
  assistent: 'Assistent',
}

export const TEAM_ROLE_COLOR: Record<TeamRole, string> = {
  zaakvoerder: '#0b4f58',
  makelaar:    '#a25b3a',
  assistent:   '#5a7a48',
}

/**
 * Mappt user_metadata naar een effectieve team-rol. Voor historische
 * users zonder team_role-veld gebruiken we e-mail-gebaseerde defaults
 * (Stefanie en Vincent als zaakvoerder) en val terug op 'assistent' voor
 * de rest. Zodra een rol expliciet gezet is via setTeamRoleAction
 * overschrijft die de default.
 */
export function getEffectiveTeamRole(
  metadata: Record<string, unknown> | null | undefined,
  email: string | null | undefined,
): TeamRole {
  const explicit = metadata?.team_role
  if (typeof explicit === 'string' && (TEAM_ROLES as string[]).includes(explicit)) {
    return explicit as TeamRole
  }
  if (email === 'stephanie@vastgoedbrowaeys.be') return 'zaakvoerder'
  if (email === 'info@studio-vm.be') return 'zaakvoerder'
  return 'assistent'
}

/** Server-side: huidige user + team-rol ophalen. Throws bij niet-admin. */
export async function getCurrentTeamRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  const teamRole = getEffectiveTeamRole(user.user_metadata as Record<string, unknown>, user.email ?? null)
  return { user, teamRole }
}

/** Guard: alleen Zaakvoerder-rol mag verder. Returnt volledige Supabase user. */
export async function requireZaakvoerder() {
  const { user, teamRole } = await getCurrentTeamRole()
  if (teamRole !== 'zaakvoerder') {
    throw new Error('Alleen de zaakvoerder kan deze actie uitvoeren.')
  }
  return user
}

/**
 * Tel het aantal Zaakvoerders. Voorkomt dat de laatste Zaakvoerder
 * zichzelf downgradet of wordt verwijderd.
 */
export async function countZaakvoerders(): Promise<number> {
  const admin = createAdminClient()
  type RpcRow = { id: string; email: string | null; raw_user_meta_data: Record<string, unknown> | null }
  try {
    const { data, error } = await admin.rpc('list_admin_users')
    if (error || !Array.isArray(data)) return 0
    return (data as RpcRow[]).filter((r) => getEffectiveTeamRole(r.raw_user_meta_data, r.email) === 'zaakvoerder').length
  } catch {
    return 0
  }
}
