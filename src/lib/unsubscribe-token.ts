import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Eenvoudige stateless unsubscribe-tokens via HMAC.
 * Geen DB-entry nodig: we verifiëren door de signature opnieuw te berekenen.
 *
 * Token format: <userId>.<sig>
 *   sig = base64url(HMAC-SHA256(secret, userId + '|' + email))
 *
 * Het secret komt uit env-var UNSUBSCRIBE_SECRET. Mist die → fallback op
 * SUPABASE_SERVICE_ROLE_KEY (al aanwezig) om setup-friction te vermijden.
 */
function getSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'fallback-do-not-use-in-prod'
  )
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function makeUnsubscribeToken(userId: string, email: string): string {
  const sig = base64url(createHmac('sha256', getSecret()).update(`${userId}|${email.toLowerCase()}`).digest())
  return `${userId}.${sig}`
}

export function verifyUnsubscribeToken(token: string, email: string): { ok: true; userId: string } | { ok: false } {
  const idx = token.indexOf('.')
  if (idx <= 0) return { ok: false }
  const userId = token.slice(0, idx)
  const providedSig = token.slice(idx + 1)
  const expectedSig = base64url(createHmac('sha256', getSecret()).update(`${userId}|${email.toLowerCase()}`).digest())
  const a = Buffer.from(providedSig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length) return { ok: false }
  if (!timingSafeEqual(a, b)) return { ok: false }
  return { ok: true, userId }
}

export function buildUnsubscribeUrl(baseUrl: string, userId: string, email: string): string {
  const token = makeUnsubscribeToken(userId, email)
  const url = new URL('/uitschrijven', baseUrl)
  url.searchParams.set('t', token)
  url.searchParams.set('e', email)
  return url.toString()
}
