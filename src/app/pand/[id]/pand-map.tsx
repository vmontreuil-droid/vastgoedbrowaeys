'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

function pinIcon(typeColor: string) {
  const html = `
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <path d="M18 0 C8.06 0 0 8.06 0 18 c0 12.5 18 30 18 30 s18 -17.5 18 -30 C36 8.06 27.94 0 18 0 Z" fill="${typeColor}"/>
      <circle cx="18" cy="18" r="7" fill="#faf8f4"/>
    </svg>
  `
  return L.divIcon({
    html,
    className: 'vb-pin',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  })
}

export function PandMap({
  lat,
  lng,
  title,
  address,
  typeColor = '#0b4f58',
}: {
  lat: number
  lng: number
  title: string
  address: string
  typeColor?: string
}) {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
      style={{ background: 'var(--color-paper-2)' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon(typeColor)}>
          <Popup>
            <strong>{title}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
