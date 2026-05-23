'use client'

import { useState, useTransition } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { createAppointmentAction, type AppointmentActionResult } from './actions'

export function NewAppointmentForm() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AppointmentActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createAppointmentAction(fd)
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

      <Section title="Afspraak">
        <Field name="title" label="Titel *" required placeholder="bv. Bezichtiging woning Horebeke" />
        <Field name="dossier_id" label="Dossier UUID *" required placeholder="Aan welk dossier hangt deze afspraak?" />
        <div className="grid sm:grid-cols-3 gap-4">
          <Field name="date" label="Datum *" type="date" required />
          <Field name="time" label="Uur *" type="time" required />
          <Field name="duration_min" label="Duur (min)" type="number" defaultValue="60" />
        </div>
        <Select
          name="status"
          label="Status"
          defaultValue="planned"
          options={[
            { value: 'planned',   label: 'Gepland' },
            { value: 'confirmed', label: 'Bevestigd' },
            { value: 'completed', label: 'Voltooid' },
            { value: 'cancelled', label: 'Geannuleerd' },
          ]}
        />
      </Section>

      <Section title="Locatie & notities">
        <Field name="location" label="Locatie" placeholder="bv. Sint-Maria-Horebeke of Kantoor Brakel" />
        <Field name="notes" label="Notities" multiline rows={4} />
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
          <Save className="size-4" />
          {pending ? 'Aanmaken…' : 'Afspraak plannen'}
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
  name, label, type = 'text', required, placeholder, defaultValue, multiline, rows = 3,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
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
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      )}
    </label>
  )
}

function Select({
  name, label, defaultValue, options,
}: {
  name: string
  label: string
  defaultValue?: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
        style={{ border: '1px solid var(--color-line)' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
