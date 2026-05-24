'use client'

import { useState, useTransition } from 'react'
import {
  FileText, Download, AlertCircle, FileSpreadsheet, FileType, FileImage, Loader2,
} from 'lucide-react'
import { getMyDocumentDownloadUrlAction } from './portal-document-actions'

export type PortalDoc = {
  id: string
  name: string
  category: string
  sizeBytes: number | null
  mimeType: string | null
  uploadedAt: string
}

const CATEGORY_LABEL: Record<string, string> = {
  compromis: 'Compromis',
  schatting: 'Schatting',
  epc: 'EPC',
  asbest: 'Asbest-attest',
  stedenbouw: 'Stedenbouw',
  plaatsbeschrijving: 'Plaatsbeschrijving',
  huurcontract: 'Huurcontract',
  foto: "Foto's",
  overig: 'Overig',
}

function iconForMime(mime: string | null) {
  if (!mime) return FileText
  if (mime.startsWith('image/')) return FileImage
  if (mime === 'application/pdf') return FileType
  if (mime.includes('sheet') || mime.includes('excel')) return FileSpreadsheet
  return FileText
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function PortalDocumentsList({ docs }: { docs: PortalDoc[] }) {
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function open(id: string) {
    setError(null)
    setOpeningId(id)
    startTransition(async () => {
      const res = await getMyDocumentDownloadUrlAction(id)
      setOpeningId(null)
      if (res.ok) window.open(res.url, '_blank', 'noopener')
      else setError(res.error)
    })
  }

  if (docs.length === 0) {
    return (
      <p className="p-6 text-sm text-[var(--color-mute)] italic"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        Er zijn nog geen documenten met u gedeeld. Zodra Stefanie iets klaarzet, verschijnt het hier.
      </p>
    )
  }

  return (
    <>
      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <ul className="divide-y" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderColor: 'var(--color-line)' }}>
        {docs.map((doc) => {
          const Icon = iconForMime(doc.mimeType)
          return (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <Icon className="size-5 shrink-0" style={{ color: 'var(--color-accent)' }} />
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => open(doc.id)}
                  disabled={openingId === doc.id}
                  className="text-sm truncate link-underline text-left disabled:opacity-50"
                >
                  {openingId === doc.id ? 'Openen…' : doc.name}
                </button>
                <p className="text-xs text-[var(--color-mute)] mt-0.5">
                  {CATEGORY_LABEL[doc.category] ?? doc.category}
                  {doc.sizeBytes && ` · ${formatSize(doc.sizeBytes)}`}
                  {' · '}
                  {new Date(doc.uploadedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => open(doc.id)}
                disabled={openingId === doc.id}
                title="Download"
                className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {openingId === doc.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
