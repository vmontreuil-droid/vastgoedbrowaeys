'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Exacte locatie van het kantoor — gegeocodeerd via Nominatim/OpenStreetMap
const OFFICE_LAT = 50.8318209
const OFFICE_LNG = 3.6821382

// Pin in petrol-accent — zelfde stijl als de listings-map
const officePin = L.divIcon({
  html: `
    <svg width="40" height="52" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.28));">
      <path d="M16 0 C7.16 0 0 7.16 0 16 c0 11 16 26 16 26 s16 -15 16 -26 C32 7.16 24.84 0 16 0 Z" fill="#0b4f58"/>
      <circle cx="16" cy="16" r="7" fill="#faf8f4"/>
      <path d="M11 18 L11 13 L13 13 L13 18 L15 18 L15 11 L17 11 L17 18 L19 18 L19 13 L21 13 L21 18" fill="none" stroke="#0b4f58" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>
  `,
  className: 'vb-office-pin',
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -46],
})

export default function ContactMap() {
  return (
    <div className="relative w-full h-[500px] md:h-[560px]" style={{ background: 'var(--color-paper-2)' }}>
      <MapContainer
        center={[OFFICE_LAT, OFFICE_LNG]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[OFFICE_LAT, OFFICE_LNG]} icon={officePin}>
          <Popup minWidth={220}>
            <div className="px-1">
              <p className="!m-0 !text-[0.65rem] uppercase tracking-[0.18em]" style={{ color: '#0b4f58' }}>
                Vastgoed Browaeys
              </p>
              <p className="!mt-1.5 !mb-0 !text-base !leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Dorpsstraat 93/00.1
              </p>
              <p className="!m-0 !text-sm" style={{ color: '#6b6b6b' }}>9667 Horebeke</p>
              <div className="!mt-2 !text-xs flex flex-col gap-0.5">
                <a href="tel:+3255595010" style={{ color: '#0b4f58' }}>+32 (0)55 59 50 10</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=Dorpsstraat+93,+9667+Horebeke" target="_blank" rel="noopener noreferrer" style={{ color: '#0b4f58' }}>
                  Route plannen →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
