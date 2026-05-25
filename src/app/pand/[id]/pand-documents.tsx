import Link from 'next/link'
import { FileText, Download, BadgeCheck, Map, Calculator, Leaf, Layers, Landmark } from 'lucide-react'
import {
  getPublicListingDocuments,
  LISTING_DOC_CATEGORY_LABEL,
  formatDocSize,
  type ListingDocumentCategory,
} from '@/lib/listing-documents'

function CategoryIcon({ category }: { category: ListingDocumentCategory }) {
  if (category === 'epc')              return <Leaf className="size-4" />
  if (category === 'plattegrond')      return <Map className="size-4" />
  if (category === 'technische_fiche') return <BadgeCheck className="size-4" />
  if (category === 'schatting')        return <Calculator className="size-4" />
  if (category === 'foto_brochure')    return <Layers className="size-4" />
  if (category === 'kadaster')         return <Landmark className="size-4" />
  if (category === 'stedenbouw')       return <Landmark className="size-4" />
  return <FileText className="size-4" />
}

export async function PandDocuments({ listingId }: { listingId: string }) {
  const docs = await getPublicListingDocuments(listingId)
  if (docs.length === 0) return null

  return (
    <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-20"
      style={{ borderTop: '1px solid var(--color-line)' }}>
      <p className="eyebrow mb-3">Documenten</p>
      <h2 className="text-3xl md:text-5xl mb-8 md:mb-12">
        Officiële{' '}
        <span className="italic" style={{ color: 'var(--color-accent)' }}>
          documenten.
        </span>
      </h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link
              href={doc.fileUrl}
              target="_blank"
              rel="noopener"
              className="block p-4 md:p-5 transition-shadow hover:shadow-sm h-full"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em]"
                  style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
                >
                  <CategoryIcon category={doc.category} />
                  {LISTING_DOC_CATEGORY_LABEL[doc.category]}
                </span>
                <Download className="size-4 shrink-0 text-[var(--color-mute)]" />
              </div>
              <p className="text-base mt-2" style={{ fontFamily: 'var(--font-display)' }}>
                {doc.name}
              </p>
              {doc.description && (
                <p className="mt-1 text-xs text-[var(--color-mute)]">{doc.description}</p>
              )}
              {doc.sizeBytes && (
                <p className="mt-2 text-[0.65rem] text-[var(--color-mute)] uppercase tracking-[0.1em]">
                  {formatDocSize(doc.sizeBytes)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
