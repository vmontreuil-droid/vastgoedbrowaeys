'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, Check, X } from 'lucide-react'

const STORAGE_KEY = 'vb-cookie-consent'
const CONSENT_VERSION = 1

type Consent = {
  version: number
  choice: 'all' | 'functional'
  setAt: string
}

function loadConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function saveConsent(choice: Consent['choice']) {
  const data: Consent = {
    version: CONSENT_VERSION,
    choice,
    setAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  // Hier later: dispatchen naar analytics-tooling indien 'all'
  return data
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Toon banner enkel als nog geen geldige keuze gemaakt is
    const existing = loadConsent()
    if (!existing) {
      // Kleine vertraging zodat banner niet meteen invliegt bij page load
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  function accept(choice: Consent['choice']) {
    saveConsent(choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-[60]"
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
        boxShadow: '0 24px 48px -20px rgba(11, 79, 88, 0.22), 0 4px 8px -4px rgba(11, 79, 88, 0.08)',
        animation: 'vb-cookie-in 520ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      <style>{`
        @keyframes vb-cookie-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="p-6 md:p-7">
        <div className="flex items-start gap-4">
          <span
            className="grid place-items-center size-10 shrink-0 rounded-full"
            style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
          >
            <Cookie className="size-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id="cookie-title" className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Discreet met cookies
            </h2>
            <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-[var(--color-mute)]">
              Wij gebruiken enkel functionele cookies die noodzakelijk zijn voor de werking
              van deze site. Wenst u ons later toe te laten om geanonimiseerde statistieken
              bij te houden, dan kan dat hieronder. Geen advertentie-cookies — beloofd.
            </p>
            <p className="mt-2 text-xs text-[var(--color-mute)]">
              Meer info in onze{' '}
              <Link href="/privacy-verklaring" className="link-underline text-[var(--color-ink)]">
                privacyverklaring
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => accept('all')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
          >
            <Check className="size-4" />
            Alles toestaan
          </button>
          <button
            onClick={() => accept('functional')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--color-ink)', color: 'var(--color-ink)' }}
          >
            <X className="size-4" />
            Enkel functioneel
          </button>
        </div>
      </div>
    </div>
  )
}
