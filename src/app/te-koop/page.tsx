import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { TeKoopGrid } from './te-koop-grid'
import { getListings, uniqueCities } from '@/lib/listings'

export const metadata = {
  title: 'Te koop',
  description:
    'Het volledige aanbod panden te koop bij Vastgoed Browaeys — woningen, appartementen, bouwgronden en handelspanden in de Vlaamse Ardennen.',
}

export default function TeKoopPage() {
  const listings = getListings({ status: ['te-koop', 'optie'] })
  const cities = uniqueCities(listings)

  return (
    <>
      <SiteHeader />

      <main>
        {/* === Page header === */}
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Aanbod</p>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Panden{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              te koop.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            {listings.length} panden in de Vlaamse Ardennen — gerangschikt op meest recente.
            Vind iets passend? Een vrijblijvend bezoek is een telefoontje weg.
          </p>
        </section>

        {/* === Filter + grid (client) === */}
        <TeKoopGrid listings={listings} cities={cities} />
      </main>

      <SiteFooter />
    </>
  )
}
