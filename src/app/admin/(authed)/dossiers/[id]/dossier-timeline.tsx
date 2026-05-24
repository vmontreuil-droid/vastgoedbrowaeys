'use client'

import { useRef, useState, useTransition } from 'react'
import {
  Clock, Mail, FileText, FilePlus, FolderClock, Eye, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp, Zap,
} from 'lucide-react'
import { addNoteAction } from './event-actions'
import type { DossierEvent } from '@/lib/admin-db'

const NOTE_TEMPLATES: Array<{ label: string; text: string }> = [
  { label: 'Gebeld — geen antwoord',     text: 'Klant gebeld, geen antwoord. Voicemail ingesproken.' },
  { label: 'Gebeld — kort gesproken',    text: 'Kort gesproken aan de telefoon — terugbellen op een rustiger moment.' },
  { label: 'Bezichtiging bevestigd',     text: 'Bezichtiging bevestigd voor [datum] om [uur].' },
  { label: 'Bezichtiging — interesse',   text: 'Bezichtiging gedaan — klant toonde duidelijke interesse, vraagt nog bedenktijd.' },
  { label: 'Bezichtiging — geen match',  text: 'Bezichtiging gedaan — pand past niet bij de zoekfiche.' },
  { label: 'Bod ontvangen',              text: 'Bod ontvangen van € [bedrag] — voorgelegd aan verkoper.' },
  { label: 'Bod aanvaard',               text: 'Bod van € [bedrag] aanvaard door verkoper. Compromis in voorbereiding.' },
  { label: 'Compromis opgemaakt',        text: 'Compromis-document opgemaakt en doorgestuurd voor nazicht.' },
  { label: 'EPC ontvangen',              text: 'EPC-attest ontvangen en opgeladen in het dossier.' },
  { label: 'Documenten compleet',        text: 'Alle wettelijk verplichte documenten zijn beschikbaar voor publicatie/akte.' },
  { label: 'Foto-shoot ingepland',       text: 'Foto-presentatie ingepland voor [datum].' },
  { label: 'Online gepubliceerd',        text: 'Pand vandaag online gezet op eigen site + Immoweb + Zimmo.' },
]

const TYPE_COLOR: Record<DossierEvent['eventType'], string> = {
  email_sent:           '#0b4f58',
  note_added:           '#737373',
  status_changed:       '#a25b3a',
  document_uploaded:    '#c98c4f',
  document_shared:      '#5a7a48',
  appointment_created:  '#0b4f58',
  appointment_completed:'#5a7a48',
  other:                '#737373',
}

function IconFor({ type }: { type: DossierEvent['eventType'] }) {
  if (type === 'email_sent') return <Mail className="size-3" />
  if (type === 'document_uploaded') return <FilePlus className="size-3" />
  if (type === 'document_shared') return <Eye className="size-3" />
  if (type === 'note_added') return <MessageSquare className="size-3" />
  if (type === 'appointment_created' || type === 'appointment_completed') return <FolderClock className="size-3" />
  if (type === 'status_changed') return <FileText className="size-3" />
  return <Clock className="size-3" />
}

export function DossierTimeline({
  dossierId,
  events,
}: {
  dossierId: string
  events: DossierEvent[]
}) {
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [optimisticEvents, setOptimisticEvents] = useState<DossierEvent[]>([])
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyTemplate(text: string) {
    setNote((prev) => (prev.trim() ? `${prev}\n\n${text}` : text))
    setTemplatesOpen(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const all = [...optimisticEvents, ...events]

  function submitNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!note.trim()) return
    const text = note
    setNote('')
    setError(null)
    const optimistic: DossierEvent = {
      id: 'tmp-' + Date.now(),
      dossierId,
      eventType: 'note_added',
      title: 'Notitie toegevoegd',
      body: text,
      metadata: {},
      createdBy: null,
      createdAt: new Date().toISOString(),
    }
    setOptimisticEvents((prev) => [optimistic, ...prev])
    startTransition(async () => {
      const res = await addNoteAction({ dossierId, note: text })
      if (!res.ok) {
        setError(res.error ?? 'Bewaren mislukt')
        setOptimisticEvents((prev) => prev.filter((e) => e !== optimistic))
        setNote(text)
      }
    })
  }

  return (
    <section>
      <h2 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <Clock className="size-5" style={{ color: 'var(--color-accent)' }} />
        Historiek
      </h2>

      <form onSubmit={submitNote}
        className="p-3 mb-4"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <div className="flex items-start gap-2 mb-2">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notitie toevoegen aan dit dossier…"
            rows={2}
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <button
            type="submit"
            disabled={pending || !note.trim()}
            className="self-stretch inline-flex items-center gap-1.5 px-3 text-xs font-medium disabled:opacity-50 shrink-0"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            {pending ? 'Bezig…' : 'Bewaren'}
          </button>
        </div>

        {/* Sjabloon-knoppen */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTemplatesOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
          >
            <Zap className="size-3" />
            Sjablonen
            <ChevronDown className={`size-3 transition-transform ${templatesOpen ? 'rotate-180' : ''}`} />
          </button>
          {templatesOpen && (
            <div
              className="absolute z-20 mt-2 left-0 right-0 sm:right-auto sm:min-w-[420px] p-2"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] px-2 py-1">
                Klik om bij de notitie te voegen
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {NOTE_TEMPLATES.map((t) => (
                  <li key={t.label}>
                    <button
                      type="button"
                      onClick={() => applyTemplate(t.text)}
                      title={t.text}
                      className="w-full text-left px-2 py-1.5 text-xs hover:bg-[var(--color-paper)] transition-colors"
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-[0.6rem] text-[var(--color-mute)] px-2 py-1.5 mt-1 border-t" style={{ borderColor: 'var(--color-line)' }}>
                💡 Plaatshouders zoals [datum], [bedrag] vervang je nog manueel.
              </p>
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {all.length === 0 ? (
        <p className="p-6 text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen historiek. Verzonden mails, toegevoegde notities en documenten verschijnen hier.
        </p>
      ) : (
        <ol className="relative">
          <span className="absolute left-3 top-1 bottom-1 w-px"
            style={{ background: 'var(--color-line)' }} />
          {all.map((ev) => {
            const isExp = expanded[ev.id]
            const hasBody = !!ev.body && ev.body.length > 80
            return (
              <li key={ev.id} className="relative pl-10 py-3">
                <span
                  className="absolute left-0 top-3 inline-flex items-center justify-center size-7 text-white"
                  style={{ background: TYPE_COLOR[ev.eventType] }}
                >
                  <IconFor type={ev.eventType} />
                </span>
                <p className="text-sm font-medium">{ev.title}</p>
                {ev.body && (
                  <p className={`text-xs text-[var(--color-mute)] mt-0.5 whitespace-pre-line ${isExp ? '' : 'line-clamp-2'}`}>
                    {ev.body}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[0.65rem] text-[var(--color-mute)]">
                    {new Date(ev.createdAt).toLocaleString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {hasBody && (
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [ev.id]: !isExp }))}
                      className="text-[0.65rem] link-underline inline-flex items-center gap-0.5"
                    >
                      {isExp ? <><ChevronUp className="size-2.5" /> Minder</> : <><ChevronDown className="size-2.5" /> Meer</>}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
