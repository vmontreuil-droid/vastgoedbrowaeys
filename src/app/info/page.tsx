import Link from 'next/link'
import { ArrowRight, ShoppingCart, Home, KeyRound, Leaf, BookA, HelpCircle, ShieldCheck } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Info & wetgeving',
  description:
    'Alles wat u als koper, verkoper of huurder moet weten over vastgoed in Vlaanderen — EPC, attesten, kosten, fiscaliteit en juridische verplichtingen.',
}

const SECTIONS = [
  {
    href: '/info/kopen',
    icon: ShoppingCart,
    title: 'Een woning kopen',
    body: 'Van zoekfase tot ondertekening van de akte — alle stappen, verplichte attesten, registratierechten en notariskosten op een rij.',
  },
  {
    href: '/info/verkopen',
    icon: Home,
    title: 'Uw woning verkopen',
    body: 'Welke attesten moet u in orde brengen, wat zijn uw verplichtingen, en hoe verloopt de verkoop praktisch?',
  },
  {
    href: '/info/huren',
    icon: KeyRound,
    title: 'Huren & verhuren',
    body: 'Vlaams Woninghuurdecreet, huurwaarborg, opzegtermijnen, plaatsbeschrijving en de rechten van beide partijen.',
  },
  {
    href: '/info/epc',
    icon: Leaf,
    title: 'EPC uitgelegd',
    body: 'Energieprestatiecertificaat: wat het is, hoe het wordt berekend, wanneer u een nieuw nodig hebt, en de renovatieplicht sinds 2023.',
  },
  {
    href: '/info/woordenlijst',
    icon: BookA,
    title: 'Vastgoed-woordenlijst',
    body: 'A–Z van vastgoedtermen: compromis, KI, opschortende voorwaarde, voorkooprecht, V-G-Vv-Gmo-Gvkr en alle andere afkortingen ontrafeld.',
  },
  {
    href: '/info/faq',
    icon: HelpCircle,
    title: 'Veelgestelde vragen',
    body: 'De meest gestelde vragen die we de voorbije jaren beantwoord hebben — kort, helder en zonder vakjargon.',
  },
]

export default function InfoIndexPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-12 md:pb-16">
          <p className="eyebrow mb-4">Info & wetgeving</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Alles wat u moet{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              weten.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            Vastgoed in Vlaanderen kent veel regels, attesten en kosten. We zetten de
            belangrijkste informatie helder uiteen — zodat u uw beslissingen rustig en goed
            geïnformeerd kunt nemen.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)]">
            Heeft u een concrete vraag over uw dossier? Bel ons gerust op{' '}
            <a href="tel:+3255595010" className="link-underline text-[var(--color-ink)]">
              +32 (0)55 59 50 10
            </a>{' '}
            — meestal hebben we de zaak in vijf minuten verteld.
          </p>
        </section>

        {/* Grid van info-tegels */}
        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group block p-8 transition-all hover:shadow-md"
                  style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                >
                  <span
                    className="inline-grid place-items-center size-12 mb-6"
                    style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h2
                    className="text-2xl md:text-3xl mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {s.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-mute)' }}>
                    {s.body}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-sm transition-colors group-hover:gap-3"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Lees meer
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Disclaimer + CTA */}
        <section
          className="container-px mx-auto max-w-screen-2xl py-16 md:py-20 border-t mt-8"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <span
                className="inline-grid place-items-center size-10 mb-4"
                style={{ background: 'var(--color-sand)', color: 'var(--color-accent)' }}
              >
                <ShieldCheck className="size-5" />
              </span>
              <h2 className="text-2xl md:text-3xl">Wettelijk &amp; bij de tijd</h2>
            </div>
            <div className="md:col-span-7 text-[var(--color-mute)] leading-relaxed space-y-3">
              <p>
                Deze info is opgesteld op basis van de Vlaamse en Belgische wetgeving zoals die
                geldt op het moment van publicatie. Sommige regels (registratierechten, EPC-normen,
                renovatieplicht) wijzigen regelmatig. Bij twijfel of voor een dossier op maat,
                contacteer ons gerust.
              </p>
              <p>
                Stefanie Browaeys is BIV-erkend vastgoedmakelaar-bemiddelaar (504.553). Onze
                informatie is informatief van aard en vervangt geen juridisch advies.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
