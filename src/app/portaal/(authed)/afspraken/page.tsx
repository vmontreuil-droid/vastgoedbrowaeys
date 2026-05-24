import Link from 'next/link'
import { Calendar, MapPin, Hash, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMyAppointments } from '@/lib/portal-db'

export const metadata = {
  title: 'Mijn afspraken',
}

const STATUS_LABEL: Record<string, string> = {
  planned: 'Gepland',
  confirmed: 'Bevestigd',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
}

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  planned:   { bg: 'rgba(11,79,88,0.12)',   fg: '#0b4f58' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',  fg: '#166534' },
  completed: { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
  cancelled: { bg: 'rgba(239,68,68,0.10)',  fg: '#b91c1c' },
}

export default async function MyAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="container-px mx-auto max-w-screen-2xl py-10">
        <p>Niet ingelogd.</p>
      </div>
    )
  }

  const { items: all } = await getMyAppointments(user.id)
  const now = Date.now()
  const upcoming = all
    .filter((a) => new Date(a.start).getTime() >= now && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  const past = all
    .filter((a) => new Date(a.start).getTime() < now || a.status === 'cancelled')
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-14">
      <section className="mb-8 md:mb-10">
        <p className="eyebrow mb-2 md:mb-3">Klantenportaal</p>
        <h1 className="text-2xl sm:text-3xl md:text-5xl flex items-center gap-3">
          <Calendar className="size-6 md:size-8 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Mijn afspraken
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--color-mute)] max-w-2xl">
          Alle bezichtigingen, plaatsbezoeken en ondertekening-momenten op één plek.
        </p>
      </section>

      {/* Komende */}
      <section className="mb-10">
        <h2 className="text-lg md:text-xl mb-3 md:mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Komende ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-mute)] italic"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen afspraken gepland.
          </p>
        ) : (
          <ul className="space-y-2 md:space-y-3">
            {upcoming.map((a) => (
              <AppointmentItem key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>

      {/* Verleden */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-[var(--color-mute)]" style={{ fontFamily: 'var(--font-display)' }}>
            Verleden ({past.length})
          </h2>
          <ul className="space-y-2 md:space-y-3">
            {past.slice(0, 20).map((a) => (
              <AppointmentItem key={a.id} a={a} dim />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function AppointmentItem({
  a,
  dim = false,
}: {
  a: Awaited<ReturnType<typeof getMyAppointments>>['items'][number]
  dim?: boolean
}) {
  const dt = new Date(a.start)
  const statusColor = STATUS_COLOR[a.status] ?? STATUS_COLOR.planned
  return (
    <li>
      <Link
        href={`/portaal/dossiers/${a.dossierId}`}
        className="block p-3 md:p-4 transition-shadow hover:shadow-sm"
        style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-line)',
          opacity: dim ? 0.7 : 1,
        }}
      >
        <div className="flex items-start gap-3 md:gap-4">
          <div className="text-center shrink-0 w-12 md:w-14 py-1 px-1"
            style={{ background: 'var(--color-paper-2)' }}>
            <p className="text-[0.55rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
              {dt.toLocaleDateString('nl-BE', { month: 'short' })}
            </p>
            <p className="text-lg md:text-xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              {dt.getDate()}
            </p>
            <p className="text-[0.6rem] text-[var(--color-mute)] mt-0.5">
              {dt.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm md:text-base truncate" style={{ fontFamily: 'var(--font-display)' }}>
                {a.title}
              </p>
              <span
                className="inline-block px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium shrink-0"
                style={{ background: statusColor.bg, color: statusColor.fg }}
              >
                {STATUS_LABEL[a.status]}
              </span>
            </div>
            {a.location && (
              <p className="text-xs text-[var(--color-mute)] mt-1 flex items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0" />
                {a.location}
              </p>
            )}
            {(a.dossierRef || a.propertyAddress) && (
              <p className="text-xs text-[var(--color-mute)] mt-1 flex items-center gap-1 truncate">
                <Hash className="size-3 shrink-0" />
                {a.dossierRef ?? a.propertyAddress ?? 'Dossier'}
              </p>
            )}
          </div>

          <ExternalLink className="size-4 shrink-0 self-center text-[var(--color-mute)]" />
        </div>
      </Link>
    </li>
  )
}
