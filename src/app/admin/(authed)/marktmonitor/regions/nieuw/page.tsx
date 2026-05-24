import Link from 'next/link'
import { ArrowLeft, Radar } from 'lucide-react'
import { RegionForm } from '../region-form'

export const metadata = {
  title: 'Admin · Nieuwe zone',
}

export default function NewRegionPage() {
  return (
    <div className="container-px mx-auto max-w-2xl py-8 md:py-10">
      <Link
        href="/admin/marktmonitor/regions"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-4 md:mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar zones
      </Link>

      <section className="mb-6 md:mb-8">
        <p className="eyebrow mb-2 md:mb-3">Admin · Marktmonitor</p>
        <h1 className="text-2xl sm:text-3xl flex items-center gap-3">
          <Radar className="size-6 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Nieuwe zone
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          Bepaal welk gebied je dagelijks wil opvolgen. Gebruik postcodes voor precieze
          afbakening, of gemeenten als je iets bredere coverage wil.
        </p>
      </section>

      <section className="p-4 md:p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <RegionForm
          initial={{
            label: '',
            postcodes: [],
            cities: [],
            listingType: 'verkoop',
            minPrice: null,
            maxPrice: null,
            propertyTypes: [],
            enabled: true,
          }}
        />
      </section>
    </div>
  )
}
