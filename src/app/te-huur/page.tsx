import Link from 'next/link'
import { ArrowRight, BellRing } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingCard } from '@/components/listing-card'
import { getListings } from '@/lib/listings'

export const metadata = {
  title: 'Te huur',
  description: 'Huurpanden in beheer bij Vastgoed Browaeys — Vlaamse Ardennen.',
}

export default function TeHuurPage() {
  const listings = getListings({ status: ['te-huur'] })

  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Aanbod</p>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Panden{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              te huur.
            </span>
          </h1>
        </section>

        {listings.length === 0 ? (
          <section className="container-px mx-auto max-w-3xl py-16 md:py-24 text-center">
            <div
              className="inline-grid place-items-center size-20 mb-8 rounded-full"
              style={{ background: 'var(--color-sand)' }}
            >
              <BellRing className="size-8" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2 className="text-3xl md:text-4xl mb-4">Momenteel geen huur-aanbod beschikbaar</h2>
            <p className="text-lg text-[var(--color-mute)] mb-10">
              Ons huur-aanbod wisselt snel. Schrijf je in voor de wachtlijst en je krijgt een
              persoonlijke melding zodra er iets passend op de markt komt.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/hou-me-op-de-hoogte" className="btn btn-solid">
                Houd me op de hoogte
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contacteer ons direct
              </Link>
            </div>
          </section>
        ) : (
          <section className="container-px mx-auto max-w-screen-2xl py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
