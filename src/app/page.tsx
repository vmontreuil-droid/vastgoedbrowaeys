import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const featuredListings = [
  {
    id: '4340985',
    href: '/aanbod/4340985',
    type: 'Woning',
    city: 'Horebeke',
    zip: '9667',
    title: 'Karaktervolle woning in landelijk Horebeke',
    price: '€ 395.000',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1400&q=80',
  },
  {
    id: '4365674',
    href: '/aanbod/4365674',
    type: 'Woning',
    city: 'Kluisbergen',
    zip: '9690',
    title: 'Stijlvolle gezinswoning met zicht op de Vlaamse Ardennen',
    price: '€ 449.000',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80',
  },
  {
    id: '4332707',
    href: '/aanbod/4332707',
    type: 'Appartement',
    city: 'Zottegem',
    zip: '9620',
    title: 'Modern appartement in centrum Zottegem',
    price: '€ 245.000',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=80',
  },
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* === HERO === */}
        <section className="relative">
          <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=2200&q=85"
              alt="Landelijk vastgoed in de Vlaamse Ardennen"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30" />
          </div>

          {/* Tekst onder de foto, niet eroverheen — rustiger */}
          <div className="container-px mx-auto max-w-6xl py-16 md:py-20">
            <p className="eyebrow mb-6">Vastgoed Browaeys · sinds 2008</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
              Bemiddelen in vastgoed,
              <br />
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                vanuit het hart.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-[var(--color-mute)]">
              Persoonlijke begeleiding bij verkoop, verhuur en projectontwikkeling in de
              Vlaamse Ardennen. Doe altijd meer dan je belooft — dat is geen slogan, dat is
              hoe we werken.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/te-koop" className="btn btn-solid">
                Bekijk het aanbod
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/gratis-schatting" className="btn btn-outline">
                Gratis schatting
              </Link>
            </div>
          </div>
        </section>

        {/* === UITGELICHT AANBOD === */}
        <section className="container-px mx-auto max-w-6xl py-20 md:py-28 border-t border-[var(--color-line)]">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Uitgelicht aanbod</p>
              <h2 className="text-3xl md:text-4xl">Panden te koop</h2>
            </div>
            <Link href="/te-koop" className="link-underline hidden md:inline-block text-sm">
              Volledig aanbod →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featuredListings.map((listing) => (
              <Link key={listing.id} href={listing.href} className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-paper-2)]">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-5">
                  <p className="eyebrow flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    {listing.zip} {listing.city}
                  </p>
                  <h3 className="mt-2 text-xl md:text-2xl leading-tight">{listing.title}</h3>
                  <p className="mt-3 text-sm text-[var(--color-mute)]">
                    {listing.type} · <span className="text-[var(--color-ink)]">{listing.price}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14 md:hidden">
            <Link href="/te-koop" className="link-underline text-sm">
              Volledig aanbod →
            </Link>
          </div>
        </section>

        {/* === FILOSOFIE / OVER === */}
        <section className="bg-[var(--color-paper-2)]">
          <div className="container-px mx-auto max-w-6xl py-24 md:py-32 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-3">Over Vastgoed Browaeys</p>
              <h2 className="text-3xl md:text-5xl">
                Klein van schaal,
                <br />
                <span className="italic">groot in toewijding.</span>
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-7">
              <div className="space-y-5 text-[var(--color-mute)] text-lg leading-relaxed">
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
                <Link href="/ons-team" className="link-underline text-sm">
                  Maak kennis →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === DIENSTEN — drie kolommen rustig === */}
        <section className="container-px mx-auto max-w-6xl py-24 md:py-32">
          <p className="eyebrow mb-3">Wat we doen</p>
          <h2 className="text-3xl md:text-5xl mb-16 max-w-3xl">
            Drie manieren waarop we u verder helpen.
          </h2>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-12">
            {[
              {
                title: 'Verkoop',
                href: '/diensten/verkoop',
                body: 'Van schatting tot ondertekening — wij zorgen voor een doordachte prijszetting, sterke foto-presentatie en een vlotte opvolging.',
              },
              {
                title: 'Verhuur',
                href: '/diensten/verhuur',
                body: 'Verhuurbemiddeling met oog voor zowel eigenaar als huurder — kandidaten worden zorgvuldig gescreend, contracten zijn waterdicht.',
              },
              {
                title: 'Projectontwikkeling',
                href: '/diensten/projectontwikkeling',
                body: 'Nieuwbouwprojecten en herontwikkelingen — wij begeleiden van conceptfase tot vermarkting van de individuele units.',
              },
            ].map((s) => (
              <Link key={s.title} href={s.href} className="group block">
                <div className="h-px w-12 bg-[var(--color-accent)] mb-6 transition-all duration-300 group-hover:w-20" />
                <h3 className="text-2xl md:text-3xl mb-4">{s.title}</h3>
                <p className="text-[var(--color-mute)] leading-relaxed">{s.body}</p>
                <p className="mt-6 text-sm link-underline">Meer info →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* === SCHATTING CTA — rustige sectie, geen schreeuwerige banner === */}
        <section className="border-t border-[var(--color-line)]">
          <div className="container-px mx-auto max-w-6xl py-24 md:py-28 text-center">
            <p className="eyebrow mb-4">Vrijblijvend</p>
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
