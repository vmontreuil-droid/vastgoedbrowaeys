'use client'

import { useState, useTransition } from 'react'
import { Send, Check, AlertCircle } from 'lucide-react'
import { createLead } from '@/lib/leads'

export function ContactForm({
  prefillSubject,
  relatedListing,
}: {
  prefillSubject?: string | null
  relatedListing?: string | null
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setStatus('sending')

    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '').trim()
    const name = `${get('name')} ${get('surname')}`.trim()
    const email = get('email')
    const phone = get('phone')
    const subject = get('subject') || (relatedListing ? `Vraag over: ${relatedListing}` : 'Bericht via contactformulier')
    const message = get('message')

    startTransition(async () => {
      const res = await createLead({
        fromName: name,
        fromEmail: email,
        fromPhone: phone,
        subject,
        body: message,
        type: relatedListing ? 'visit_request' : (get('subject') ? 'vraag' : 'algemeen'),
        relatedListing: relatedListing ?? null,
        source: relatedListing ? 'pand-detail' : 'contact',
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('idle')
        setError(res.error)
      }
    })
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
      {relatedListing && (
        <div
          className="p-3 text-sm"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
        >
          <p className="eyebrow text-[0.55rem] mb-1">Over pand</p>
          <p>{relatedListing}</p>
        </div>
      )}
      <FormField label="Onderwerp" name="subject" defaultValue={prefillSubject ?? ''} />
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

      {error && (
        <div
          className="flex items-start gap-3 p-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}
          role="alert"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  textarea?: boolean
  rows?: number
  defaultValue?: string
}) {
  const base =
    'w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-mute)]'
  const style: React.CSSProperties = { border: '1px solid var(--color-line)' }

  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}{required && ' *'}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={rows ?? 4} className={base} style={style} defaultValue={defaultValue} />
      ) : (
        <input name={name} type={type} required={required} className={base} style={style} defaultValue={defaultValue} />
      )}
    </label>
  )
}
