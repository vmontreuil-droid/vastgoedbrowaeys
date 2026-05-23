'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

const TYPES = ['Woning', 'Appartement', 'Bouwgrond', 'Handelspand', 'Andere'] as const
const REASONS = ['Verkoop', 'Verhuur', 'Erfenis / schenking', 'Persoonlijke info', 'Andere'] as const

export function SchattingForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => setStatus('sent'), 900)
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
          Bedankt — uw aanvraag is verzonden.
        </h3>
        <p className="text-[var(--color-mute)] max-w-md mx-auto">
          We bekijken uw gegevens en nemen binnen de werkdag persoonlijk contact op om
          het plaatsbezoek in te plannen.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Sectie 1: woning */}
      <Section number="01" title="Over het pand">
        <SelectField label="Type" name="type" options={TYPES} required />
        <div className="grid sm:grid-cols-3 gap-5">
          <TextField label="Straat & nummer" name="street" required className="sm:col-span-2" />
          <TextField label="Postcode" name="zip" required />
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <TextField label="Gemeente" name="city" required className="sm:col-span-2" />
          <TextField label="Bouwjaar" name="year" type="number" />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="Bewoonbare oppervlakte (m²)" name="surface" type="number" />
          <TextField label="Aantal slaapkamers" name="bedrooms" type="number" />
        </div>
      </Section>

      {/* Sectie 2: reden */}
      <Section number="02" title="Reden van schatting">
        <SelectField label="Waarvoor heeft u de schatting nodig?" name="reason" options={REASONS} />
        <TextField
          label="Eventuele bijkomende info"
          name="notes"
          textarea
          rows={4}
        />
      </Section>

      {/* Sectie 3: contact */}
      <Section number="03" title="Uw contactgegevens">
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="Voornaam" name="firstname" required />
          <TextField label="Familienaam" name="lastname" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="E-mail" name="email" type="email" required />
          <TextField label="Telefoon" name="phone" type="tel" required />
        </div>
      </Section>

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

      <div>
        <button type="submit" disabled={status === 'sending'} className="btn btn-solid">
          {status === 'sending' ? 'Versturen…' : 'Schatting aanvragen'}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </form>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 mb-6">
        <span
          className="leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '2.5rem',
            color: 'var(--color-clay)',
            opacity: 0.55,
          }}
        >
          {number}
        </span>
        <h2 className="text-xl md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function TextField({
  label,
  name,
  type = 'text',
  required,
  textarea,
  rows,
  className,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  textarea?: boolean
  rows?: number
  className?: string
}) {
  const base =
    'w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-mute)]'
  const style: React.CSSProperties = { border: '1px solid var(--color-line)' }

  return (
    <label className={`block ${className ?? ''}`}>
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}{required && ' *'}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={rows ?? 4} className={base} style={style} />
      ) : (
        <input name={name} type={type} required={required} className={base} style={style} />
      )}
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string
  name: string
  options: readonly string[]
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}{required && ' *'}</span>
      <select
        name={name}
        required={required}
        className="w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)]"
        style={{ border: '1px solid var(--color-line)' }}
        defaultValue=""
      >
        <option value="" disabled>Kies een optie…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}
