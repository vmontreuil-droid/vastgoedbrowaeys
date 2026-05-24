'use client'

import { useMemo, useState } from 'react'
import {
  Send, Users, Download, Copy, CheckCircle2, MapPin, ExternalLink, AlertCircle,
} from 'lucide-react'

export type Audience = {
  id: string
  name: string
  email: string
  kinds: string[]
  status: 'actief' | 'inactief' | 'lead'
  city: string | null
  unsubscribeUrl: string
}

const KIND_OPTIONS = [
  { value: 'koper',      label: 'Koper' },
  { value: 'verkoper',   label: 'Verkoper' },
  { value: 'huurder',    label: 'Huurder' },
  { value: 'verhuurder', label: 'Verhuurder' },
]

const STATUS_OPTIONS = [
  { value: 'actief',   label: 'Actief' },
  { value: 'lead',     label: 'Lead' },
  { value: 'inactief', label: 'Inactief' },
]

const MAILTO_BATCH = 50  // praktisch limiet voor mailto BCC

export function NewsletterComposer({ audiences }: { audiences: Audience[] }) {
  const [includeKinds, setIncludeKinds] = useState<Set<string>>(new Set(['koper', 'verkoper', 'huurder', 'verhuurder']))
  const [includeStatuses, setIncludeStatuses] = useState<Set<string>>(new Set(['actief', 'lead']))
  const [cityFilter, setCityFilter] = useState('')
  const [subject, setSubject] = useState('Nieuws van Vastgoed Browaeys')
  const [body, setBody] = useState(
    `Beste,\n\n[Schrijf hier je bericht.]\n\nVriendelijke groeten,\nVastgoed Browaeys\n055 / 59 50 10\ninfo@vastgoedbrowaeys.be\n\n—\nMaakt u liever geen deel meer uit van onze mailing? Reageer op deze e-mail met "uitschrijven", of bezoek https://vastgoedbrowaeys.vercel.app/uitschrijven`,
  )
  const [personalisedSend, setPersonalisedSend] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Filter audience
  const matched = useMemo(() => {
    return audiences.filter((a) => {
      if (!a.email) return false
      if (!includeStatuses.has(a.status)) return false
      if (a.kinds.length === 0) {
        // klanten zonder kinds: meegnemen als 'overig'
        return true
      }
      const hasKindMatch = a.kinds.some((k) => includeKinds.has(k))
      if (!hasKindMatch) return false
      if (cityFilter.trim()) {
        const c = cityFilter.trim().toLowerCase()
        if (!a.city || !a.city.toLowerCase().includes(c)) return false
      }
      return true
    })
  }, [audiences, includeKinds, includeStatuses, cityFilter])

  function toggleKind(k: string) {
    setIncludeKinds((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }
  function toggleStatus(s: string) {
    setIncludeStatuses((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  function openMailClient(batchIndex = 0) {
    const start = batchIndex * MAILTO_BATCH
    const batch = matched.slice(start, start + MAILTO_BATCH)
    const bcc = batch.map((a) => a.email).join(',')
    const href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = href
  }

  function openMailClientPersonalised(index: number) {
    const recipient = matched[index]
    if (!recipient) return
    const personalisedBody = body
      .replace('Beste,', `Beste ${recipient.name},`)
      .replace('https://vastgoedbrowaeys.vercel.app/uitschrijven', recipient.unsubscribeUrl)
    const href = `mailto:${encodeURIComponent(recipient.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(personalisedBody)}`
    window.location.href = href
  }

  async function copyAddresses() {
    try {
      await navigator.clipboard.writeText(matched.map((a) => a.email).join(', '))
      setCopied('emails')
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  function downloadCsv() {
    const header = ['Naam', 'E-mail', 'Stad', 'Status', 'Types', 'Persoonlijke uitschrijflink']
    const rows = matched.map((a) => [a.name, a.email, a.city ?? '', a.status, a.kinds.join(', '), a.unsubscribeUrl])
    const escape = (v: string) =>
      v.includes(';') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"`
        : v
    const csv = '﻿' + [header, ...rows].map((r) => r.map(escape).join(';')).join('\r\n') + '\r\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nieuwsbrief-doelgroep-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const batchCount = Math.ceil(matched.length / MAILTO_BATCH)

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(320px,400px)] gap-6">
      {/* Composer */}
      <div className="space-y-5">
        <Section title="Doelgroep">
          <div className="space-y-4">
            <div>
              <p className="eyebrow text-[0.55rem] mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <Pill key={s.value} label={s.label} active={includeStatuses.has(s.value)} onClick={() => toggleStatus(s.value)} />
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow text-[0.55rem] mb-2">Type klant</p>
              <div className="flex flex-wrap gap-2">
                {KIND_OPTIONS.map((k) => (
                  <Pill key={k.value} label={k.label} active={includeKinds.has(k.value)} onClick={() => toggleKind(k.value)} />
                ))}
              </div>
            </div>
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1.5 block">Filter op stad (optioneel)</span>
              <div className="relative">
                <MapPin className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]" />
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="bv. Brakel"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                  style={{ border: '1px solid var(--color-line)' }}
                />
              </div>
            </label>
          </div>
        </Section>

        <Section title="Bericht">
          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1.5 block">Onderwerp</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <label className="block mt-3">
            <span className="eyebrow text-[0.55rem] mb-1.5 block">Inhoud</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)] font-mono"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
        </Section>
      </div>

      {/* Audience preview + acties */}
      <aside className="space-y-4">
        <div className="p-5"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-4" style={{ color: 'var(--color-accent)' }} />
            <h3 className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>Doelgroep</h3>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{matched.length}</p>
          <p className="text-xs text-[var(--color-mute)] mt-1">ontvangers met geldig e-mailadres</p>

          {matched.length > MAILTO_BATCH && (
            <div className="mt-3 p-2 text-[0.65rem]"
              style={{ background: 'rgba(201,140,79,0.15)', color: '#92400e' }}>
              <AlertCircle className="size-3 inline mr-1" />
              Meer dan {MAILTO_BATCH} adressen — verstuur in {batchCount} batches of gebruik CSV.
            </div>
          )}
        </div>

        <div className="p-4 space-y-2"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          {batchCount <= 1 ? (
            <button
              type="button"
              onClick={() => openMailClient(0)}
              disabled={matched.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Send className="size-4" />
              Open e-mailclient ({matched.length})
            </button>
          ) : (
            <div className="space-y-1">
              <p className="text-[0.65rem] text-[var(--color-mute)] mb-1">{batchCount} batches van max {MAILTO_BATCH}:</p>
              {Array.from({ length: batchCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openMailClient(i)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                >
                  <Send className="size-3.5" />
                  Batch {i + 1}: {Math.min(MAILTO_BATCH, matched.length - i * MAILTO_BATCH)} adressen
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={downloadCsv}
            disabled={matched.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
            style={{ border: '1px solid var(--color-line)' }}
          >
            <Download className="size-3.5" />
            Download CSV (Excel)
          </button>

          <button
            type="button"
            onClick={copyAddresses}
            disabled={matched.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
            style={{ border: '1px solid var(--color-line)' }}
          >
            {copied === 'emails' ? <CheckCircle2 className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
            {copied === 'emails' ? 'Gekopieerd' : 'Kopieer alle e-mails'}
          </button>
        </div>

        {matched.length > 0 && (
          <div className="p-4 max-h-80 overflow-y-auto"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <p className="eyebrow text-[0.55rem] mb-2">Preview ({Math.min(matched.length, 15)} van {matched.length})</p>
            <ul className="space-y-1.5">
              {matched.slice(0, 15).map((a) => (
                <li key={a.id} className="text-xs flex items-baseline justify-between gap-2">
                  <span className="truncate">{a.name}</span>
                  <span className="text-[var(--color-mute)] truncate">{a.email}</span>
                </li>
              ))}
            </ul>
            {matched.length > 15 && (
              <p className="text-[0.65rem] text-[var(--color-mute)] mt-2 italic">
                + {matched.length - 15} meer…
              </p>
            )}
          </div>
        )}

        <p className="text-[0.65rem] text-[var(--color-mute)] flex items-start gap-1">
          <ExternalLink className="size-3 mt-0.5 shrink-0" />
          Auto-versturen via Resend (SMTP) komt later — dan kan je hier rechtstreeks
          op één knop versturen en wordt het in een verzendingslog gelogd.
        </p>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-5"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h2 className="text-base mb-3" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
      {children}
    </section>
  )
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 text-xs uppercase tracking-[0.1em] font-medium transition-colors"
      style={{
        background: active ? 'var(--color-ink)' : 'transparent',
        color: active ? 'var(--color-paper)' : 'var(--color-mute)',
        border: '1px solid ' + (active ? 'var(--color-ink)' : 'var(--color-line)'),
      }}
    >
      {label}
    </button>
  )
}
