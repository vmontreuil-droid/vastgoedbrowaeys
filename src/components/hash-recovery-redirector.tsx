'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Vangt Supabase password-recovery hashes op die op de root-URL belanden.
 * Wanneer een gebruiker op de recovery-mail klikt, komt hij/zij uit op
 *   https://site.be/#access_token=...&type=recovery&...
 * Deze component leest die hash en redirect naar /wachtwoord-reset
 * (met behoud van de hash zodat de reset-pagina de sessie kan oprapen).
 */
export function HashRecoveryRedirector() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Niet redirecten als we al op de reset-pagina staan
    if (pathname.startsWith('/wachtwoord-reset')) return
    if (typeof window === 'undefined') return

    // PKCE flow: ?code=... op de root-URL → naar /wachtwoord-reset met code
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (code) {
      router.replace(`/wachtwoord-reset?code=${encodeURIComponent(code)}`)
      return
    }

    // Hash-recovery flow (oude implicit): #access_token=...&type=recovery
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      router.replace(`/wachtwoord-reset${hash}`)
    }
  }, [pathname, router])

  return null
}
