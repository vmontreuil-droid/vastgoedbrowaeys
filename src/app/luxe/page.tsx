import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroSlider, type HeroSlide } from '@/components/hero-slider'
import { ListingCard } from '@/components/listing-card'
import { getListings, formatPrice, listingHref } from '@/lib/listings'

export const metadata = {
  title: 'Luxe-preview',
  description: 'Alternatief thema — zwart + goud, modern luxe.',
}

// === LUXE-PREVIEW HOMEPAGE ===
// Inhoud is identiek aan / (homepage); enkel de theme-class op <html> wisselt,
// gestuurd door ThemeApplier op basis van pathname.

export default function LuxePreviewPage() {
  const newest = getListings({ status: ['te-koop'], sortBy: 'newest', limit: 3 })
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
        {/* === Preview-banner zodat het duidelijk is dat dit een variant is === */}
        <div
          className="text-center py-2 text-xs uppercase tracking-[0.22em]"
          style={{
            background: 'var(--color-accent)',
            color: '#0a0a0a',
          }}
        >
          Luxe-preview — <Link href="/" className="underline ml-1">terug naar standaard</Link>
        </div>

        <HeroSlider slides={heroSlides} />

        <section className="container-px mx-auto max-w-screen-2xl py-20 md:py-28">
          <p className="eyebrow mb-6">Vastgoed Browaeys · sinds 2008</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Bemiddelen in vastgoed,
            <br />
            <span
              className="italic inline-block"
              style={{
                color: 'var(--color-accent)',
                transform: 'rotate(-1.5deg)',
              }}
            >
              vanuit het hart.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg" style={{ color: 'var(--color-mute)' }}>
            Persoonlijke begeleiding bij verkoop, verhuur en projectontwikkeling in de
            Vlaamse Ardennen. Doe altijd meer dan je belooft — dat is geen slogan, dat is
            hoe we werken.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/te-koop" className="btn btn-solid">
              Bekijk het volledige aanbod
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/gratis-schatting" className="btn btn-outline">
              Gratis schatting
            </Link>
          </div>
        </section>

        {/* === UITGELICHT AANBOD === */}
        <section className="container-px mx-auto max-w-screen-2xl py-20 md:py-28">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Uitgelicht aanbod</p>
              <h2 className="text-3xl md:text-4xl">Recente panden te koop</h2>
            </div>
            <Link href="/te-koop" className="link-underline hidden md:inline-block text-sm">
              Volledig aanbod →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featured.slice(0, 3).map((listing, i) => {
              const yOffset = i === 1 ? 'lg:-translate-y-8' : i === 2 ? 'lg:translate-y-4' : ''
              return <ListingCard key={listing.id} listing={listing} className={yOffset} />
            })}
          </div>
        </section>

        {/* === FILOSOFIE — zwart op zwart-2 (sub-vlak), goud accent === */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink)' }}
        >
          <span
            aria-hidden
            className="absolute select-none pointer-events-none leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(280px, 38vw, 540px)',
              color: 'var(--color-accent)',
              opacity: 0.12,
              top: '-0.18em',
              right: '-0.05em',
            }}
          >
            “
          </span>

          <div className="relative container-px mx-auto max-w-screen-2xl py-24 md:py-32 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-3" style={{ color: 'var(--color-accent)' }}>Over Vastgoed Browaeys</p>
              <h2 className="text-3xl md:text-5xl">
                Klein van schaal,
                <br />
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  groot in toewijding.
                </span>
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-7">
              <div className="space-y-5 text-lg leading-relaxed" style={{ color: 'var(--color-mute)' }}>
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
                  style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                >
                  Maak kennis →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === SCHATTING CTA === */}
        <section
          style={{ background: 'var(--color-paper)', borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}
        >
          <div className="relative container-px mx-auto max-w-screen-2xl py-24 md:py-28 text-center">
            <p className="eyebrow mb-4" style={{ color: 'var(--color-accent)' }}>Vrijblijvend</p>
            <h2 className="text-3xl md:text-5xl max-w-3xl mx-auto">
              Wilt u weten wat uw woning vandaag waard is?
            </h2>
            <p className="mt-6 text-lg max-w-xl mx-auto" style={{ color: 'var(--color-mute)' }}>
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
