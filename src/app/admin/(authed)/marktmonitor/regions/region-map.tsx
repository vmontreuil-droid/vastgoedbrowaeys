'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { findPostcodesWithinRadius, type BePostcode } from '@/lib/be-postcodes'

// Pin-icoon (zelfde stijl als de hoofdkaart)
function makeCenterIcon() {
  const html = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <path d="M16 0 C7.16 0 0 7.16 0 16 c0 11 16 26 16 26 s16 -15 16 -26 C32 7.16 24.84 0 16 0 Z" fill="#0b4f58"/>
      <circle cx="16" cy="16" r="6" fill="#faf8f4"/>
    </svg>
  `
  return L.divIcon({
    html,
    className: 'vb-region-pin',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  })
}

function ClickHandler({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function RecenterIfChanged({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  const last = useRef<string>('')
  useEffect(() => {
    const k = `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`
    if (k === last.current) return
    last.current = k
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true })
  }, [center, map])
  return null
}

export type RegionMapPickerValue = {
  center: { lat: number; lng: number }
  radiusKm: number
  matchedPostcodes: BePostcode[]
}

export function RegionMapPicker({
  initialCenter,
  initialRadiusKm,
  onChange,
}: {
  initialCenter?: { lat: number; lng: number }
  initialRadiusKm?: number
  onChange?: (v: RegionMapPickerValue) => void
}) {
  const [center, setCenter] = useState(initialCenter ?? { lat: 50.834, lng: 3.706 }) // Horebeke default
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm ?? 10)

  const matched = useMemo(() => findPostcodesWithinRadius(center, radiusKm), [center, radiusKm])

  const pinIcon = useMemo(() => makeCenterIcon(), [])

  // Trigger onChange wanneer state wijzigt
  const lastFiredRef = useRef<string>('')
  useEffect(() => {
    if (!onChange) return
    const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)},${radiusKm}`
    if (key === lastFiredRef.current) return
    lastFiredRef.current = key
    onChange({ center, radiusKm, matchedPostcodes: matched })
  }, [center, radiusKm, matched, onChange])

  return (
    <div className="space-y-3">
      <div className="relative" style={{ height: 380 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMove={(lat, lng) => setCenter({ lat, lng })} />
          <RecenterIfChanged center={center} />
          <Marker
            position={[center.lat, center.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const ll = (e.target as L.Marker).getLatLng()
                setCenter({ lat: ll.lat, lng: ll.lng })
              },
            }}
          />
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#0b4f58',
              fillColor: '#0b4f58',
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        </MapContainer>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-1.5 block">
            Straal: {radiusKm} km
          </span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          <div className="flex justify-between text-[0.6rem] text-[var(--color-mute)] mt-1">
            <span>1 km</span>
            <span>15 km</span>
            <span>30 km</span>
          </div>
        </label>
        <div className="text-xs text-[var(--color-mute)]">
          {matched.length} gemeente{matched.length === 1 ? '' : 'n'} binnen straal
        </div>
      </div>

      <p className="text-[0.65rem] text-[var(--color-mute)] italic">
        💡 Klik op de kaart om een nieuw centrum te zetten, of sleep de pin. Lijst van
        gemeenten/postcodes binnen de cirkel verschijnt hieronder.
      </p>
    </div>
  )
}

export function MatchedPostcodesList({
  matched,
  onApply,
}: {
  matched: BePostcode[]
  onApply: (postcodes: BePostcode[]) => void
}) {
  if (matched.length === 0) {
    return (
      <p className="text-xs italic text-[var(--color-mute)] p-3"
        style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
        Geen gemeenten in de dataset binnen deze straal. Verhoog de radius of voeg
        postcodes manueel toe via het veld hieronder.
      </p>
    )
  }
  return (
    <div className="p-3"
      style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="eyebrow text-[0.55rem]">
          Gemeenten binnen straal ({matched.length})
        </span>
        <button
          type="button"
          onClick={() => onApply(matched)}
          className="px-3 py-1 text-[0.65rem]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Voeg deze toe aan zone
        </button>
      </div>
      <ul className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {matched.map((p) => (
          <li key={p.postcode} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.65rem]"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <span className="font-medium">{p.postcode}</span>
            <span className="text-[var(--color-mute)]">{p.city}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
