'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle, X, MapPin, Building2, Plus, Map as MapIcon } from 'lucide-react'
import { createRegionAction, updateRegionAction, type RegionInput } from '../regions-actions'
import type { BePostcode } from '@/lib/be-postcodes'
import { MatchedPostcodesList } from './region-map'

// Lazy-load: react-leaflet vereist window.
const RegionMapPicker = dynamic(
  () => import('./region-map').then((m) => m.RegionMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full grid place-items-center" style={{ height: 380, background: 'var(--color-paper-2)' }}>
        <p className="text-sm text-[var(--color-mute)]">Kaart laden…</p>
      </div>
    ),
  },
)

const PROPERTY_TYPES = [
  { value: 'house', label: 'Huis' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Bouwgrond' },
  { value: 'commercial', label: 'Handelspand' },
  { value: 'office', label: 'Kantoor' },
  { value: 'garage', label: 'Garage' },
]

export function RegionForm({
  initial,
  regionId,
}: {
  initial: RegionInput
  regionId?: string
}) {
  const router = useRouter()
  const [label, setLabel] = useState(initial.label)
  const [postcodes, setPostcodes] = useState<string[]>(initial.postcodes)
  const [postcodeInput, setPostcodeInput] = useState('')
  const [cities, setCities] = useState<string[]>(initial.cities)
  const [cityInput, setCityInput] = useState('')
  const [listingType, setListingType] = useState<RegionInput['listingType']>(initial.listingType)
  const [minPrice, setMinPrice] = useState(initial.minPrice != null ? String(initial.minPrice) : '')
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice != null ? String(initial.maxPrice) : '')
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initial.propertyTypes)
  const [enabled, setEnabled] = useState(initial.enabled)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mapMatched, setMapMatched] = useState<BePostcode[]>([])

  function applyMatchedToZone(matched: BePostcode[]) {
    const newPcs = matched.map((m) => m.postcode).filter((p) => !postcodes.includes(p))
    const newCities = matched.map((m) => m.city).filter((c) => !cities.some((x) => x.toLowerCase() === c.toLowerCase()))
    if (newPcs.length > 0) setPostcodes([...postcodes, ...newPcs])
    if (newCities.length > 0) setCities([...cities, ...newCities])
  }

  function addPostcode() {
    const p = postcodeInput.trim()
    if (!/^[1-9]\d{3}$/.test(p)) {
      setError('Postcode moet 4 cijfers zijn (bv. 9667)')
      return
    }
    if (postcodes.includes(p)) {
      setPostcodeInput('')
      return
    }
    setPostcodes([...postcodes, p])
    setPostcodeInput('')
    setError(null)
  }

  function addCity() {
    const c = cityInput.trim()
    if (!c || c.length < 2) return
    const normalized = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
    if (cities.some((x) => x.toLowerCase() === c.toLowerCase())) {
      setCityInput('')
      return
    }
    setCities([...cities, normalized])
    setCityInput('')
    setError(null)
  }

  function toggleType(value: string) {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input: RegionInput = {
      label,
      postcodes,
      cities,
      listingType,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      propertyTypes,
      enabled,
    }

    startTransition(async () => {
      const res = regionId
        ? await updateRegionAction(regionId, input)
        : await createRegionAction(input)
      if (res.ok) {
        router.push('/admin/marktmonitor/regions')
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Naam van de zone</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          maxLength={80}
          placeholder="bv. Vlaamse Ardennen — Horebeke + Zottegem"
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
        <p className="mt-1 text-[0.65rem] text-[var(--color-mute)]">
          Korte titel die je herkent in het overzicht.
        </p>
      </label>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2 flex items-center gap-1.5">
          <MapIcon className="size-3" />
          Zone op kaart aanduiden
        </legend>
        <p className="text-[0.65rem] text-[var(--color-mute)] mb-2">
          Klik op de kaart of sleep de pin om het centrum te zetten. Stel de straal in
          en klik &ldquo;Voeg toe aan zone&rdquo; om alle gevonden gemeenten in één keer over te nemen.
        </p>
        <RegionMapPicker onChange={(v) => setMapMatched(v.matchedPostcodes)} />
        <div className="mt-3">
          <MatchedPostcodesList matched={mapMatched} onApply={applyMatchedToZone} />
        </div>
      </fieldset>

      <div className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-mute)] flex items-center gap-3">
        <span className="flex-1 h-px" style={{ background: 'var(--color-line)' }} />
        Of manueel
        <span className="flex-1 h-px" style={{ background: 'var(--color-line)' }} />
      </div>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Postcodes</legend>
        <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[2.5rem] p-2"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          {postcodes.length === 0 && (
            <span className="text-[0.7rem] italic text-[var(--color-mute)] px-1">
              Nog geen postcodes toegevoegd
            </span>
          )}
          {postcodes.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              {p}
              <button type="button" onClick={() => setPostcodes(postcodes.filter((x) => x !== p))}
                className="hover:text-red-300" aria-label={`Verwijder ${p}`}>
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                e.preventDefault()
                addPostcode()
              }
            }}
            placeholder="bv. 9667"
            maxLength={4}
            inputMode="numeric"
            className="w-32 px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <button type="button" onClick={addPostcode}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs"
            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
            <Plus className="size-3" /> Voeg toe
          </button>
          <span className="text-[0.65rem] text-[var(--color-mute)]">
            Druk Enter, spatie of komma om toe te voegen
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Gemeenten (alternatief / aanvullend)</legend>
        <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[2.5rem] p-2"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          {cities.length === 0 && (
            <span className="text-[0.7rem] italic text-[var(--color-mute)] px-1">
              Nog geen gemeenten toegevoegd
            </span>
          )}
          {cities.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              <MapPin className="size-2.5" />
              {c}
              <button type="button" onClick={() => setCities(cities.filter((x) => x !== c))}
                className="hover:text-red-300" aria-label={`Verwijder ${c}`}>
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addCity()
              }
            }}
            placeholder="bv. Horebeke, Zottegem"
            maxLength={60}
            className="flex-1 max-w-xs px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <button type="button" onClick={addCity}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs"
            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
            <Plus className="size-3" /> Voeg toe
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Wat zoek je?</legend>
        <div className="flex gap-2">
          {(['verkoop', 'verhuur', 'beide'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setListingType(t)}
              className="flex-1 px-3 py-2 text-sm transition-colors"
              style={{
                background: listingType === t ? 'var(--color-ink)' : 'var(--color-paper-2)',
                color: listingType === t ? 'var(--color-paper)' : 'var(--color-ink)',
                border: '1px solid var(--color-line)',
              }}>
              {t === 'verkoop' ? 'Te koop' : t === 'verhuur' ? 'Te huur' : 'Beide'}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Prijsklasse (optioneel)</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-[var(--color-mute)] mb-1 block">Vanaf €</span>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="bv. 200000"
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mute)] mb-1 block">Tot €</span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="bv. 500000"
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Type pand (optioneel — leeg = alle types)</legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => {
            const active = propertyTypes.includes(t.value)
            return (
              <button key={t.value} type="button" onClick={() => toggleType(t.value)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors"
                style={{
                  background: active ? 'var(--color-ink)' : 'var(--color-paper-2)',
                  color: active ? 'var(--color-paper)' : 'var(--color-ink)',
                  border: '1px solid var(--color-line)',
                }}>
                <Building2 className="size-3" />
                {t.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow text-[0.6rem] mb-2">Status</legend>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Deze regio meenemen in de dagelijkse scan
        </label>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          <Check className="size-4" />
          {pending ? 'Bezig…' : regionId ? 'Wijzigingen bewaren' : 'Regio aanmaken'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-sm link-underline text-[var(--color-mute)]">
          Annuleer
        </button>
      </div>
    </form>
  )
}
