'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
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
  return { ok: true, message: `${firstName} ${lastName} toegevoegd als beheerder.` }
}

export async function deleteTeamMemberAction(userId: string): Promise<ActionResult> {
  let currentUser
  try {
    currentUser = await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
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
  return { ok: true, message: 'Beheerder verwijderd.' }
}
