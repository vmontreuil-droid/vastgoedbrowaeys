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
    const hash = window.location.hash
    if (!hash || !hash.includes('type=recovery')) return

    // Redirect met behoud van de hash (essentieel voor Supabase auth-detect)
    router.replace(`/wachtwoord-reset${hash}`)
  }, [pathname, router])

  return null
}
