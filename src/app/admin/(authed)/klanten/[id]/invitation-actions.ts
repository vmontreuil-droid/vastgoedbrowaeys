'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
}

export type InviteResult =
  | { ok: true; mode: 'created' | 'reset'; magicLink: string; email: string; tempPassword?: string }
  | { ok: false; error: string }

/**
 * Genereert een uitnodiging voor een klant:
 *  - als de klant nog geen auth-account heeft → admin.auth.admin.createUser
 *    met tijdelijk wachtwoord, daarna generateLink type='magiclink'
 *  - als hij al een auth-account heeft → generateLink type='recovery' zodat
 *    hij een nieuw wachtwoord kan instellen
 *
 * De link wordt NIET automatisch verstuurd — we returnen hem zodat de admin
 * hem zelf via 'open e-mailclient' of clipboard kan delen (geen SMTP nodig).
 */
export async function generateClientInvitationAction(input: {
  clientId: string
  email: string
}): Promise<InviteResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Geldig e-mailadres ontbreekt.' }
  }

  const admin = createAdminClient()

  // Kijken of de user al bestaat
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(input.clientId)
  if (getErr) return { ok: false, error: getErr.message }

  // Bepaal redirect URL — komt automatisch in de magic link
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vastgoedbrowaeys.vercel.app'
  const redirectTo = `${siteUrl}/wachtwoord-reset`

  if (!existing.user) {
    // Bestaat nog niet → maak aan met tijdelijk wachtwoord
    const tempPassword = Math.random().toString(36).slice(2, 14) + 'A1!'
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'client', invited_at: new Date().toISOString() },
    })
    if (createErr || !created.user) {
      return { ok: false, error: `Aanmaken mislukt: ${createErr?.message ?? 'onbekend'}` }
    }
    // Genereer recovery-link (klant kiest nieuw wachtwoord)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })
    if (linkErr || !linkData.properties?.action_link) {
      return { ok: false, error: `Magic-link genereren mislukt: ${linkErr?.message ?? 'onbekend'}` }
    }
    return {
      ok: true,
      mode: 'created',
      magicLink: linkData.properties.action_link,
      email,
      tempPassword,
    }
  }

  // User bestaat — promoot eerst rol naar client als nog niet gezet
  const meta = (existing.user.user_metadata ?? {}) as Record<string, unknown>
  if (meta.role !== 'client' && meta.role !== 'admin') {
    await admin.auth.admin.updateUserById(existing.user.id, {
      user_metadata: { ...meta, role: 'client', invited_at: new Date().toISOString() },
    })
  }

  // Genereer recovery-link (laat klant nieuw wachtwoord kiezen)
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  })
  if (linkErr || !linkData.properties?.action_link) {
    return { ok: false, error: `Magic-link genereren mislukt: ${linkErr?.message ?? 'onbekend'}` }
  }

  return {
    ok: true,
    mode: 'reset',
    magicLink: linkData.properties.action_link,
    email,
  }
}
