import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Home } from 'lucide-react'
import { getDbListing } from '@/lib/listings-db'
import { ListingForm } from '../listing-form'

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

      <ListingForm mode="edit" listing={listing} />
    </div>
  )
}
