import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { ListingForm } from '../listing-form'

export const metadata = {
  title: 'Admin · Nieuw pand',
}

export default function NewListingPage() {
  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/aanbod"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar aanbod
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Aanbod</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3">
          <Home className="size-7" style={{ color: 'var(--color-accent)' }} />
          Nieuw pand
        </h1>
      </section>

      <ListingForm mode="create" />
    </div>
  )
}
