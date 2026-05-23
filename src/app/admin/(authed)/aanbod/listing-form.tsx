'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import {
  createListingAction,
  updateListingAction,
  deleteListingAction,
  type ListingActionResult,
} from './actions'
import type { ListingDb } from '@/lib/listings-db'

export function ListingForm({
  mode,
  listing,
}: {
  mode: 'create' | 'edit'
  listing?: ListingDb
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ListingActionResult | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res =
        mode === 'create'
          ? await createListingAction(fd)
          : await updateListingAction(listing!.id, fd)
      setResult(res)
      if (res.ok && mode === 'create') {
        router.push(`/admin/aanbod/${res.id}`)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteListingAction(listing!.id)
      if (!res.ok) setResult(res)
      // bij succes redirect de action zelf
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-4xl"
    >
      {result && (
        <div
          className="flex items-start gap-3 p-3 text-sm"
          style={{
            background: result.ok ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.08)',
            color: result.ok ? '#166534' : '#b91c1c',
          }}
        >
          {result.ok ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <AlertCircle className="size-4 mt-0.5 shrink-0" />}
          <span>{result.ok ? (result.message ?? 'Opgeslagen.') : result.error}</span>
        </div>
      )}

      <Section title="Basisgegevens">
        <Field name="title" label="Titel *" defaultValue={listing?.title ?? ''} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            name="type"
            label="Type *"
            defaultValue={listing?.type ?? 'woning'}
            required
            options={[
              { value: 'woning', label: 'Woning' },
              { value: 'appartement', label: 'Appartement' },
              { value: 'bouwgrond', label: 'Bouwgrond' },
              { value: 'handelspand', label: 'Handelspand' },
            ]}
          />
          <Select
            name="status"
            label="Status *"
            defaultValue={listing?.status ?? 'te-koop'}
            required
            options={[
              { value: 'concept', label: 'Concept (niet zichtbaar)' },
              { value: 'te-koop', label: 'Te koop' },
              { value: 'te-huur', label: 'Te huur' },
              { value: 'optie', label: 'Onder optie' },
              { value: 'verkocht', label: 'Verkocht' },
              { value: 'verhuurd', label: 'Verhuurd' },
            ]}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field name="ref" label="Referentie" defaultValue={listing?.ref ?? ''} placeholder="bv. VB-2026-001" />
          <Field name="slug" label="URL-slug" defaultValue={listing?.slug ?? ''} placeholder="Auto vanuit titel" />
          <CheckField name="is_published" label="Publiek zichtbaar" defaultChecked={listing?.is_published ?? true} />
        </div>
      </Section>

      <Section title="Locatie">
        <div className="grid sm:grid-cols-[1fr_auto_2fr] gap-4">
          <Field name="street" label="Straat + nr" defaultValue={listing?.street ?? ''} />
          <Field name="zip" label="Postcode" defaultValue={listing?.zip ?? ''} />
          <Field name="city" label="Stad *" defaultValue={listing?.city ?? ''} required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="lat" label="Latitude" defaultValue={listing?.lat?.toString() ?? ''} placeholder="50.7892" type="text" />
          <Field name="lng" label="Longitude" defaultValue={listing?.lng?.toString() ?? ''} placeholder="3.5641" type="text" />
        </div>
      </Section>

      <Section title="Prijs">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="price" label="Prijs (€)" defaultValue={listing?.price?.toString() ?? ''} type="text" placeholder="bv. 395000" />
          <Field name="price_label" label="Prijs-label (optioneel)" defaultValue={listing?.price_label ?? ''} placeholder="bv. Vanaf € 395.000" />
        </div>
      </Section>

      <Section title="Kenmerken">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field name="bedrooms" label="Slaapkamers" defaultValue={listing?.bedrooms?.toString() ?? ''} type="text" />
          <Field name="bathrooms" label="Badkamers" defaultValue={listing?.bathrooms?.toString() ?? ''} type="text" />
          <Field name="living_area" label="Bewoonbaar (m²)" defaultValue={listing?.living_area?.toString() ?? ''} type="text" />
          <Field name="plot_area" label="Perceel (m²)" defaultValue={listing?.plot_area?.toString() ?? ''} type="text" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="build_year" label="Bouwjaar" defaultValue={listing?.build_year?.toString() ?? ''} type="text" placeholder="bv. 1985" />
          <Field name="epc_score" label="EPC" defaultValue={listing?.epc_score ?? ''} placeholder="bv. C — 210 kWh/m²" />
        </div>
      </Section>

      <Section title="Beschrijving">
        <Field
          name="description"
          label="Tekst"
          defaultValue={listing?.description ?? ''}
          multiline
          rows={8}
        />
      </Section>

      <Section title="Foto's">
        <Field
          name="gallery"
          label="Foto-URLs (één per lijn of komma-gescheiden)"
          defaultValue={listing?.gallery?.join('\n') ?? ''}
          multiline
          rows={4}
          placeholder="https://… of /listings/123/foto.jpg"
        />
        <Field
          name="cover_photo"
          label="Cover-foto URL (optioneel — anders eerste uit gallery)"
          defaultValue={listing?.cover_photo ?? ''}
        />
      </Section>

      <div
        className="sticky bottom-0 -mx-4 px-4 py-4 flex items-center justify-between gap-3"
        style={{
          background: 'var(--color-paper-2)',
          borderTop: '1px solid var(--color-line)',
        }}
      >
        {mode === 'edit' && listing ? (
          confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: '#b91c1c' }}>Permanent verwijderen?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="px-2 py-1 text-white"
                style={{ background: '#b91c1c' }}
              >
                {pending ? '…' : 'Ja, verwijder'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="link-underline"
              >
                Annuleer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs text-red-700"
            >
              <Trash2 className="size-3.5" />
              Verwijderen
            </button>
          )
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Save className="size-4" />
          {pending ? 'Opslaan…' : mode === 'create' ? 'Pand aanmaken' : 'Wijzigingen bewaren'}
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
  name, label, defaultValue, required, placeholder, type = 'text', multiline, rows = 3,
}: {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
  placeholder?: string
  type?: string
  multiline?: boolean
  rows?: number
}) {
  return (
    <label className="block">
      <span className="eyebrow text-[0.6rem] mb-2 block">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
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

function CheckField({
  name, label, defaultChecked,
}: {
  name: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm pt-7">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-[var(--color-accent)]"
      />
      <span>{label}</span>
    </label>
  )
}
