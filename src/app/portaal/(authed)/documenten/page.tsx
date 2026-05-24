import Link from 'next/link'
import { FileText, Hash, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMySharedDocuments } from '@/lib/portal-db'
import { PortalDocumentsList, type PortalDoc } from '../dossiers/[id]/portal-documents-list'

export const metadata = {
  title: 'Mijn documenten',
}

const CATEGORY_LABEL: Record<string, string> = {
  compromis: 'Compromis',
  schatting: 'Schatting',
  epc: 'EPC',
  asbest: 'Asbest',
  stedenbouw: 'Stedenbouw',
  plaatsbeschrijving: 'Plaatsbeschrijving',
  huurcontract: 'Huurcontract',
  foto: 'Foto',
  overig: 'Overig',
}

export default async function MyDocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="container-px mx-auto max-w-screen-2xl py-10">
        <p>Niet ingelogd.</p>
      </div>
    )
  }

  const { items: documents } = await getMySharedDocuments(user.id)

  // Groepeer per dossier
  const byDossier = new Map<string, {
    dossierId: string
    dossierRef: string | null
    propertyAddress: string | null
    docs: PortalDoc[]
  }>()
  for (const d of documents) {
    const key = d.dossierId
    if (!byDossier.has(key)) {
      byDossier.set(key, {
        dossierId: d.dossierId,
        dossierRef: d.dossierRef,
        propertyAddress: d.propertyAddress,
        docs: [],
      })
    }
    byDossier.get(key)!.docs.push({
      id: d.id,
      name: d.name,
      category: d.category,
      sizeBytes: d.sizeBytes,
      mimeType: d.mimeType,
      uploadedAt: d.uploadedAt,
    })
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-14">
      <section className="mb-8 md:mb-10">
        <p className="eyebrow mb-2 md:mb-3">Klantenportaal</p>
        <h1 className="text-2xl sm:text-3xl md:text-5xl flex items-center gap-3">
          <FileText className="size-6 md:size-8 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Mijn documenten
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--color-mute)] max-w-2xl">
          Alle documenten die met u zijn gedeeld — gegroepeerd per dossier.
        </p>
      </section>

      {documents.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen documenten gedeeld.
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {Array.from(byDossier.values()).map((group) => (
            <section key={group.dossierId}>
              <Link
                href={`/portaal/dossiers/${group.dossierId}`}
                className="inline-flex items-center gap-2 text-sm md:text-base mb-3 group"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Hash className="size-3 md:size-4 text-[var(--color-mute)]" />
                <span>{group.propertyAddress || group.dossierRef || 'Zoekopdracht'}</span>
                <ExternalLink className="size-3 md:size-4 text-[var(--color-mute)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-xs text-[var(--color-mute)] mb-3">
                {group.docs.length} document{group.docs.length === 1 ? '' : 'en'}
              </p>
              <PortalDocumentsList docs={group.docs} />
            </section>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-[var(--color-mute)] italic">
        Categorieën: {Object.values(CATEGORY_LABEL).join(' · ')}
      </p>
    </div>
  )
}
