'use client'

import { useState, useTransition } from 'react'
import { Calendar, RefreshCw, Copy, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { regenerateIcalTokenAction } from './actions'

export function IcalPanel({
  initialToken,
  baseUrl,
}: {
  initialToken: string | null
  baseUrl: string
}) {
  const [token, setToken] = useState<string | null>(initialToken)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const url = token ? `${baseUrl}/api/ical/${token}.ics` : null

  function generate() {
    if (token && !confirm('Een nieuwe URL maken? De oude URL stopt dan met werken in je agenda.')) return
    setError(null)
    startTransition(async () => {
      const res = await regenerateIcalTokenAction()
      if (res.ok) setToken(res.token)
      else setError(res.error)
    })
  }

  async function copyUrl() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl flex items-center gap-3"
            style={{ fontFamily: 'var(--font-display)' }}>
            <Calendar className="size-5" style={{ color: 'var(--color-accent)' }} />
            Agenda-synchronisatie
          </h2>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Persoonlijke iCalendar-feed: abonneer jouw Google Calendar / iPhone / Outlook
            op deze URL en al je afspraken verschijnen automatisch.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-5 space-y-4"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        {!token ? (
          <div>
            <p className="text-sm text-[var(--color-mute)] mb-3">
              Je hebt nog geen feed-URL. Genereer er een om aan de slag te gaan.
            </p>
            <button
              type="button"
              onClick={generate}
              disabled={pending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Calendar className="size-3.5" />
              {pending ? 'Genereren…' : 'Genereer feed-URL'}
            </button>
          </div>
        ) : (
          <>
            <div>
              <p className="eyebrow text-[0.55rem] mb-2">Jouw feed-URL (geheim — niet delen)</p>
              <div className="flex items-stretch gap-2">
                <input
                  readOnly
                  value={url ?? ''}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[var(--color-paper-2)] focus:outline-none focus:border-[var(--color-accent)]"
                  style={{ border: '1px solid var(--color-line)' }}
                />
                <button
                  type="button"
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1.5 px-3 text-xs"
                  style={{ border: '1px solid var(--color-line)' }}
                >
                  {copied ? <CheckCircle2 className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
                  {copied ? 'Gekopieerd' : 'Kopieer'}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <Tip
                title="Google Calendar"
                steps={[
                  'calendar.google.com',
                  'Linker sidebar → "Andere agenda\'s" → "+"',
                  '"Via URL" → plak je feed-URL',
                ]}
              />
              <Tip
                title="iPhone / iPad"
                steps={[
                  'Instellingen → Agenda → Accounts',
                  '"Account toevoegen" → "Overige"',
                  '"Voeg geabonneerde agenda toe" → URL plakken',
                ]}
              />
              <Tip
                title="Outlook"
                steps={[
                  'outlook.live.com → Agenda',
                  '"Agenda toevoegen" → "Vanaf web"',
                  'Plak je feed-URL',
                ]}
              />
            </div>

            <div className="pt-3 border-t flex items-center justify-between gap-2 flex-wrap"
              style={{ borderColor: 'var(--color-line)' }}>
              <p className="text-[0.65rem] text-[var(--color-mute)]">
                💡 De feed wordt door agenda-apps elke 5-60 minuten automatisch ververst (verschilt per app).
              </p>
              <div className="flex items-center gap-2">
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-xs link-underline text-[var(--color-mute)]"
                  >
                    <ExternalLink className="size-3" />
                    Test in browser
                  </a>
                )}
                <button
                  type="button"
                  onClick={generate}
                  disabled={pending}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
                  title="Maakt een nieuwe URL en zet de oude buiten werking"
                >
                  <RefreshCw className="size-3" />
                  Genereer nieuwe URL
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function Tip({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="p-3" style={{ background: 'var(--color-paper-2)' }}>
      <p className="text-xs font-medium mb-2">{title}</p>
      <ol className="text-[0.7rem] text-[var(--color-mute)] space-y-1 list-decimal list-inside">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  )
}
