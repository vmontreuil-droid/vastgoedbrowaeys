'use client'

import { useState, useTransition } from 'react'
import { Mail, Send, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { logEmailSentAction } from './event-actions'

export function EmailComposer({
  dossierId,
  clientEmail,
  clientName,
  defaultSubject,
}: {
  dossierId: string
  clientEmail: string | null
  clientName: string
  defaultSubject: string
}) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(
    `Beste ${clientName},\n\n\n\nVriendelijke groeten,\nVastgoed Browaeys\n055 / 59 50 10`,
  )
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sentOk, setSentOk] = useState(false)

  function openMailClient() {
    if (!clientEmail) {
      setError('Deze klant heeft geen e-mailadres in het systeem.')
      return
    }
    const href = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = href
  }

  function markSent() {
    if (!clientEmail) {
      setError('Geen e-mailadres bekend.')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await logEmailSentAction({ dossierId, to: clientEmail, subject, body })
      if (res.ok) {
        setSentOk(true)
        setTimeout(() => { setOpen(false); setSentOk(false) }, 1200)
      } else {
        setError(res.error ?? 'Loggen mislukte')
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs"
        style={{ border: '1px solid var(--color-line)' }}
      >
        <Mail className="size-3.5" />
        E-mail klant
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Mail className="size-5" style={{ color: 'var(--color-accent)' }} />
              E-mail aan {clientName}
            </h3>
            <p className="text-xs text-[var(--color-mute)] mt-1">
              {clientEmail ?? 'geen email bekend'}
            </p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-[var(--color-mute)]">
            <X className="size-4" />
          </button>
        </header>

        {error && (
          <div className="flex items-start gap-2 p-2 mb-3 text-xs"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sentOk && (
          <div className="flex items-start gap-2 p-2 mb-3 text-xs"
            style={{ background: 'rgba(34,197,94,0.10)', color: '#166534' }}>
            <CheckCircle2 className="size-3.5 mt-0.5 shrink-0" />
            <span>E-mail gelogd in dossier-historiek.</span>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1 block">Onderwerp</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1 block">Bericht</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)] font-mono"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-[0.65rem] text-[var(--color-mute)]">
            💡 Auto-verzending komt later via Resend. Klik nu eerst <strong>Open e-mailclient</strong>, verstuur,
            klik dan <strong>Markeer als verzonden</strong> om het te loggen in de historiek.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={openMailClient}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs"
              style={{ border: '1px solid var(--color-line)' }}
            >
              <Mail className="size-3.5" />
              Open e-mailclient
            </button>
            <button
              type="button"
              onClick={markSent}
              disabled={pending || !clientEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Send className="size-3.5" />
              {pending ? 'Loggen…' : 'Markeer als verzonden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
