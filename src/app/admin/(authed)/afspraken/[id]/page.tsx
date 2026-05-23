import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Clock, MapPin, User, Calendar, FileText, FolderOpen,
} from 'lucide-react'
import { getAdminAppointment, getAdminDossier } from '@/lib/admin-db'

export const metadata = {
  title: 'Admin · Afspraak',
}

const STATUS_LABEL: Record<string, string> = {
  planned: 'Gepland',
  confirmed: 'Bevestigd',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
}

const STATUS_BADGE: Record<string, { bg: string; fg: string }> = {
  planned:   { bg: 'rgba(115,115,115,0.15)', fg: '#525252' },
  confirmed: { bg: 'rgba(11,79,88,0.15)',    fg: '#0b4f58' },
  completed: { bg: 'rgba(34,197,94,0.18)',   fg: '#14532d' },
  cancelled: { bg: 'rgba(239,68,68,0.10)',   fg: '#b91c1c' },
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const a = await getAdminAppointment(id)
  if (!a) notFound()

  const dossier = a.dossierId ? await getAdminDossier(a.dossierId) : null
  const statusCfg = STATUS_BADGE[a.status] ?? STATUS_BADGE.planned
  const startDate = new Date(a.start)
  const endDate = new Date(startDate.getTime() + a.durationMin * 60_000)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/afspraken"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar agenda
      </Link>

      <section className="mb-6">
        <p className="eyebrow mb-3">Admin · Afspraak</p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="inline-block px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.fg }}
          >
            {STATUS_LABEL[a.status] ?? a.status}
          </span>
          {a.dossierRef && (
            <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
              #{a.dossierRef}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <Calendar className="size-6" style={{ color: 'var(--color-accent)' }} />
          {a.title}
        </h1>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4">
          <Card title="Wanneer">
            <p className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {startDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm text-[var(--color-mute)] mt-1 flex items-center gap-2">
              <Clock className="size-3.5" />
              {startDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
              <span>·</span>
              <span>{a.durationMin} min</span>
            </p>
          </Card>

          {a.location && (
            <Card title="Locatie">
              <p className="text-sm flex items-start gap-2">
                <MapPin className="size-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>{a.location}</span>
              </p>
            </Card>
          )}

          <Card title="Klant">
            <p className="text-sm flex items-center gap-2">
              <User className="size-3.5" style={{ color: 'var(--color-accent)' }} />
              {a.clientName}
            </p>
          </Card>

          {dossier && (
            <Card title="Dossier">
              <Link href={`/admin/dossiers/${dossier.id}`} className="text-sm link-underline flex items-center gap-2">
                <FolderOpen className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                {dossier.ref ?? dossier.id.slice(0, 8)}
              </Link>
              {dossier.propertyAddress && (
                <p className="text-xs text-[var(--color-mute)] mt-1">{dossier.propertyAddress}</p>
              )}
            </Card>
          )}
        </aside>

        <article className="lg:col-span-2 p-6"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <header className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-line)' }}>
            <FileText className="size-4" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>Notities</h2>
          </header>
          {a.notes ? (
            <div className="text-sm whitespace-pre-line leading-relaxed">{a.notes}</div>
          ) : (
            <p className="text-sm text-[var(--color-mute)] italic">Geen notities bij deze afspraak.</p>
          )}
        </article>
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
