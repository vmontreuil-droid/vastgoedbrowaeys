'use client'

import dynamic from 'next/dynamic'

// Leaflet vereist window-toegang — dynamic import met ssr:false vanuit
// een client component (mag niet in server components in Next 16).
const ContactMap = dynamic(() => import('@/components/contact-map'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-[500px] md:h-[560px] grid place-items-center"
      style={{ background: 'var(--color-paper-2)' }}
    >
      <p className="text-sm" style={{ color: 'var(--color-mute)' }}>
        Kaart laden…
      </p>
    </div>
  ),
})

export function ContactMapWrapper() {
  return <ContactMap />
}
