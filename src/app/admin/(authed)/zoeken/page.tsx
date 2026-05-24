import Link from 'next/link'
import { Search, FileText, MessageSquare, Calculator, User, ArrowUpRight } from 'lucide-react'
import { searchAdminNotes, type AdminSearchHit } from '@/lib/admin-db'

export const metadata = {
  title: 'Admin · Zoeken',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const TYPE_LABEL: Record<AdminSearchHit['type'], string> = {
  dossier_notes: 'Dossier-notitie',
  dossier_event: 'Historiek',
  commission_notes: 'Commissie-notitie',
  client_notes: 'Klant-notitie',
}

const TYPE_COLOR: Record<AdminSearchHit['type'], string> = {
  dossier_notes: '#0b4f58',
  dossier_event: '#737373',
  commission_notes: '#c98c4f',
  client_notes: '#5a7a48',
}

function TypeIcon({ type }: { type: AdminSearchHit['type'] }) {
  if (type === 'dossier_notes' || type === 'dossier_event') return <FileText className="size-3" />
  if (type === 'commission_notes') return <Calculator className="size-3" />
  if (type === 'client_notes') return <User className="size-3" />
  return <MessageSquare className="size-3" />
}

function highlightMatch(text: string, q: string): React.ReactNode[] {
  if (!q) return [text]
  const parts: React.ReactNode[] = []
  const lower = text.toLowerCase()
  const qLower = q.toLowerCase()
  let lastEnd = 0
  let idx = lower.indexOf(qLower)
  let key = 0
  while (idx >= 0) {
    if (idx > lastEnd) parts.push(text.slice(lastEnd, idx))
    parts.push(
      <mark key={key++} style={{ background: 'rgba(201,140,79,0.45)', color: 'inherit', padding: '0 2px' }}>
        {text.slice(idx, idx + q.length)}
      </mark>,
    )
    lastEnd = idx + q.length
    idx = lower.indexOf(qLower, lastEnd)
  }
  if (lastEnd < text.length) parts.push(text.slice(lastEnd))
  return parts
}

export default async function SearchPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const q = ((params.q as string | undefined) ?? '').trim()
  const hits = q.length >= 2 ? await searchAdminNotes(q) : []

  // Groeperen per type
  const byType = new Map<AdminSearchHit['type'], AdminSearchHit[]>()
  for (const h of hits) {
    const arr = byType.get(h.type) ?? []
    arr.push(h)
    byType.set(h.type, arr)
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Zoeken</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3 mb-6">
          <Search className="size-7" style={{ color: 'var(--color-accent)' }} />
          Zoek in notities & historiek
        </h1>

        <form className="max-w-2xl">
          <div className="relative">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)]" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="bv. 'compromis' of 'Stefanie' of 'EPC'…"
              className="w-full pl-11 pr-4 py-3 text-base bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </div>
          <p className="text-[0.65rem] text-[var(--color-mute)] mt-2">
            Zoekt in dossier-notities, commissie-notities, klant-notities en de historiek-tijdslijn (mails, status-wijzigingen, document-events).
          </p>
        </form>
      </section>

      {q.length < 2 ? (
        <p className="text-sm text-[var(--color-mute)] italic p-6"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Typ minstens 2 letters om te zoeken.
        </p>
      ) : hits.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)] italic p-6"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Geen resultaten gevonden voor <strong>&ldquo;{q}&rdquo;</strong>.
        </p>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-[var(--color-mute)]">
            <strong>{hits.length}</strong> resultaten voor <strong>&ldquo;{q}&rdquo;</strong>
          </p>

          {Array.from(byType.entries()).map(([type, items]) => (
            <section key={type}>
              <h2 className="text-sm uppercase tracking-[0.16em] text-[var(--color-mute)] mb-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 text-white"
                  style={{ background: TYPE_COLOR[type] }}>
                  <TypeIcon type={type} />
                </span>
                {TYPE_LABEL[type]} ({items.length})
              </h2>
              <ul className="divide-y"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderColor: 'var(--color-line)' }}>
                {items.map((h, i) => (
                  <li key={i} className="px-4 py-3">
                    <Link href={h.href} className="group block">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <p className="text-sm font-medium group-hover:underline">
                          {h.dossierRef ?? h.clientName ?? '—'}
                          {h.clientName && h.dossierRef && (
                            <span className="text-[var(--color-mute)] font-normal"> · {h.clientName}</span>
                          )}
                        </p>
                        <span className="text-[0.65rem] text-[var(--color-mute)] shrink-0 flex items-center gap-1">
                          {new Date(h.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100" />
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-mute)] whitespace-pre-line">
                        {highlightMatch(h.matchText, q)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
