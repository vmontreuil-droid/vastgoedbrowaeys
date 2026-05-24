'use client'

import { useState, useTransition } from 'react'
import { Mail, Copy, CheckCircle2, AlertCircle, ExternalLink, KeyRound } from 'lucide-react'
import { generateClientInvitationAction, type InviteResult } from './invitation-actions'

export function InviteButton({
  clientId,
  clientEmail,
  clientName,
  alreadyHasAccount,
}: {
  clientId: string
  clientEmail: string
  clientName: string
  alreadyHasAccount: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  function generate() {
    setResult(null)
    startTransition(async () => {
      const res = await generateClientInvitationAction({ clientId, email: clientEmail })
      setResult(res)
      if (res.ok) setOpen(true)
    })
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  function openMail() {
    if (!result?.ok) return
    const subject = `Welkom op uw klantenportaal — Vastgoed Browaeys`
    const body = `Beste ${clientName},\n\n` +
      `U heeft nu toegang tot ons klantenportaal. Daar vindt u uw lopende dossiers, ` +
      `gedeelde documenten en geplande afspraken op één plek.\n\n` +
      `Klik op onderstaande link om uw eigen wachtwoord in te stellen:\n\n` +
      `${result.magicLink}\n\n` +
      `Deze link is 1 uur geldig.\n\n` +
      `Vriendelijke groeten,\n` +
      `Vastgoed Browaeys\n055 / 59 50 10`
    window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs disabled:opacity-50"
        style={{ border: '1px solid var(--color-line)' }}
        title={alreadyHasAccount
          ? 'Stuur opnieuw een wachtwoord-link'
          : 'Maak een login-account aan + stuur uitnodiging'}
      >
        <KeyRound className="size-3.5" />
        {pending ? 'Bezig…' : alreadyHasAccount ? 'Nieuwe wachtwoord-link' : 'Stuur uitnodiging'}
      </button>

      {result && !result.ok && (
        <div className="mt-2 flex items-start gap-2 p-2 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5" />
          <span>{result.error}</span>
        </div>
      )}

      {open && result?.ok && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl p-6"
            style={{
              background: 'var(--color-paper)',
              border: '1px solid var(--color-line)',
              maxHeight: 'calc(100dvh - 2rem)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Mail className="size-5" style={{ color: 'var(--color-accent)' }} />
                  {result.mode === 'created' ? 'Account aangemaakt + uitnodiging klaar' : 'Wachtwoord-link klaar'}
                </h3>
                <p className="text-xs text-[var(--color-mute)] mt-1">{clientEmail}</p>
              </div>
            </header>

            <p className="text-sm mb-4">
              {result.mode === 'created'
                ? 'Klant kan nu inloggen via onderstaande link. Stuur hem zelf door via e-mail.'
                : 'Verstuur deze link aan de klant zodat hij/zij een nieuw wachtwoord kan instellen.'}
            </p>

            <div className="space-y-3 mb-4">
              <label className="block">
                <span className="eyebrow text-[0.55rem] mb-1.5 block">Wachtwoord-instel link (1 uur geldig)</span>
                <div className="flex items-stretch gap-2">
                  <input
                    readOnly
                    value={result.magicLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 px-3 py-2 text-[0.7rem] font-mono bg-[var(--color-paper-2)] focus:outline-none"
                    style={{ border: '1px solid var(--color-line)' }}
                  />
                  <button
                    type="button"
                    onClick={() => copy(result.magicLink, 'link')}
                    className="inline-flex items-center gap-1.5 px-3 text-xs"
                    style={{ border: '1px solid var(--color-line)' }}
                  >
                    {copied === 'link' ? <CheckCircle2 className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
                    {copied === 'link' ? 'Gekopieerd' : 'Kopieer'}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-line)' }}>
              <button
                type="button"
                onClick={openMail}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                <Mail className="size-4" />
                Open e-mailclient met sjabloon
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-xs text-[var(--color-mute)]"
              >
                Sluit
              </button>
            </div>

            <p className="text-[0.65rem] text-[var(--color-mute)] mt-3 flex items-start gap-1">
              <ExternalLink className="size-3 mt-0.5 shrink-0" />
              Auto-verzending via Resend komt later — voorlopig open je hier je
              eigen mail-app met de uitnodiging voorbereid.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
