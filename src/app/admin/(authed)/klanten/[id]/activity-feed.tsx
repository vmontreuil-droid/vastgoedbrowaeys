import Link from 'next/link'
import { Clock, Mail, FileText, FilePlus, FolderClock, Eye, MessageSquare, Hash } from 'lucide-react'
import type { ClientActivityEvent } from '@/lib/admin-db'

const TYPE_COLOR: Record<ClientActivityEvent['eventType'], string> = {
  email_sent:           '#0b4f58',
  note_added:           '#737373',
  status_changed:       '#a25b3a',
  document_uploaded:    '#c98c4f',
  document_shared:      '#5a7a48',
  appointment_created:  '#0b4f58',
  appointment_completed:'#5a7a48',
  other:                '#737373',
}

function IconFor({ type }: { type: ClientActivityEvent['eventType'] }) {
  if (type === 'email_sent') return <Mail className="size-3" />
  if (type === 'document_uploaded') return <FilePlus className="size-3" />
  if (type === 'document_shared') return <Eye className="size-3" />
  if (type === 'note_added') return <MessageSquare className="size-3" />
  if (type === 'appointment_created' || type === 'appointment_completed') return <FolderClock className="size-3" />
  if (type === 'status_changed') return <FileText className="size-3" />
  return <Clock className="size-3" />
}

function formatRelative(iso: string, now = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'zonet'
  if (minutes < 60) return `${minutes} min geleden`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} u geleden`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d geleden`
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ClientActivityFeed({ events }: { events: ClientActivityEvent[] }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Clock className="size-5" style={{ color: 'var(--color-accent)' }} />
          Activiteit ({events.length})
        </h2>
      </div>

      {events.length === 0 ? (
        <p className="p-6 text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen activiteit. Wanneer er e-mails verstuurd worden, notities toegevoegd worden of documenten gedeeld, verschijnen ze hier.
        </p>
      ) : (
        <ol className="relative">
          <span className="absolute left-3 top-1 bottom-1 w-px"
            style={{ background: 'var(--color-line)' }} />
          {events.map((ev) => (
            <li key={ev.id} className="relative pl-10 py-3">
              <span className="absolute left-0 top-3 inline-flex items-center justify-center size-7 text-white"
                style={{ background: TYPE_COLOR[ev.eventType] }}>
                <IconFor type={ev.eventType} />
              </span>
              <div className="flex items-baseline justify-between gap-3 mb-0.5 flex-wrap">
                <p className="text-sm font-medium">{ev.title}</p>
                {ev.dossierRef && (
                  <Link
                    href={`/admin/dossiers/${ev.dossierId}`}
                    className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-mute)] link-underline shrink-0"
                  >
                    <Hash className="size-2.5" />
                    {ev.dossierRef}
                  </Link>
                )}
              </div>
              {ev.body && (
                <p className="text-xs text-[var(--color-mute)] mt-0.5 whitespace-pre-line line-clamp-3">{ev.body}</p>
              )}
              <p className="text-[0.65rem] text-[var(--color-mute)] mt-1">
                {formatRelative(ev.createdAt)}
                {ev.dossierAddress && <span className="ml-2 italic">{ev.dossierAddress}</span>}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
