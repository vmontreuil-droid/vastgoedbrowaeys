import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Home } from 'lucide-react'
import { getDbListing } from '@/lib/listings-db'
import { findMatchingZoekfiches } from '@/lib/matching'
import { formatPrice } from '@/lib/listings'
import { ListingForm } from '../listing-form'
import { MatchesPanel } from './matches-panel'

export const metadata = {
  title: 'Admin · Pand bewerken',
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await getDbListing(id)
  if (!listing) notFound()

  const matches = await findMatchingZoekfiches(listing)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vastgoedbrowaeys.vercel.app'
  const publicHref = `${siteUrl}/aanbod/${listing.id}`

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/aanbod"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar aanbod
      </Link>

      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Aanbod</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Home className="size-7" style={{ color: 'var(--color-accent)' }} />
            Pand bewerken
          </h1>
          <p className="text-sm text-[var(--color-mute)] mt-2">{listing.title}</p>
        </div>
        {listing.is_published && (
          <Link
            href={`/aanbod/${listing.id}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            style={{ border: '1px solid var(--color-line)' }}
          >
            <ExternalLink className="size-3.5" />
            Bekijk publiek
          </Link>
        )}
      </section>

      <div className="mb-8">
        <MatchesPanel
          matches={matches}
          listingTitle={listing.title}
          listingCity={listing.city}
          listingZip={listing.zip}
          listingPriceLabel={listing.price_label || formatPrice(listing.price)}
          listingHref={publicHref}
        />
      </div>

      <ListingForm mode="edit" listing={listing} />
    </div>
  )
}
