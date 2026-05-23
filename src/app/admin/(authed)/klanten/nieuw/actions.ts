'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang — alleen beheerders.')
  }
}

export type ClientActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function createClientAction(formData: FormData): Promise<ClientActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const kinds = formData.getAll('kinds').map((k) => String(k))
  const notes = String(formData.get('notes') ?? '').trim()
  const grantPortal = formData.get('grant_portal') === 'on'

  if (!firstName || !lastName) {
    return { ok: false, error: 'Voornaam en familienaam zijn verplicht.' }
  }
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Geldig e-mailadres is verplicht.' }
  }

  const admin = createAdminClient()
  const metadata = {
    role: 'client',
    first_name: firstName,
    last_name: lastName,
    phone: phone || undefined,
    city: city || undefined,
    kinds,
    notes: notes || undefined,
  }

  if (grantPortal) {
    // Maak account aan met tijdelijk wachtwoord; klant kan via 'wachtwoord vergeten' resetten
    const tempPassword = Math.random().toString(36).slice(2, 14) + 'A1!'
    const { error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: metadata,
    })
    if (error) {
      return { ok: false, error: `Klant-account aanmaken mislukt: ${error.message}` }
    }
    revalidatePath('/admin/klanten')
    redirect(`/admin/klanten?created=1&email=${encodeURIComponent(email)}`)
  } else {
    // Alleen profile-rij zonder login — schrijven naar public.profiles
    // Generate een fake UUID zodat we een herkenbare key hebben
    const fakeId = crypto.randomUUID()
    const { error } = await admin.from('profiles').upsert({
      id: fakeId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role: 'client',
    })
    if (error) {
      return {
        ok: false,
        error: `DB-opslag mislukte (${error.message}). Vink 'Portaal-toegang' aan om in plaats daarvan via auth te bewaren.`,
      }
    }
    revalidatePath('/admin/klanten')
    redirect('/admin/klanten?created=1')
  }
}
