'use client'

import { useState, useTransition } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { createDossierAction, type DossierActionResult } from './actions'

export function NewDossierForm() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<DossierActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createDossierAction(fd)
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

      <Section title="Dossier">
        <Field name="client_id" label="Klant UUID *" required placeholder="UUID van de klant uit auth.users of profiles" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            name="type"
            label="Type *"
            required
            options={[
              { value: 'verkoop', label: 'Verkoop' },
              { value: 'verhuur', label: 'Verhuur' },
              { value: 'koop_zoeker', label: 'Koop-zoeker' },
              { value: 'huur_zoeker', label: 'Huur-zoeker' },
            ]}
          />
          <Select
            name="status"
            label="Status *"
            defaultValue="open"
            required
            options={[
              { value: 'open', label: 'Open' },
              { value: 'in_behandeling', label: 'In behandeling' },
              { value: 'onder_optie', label: 'Onder optie' },
              { value: 'verkocht', label: 'Verkocht' },
              { value: 'verhuurd', label: 'Verhuurd' },
              { value: 'geannuleerd', label: 'Geannuleerd' },
            ]}
          />
        </div>
        <Field name="reference" label="Referentie" placeholder="bv. VK-2026-019" />
      </Section>

      <Section title="Pand">
        <Field name="property_address" label="Adres" />
        <div className="grid sm:grid-cols-[auto_1fr_auto] gap-4">
          <Field name="property_zip" label="Postcode" />
          <Field name="property_city" label="Stad" />
          <Select
            name="property_type"
            label="Type pand"
            options={[
              { value: '', label: '— niet ingevuld —' },
              { value: 'woning', label: 'Woning' },
              { value: 'appartement', label: 'Appartement' },
              { value: 'bouwgrond', label: 'Bouwgrond' },
              { value: 'handelspand', label: 'Handelspand' },
            ]}
          />
        </div>
        <Field name="asking_price" label="Vraagprijs / budget (€)" type="text" />
      </Section>

      <Section title="Notities">
        <Field name="notes" label="Vrije tekst" multiline rows={5} />
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
          {pending ? 'Aanmaken…' : 'Dossier aanmaken'}
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
  name, label, type = 'text', required, placeholder, multiline, rows = 3,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
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
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      )}
    </label>
  )
}

function Select({
  name, label, defaultValue, required, options,
}: {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
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
