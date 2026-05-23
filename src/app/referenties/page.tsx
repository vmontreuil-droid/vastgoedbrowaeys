import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SOLD_LISTINGS, uniqueSoldCities } from '@/data/listings-sold'

export const metadata = {
  title: 'Realisaties',
  description:
    'Een overzicht van panden die wij de voorbije jaren mochten bemiddelen — woningen, villa\'s, appartementen, bouwgronden en handelspanden in de Vlaamse Ardennen.',
}

export default function RealisatiesPage() {
  const total = SOLD_LISTINGS.length
  const cities = uniqueSoldCities()

  return (
    <>
      <SiteHeader />

      <main>
        {/* === Header === */}
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Portfolio</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Realisaties &{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              referenties.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            Een terugblik op {total} panden die wij sinds 2008 in de Vlaamse Ardennen mochten
            bemiddelen — verkochten of verhuurden voor onze klanten.
          </p>

          {/* Mini-stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 py-8 border-y" style={{ borderColor: 'var(--color-line)' }}>
            <div>
              <p
                className="text-4xl md:text-5xl italic"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                {total}
              </p>
              <p className="mt-2 eyebrow">Bemiddelde panden</p>
            </div>
            <div>
              <p
                className="text-4xl md:text-5xl italic"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                {cities.length}
              </p>
              <p className="mt-2 eyebrow">Gemeenten</p>
            </div>
            <div>
              <p
                className="text-4xl md:text-5xl italic"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                17+
              </p>
              <p className="mt-2 eyebrow">Jaar ervaring</p>
            </div>
            <div>
              <p
                className="text-4xl md:text-5xl italic"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                100%
              </p>
              <p className="mt-2 eyebrow">Persoonlijk dossier</p>
            </div>
          </div>
        </section>

        {/* === Grid === */}
        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {SOLD_LISTINGS.map((l) => (
              <article
                key={l.index}
                className="group block"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-paper-2)]">
                  <Image
                    src={l.image}
                    alt={`${l.type} in ${l.city}`}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover grayscale-[35%] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
                  />
                  <span
                    className="absolute top-3 left-3 inline-block px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.16em] font-medium"
                    style={{
                      background: 'color-mix(in srgb, #faf8f4 88%, transparent)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--color-ink)',
                    }}
                  >
                    Verkocht
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                    {l.type}
                  </p>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-mute)' }}>
                    <MapPin className="size-3" />
                    {l.city || 'Vlaamse Ardennen'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* === CTA === */}
        <section className="container-px mx-auto max-w-screen-2xl py-24 md:py-28 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow mb-3">Wordt uw pand de volgende?</p>
            <h2 className="text-3xl md:text-5xl">
              Een nieuwe woning op{' '}
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                onze lijst
              </span>{' '}
              brengen?
            </h2>
            <p className="mt-6 text-lg text-[var(--color-mute)]">
              Vraag een vrijblijvende schatting aan en ontdek wat uw woning vandaag waard is.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/gratis-schatting" className="btn btn-solid">
                Gratis schatting
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Neem contact op
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
