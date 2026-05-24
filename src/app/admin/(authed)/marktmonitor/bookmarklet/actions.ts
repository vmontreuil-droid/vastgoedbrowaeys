'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'node:crypto'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

function generateToken(): string {
  return randomBytes(24).toString('base64url')
}

export type TokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string }

export async function regenerateMarketImportTokenAction(): Promise<TokenResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const token = generateToken()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      market_import_token: token,
    },
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/marktmonitor/bookmarklet')
  return { ok: true, token }
}

/** Genereert een token alleen als de gebruiker er nog geen heeft. Stil. */
export async function ensureMarketImportTokenAction(): Promise<TokenResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const existing = user.user_metadata?.market_import_token as string | undefined
  if (existing && existing.length > 10) return { ok: true, token: existing }

  return regenerateMarketImportTokenAction()
}
