import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin, Phone, BedDouble, Bath, Square, Leaf } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingCard } from '@/components/listing-card'
import {
  LISTINGS,
  TYPE_BADGE,
  FIELD_CATEGORY_LABEL,
  formatPrice,
  getListings,
  groupFields,
  findField,
  findFieldNumber,
  type FieldCategory,
} from '@/lib/listings'
import { PropertyGallery } from './property-gallery'

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
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  }
}

// Categorieën in display-volgorde
const CATEGORY_ORDER: FieldCategory[] = [
  'financieel',
  'oppervlakte',
  'indeling',
  'energie',
  'epc',
  'voorzieningen',
  'bouwtechnisch',
  'omgeving',
  'overig',
]

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const listing = findListing(id)
  if (!listing) notFound()

  const badge = TYPE_BADGE[listing.type]
  const gallery = listing.gallery.length > 0
    ? [listing.image, ...listing.gallery]
    : [listing.image]

  const grouped = groupFields(listing.fields)

  // Belangrijke snel-feiten voor de header
  const bedrooms = findFieldNumber(listing, /^slaapkamers?$/i) ?? findFieldNumber(listing, /slaapkamer/i)
  const bathrooms = findFieldNumber(listing, /^badkamers?$/i)
  const surface = findField(listing, /^bewoonbaar(e)? opp/i) ?? findField(listing, /opp\.?\s*woning/i) ?? findField(listing, /totale opp/i)
  const bouwjaar = findField(listing, /^bouwjaar$/i)
  const epcValue = findField(listing, /^epc kwh/i) ?? findField(listing, /^epc$/i)

  const similar = getListings({ status: ['te-koop'] })
    .filter((l) => l.id !== listing.id && l.type === listing.type)
    .slice(0, 3)

  return (
    <>
      <SiteHeader />

      <main>
        <div className="container-px mx-auto max-w-screen-2xl pt-8">
          <Link
            href="/te-koop"
            className="inline-flex items-center gap-2 text-sm link-underline text-[var(--color-mute)]"
          >
            <ArrowLeft className="size-4" />
            Terug naar het aanbod
          </Link>
        </div>

        {/* === Foto-gallery met Celine-stijl glass-overlay-card (edge-to-edge) === */}
        <section className="w-full pt-6">
          <PropertyGallery
            images={gallery}
            alt={listing.title}
            overlayCard={
              <div
                className="p-6 md:p-7"
                style={{
                  background: 'color-mix(in srgb, #faf8f4 82%, transparent)',
                  backdropFilter: 'blur(8px) saturate(130%)',
                  WebkitBackdropFilter: 'blur(8px) saturate(130%)',
                  border: '1px solid color-mix(in srgb, #ffffff 35%, transparent)',
                  boxShadow: '0 16px 36px -16px rgba(0,0,0,0.30)',
                }}
              >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span
                    className="inline-block px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] font-medium"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                  <span
                    className="text-[0.6rem] uppercase tracking-[0.16em] font-medium flex items-center gap-1"
                    style={{ color: 'var(--color-clay-dark)' }}
                  >
                    <MapPin className="size-3" />
                    {listing.zip} {listing.city}
                  </span>
                  {listing.status === 'optie' && (
                    <span
                      className="text-[0.6rem] uppercase tracking-[0.16em] font-medium"
                      style={{ color: 'var(--color-clay-dark)' }}
                    >
                      · onder optie
                    </span>
                  )}
                </div>
                <h1
                  className="text-2xl md:text-3xl leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {listing.title}
                </h1>
                <p
                  className="mt-3 text-2xl md:text-3xl italic"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
                >
                  {formatPrice(listing.price)}
                </p>

                {/* Compact kenmerken-rij */}
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: 'var(--color-mute)' }}>
                  {bedrooms != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="size-3.5" />{bedrooms} slpk
                    </span>
                  )}
                  {bathrooms != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="size-3.5" />{bathrooms} badk
                    </span>
                  )}
                  {surface && (
                    <span className="inline-flex items-center gap-1.5">
                      <Square className="size-3.5" />{surface}
                    </span>
                  )}
                  {epcValue && (
                    <span className="inline-flex items-center gap-1.5">
                      <Leaf className="size-3.5" />EPC {epcValue}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/contact?ref=${listing.ref || listing.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-colors"
                    style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                  >
                    Vraag info aan
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <a
                    href="tel:+3255595010"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-colors"
                    style={{ border: '1px solid var(--color-ink)', color: 'var(--color-ink)' }}
                  >
                    <Phone className="size-3.5" />
                    Bel direct
                  </a>
                </div>
              </div>
            }
          />
        </section>

        {/* === Header + sidebar === */}
        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-16 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            {listing.ref && (
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Referentie: {listing.ref}
              </p>
            )}

            {/* Beschrijving */}
            <div>
              <h2 className="text-2xl md:text-3xl mb-5">Beschrijving</h2>
              <p className="text-[var(--color-mute)] leading-relaxed text-lg whitespace-pre-line">
                {listing.description || 'Volledige beschrijving op aanvraag.'}
              </p>
            </div>

            {/* === Alle kenmerken — gegroepeerd === */}
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl mb-6">Alle kenmerken</h2>
              <div className="space-y-8">
                {CATEGORY_ORDER.map((cat) => {
                  const fields = grouped[cat]
                  if (!fields || fields.length === 0) return null
                  return (
                    <section key={cat}>
                      <h3
                        className="eyebrow mb-3"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        {FIELD_CATEGORY_LABEL[cat]}
                      </h3>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                        {fields.map((f, i) => (
                          <div
                            key={`${f.label}-${i}`}
                            className="flex justify-between gap-4 py-2 border-b"
                            style={{ borderColor: 'var(--color-line)' }}
                          >
                            <dt className="text-[var(--color-mute)]">{f.label}</dt>
                            <dd className="text-[var(--color-ink)] text-right">{f.value || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar — contact-blok */}
          <aside className="lg:col-span-5">
            <div
              className="sticky top-32 p-8 md:p-10"
              style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
            >
              <p className="eyebrow mb-4" style={{ color: 'var(--color-clay)' }}>
                Interesse?
              </p>
              <h3 className="text-2xl md:text-3xl mb-6" style={{ color: 'var(--color-paper)' }}>
                Plan een bezoek of vraag meer info.
              </h3>
              <p className="mb-8 leading-relaxed" style={{ color: 'rgba(250, 248, 244, 0.85)' }}>
                Stefanie staat persoonlijk klaar om uw vragen te beantwoorden — vrijblijvend en zonder tussenpersonen.
              </p>

              <div className="space-y-3 text-sm">
                <a href="tel:+3255595010" className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(196, 163, 128, 0.4)' }}>
                  <span style={{ color: 'var(--color-clay)' }}>Bel direct</span>
                  <span>+32 (0)55 59 50 10</span>
                </a>
                <a href={`mailto:info@vastgoedbrowaeys.be?subject=Info over pand ${listing.ref || listing.id}`} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(196, 163, 128, 0.4)' }}>
                  <span style={{ color: 'var(--color-clay)' }}>E-mail</span>
                  <span>info@vastgoedbrowaeys.be</span>
                </a>
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(196, 163, 128, 0.4)' }}>
                  <span style={{ color: 'var(--color-clay)' }}>Referentie</span>
                  <span>{listing.ref || `VB-${listing.id}`}</span>
                </div>
              </div>

              <Link
                href={`/contact?ref=${listing.ref || listing.id}`}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
              >
                Vraag info aan
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </section>

        {/* === Vergelijkbare panden === */}
        {similar.length > 0 && (
          <section className="container-px mx-auto max-w-screen-2xl py-20 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <p className="eyebrow mb-3">Mogelijks ook interessant</p>
            <h2 className="text-2xl md:text-3xl mb-12">
              Andere {badge.label.toLowerCase()}en in het aanbod
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {similar.map((l) => (
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

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-[0.6rem]">{label}</p>
      <p className="mt-1.5 text-base">{value}</p>
    </div>
  )
}
