'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireZaakvoerder, getEffectiveTeamRole } from '@/lib/permissions'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang — alleen beheerders.')
  }
  return user
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function addTeamMemberAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireZaakvoerder()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Alleen de Zaakvoerder kan werknemers toevoegen.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const bivNumber = String(formData.get('biv_number') ?? '').trim()

  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Ongeldig e-mailadres.' }
  }
  if (password.length < 8) {
    return { ok: false, error: 'Wachtwoord moet minstens 8 tekens bevatten.' }
  }
  if (!firstName || !lastName) {
    return { ok: false, error: 'Voornaam en familienaam zijn verplicht.' }
  }

  const metadata: Record<string, unknown> = {
    role: 'admin',
    first_name: firstName,
    last_name: lastName,
  }
  if (title) metadata.title = title
  if (phone) metadata.phone = phone
  if (bivNumber) metadata.biv_number = bivNumber

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/instellingen')
  revalidatePath('/admin/team')
  return { ok: true, message: `${firstName} ${lastName} toegevoegd als beheerder.` }
}

export async function updateTeamMemberAction(
  userId: string,
  formData: FormData,
): Promise<ActionResult> {
  let me
  try {
    me = await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  // Bewerken van anderen vereist Zaakvoerder; bewerken van zichzelf mag altijd
  if (me.id !== userId) {
    const teamRole = getEffectiveTeamRole(me.user_metadata as Record<string, unknown>, me.email ?? null)
    if (teamRole !== 'zaakvoerder') {
      return { ok: false, error: 'Alleen de Zaakvoerder kan collega-gegevens bewerken.' }
    }
  }

  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const bivNumber = String(formData.get('biv_number') ?? '').trim()
  const newPassword = String(formData.get('password') ?? '')

  if (!firstName || !lastName) {
    return { ok: false, error: 'Voornaam en familienaam zijn verplicht.' }
  }
  if (newPassword && newPassword.length < 8) {
    return { ok: false, error: 'Nieuw wachtwoord moet minstens 8 tekens bevatten.' }
  }

  const admin = createAdminClient()

  // Huidige user ophalen om bestaande metadata te bewaren (role, active, ...)
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Kon werknemer niet vinden: ' + (getErr?.message || '404') }
  }

  const mergedMetadata: Record<string, unknown> = {
    ...(existing.user.user_metadata || {}),
    role: 'admin',
    first_name: firstName,
    last_name: lastName,
  }
  mergedMetadata.title = title || null
  mergedMetadata.phone = phone || null
  mergedMetadata.biv_number = bivNumber || null

  const updatePayload: Parameters<typeof admin.auth.admin.updateUserById>[1] = {
    user_metadata: mergedMetadata,
  }
  if (newPassword) updatePayload.password = newPassword

  const { error } = await admin.auth.admin.updateUserById(userId, updatePayload)
  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/instellingen')
  revalidatePath('/admin/team')
  return { ok: true, message: `${firstName} ${lastName} bijgewerkt.` }
}

export async function setActiveAction(
  userId: string,
  active: boolean,
): Promise<ActionResult> {
  let currentUser
  try {
    currentUser = await requireZaakvoerder()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Alleen de Zaakvoerder kan accounts (de)activeren.' }
  }

  if (currentUser.id === userId && !active) {
    return { ok: false, error: 'Je kan je eigen account niet deactiveren.' }
  }

  const admin = createAdminClient()

  if (!active) {
    // Voorkom dat de laatste actieve beheerder zichzelf in een lockout zet
    const { data: usersData, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) {
      return { ok: false, error: 'Kon team-lijst niet ophalen: ' + listErr.message }
    }
    const activeAdmins = (usersData?.users ?? []).filter(
      (u) => u.user_metadata?.role === 'admin' && u.user_metadata?.active !== false,
    )
    if (activeAdmins.length <= 1) {
      return { ok: false, error: 'Kan de laatste actieve beheerder niet deactiveren.' }
    }
  }

  // Huidige metadata mergen met active-vlag
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Werknemer niet gevonden.' }
  }
  const mergedMetadata = {
    ...(existing.user.user_metadata || {}),
    active,
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: mergedMetadata,
  })
  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/instellingen')
  revalidatePath('/admin/team')
  return { ok: true, message: active ? 'Account geactiveerd.' : 'Account gedeactiveerd.' }
}

export type IcalTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string }

export async function regenerateIcalTokenAction(): Promise<IcalTokenResult> {
  let currentUser
  try {
    currentUser = await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  // Genereer 32-char random token
  const arr = new Uint8Array(24)
  crypto.getRandomValues(arr)
  const token = Array.from(arr)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32)

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(currentUser.id, {
    user_metadata: { ...(currentUser.user_metadata || {}), ical_token: token },
  })
  if (error) return { ok: false, error: error.message }

  return { ok: true, token }
}

export async function deleteTeamMemberAction(userId: string): Promise<ActionResult> {
  let currentUser
  try {
    currentUser = await requireZaakvoerder()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Alleen de Zaakvoerder kan werknemers verwijderen.' }
  }

  if (currentUser.id === userId) {
    return { ok: false, error: 'Je kan je eigen account niet verwijderen.' }
  }

  const admin = createAdminClient()

  // Tel admins — laat de laatste niet verwijderen
  const { data: usersData, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) {
    return { ok: false, error: 'Kon team-lijst niet ophalen: ' + listErr.message }
  }
  const admins = (usersData?.users ?? []).filter((u) => u.user_metadata?.role === 'admin')
  if (admins.length <= 1) {
    return { ok: false, error: 'Kan de laatste beheerder niet verwijderen.' }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/instellingen')
  revalidatePath('/admin/team')
  return { ok: true, message: 'Beheerder verwijderd.' }
}
