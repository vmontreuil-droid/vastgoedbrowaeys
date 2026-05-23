import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import {
  TYPE_BADGE,
  formatPrice,
  listingHref,
  findField,
  findFieldNumber,
  type Listing,
} from '@/lib/listings'

type Props = {
  listing: Listing
  aspect?: '4/5' | '3/4' | '4/3' | '16/10'
  className?: string
  priority?: boolean
}

export function ListingCard({ listing, aspect = '4/5', className, priority = false }: Props) {
  const badge = TYPE_BADGE[listing.type]
  const href = listingHref(listing)
  const isReserved = listing.status === 'optie' || listing.status === 'verkocht'

  const bedrooms = findFieldNumber(listing, /^slaapkamers?$/i) ?? findFieldNumber(listing, /slaapkamer/i)
  const surface =
    findField(listing, /^bewoonbaar(e)? opp/i) ??
    findField(listing, /opp\.?\s*woning/i) ??
    findField(listing, /totale opp/i)
  const epc = findField(listing, /^epc$|^epc label$|^epc kwh/i) ?? findField(listing, /^epc\b/i)

  const facts = [
    bedrooms && `${bedrooms} slpk`,
    surface,
    epc && `EPC ${epc}`,
  ].filter(Boolean)

  return (
    <Link href={href} className={`group block ${className ?? ''}`}>
      <div
        className="relative w-full overflow-hidden bg-[var(--color-paper-2)]"
        style={{ aspectRatio: aspect.replace('/', ' / ') }}
      >
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${isReserved ? 'grayscale-[40%]' : ''}`}
          priority={priority}
        />
        <span
          className="absolute top-4 left-4 inline-block px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] font-medium"
          style={{ background: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>
        {isReserved && (
          <span
            className="absolute top-4 right-4 inline-block px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] font-medium"
            style={{
              background: 'color-mix(in srgb, #faf8f4 88%, transparent)',
              backdropFilter: 'blur(8px)',
              color: 'var(--color-ink)',
            }}
          >
            {listing.status === 'optie' ? 'Onder optie' : 'Verkocht'}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="eyebrow flex items-center gap-1.5">
          <MapPin className="size-3" />
          {listing.zip} {listing.city}
        </p>
        <h3 className="mt-2 text-xl md:text-2xl leading-tight transition-colors group-hover:text-[var(--color-accent)]">
          {listing.title}
        </h3>
        <p
          className="mt-3 text-xl italic"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
        >
          {listing.priceLabel?.replace(/^[A-Za-z\s]+(voor|te koop|te huur)\s+/, '') ?? formatPrice(listing.price)}
        </p>
        {facts.length > 0 && (
          <p className="mt-2 text-xs uppercase tracking-wider text-[var(--color-mute)]">
            {facts.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
