'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Zet een theme-class op het <html>-element op basis van de URL.
 * - /luxe/* → `theme-luxe`  (zwart + goud, sans-serif)
 * - alle andere → standaard boutique-editorial palette
 *
 * Voor toekomstige uitbreiding kan hier ook een gebruiker-keuze toggle bij.
 */
export function ThemeApplier() {
  const pathname = usePathname()

  useEffect(() => {
    const html = document.documentElement
    if (pathname.startsWith('/luxe')) {
      html.classList.add('theme-luxe')
    } else {
      html.classList.remove('theme-luxe')
    }
  }, [pathname])

  return null
}
