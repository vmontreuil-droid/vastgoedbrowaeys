'use client'

import { useState } from 'react'
import { Send, Check } from 'lucide-react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Placeholder — server action / Supabase komt later
    setTimeout(() => setStatus('sent'), 800)
  }

  if (status === 'sent') {
    return (
      <div className="p-10 text-center" style={{ background: 'var(--color-paper-2)' }}>
        <div
          className="inline-grid place-items-center size-14 mb-6 rounded-full"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          <Check className="size-6" />
        </div>
        <h3 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Bedankt voor uw bericht.
        </h3>
        <p className="text-[var(--color-mute)]">
          We nemen binnen de werkdag persoonlijk contact met u op.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Naam" name="name" required />
        <FormField label="Familienaam" name="surname" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="E-mail" name="email" type="email" required />
        <FormField label="Telefoon" name="phone" type="tel" />
      </div>
      <FormField label="Onderwerp" name="subject" />
      <FormField label="Uw bericht" name="message" textarea rows={5} required />

      <label className="flex items-start gap-3 text-sm text-[var(--color-mute)] pt-2">
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
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn btn-solid"
        >
          {status === 'sending' ? 'Versturen…' : 'Bericht versturen'}
          <Send className="size-4" />
        </button>
      </div>
    </form>
  )
}

function FormField({
  label,
  name,
  type = 'text',
  required,
  textarea,
  rows,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  textarea?: boolean
  rows?: number
}) {
  const base =
    'w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-mute)]'
  const style: React.CSSProperties = { border: '1px solid var(--color-line)' }

  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}{required && ' *'}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={rows ?? 4} className={base} style={style} />
      ) : (
        <input name={name} type={type} required={required} className={base} style={style} />
      )}
    </label>
  )
}
