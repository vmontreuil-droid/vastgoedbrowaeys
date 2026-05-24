import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Radar } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { RegionForm } from '../region-form'

export const metadata = {
  title: 'Admin · Zone bewerken',
}

export default async function EditRegionPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('market_search_regions')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  type Row = {
    id: string; label: string; postcodes: string[] | null; cities: string[] | null;
    listing_type: 'verkoop' | 'verhuur' | 'beide'; min_price: number | null;
    max_price: number | null; property_types: string[] | null; enabled: boolean;
  }
  const r = data as Row

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
          Zone bewerken
        </h1>
      </section>

      <section className="p-4 md:p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <RegionForm
          regionId={r.id}
          initial={{
            label: r.label,
            postcodes: r.postcodes ?? [],
            cities: r.cities ?? [],
            listingType: r.listing_type,
            minPrice: r.min_price,
            maxPrice: r.max_price,
            propertyTypes: r.property_types ?? [],
            enabled: r.enabled,
          }}
        />
      </section>
    </div>
  )
}
