import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroSlider, type HeroSlide } from '@/components/hero-slider'
import { ListingCard } from '@/components/listing-card'
import { getListings, formatPrice, listingHref } from '@/lib/listings'

export default function HomePage() {
  // 12 slides in de hero, 6 panden in het "uitgelicht aanbod"-blok eronder.
  const newest = getListings({ status: ['te-koop'], sortBy: 'newest', limit: 12 })
  const featured = getListings({ status: ['te-koop'], sortBy: 'newest', limit: 6 })

  const heroSlides: HeroSlide[] = newest.map((l) => ({
    id: l.id,
    href: listingHref(l),
    type: l.type,
    city: l.city,
    zip: l.zip,
    title: l.title,
    price: l.priceLabel ?? formatPrice(l.price),
    image: l.image,
  }))

  return (
    <>
      <SiteHeader />

      <main>
        {/* === HERO SLIDER === */}
        <HeroSlider slides={heroSlides} />

        {/* === IN DE KIJKER — uitgelicht aanbod === */}
        <section className="container-px mx-auto max-w-screen-2xl py-20 md:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Aanbod · Vlaamse Ardennen</p>
              <h2 className="text-4xl md:text-6xl max-w-3xl">
                In de{' '}
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  kijker.
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-lg text-[var(--color-mute)]">
                Een selectie uit het actuele aanbod — woningen, appartementen, bouwgronden
                en handelspanden in en rond de Vlaamse Ardennen.
              </p>
            </div>
            <Link href="/te-koop" className="link-underline hidden md:inline-flex items-center gap-2 text-sm">
              Bekijk het volledige aanbod
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featured.map((listing, i) => {
              // Staggered ritme over 2 rijen (eerste rij: i=0,1,2; tweede: 3,4,5)
              const yOffset =
                i === 1 || i === 4 ? 'lg:-translate-y-8' :
                i === 2 || i === 5 ? 'lg:translate-y-4' : ''
              return <ListingCard key={listing.id} listing={listing} className={yOffset} />
            })}
          </div>

          <div className="mt-14 md:hidden">
            <Link href="/te-koop" className="link-underline text-sm">
              Volledig aanbod →
            </Link>
          </div>
        </section>

        {/* === FILOSOFIE / OVER — omgekeerd, diep petrol, met deco-quote === */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          <span
            aria-hidden
            className="absolute select-none pointer-events-none leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(280px, 38vw, 540px)',
              color: 'var(--color-clay)',
              opacity: 0.18,
              top: '-0.18em',
              right: '-0.05em',
            }}
          >
            “
          </span>

          <div className="relative container-px mx-auto max-w-screen-2xl py-24 md:py-32 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-3" style={{ color: 'var(--color-clay)' }}>
                Over Vastgoed Browaeys
              </p>
              <h2 className="text-3xl md:text-5xl" style={{ color: 'var(--color-paper)' }}>
                Klein van schaal,
                <br />
                <span className="italic" style={{ color: 'var(--color-clay)' }}>
                  groot in toewijding.
                </span>
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-7">
              <div className="space-y-5 text-lg leading-relaxed" style={{ color: 'rgba(250, 248, 244, 0.85)' }}>
                <p>
                  Als kantoor in Horebeke kennen we het land, de dorpen en de mensen van de
                  Vlaamse Ardennen. Geen massa-aanpak, geen overhaaste deals — wel een
                  doordachte begeleiding van eerste schatting tot laatste handdruk.
                </p>
                <p>
                  Stefanie Browaeys is BIV-gecertificeerd makelaar-bemiddelaar (504.553) en
                  staat persoonlijk in voor elk dossier. Geen tussenpersonen, geen
                  call-centers — gewoon iemand die haar regio van binnen en buiten kent.
                </p>
              </div>
              <div className="mt-10">
                <Link
                  href="/ons-team"
                  className="inline-block text-sm border-b transition-colors"
                  style={{ borderColor: 'var(--color-clay)', color: 'var(--color-clay)' }}
                >
                  Maak kennis →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === DIENSTEN — met grote ornament-nummers === */}
        <section className="container-px mx-auto max-w-screen-2xl py-24 md:py-32">
          <p className="eyebrow mb-3">Wat we doen</p>
          <h2 className="text-3xl md:text-5xl mb-20 max-w-3xl">
            Drie manieren waarop we u verder helpen.
          </h2>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
            {[
              { n: '01', title: 'Verkoop',             href: '/diensten/verkoop',            body: 'Van schatting tot ondertekening — wij zorgen voor een doordachte prijszetting, sterke foto-presentatie en een vlotte opvolging.' },
              { n: '02', title: 'Verhuur',             href: '/diensten/verhuur',            body: 'Verhuurbemiddeling met oog voor zowel eigenaar als huurder — kandidaten worden zorgvuldig gescreend, contracten zijn waterdicht.' },
              { n: '03', title: 'Projectontwikkeling', href: '/diensten/projectontwikkeling', body: 'Nieuwbouwprojecten en herontwikkelingen — wij begeleiden van conceptfase tot vermarkting van de individuele units.' },
            ].map((s) => (
              <Link key={s.title} href={s.href} className="group block relative">
                <span
                  aria-hidden
                  className="block leading-none mb-6 transition-colors duration-300 group-hover:text-[var(--color-accent)]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 'clamp(72px, 8vw, 110px)',
                    color: 'var(--color-clay)',
                    opacity: 0.55,
                  }}
                >
                  {s.n}
                </span>
                <h3 className="text-2xl md:text-3xl mb-4">{s.title}</h3>
                <p className="text-[var(--color-mute)] leading-relaxed">{s.body}</p>
                <p className="mt-6 text-sm link-underline">Meer info →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* === SCHATTING CTA === */}
        <section className="relative overflow-hidden" style={{ background: 'var(--color-sand)' }}>
          <span aria-hidden className="absolute pointer-events-none" style={{ width: '420px', height: '420px', borderRadius: '50%', background: 'var(--color-clay)', opacity: 0.25, top: '-180px', left: '-140px', filter: 'blur(20px)' }} />
          <span aria-hidden className="absolute pointer-events-none" style={{ width: '320px', height: '320px', borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.12, bottom: '-140px', right: '-100px', filter: 'blur(24px)' }} />

          <div className="relative container-px mx-auto max-w-screen-2xl py-24 md:py-28 text-center">
            <p className="eyebrow mb-4" style={{ color: 'var(--color-clay-dark)' }}>Vrijblijvend</p>
            <h2 className="text-3xl md:text-5xl max-w-3xl mx-auto">
              Wilt u weten wat uw woning vandaag waard is?
            </h2>
            <p className="mt-6 text-lg text-[var(--color-mute)] max-w-xl mx-auto">
              Een schatting bij Vastgoed Browaeys is gratis, vrijblijvend en gebaseerd op
              actuele lokale marktcijfers.
            </p>
            <div className="mt-10">
              <Link href="/gratis-schatting" className="btn btn-solid">
                Vraag uw schatting aan
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
