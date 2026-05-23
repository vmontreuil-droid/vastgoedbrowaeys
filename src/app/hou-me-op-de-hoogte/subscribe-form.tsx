'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { TYPE_BADGE, type ListingType } from '@/lib/listings'

const TYPES: ListingType[] = ['woning', 'appartement', 'bouwgrond', 'handelspand']
const STATUSES = ['Te koop', 'Te huur', 'Beide'] as const
const REGIONS = ['Zwalm', 'Horebeke', 'Kluisbergen', 'Brakel', 'Geraardsbergen', 'Herzele', 'Zottegem', 'Andere'] as const

export function SubscribeForm() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')
  const [types, setTypes] = useState<Set<ListingType>>(new Set())
  const [regions, setRegions] = useState<Set<string>>(new Set())

  function toggleType(t: ListingType) {
    setTypes((prev) => {
      const next = new Set(prev); next.has(t) ? next.delete(t) : next.add(t); return next
    })
  }
  function toggleRegion(r: string) {
    setRegions((prev) => {
      const next = new Set(prev); next.has(r) ? next.delete(r) : next.add(r); return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTimeout(() => setStatus('sent'), 700)
  }

  if (status === 'sent') {
    return (
      <div className="p-10 md:p-14 text-center" style={{ background: 'var(--color-paper-2)' }}>
        <div
          className="inline-grid place-items-center size-14 mb-6 rounded-full"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          <Check className="size-6" />
        </div>
        <h3 className="text-2xl md:text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          U staat ingeschreven.
        </h3>
        <p className="text-[var(--color-mute)]">
          Zodra er een pand op de markt komt dat aan uw criteria voldoet, krijgt u een
          persoonlijk seintje van Stefanie.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Wat zoek je? */}
      <div>
        <p className="eyebrow mb-3">Wat zoek je?</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const isActive = types.has(t)
            const badge = TYPE_BADGE[t]
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className="px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium transition-all"
                style={{
                  background: isActive ? badge.bg : 'transparent',
                  color: isActive ? badge.text : 'var(--color-ink)',
                  border: `1px solid ${isActive ? badge.bg : 'var(--color-line)'}`,
                }}
              >
                {badge.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Koop of huur */}
      <div>
        <p className="eyebrow mb-3">Koop of huur</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="status" value={s} className="peer sr-only" defaultChecked={s === 'Te koop'} />
              <span
                className="block px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium border transition-all peer-checked:bg-[var(--color-ink)] peer-checked:text-[var(--color-paper)] peer-checked:border-[var(--color-ink)]"
                style={{ borderColor: 'var(--color-line)' }}
              >
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Regio */}
      <div>
        <p className="eyebrow mb-3">Regio (meerdere mogelijk)</p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => {
            const isActive = regions.has(r)
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className="px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium transition-all"
                style={{
                  background: isActive ? 'var(--color-ink)' : 'transparent',
                  color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                  border: `1px solid ${isActive ? 'var(--color-ink)' : 'var(--color-line)'}`,
                }}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>

      {/* Prijs-budget */}
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Budget (max €)" name="budget" type="number" />
        <TextField label="Min. slaapkamers" name="bedrooms" type="number" />
      </div>

      {/* Contact */}
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Naam" name="name" required />
        <TextField label="E-mail" name="email" type="email" required />
      </div>
      <TextField label="Telefoon (optioneel)" name="phone" type="tel" />

      <label className="flex items-start gap-3 text-sm text-[var(--color-mute)]">
        <input type="checkbox" required className="mt-0.5 accent-[var(--color-accent)]" />
        <span>
          Ik ga akkoord met de verwerking van mijn gegevens conform de{' '}
          <a href="/privacy-verklaring" className="link-underline text-[var(--color-ink)]">
            privacyverklaring
          </a>
          .
        </span>
      </label>

      <button type="submit" className="btn btn-solid">
        Schrijf me in
        <ArrowRight className="size-4" />
      </button>
    </form>
  )
}

function TextField({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}{required && ' *'}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)]"
        style={{ border: '1px solid var(--color-line)' }}
      />
    </label>
  )
}
