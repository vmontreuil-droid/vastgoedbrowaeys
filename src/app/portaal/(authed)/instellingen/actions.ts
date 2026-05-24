'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireSelf() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd')
  return { supabase, user }
}

export type SettingsResult = { ok: boolean; error?: string; message?: string }

export async function updatePortalProfileAction(formData: FormData): Promise<SettingsResult> {
  let user
  try { ({ user } = await requireSelf()) } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!firstName || !lastName) {
    return { ok: false, error: 'Voornaam en familienaam zijn verplicht.' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(user.id)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Account niet gevonden.' }
  }

  const merged = {
    ...(existing.user.user_metadata || {}),
    first_name: firstName,
    last_name: lastName,
    phone: phone || null,
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: merged,
  })
  if (error) return { ok: false, error: error.message }

  // Ook profiles updaten als rij bestaat
  await admin
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, phone: phone || null })
    .eq('id', user.id)

  revalidatePath('/portaal/instellingen')
  return { ok: true, message: 'Gegevens bewaard.' }
}

export async function updatePortalPasswordAction(formData: FormData): Promise<SettingsResult> {
  let supabase, user
  try { ({ supabase, user } = await requireSelf()) } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const currentPassword = String(formData.get('current_password') ?? '')
  const newPassword = String(formData.get('new_password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (newPassword.length < 8) {
    return { ok: false, error: 'Nieuw wachtwoord moet minstens 8 tekens bevatten.' }
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'Bevestiging komt niet overeen.' }
  }

  // Verifieer huidige wachtwoord via sign-in
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email ?? '',
    password: currentPassword,
  })
  if (verifyErr) {
    return { ok: false, error: 'Huidig wachtwoord klopt niet.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })
  if (error) return { ok: false, error: error.message }

  return { ok: true, message: 'Wachtwoord gewijzigd.' }
}

export async function togglePortalNewsletterAction(optOut: boolean): Promise<SettingsResult> {
  let user
  try { ({ user } = await requireSelf()) } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(user.id)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Account niet gevonden.' }
  }

  const merged = {
    ...(existing.user.user_metadata || {}),
    newsletter_opt_out: optOut,
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: merged,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/portaal/instellingen')
  return { ok: true }
}
