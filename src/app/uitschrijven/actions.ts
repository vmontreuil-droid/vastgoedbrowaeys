'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export type OptOutResult = { ok: boolean; error?: string }

/**
 * Publieke endpoint — geen login vereist. Authorisatie via signed token.
 * Klant zet zelf newsletter_opt_out aan/uit via de unsubscribe-link.
 */
export async function setOptOutAction(input: {
  userId: string
  email: string
  token: string
  optOut: boolean
}): Promise<OptOutResult> {
  const verify = verifyUnsubscribeToken(input.token, input.email)
  if (!verify.ok || verify.userId !== input.userId) {
    return { ok: false, error: 'Ongeldige token.' }
  }

  const admin = createAdminClient()
  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(input.userId)
  if (getErr || !existing.user) {
    return { ok: false, error: 'Gebruiker niet gevonden.' }
  }
  if ((existing.user.email ?? '').toLowerCase() !== input.email.toLowerCase()) {
    return { ok: false, error: 'E-mailadres komt niet overeen.' }
  }

  const merged = {
    ...(existing.user.user_metadata || {}),
    newsletter_opt_out: input.optOut,
    newsletter_opt_out_at: input.optOut ? new Date().toISOString() : null,
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(input.userId, {
    user_metadata: merged,
  })
  if (updErr) {
    return { ok: false, error: updErr.message }
  }

  revalidatePath('/uitschrijven')
  return { ok: true }
}
