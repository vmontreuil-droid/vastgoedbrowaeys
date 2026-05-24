import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Hash, MapPin, FileText, Calendar, Clock, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getMyDossier, getSharedDocumentsForDossier, getAppointmentsForMyDossier, getStepsForMyDossier,
} from '@/lib/portal-db'
import { formatPrice } from '@/lib/listings'
import { PortalDocumentsList, type PortalDoc } from './portal-documents-list'

export const metadata = {
  title: 'Mijn dossier',
}

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

const STATUS_BADGE: Record<string, { bg: string; fg: string }> = {
  open:           { bg: 'rgba(34,197,94,0.15)',  fg: '#166534' },
  in_behandeling: { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58' },
  onder_optie:    { bg: 'rgba(201,140,79,0.20)', fg: '#92400e' },
  verkocht:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  verhuurd:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  geannuleerd:    { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
}

export default async function MyDossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const dossier = await getMyDossier(user.id, id)
  if (!dossier) notFound()

  const [{ items: docs }, { items: appointments }, { items: steps }] = await Promise.all([
    getSharedDocumentsForDossier(user.id, id),
    getAppointmentsForMyDossier(user.id, id),
    getStepsForMyDossier(user.id, id),
  ])

  const statusBadge = STATUS_BADGE[dossier.status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252' }
  const doneSteps = steps.filter((s) => s.status === 'done').length
  const skippedSteps = steps.filter((s) => s.status === 'skipped').length
  const totalActiveSteps = steps.length - skippedSteps
  const progress = totalActiveSteps === 0 ? 0 : Math.round((doneSteps / totalActiveSteps) * 100)
  const docRows: PortalDoc[] = docs.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    sizeBytes: d.sizeBytes,
    mimeType: d.mimeType,
    uploadedAt: d.uploadedAt,
  }))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <Link
        href="/portaal/dossiers"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar mijn dossiers
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Mijn dossier</p>
        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-mute)] mb-2">
          <Hash className="size-3" />
          {dossier.ref ?? dossier.id.slice(0, 8)}
          <span>·</span>
          <span>{TYPE_LABEL[dossier.type] ?? dossier.type}</span>
        </div>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3 flex-wrap" style={{ fontFamily: 'var(--font-display)' }}>
          {dossier.propertyAddress || 'Zoekopdracht'}
          <span
            className="inline-block px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
            style={{ background: statusBadge.bg, color: statusBadge.fg }}
          >
            {STATUS_LABEL[dossier.status] ?? dossier.status}
          </span>
        </h1>
        {dossier.propertyCity && (
          <p className="text-sm text-[var(--color-mute)] mt-2 flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {dossier.propertyCity}
          </p>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4">
          <Card title="Cijfers">
            <ul className="space-y-2 text-sm">
              {dossier.askingPrice && (
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-mute)] text-xs">
                    {dossier.type === 'verkoop' || dossier.type === 'verhuur' ? 'Vraagprijs' : 'Budget'}
                  </span>
                  <span style={{ color: 'var(--color-accent)' }}>{formatPrice(dossier.askingPrice)}</span>
                </li>
              )}
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)] text-xs">Geopend</span>
                <span>{new Date(dossier.openedAt).toLocaleDateString('nl-BE')}</span>
              </li>
              {dossier.closedAt && (
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-mute)] text-xs">Afgesloten</span>
                  <span>{new Date(dossier.closedAt).toLocaleDateString('nl-BE')}</span>
                </li>
              )}
            </ul>
          </Card>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          {steps.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Clock className="size-5" style={{ color: 'var(--color-accent)' }} />
                  Voortgang
                </h2>
                <span className="text-xs text-[var(--color-mute)]">
                  {doneSteps} van {totalActiveSteps} ({progress}%)
                </span>
              </div>

              <div className="h-2 w-full mb-4" style={{ background: 'var(--color-paper-2)' }}>
                <div
                  className="h-full transition-all"
                  style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
                />
              </div>

              <ol className="p-5 space-y-3"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                {steps.map((step, idx) => {
                  const isDone = step.status === 'done'
                  const isSkipped = step.status === 'skipped'
                  return (
                    <li key={step.id} className="flex items-start gap-3 text-sm">
                      <span
                        className="mt-0.5 size-5 grid place-items-center shrink-0"
                        style={{
                          background: isDone ? 'var(--color-accent)' : 'transparent',
                          border: `2px solid ${isDone ? 'var(--color-accent)' : isSkipped ? 'var(--color-line)' : 'var(--color-mute)'}`,
                          color: '#fff',
                        }}
                      >
                        {isDone && <Check className="size-3" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={isDone ? 'line-through text-[var(--color-mute)]' : isSkipped ? 'text-[var(--color-mute)] italic' : ''}>
                          <span className="text-[0.65rem] text-[var(--color-mute)] mr-2">{idx + 1}.</span>
                          {step.label}
                          {isSkipped && <span className="ml-2 text-[0.6rem] uppercase tracking-[0.1em]">overgeslagen</span>}
                        </p>
                        {step.doneAt && isDone && (
                          <p className="text-[0.65rem] text-[var(--color-mute)] mt-0.5">
                            voltooid op {new Date(step.doneAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          <section>
            <h2 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Calendar className="size-5" style={{ color: 'var(--color-accent)' }} />
              Afspraken ({appointments.length})
            </h2>
            {appointments.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-mute)] italic"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Nog geen afspraken gepland.
              </p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((a) => (
                  <li key={a.id} className="flex items-center gap-4 p-3 text-sm"
                    style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                    <div className="text-center shrink-0">
                      <p className="text-[0.55rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
                        {new Date(a.start).toLocaleDateString('nl-BE', { month: 'short' })}
                      </p>
                      <p className="text-lg leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {new Date(a.start).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p>{a.title}</p>
                      <p className="text-xs text-[var(--color-mute)]">
                        {new Date(a.start).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {a.location && <> · {a.location}</>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <FileText className="size-5" style={{ color: 'var(--color-accent)' }} />
              Documenten ({docRows.length})
            </h2>
            <PortalDocumentsList docs={docRows} />
          </section>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="eyebrow text-[0.55rem] mb-3">{title}</h3>
      {children}
    </section>
  )
}
