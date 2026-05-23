'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import {
  TYPE_BADGE,
  formatPrice,
  listingHref,
  type Listing,
  type ListingType,
} from '@/lib/listings'
import { LISTING_COORDS } from '@/data/listing-coords'

// Klein huis-pin als SVG. Kleur volgt het type-badge zodat de kaart
// dezelfde visuele code heeft als de cards.
function pinIcon(type: ListingType) {
  const badge = TYPE_BADGE[type]
  // Resolved CSS-var → hex zou ideaal zijn, maar voor SVG gebruiken we
  // CSS color() niet betrouwbaar — dus mappen we naar concrete hex.
  const HEX: Record<ListingType, string> = {
    woning:      '#0b4f58',
    appartement: '#c4a380',
    bouwgrond:   '#6e7d4d',
    handelspand: '#a17e58',
  }
  const fill = HEX[type]
  const html = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
      <path d="M16 0 C7.16 0 0 7.16 0 16 c0 11 16 26 16 26 s16 -15 16 -26 C32 7.16 24.84 0 16 0 Z" fill="${fill}"/>
      <circle cx="16" cy="16" r="6" fill="#faf8f4"/>
    </svg>
  `
  return L.divIcon({
    html,
    className: 'vb-pin',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  })
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [bounds, map])
  return null
}

export default function ListingsMap({ listings }: { listings: Listing[] }) {
  // Filter listings die geocoded zijn
  const withCoords = listings.filter((l) => LISTING_COORDS[l.id])

  if (withCoords.length === 0) {
    return (
      <div className="p-12 text-center" style={{ background: 'var(--color-paper-2)' }}>
        <p className="text-[var(--color-mute)]">Geen panden met locatiegegevens.</p>
      </div>
    )
  }

  const points: L.LatLngTuple[] = withCoords.map((l) => {
    const c = LISTING_COORDS[l.id]
    return [c.lat, c.lng]
  })
  const bounds: L.LatLngBoundsExpression = L.latLngBounds(points)

  return (
    <div className="relative w-full h-[70vh] min-h-[560px]" style={{ background: 'var(--color-paper-2)' }}>
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        {withCoords.map((listing) => {
          const c = LISTING_COORDS[listing.id]
          return (
            <Marker
              key={listing.id}
              position={[c.lat, c.lng]}
              icon={pinIcon(listing.type)}
            >
              <Popup minWidth={260} maxWidth={300}>
                <Link href={listingHref(listing)} className="block group">
                  <div className="relative w-full aspect-[16/10] overflow-hidden mb-3" style={{ background: 'var(--color-paper-2)' }}>
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                    <span
                      className="absolute top-2 left-2 inline-block px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.14em] font-medium"
                      style={{ background: TYPE_BADGE[listing.type].bg, color: TYPE_BADGE[listing.type].text }}
                    >
                      {TYPE_BADGE[listing.type].label}
                    </span>
                  </div>
                  <p className="!m-0 !text-[0.65rem] uppercase tracking-[0.14em] flex items-center gap-1" style={{ color: 'var(--color-mute)' }}>
                    <MapPin className="size-3" />
                    {listing.zip} {listing.city}
                  </p>
                  <h4 className="!mt-1.5 !mb-1 !text-base !leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {listing.title}
                  </h4>
                  <p className="!m-0 !text-base !italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
                    {formatPrice(listing.price)}
                  </p>
                  <p className="!mt-2 !mb-0 !text-xs inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ color: 'var(--color-ink)' }}>
                    Bekijk pand <ArrowRight className="size-3" />
                  </p>
                </Link>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
