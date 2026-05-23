import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Shield, Award, Heart, Sparkles, Quote } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingCard } from '@/components/listing-card'
import { getListings, formatPrice } from '@/lib/listings'

export const metadata = {
  title: 'Fulham-preview',
  description: 'Alternatief homepage-design geïnspireerd op qode/Fulham — licht, luxe, contemporary.',
}

const TESTIMONIALS = [
  {
    quote: 'Stefanie begeleidde de verkoop van onze ouderlijke woning met een rust en deskundigheid waar wij heel veel aan gehad hebben. Geen druk, wel resultaat.',
    name: 'Familie Van Daele',
    location: 'Horebeke',
  },
  {
    quote: 'Wij zochten een woning in de streek en kregen een persoonlijke selectie van vier panden, perfect op onze criteria afgestemd. Binnen drie weken hadden we onze keuze.',
    name: 'Bart & Liesbeth',
    location: 'Kluisbergen',
  },
  {
    quote: 'Voor de schatting van het huis na het overlijden van mijn moeder, kwam Stefanie discreet en goed voorbereid. Een mens die luistert.',
    name: 'Mevr. Decoster',
    location: 'Zwalm',
  },
]

export default function FulhamPreviewPage() {
  const heroListing = getListings({ status: ['te-koop'], sortBy: 'newest', limit: 1 })[0]
  const featured = getListings({ status: ['te-koop'], sortBy: 'newest', limit: 4 })

  return (
    <>
      <SiteHeader />

      <main>
        {/* === Preview-banner === */}
        <div
          className="text-center py-2 text-xs uppercase tracking-[0.22em]"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          Fulham-preview — <Link href="/" className="underline ml-1">terug naar standaard</Link>
        </div>

        {/* === HERO — full-bleed foto met centered tagline === */}
        <section className="relative w-full h-[90vh] min-h-[640px] overflow-hidden">
          {heroListing && (
            <Image
              src={heroListing.image}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          {/* Dark warm gradient onderaan voor leesbaarheid */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26,26,26,0.20) 0%, rgba(26,26,26,0.10) 35%, rgba(26,26,26,0.55) 100%)',
            }}
          />

          {/* Eyebrow + groot statement centred */}
          <div className="relative h-full container-px mx-auto max-w-screen-2xl flex flex-col items-center justify-center text-center">
            <p
              className="text-[0.7rem] uppercase tracking-[0.32em] mb-6"
              style={{ color: 'rgba(250, 248, 244, 0.9)' }}
            >
              Sinds 2008 · Vlaamse Ardennen
            </p>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl"
              style={{ color: 'var(--color-paper)', fontWeight: 300, letterSpacing: '-0.015em' }}
            >
              Bemiddelen in vastgoed,
              <br />
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                vanuit het hart.
              </span>
            </h1>
            <p
              className="mt-8 max-w-xl text-lg"
              style={{ color: 'rgba(250, 248, 244, 0.88)' }}
            >
              Persoonlijke begeleiding bij verkoop, verhuur en projectontwikkeling.
              Doe altijd meer dan je belooft.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/te-koop"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
              >
                Bekijk het aanbod
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/gratis-schatting"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid rgba(250,248,244,0.5)',
                  color: 'var(--color-paper)',
                }}
              >
                Gratis schatting
              </Link>
            </div>
          </div>
        </section>

        {/* === USP-ROW met iconen === */}
        <section className="container-px mx-auto max-w-screen-2xl py-20 md:py-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {[
              { icon: Heart,    title: 'Vanuit het hart',     body: 'Een dossier is geen nummer. Elke verkoop krijgt de tijd, aandacht en discretie die het verdient.' },
              { icon: Shield,   title: 'BIV-erkend',           body: 'Stefanie Browaeys, BIV 504.553. Onafhankelijke, gecertificeerde vastgoedmakelaar.' },
              { icon: Award,    title: 'Sinds 2008',           body: 'Bijna twee decennia ervaring met de lokale markt en haar fijne kneepjes.' },
              { icon: Sparkles, title: 'Vlaamse Ardennen',     body: 'Diepgewortelde kennis van de streek, haar dorpen en haar mensen.' },
            ].map((u, i) => {
              const Icon = u.icon
              return (
                <div key={i} className="text-center">
                  <span
                    className="inline-grid place-items-center size-14 mb-6 rounded-full"
                    style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {u.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mute)' }}>
                    {u.body}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* === "IN CIJFERS" sectie === */}
        <section style={{ background: 'var(--color-paper-2)' }}>
          <div className="container-px mx-auto max-w-screen-2xl py-20 md:py-28">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 text-center">
              {[
                { value: '17',  label: 'Jaar ervaring' },
                { value: '300+', label: 'Bemiddelde dossiers' },
                { value: '8',   label: 'Gemeenten actief' },
                { value: '100%', label: 'Persoonlijke opvolging' },
              ].map((s, i) => (
                <div key={i}>
                  <p
                    className="text-5xl md:text-6xl italic"
                    style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-3 eyebrow">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === RECENT AANBOD === */}
        <section className="container-px mx-auto max-w-screen-2xl py-24 md:py-32">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">Aanbod</p>
            <h2 className="text-4xl md:text-6xl">
              Recente{' '}
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                eigendommen
              </span>
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-lg" style={{ color: 'var(--color-mute)' }}>
              Een selectie uit ons actuele aanbod in de Vlaamse Ardennen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {featured.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 2} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/te-koop"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--color-ink)', color: 'var(--color-ink)' }}
            >
              Volledig aanbod
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* === TESTIMONIALS === */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'var(--color-sand)' }}
        >
          <span
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(280px, 32vw, 480px)',
              color: 'var(--color-accent)',
              opacity: 0.10,
              top: '-0.15em',
              left: '0.04em',
              lineHeight: 1,
            }}
          >
            “
          </span>

          <div className="relative container-px mx-auto max-w-screen-2xl py-24 md:py-32">
            <div className="text-center mb-16">
              <p className="eyebrow mb-3" style={{ color: 'var(--color-clay-dark)' }}>Klanten aan het woord</p>
              <h2 className="text-4xl md:text-5xl">Wat onze klanten zeggen</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <article
                  key={i}
                  className="p-8 md:p-10"
                  style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                >
                  <Quote
                    className="size-7 mb-6"
                    style={{ color: 'var(--color-accent)' }}
                  />
                  <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
                    {t.quote}
                  </p>
                  <div className="pt-6 border-t" style={{ borderColor: 'var(--color-line)' }}>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--color-mute)' }}>
                      <MapPin className="size-3" />
                      {t.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === FILOSOFIE-band === */}
        <section className="container-px mx-auto max-w-screen-2xl py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="md:col-span-5">
              <p className="eyebrow mb-3" style={{ color: 'var(--color-clay-dark)' }}>Over Vastgoed Browaeys</p>
              <h2 className="text-4xl md:text-5xl">
                Klein van schaal,
                <br />
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  groot in toewijding.
                </span>
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-lg leading-relaxed" style={{ color: 'var(--color-mute)' }}>
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
              <div className="pt-4">
                <Link href="/ons-team" className="link-underline text-sm">
                  Maak kennis met Stefanie →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === SCHATTING CTA — donker, premium === */}
        <section style={{ background: 'var(--color-ink)' }}>
          <div className="container-px mx-auto max-w-screen-2xl py-24 md:py-32 text-center">
            <p className="eyebrow mb-4" style={{ color: 'var(--color-accent)' }}>Vrijblijvend</p>
            <h2
              className="text-4xl md:text-6xl max-w-3xl mx-auto"
              style={{ color: 'var(--color-paper)', fontWeight: 300 }}
            >
              Wat is uw eigendom{' '}
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                vandaag waard?
              </span>
            </h2>
            <p className="mt-6 text-lg max-w-xl mx-auto" style={{ color: 'rgba(250,248,244,0.7)' }}>
              Een schatting bij Vastgoed Browaeys is gratis, vrijblijvend en gebaseerd op
              actuele lokale marktcijfers.
            </p>
            <div className="mt-10">
              <Link
                href="/gratis-schatting"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium transition-colors"
                style={{ background: 'var(--color-accent)', color: 'var(--color-ink)' }}
              >
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
