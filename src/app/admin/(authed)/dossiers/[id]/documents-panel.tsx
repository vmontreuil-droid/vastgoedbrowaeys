'use client'

import { useRef, useState, useTransition } from 'react'
import {
  Upload, FileText, Download, Trash2, AlertCircle,
  Loader2, FileSpreadsheet, FileType, FileImage, Eye, EyeOff,
} from 'lucide-react'
import {
  uploadDocumentAction,
  deleteDocumentAction,
  getDocumentDownloadUrlAction,
  toggleDocumentShareAction,
  type DocCategory,
} from './document-actions'

export type DocumentRow = {
  id: string
  name: string
  category: DocCategory
  storagePath: string
  sizeBytes: number | null
  mimeType: string | null
  uploadedAt: string
  sharedWithClient: boolean
}

const CATEGORIES: { value: DocCategory; label: string }[] = [
  { value: 'compromis',         label: 'Compromis' },
  { value: 'schatting',         label: 'Schatting' },
  { value: 'epc',               label: 'EPC' },
  { value: 'asbest',            label: 'Asbest-attest' },
  { value: 'stedenbouw',        label: 'Stedenbouw' },
  { value: 'plaatsbeschrijving',label: 'Plaatsbeschrijving' },
  { value: 'huurcontract',      label: 'Huurcontract' },
  { value: 'foto',              label: "Foto's" },
  { value: 'overig',            label: 'Overig' },
]

const CATEGORY_COLOR: Record<DocCategory, string> = {
  compromis:         '#0b4f58',
  schatting:         '#c98c4f',
  epc:               '#5a7a48',
  asbest:            '#b91c1c',
  stedenbouw:        '#8c6b2e',
  plaatsbeschrijving:'#a25b3a',
  huurcontract:      '#0b4f58',
  foto:              '#737373',
  overig:            '#737373',
}

function iconForMime(mime: string | null) {
  if (!mime) return FileText
  if (mime.startsWith('image/')) return FileImage
  if (mime === 'application/pdf') return FileType
  if (mime.includes('sheet') || mime.includes('excel')) return FileSpreadsheet
  if (mime.includes('word') || mime.includes('document')) return FileText
  return FileText
}

function formatSize(bytes: number | null) {
  if (!bytes) return '?'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentsPanel({
  dossierId,
  initialDocuments,
}: {
  dossierId: string
  initialDocuments: DocumentRow[]
}) {
  const [docs, setDocs] = useState<DocumentRow[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>('overig')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    // Eén voor één uploaden (concurrent uploads zou Vercel-functie kunnen overbelasten)
    Promise.all(
      Array.from(files).map(async (file) => {
        const fd = new FormData()
        fd.set('file', file)
        fd.set('category', selectedCategory)
        const res = await uploadDocumentAction(dossierId, fd)
        if (res.ok) {
          setDocs((prev) => [
            {
              id: res.documentId,
              name: file.name,
              category: selectedCategory,
              storagePath: res.storagePath,
              sizeBytes: file.size,
              mimeType: file.type || null,
              uploadedAt: new Date().toISOString(),
              sharedWithClient: false,
            },
            ...prev,
          ])
        } else {
          setError(res.error)
        }
      }),
    ).finally(() => setUploading(false))
  }

  function toggleShare(doc: DocumentRow) {
    const next = !doc.sharedWithClient
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, sharedWithClient: next } : d))
    startTransition(async () => {
      const res = await toggleDocumentShareAction(doc.id, next)
      if (!res.ok) {
        setError(res.error ?? 'Delen toggelen mislukt')
        // Rollback optimistic update
        setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, sharedWithClient: !next } : d))
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteDocumentAction(id)
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id))
        setConfirmDelete(null)
      } else {
        setError(res.error ?? 'Verwijderen mislukt')
      }
    })
  }

  function handleOpen(id: string) {
    setOpeningId(id)
    startTransition(async () => {
      const res = await getDocumentDownloadUrlAction(id)
      setOpeningId(null)
      if (res.ok) {
        window.open(res.url, '_blank', 'noopener')
      } else {
        setError(res.error)
      }
    })
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault(); dragCounter.current++; setIsDragging(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault(); dragCounter.current--; if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0 }
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false); dragCounter.current = 0
    handleFiles(e.dataTransfer.files)
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <FileText className="size-5" style={{ color: 'var(--color-accent)' }} />
          Documenten ({docs.length})
        </h2>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload zone */}
      <div className="mb-4 space-y-3">
        <label className="block">
          <span className="eyebrow text-[0.55rem] mb-1.5 block">Categorie voor nieuwe upload</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DocCategory)}
            className="px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="cursor-pointer border-2 border-dashed transition-colors"
          style={{
            borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-line)',
            background: isDragging ? 'var(--color-paper-2)' : 'transparent',
          }}
        >
          <div className="px-6 py-8 text-center">
            {uploading ? (
              <Loader2 className="size-6 mx-auto mb-2 animate-spin" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <Upload className="size-6 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
            )}
            <p className="text-sm">
              <span className="font-medium">Klik om te uploaden</span> of sleep bestanden hierheen
            </p>
            <p className="text-xs text-[var(--color-mute)] mt-1">
              PDF, Word, Excel, JPG/PNG — max 25 MB per bestand
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Documenten-lijst */}
      {docs.length === 0 ? (
        <p className="p-6 text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen documenten opgeladen.
        </p>
      ) : (
        <div style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <ul className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
            {docs.map((doc) => {
              const Icon = iconForMime(doc.mimeType)
              const catLabel = CATEGORIES.find((c) => c.value === doc.category)?.label ?? doc.category
              return (
                <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                  <Icon className="size-5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpen(doc.id)}
                        disabled={openingId === doc.id}
                        className="text-sm truncate link-underline text-left disabled:opacity-50"
                      >
                        {openingId === doc.id ? 'Openen…' : doc.name}
                      </button>
                      <span
                        className="inline-block px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
                        style={{ background: CATEGORY_COLOR[doc.category], color: '#fff' }}
                      >
                        {catLabel}
                      </span>
                      {doc.sharedWithClient && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
                          style={{ background: 'rgba(34,197,94,0.18)', color: '#166534' }}>
                          <Eye className="size-2.5" />
                          Gedeeld
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">
                      {formatSize(doc.sizeBytes)} · {new Date(doc.uploadedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {confirmDelete === doc.id ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: '#b91c1c' }}>Zeker?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="px-2 py-1 text-white"
                        style={{ background: '#b91c1c' }}
                      >
                        Ja
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="link-underline"
                      >
                        Annuleer
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleShare(doc)}
                        title={doc.sharedWithClient ? 'Niet meer delen met klant' : 'Delen met klant'}
                        className="p-1.5"
                        style={{ color: doc.sharedWithClient ? 'var(--color-accent)' : 'var(--color-mute)' }}
                      >
                        {doc.sharedWithClient ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpen(doc.id)}
                        disabled={openingId === doc.id}
                        title="Download / open"
                        className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
                      >
                        <Download className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(doc.id)}
                        title="Verwijder"
                        className="p-1.5 text-[var(--color-mute)] hover:text-red-700"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
