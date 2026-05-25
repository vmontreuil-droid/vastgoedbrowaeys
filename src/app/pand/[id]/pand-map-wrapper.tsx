'use client'

import dynamic from 'next/dynamic'

// react-leaflet vereist window — alleen client-side laden.
// Next.js 16 staat ssr: false enkel toe in Client Components.
const PandMapInner = dynamic(() => import('./pand-map').then((m) => m.PandMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] grid place-items-center"
      style={{ background: 'var(--color-paper-2)' }}>
      <p className="text-sm text-[var(--color-mute)]">Kaart laden…</p>
    </div>
  ),
})

export function PandMapWrapper(props: {
  lat: number
  lng: number
  title: string
  address: string
  typeColor?: string
}) {
  return <PandMapInner {...props} />
}
