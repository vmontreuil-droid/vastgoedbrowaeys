'use client'

import { useState, useTransition } from 'react'
import { Save, AlertCircle, UserPlus } from 'lucide-react'
import { createClientAction, type ClientActionResult } from './actions'

const KINDS = [
  { value: 'koper', label: 'Koper' },
  { value: 'verkoper', label: 'Verkoper' },
  { value: 'huurder', label: 'Huurder' },
  { value: 'verhuurder', label: 'Verhuurder' },
]

export function NewClientForm() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ClientActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createClientAction(fd)
      setResult(res)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {result && !result.ok && (
        <div
          className="flex items-start gap-3 p-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <Section title="Persoon">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="first_name" label="Voornaam *" required />
          <Field name="last_name" label="Familienaam *" required />
        </div>
        <Field name="email" label="E-mail *" type="email" required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="phone" label="Telefoon" type="tel" />
          <Field name="city" label="Stad" />
        </div>
      </Section>

      <Section title="Profiel">
        <div>
          <span className="eyebrow text-[0.6rem] mb-2 block">Type klant (meerdere mogelijk)</span>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <label key={k.value} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm" style={{ border: '1px solid var(--color-line)' }}>
                <input type="checkbox" name="kinds" value={k.value} className="accent-[var(--color-accent)]" />
                {k.label}
              </label>
            ))}
          </div>
        </div>

        <Field name="notes" label="Notities" multiline rows={4} />
      </Section>

      <Section title="Portaal-toegang">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="grant_portal" className="accent-[var(--color-accent)] mt-0.5" />
          <span>
            Klant krijgt login-account
            <span className="block text-xs text-[var(--color-mute)] mt-0.5">
              Aanvinken om een Supabase-account aan te maken. Klant kan via &quot;Wachtwoord vergeten&quot; zelf een wachtwoord instellen.
            </span>
          </span>
        </label>
      </Section>

      <div
        className="sticky bottom-0 -mx-4 px-4 py-4 flex items-center justify-end gap-3"
        style={{ background: 'var(--color-paper-2)', borderTop: '1px solid var(--color-line)' }}
      >
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <UserPlus className="size-4" />
          {pending ? 'Aanmaken…' : 'Klant aanmaken'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="p-5 md:p-6 space-y-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
      {children}
    </section>
  )
}

function Field({
  name, label, type = 'text', required, multiline, rows = 3,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  multiline?: boolean
  rows?: number
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          rows={rows}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      )}
    </label>
  )
}
