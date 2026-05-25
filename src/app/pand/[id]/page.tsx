import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, ArrowRight, MapPin, Phone, Mail, BedDouble, Bath, Square,
  Leaf, Calendar, ExternalLink, User as UserIcon,
} from 'lucide-react'
import {
  LISTINGS,
  formatPrice,
  findField,
  findFieldNumber,
  TYPE_BADGE,
  listingHref,
} from '@/lib/listings'
import { headers } from 'next/headers'
import { BrandLogo } from '@/components/brand-logo'
import { PandGallery } from './pand-gallery'
import { PandLogin } from './pand-login'
import { PandQR } from './pand-qr'
import { PandDocuments } from './pand-documents'

export function generateStaticParams() {
  return LISTINGS.flatMap((l) => [
    { id: l.id },
    { id: `${l.id}-${l.slug.replace(/^\d+-/, '')}` },
  ])
}

type Params = Promise<{ id: string }>

function findListing(idOrSlug: string) {
  const numeric = idOrSlug.split('-')[0]
  return LISTINGS.find((l) => l.id === numeric)
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const listing = findListing(id)
  if (!listing) return {}
  const desc = listing.description.slice(0, 160)
  const ogImage = listing.image || listing.gallery[0]
  return {
    title: `${listing.title} — Vastgoed Browaeys`,
    description: desc,
    openGraph: {
      title: listing.title,
      description: desc,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: desc,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function PandMicrosite({ params }: { params: Params }) {
  const { id } = await params
  const listing = findListing(id)
  if (!listing) notFound()

  // Bereken absolute URL voor de QR-code
  const hdr = await headers()
  const host = hdr.get('host') ?? 'vastgoedbrowaeys.be'
  const proto = hdr.get('x-forwarded-proto') ?? 'https'
  const pandUrl = `${proto}://${host}/pand/${listing.id}-${listing.slug.replace(/^\d+-/, '')}`

  const badge = TYPE_BADGE[listing.type]
  const statusLabel = listing.status === 'te-koop' ? 'Te koop' :
    listing.status === 'te-huur' ? 'Te huur' :
    listing.status === 'optie' ? 'Onder optie' : 'Verkocht'

  // Snelle kerngegevens (uit fields-array)
  const slpk = findFieldNumber(listing, /slaapkamer/i)
  const badk = findFieldNumber(listing, /badkamer/i)
  const opp = findFieldNumber(listing, /bewoonb/i)
  const epc = findField(listing, /epc/i) || findField(listing, /energie/i)

  // Beschrijving in paragrafen
  const paragraphs = listing.description
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
      {/* === Minimale top-bar === */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'color-mix(in srgb, var(--color-paper) 92%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <div className="container-px mx-auto max-w-screen-2xl h-14 md:h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <BrandLogo height={28} textHeight={28} />
            <span className="hidden sm:inline text-xs uppercase tracking-[0.16em] text-[var(--color-mute)]">
              aangeboden door
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/te-koop"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs link-underline text-[var(--color-mute)]"
            >
              <ArrowLeft className="size-3" />
              Volledig aanbod
            </Link>
            <PandLogin listingId={listing.id} />
          </div>
        </div>
      </header>

      <main>
        {/* === HERO — full-bleed foto met overlay-info === */}
        <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/* Donker gradient onderaan voor leesbaarheid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }}
          />

          {/* Linksboven: type + status badges met glass-blur */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-wrap gap-2">
            <span
              className="inline-block px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] font-medium"
              style={{
                background: `color-mix(in srgb, ${badge.bg} 80%, transparent)`,
                color: badge.text,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {badge.label}
            </span>
            <span
              className="inline-block px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] font-medium"
              style={{
                background: 'color-mix(in srgb, #faf8f4 70%, transparent)',
                color: 'var(--color-ink)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {statusLabel}
            </span>
          </div>

          {/* Onderaan: titel + adres + prijs */}
          <div className="absolute bottom-0 inset-x-0 pb-10 md:pb-16">
            <div className="container-px mx-auto max-w-screen-2xl">
              <p
                className="eyebrow mb-2 md:mb-3 flex items-center gap-2"
                style={{ color: 'color-mix(in srgb, #faf8f4 85%, transparent)' }}
              >
                <MapPin className="size-3.5" />
                {listing.zip} {listing.city}
              </p>
              <h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl max-w-4xl"
                style={{
                  color: 'var(--color-paper)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {listing.title}
              </h1>
              <p
                className="mt-4 md:mt-6 text-2xl md:text-4xl italic"
                style={{
                  color: 'var(--color-paper)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {formatPrice(listing.price)}
                {listing.priceLabel && (
                  <span className="text-base md:text-xl ml-2 opacity-80">{listing.priceLabel}</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* === KERNGEGEVENS — strip onder hero === */}
        <section
          className="container-px mx-auto max-w-screen-2xl py-8 md:py-10"
          style={{ borderBottom: '1px solid var(--color-line)' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {slpk != null && (
              <KernStat icon={<BedDouble className="size-5" />} label="Slaapkamers" value={String(slpk)} />
            )}
            {badk != null && (
              <KernStat icon={<Bath className="size-5" />} label="Badkamers" value={String(badk)} />
            )}
            {opp != null && (
              <KernStat icon={<Square className="size-5" />} label="Bewoonbare opp." value={`${opp} m²`} />
            )}
            {epc && (
              <KernStat icon={<Leaf className="size-5" />} label="EPC" value={epc} />
            )}
          </div>
        </section>

        {/* === GALERIJ — masonry, alle foto's direct zichtbaar === */}
        {listing.gallery.length > 1 && (
          <section className="py-12 md:py-20">
            <div className="container-px mx-auto max-w-screen-2xl mb-6 md:mb-8">
              <p className="eyebrow mb-3">In beeld</p>
              <h2 className="text-3xl md:text-5xl">
                Alle{' '}
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  {listing.gallery.length} foto&apos;s.
                </span>
              </h2>
            </div>
            <PandGallery images={listing.gallery} alt={listing.title} />
          </section>
        )}

        {/* === BESCHRIJVING === */}
        {paragraphs.length > 0 && (
          <section className="container-px mx-auto max-w-3xl py-12 md:py-20">
            <p className="eyebrow mb-3">Beschrijving</p>
            <h2 className="text-3xl md:text-5xl mb-8 md:mb-12">
              Een verhaal{' '}
              <span className="italic" style={{ color: 'var(--color-accent)' }}>
                achter het pand.
              </span>
            </h2>
            <div className="prose-pand">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed mb-4 md:mb-6">
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* === KENMERKEN === */}
        {listing.fields.length > 0 && (
          <section
            className="py-12 md:py-20"
            style={{ background: 'var(--color-paper-2)' }}
          >
            <div className="container-px mx-auto max-w-screen-2xl">
              <p className="eyebrow mb-3">Specificaties</p>
              <h2 className="text-3xl md:text-5xl mb-8 md:mb-12">
                Kenmerken{' '}
                <span className="italic" style={{ color: 'var(--color-accent)' }}>
                  in detail.
                </span>
              </h2>
              <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                {listing.fields.slice(0, 24).map((f, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-4 py-1.5 border-b"
                    style={{ borderColor: 'var(--color-line)' }}>
                    <dt className="text-sm text-[var(--color-mute)]">{f.label}</dt>
                    <dd className="text-sm text-right">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* === DOCUMENTEN === */}
        <PandDocuments listingId={listing.id} />

        {/* === LOCATIE === */}
        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-20"
          style={{ borderTop: '1px solid var(--color-line)' }}>
          <p className="eyebrow mb-3">Locatie</p>
          <h2 className="text-3xl md:text-5xl mb-6 md:mb-8">
            {listing.zip}{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              {listing.city}.
            </span>
          </h2>
          <p className="text-lg text-[var(--color-mute)] max-w-2xl mb-6">
            {listing.street}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.street} ${listing.zip} ${listing.city}`)}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 link-underline text-sm"
          >
            <ExternalLink className="size-4" />
            Bekijk op Google Maps
          </a>
        </section>

        {/* === CONTACT-CTA + QR === */}
        <section
          className="py-16 md:py-24"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-paper)',
          }}
        >
          <div className="container-px mx-auto max-w-screen-2xl grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow mb-3" style={{ color: 'rgba(250,248,244,0.85)' }}>
                Geïnteresseerd?
              </p>
              <h2 className="text-3xl md:text-5xl mb-5">
                Plan een{' '}
                <span className="italic">vrijblijvend bezoek</span>.
              </h2>
              <p className="text-lg mb-10 max-w-xl" style={{ color: 'rgba(250,248,244,0.85)' }}>
                Persoonlijke begeleiding door Stefanie Browaeys — geen call-center, geen
                tussenpersonen.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/contact?ref=${listing.ref}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium"
                  style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
                >
                  <Calendar className="size-4" />
                  Bezoek plannen
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="tel:+3255595010"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm"
                  style={{
                    background: 'color-mix(in srgb, #faf8f4 15%, transparent)',
                    color: 'var(--color-paper)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Phone className="size-4" />
                  +32 (0)55 59 50 10
                </a>
                <a
                  href="mailto:info@vastgoedbrowaeys.be"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm"
                  style={{
                    background: 'color-mix(in srgb, #faf8f4 15%, transparent)',
                    color: 'var(--color-paper)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Mail className="size-4" />
                  Mail
                </a>
              </div>
            </div>

            {/* QR-code */}
            <div className="lg:justify-self-end">
              <PandQR url={pandUrl} />
            </div>
          </div>
        </section>

        {/* === Minimal footer === */}
        <footer
          className="container-px mx-auto max-w-screen-2xl py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-mute)]"
        >
          <span>
            Aangeboden door <Link href="/" className="link-underline text-[var(--color-ink)]">Vastgoed Browaeys</Link>{' '}
            · BIV 504.553 · {listing.ref}
          </span>
          <div className="flex gap-5">
            <Link href={listingHref(listing)} className="link-underline">Klassieke weergave</Link>
            <Link href="/privacy-verklaring" className="link-underline">Privacy</Link>
          </div>
        </footer>
      </main>
    </div>
  )
}

function KernStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[var(--color-mute)] mb-1">
        {icon}
        <span className="eyebrow text-[0.6rem]">{label}</span>
      </div>
      <p className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
    </div>
  )
}
