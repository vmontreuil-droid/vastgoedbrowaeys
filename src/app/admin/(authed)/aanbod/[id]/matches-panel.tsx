'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Mail, Phone, Target, Users, ArrowRight, Copy, CheckCircle2 } from 'lucide-react'
import type { ZoekficheMatch } from '@/lib/matching'

export function MatchesPanel({
  matches,
  listingTitle,
  listingCity,
  listingZip,
  listingPriceLabel,
  listingHref,
}: {
  matches: ZoekficheMatch[]
  listingTitle: string
  listingCity: string
  listingZip: string | null
  listingPriceLabel: string
  listingHref: string
}) {
  const [copiedFor, setCopiedFor] = useState<string | null>(null)

  const subject = `Nieuw pand dat past bij uw zoekopdracht — ${listingTitle}`
  const bodyTemplate = useMemo(() => {
    const lines = [
      'Beste,',
      '',
      'In ons aanbod hebben we net een pand binnengekregen dat past binnen uw zoekcriteria:',
      '',
      `  ${listingTitle}`,
      `  ${listingZip ?? ''} ${listingCity}`.trim(),
      `  ${listingPriceLabel}`,
      '',
      'U kunt het pand online bekijken via:',
      `${listingHref}`,
      '',
      'Graag een bezichtiging inplannen? Antwoord gerust op deze mail of bel even.',
      '',
      'Vriendelijke groeten,',
      'Vastgoed Browaeys',
      '055 / 59 50 10 · info@vastgoedbrowaeys.be',
    ]
    return lines.join('\n')
  }, [listingTitle, listingZip, listingCity, listingPriceLabel, listingHref])

  function bulkMailto() {
    const toList = matches.map((m) => m.clientEmail).filter(Boolean).join(',')
    const href = `mailto:?bcc=${encodeURIComponent(toList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTemplate)}`
    window.location.href = href
  }

  function mailtoOne(m: ZoekficheMatch) {
    const personal = bodyTemplate.replace('Beste,', `Beste ${m.clientName},`)
    const href = `mailto:${encodeURIComponent(m.clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(personal)}`
    window.location.href = href
  }

  async function copyBody() {
    try {
      await navigator.clipboard.writeText(bodyTemplate)
      setCopiedFor('all')
      setTimeout(() => setCopiedFor(null), 1500)
    } catch {}
  }

  if (matches.length === 0) {
    return (
      <section className="p-5"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="size-4" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-base" style={{ fontFamily: 'var(--font-display)' }}>Zoekfiche-matches</h2>
        </div>
        <p className="text-sm text-[var(--color-mute)] italic">
          Geen open zoekfiches die matchen op stad + type + budget.
        </p>
      </section>
    )
  }

  return (
    <section className="p-5"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base" style={{ fontFamily: 'var(--font-display)' }}>
              Zoekfiche-matches <span className="text-[var(--color-mute)]">({matches.length})</span>
            </h2>
          </div>
          <p className="text-xs text-[var(--color-mute)] mt-1">
            Open koop/huur-zoekers die matchen op <strong>stad</strong> + type + budget.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyBody}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
          >
            {copiedFor === 'all' ? <CheckCircle2 className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
            {copiedFor === 'all' ? 'Gekopieerd' : 'Kopieer mailtekst'}
          </button>
          <button
            type="button"
            onClick={bulkMailto}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Users className="size-3.5" />
            Mail allen ({matches.length})
          </button>
        </div>
      </div>

      <ul className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
        {matches.map((m) => (
          <li key={m.dossierId} className="py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/admin/klanten/${m.clientId}`} className="text-sm link-underline font-medium">
                  {m.clientName}
                </Link>
                {m.dossierRef && (
                  <Link href={`/admin/dossiers/${m.dossierId}`}
                    className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] link-underline">
                    {m.dossierRef}
                  </Link>
                )}
                {m.matchedOn.map((r) => (
                  <span key={r}
                    className="inline-block px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
                    style={{ background: 'rgba(34,197,94,0.18)', color: '#166534' }}>
                    ✓ {r}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-xs text-[var(--color-mute)] flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 truncate max-w-[260px]">
                  <Mail className="size-3" /> {m.clientEmail}
                </span>
                {m.clientPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" /> {m.clientPhone}
                  </span>
                )}
                {m.budget && (
                  <span>budget: € {m.budget.toLocaleString('nl-BE')}</span>
                )}
                {m.searchCity.length > 0 && (
                  <span>steden: {m.searchCity.join(', ')}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => mailtoOne(m)}
                title="Mail persoonlijk"
                className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              >
                <Mail className="size-3.5" />
              </button>
              <Link
                href={`/admin/dossiers/${m.dossierId}`}
                title="Open dossier"
                className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              >
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[0.65rem] text-[var(--color-mute)] mt-3">
        💡 Auto-verzending via SMTP komt later (Resend.com of vergelijkbaar). Voor nu opent de
        knop je e-mailclient met alle adressen + de tekst voorbereid.
      </p>
    </section>
  )
}
