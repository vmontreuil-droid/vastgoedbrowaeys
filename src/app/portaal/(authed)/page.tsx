import Link from 'next/link'
import {
  ArrowRight, FolderOpen, Calendar, FileText, Hash, MapPin, Bell,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getMyDossiers, getMyAppointments, getMySharedDocuments, getMyStats,
} from '@/lib/portal-db'
import { getNotificationsForUser } from '@/lib/admin-db'
import { formatPrice } from '@/lib/listings'
import { NotificationsList, type NotificationRow } from './notifications-list'

export const metadata = {
  title: 'Mijn portaal',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  open:           { bg: 'rgba(34,197,94,0.15)',  fg: '#166534' },
  in_behandeling: { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58' },
  onder_optie:    { bg: 'rgba(201,140,79,0.20)', fg: '#92400e' },
  verkocht:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  verhuurd:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  geannuleerd:    { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
}

function deriveDisplayName(firstName: string | undefined, email: string | null) {
  const first = firstName?.trim()
  if (first) return first
  if (email) {
    const local = email.split('@')[0]
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return 'u'
}

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name as string | undefined
  const displayName = deriveDisplayName(firstName, user?.email ?? null)

  if (!user) {
    return (
      <div className="container-px mx-auto max-w-screen-2xl py-10">
        <p>Niet ingelogd.</p>
      </div>
    )
  }

  const [
    stats,
    { items: dossiers },
    { items: appointments },
    { items: documents },
    { items: notifs },
  ] = await Promise.all([
    getMyStats(user.id),
    getMyDossiers(user.id),
    getMyAppointments(user.id),
    getMySharedDocuments(user.id),
    getNotificationsForUser(user.id, 8),
  ])

  const openDossiers = dossiers.filter((d) =>
    ['open', 'in_behandeling', 'onder_optie'].includes(d.status),
  )
  const upcomingAppointments = appointments
    .filter((a) => new Date(a.start).getTime() >= Date.now())
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3)
  const recentDocuments = documents.slice(0, 4)
  const unreadNotifs = notifs.filter((n) => !n.readAt)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-14">
      {/* === Welkom === */}
      <section className="mb-8 md:mb-12">
        <p className="eyebrow mb-2 md:mb-3">Klantenportaal</p>
        <h1 className="text-2xl sm:text-3xl md:text-5xl">
          Welkom terug,{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            {displayName}.
          </span>
        </h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-[var(--color-mute)] max-w-2xl">
          Uw lopende dossiers, afspraken en documenten — overzichtelijk op één plek.
        </p>
      </section>

      {/* === Snelle stats === */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        <StatCard
          href="/portaal/dossiers"
          icon={<FolderOpen className="size-4 md:size-5" />}
          label="Lopende dossiers"
          value={String(stats.openDossiers)}
        />
        <StatCard
          href="/portaal/afspraken"
          icon={<Calendar className="size-4 md:size-5" />}
          label="Afspraken"
          value={String(stats.appointments)}
          hint={upcomingAppointments[0] ? `Volgende: ${new Date(upcomingAppointments[0].start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}` : undefined}
        />
        <StatCard
          href="/portaal/documenten"
          icon={<FileText className="size-4 md:size-5" />}
          label="Documenten"
          value={String(stats.documents)}
        />
        <StatCard
          icon={<Bell className="size-4 md:size-5" />}
          label="Meldingen"
          value={String(stats.unreadNotifications)}
          hint={stats.unreadNotifications > 0 ? 'ongelezen' : 'alles gelezen'}
          accent={stats.unreadNotifications > 0}
        />
      </section>

      {/* === Meldingen === */}
      {notifs.length > 0 && (
        <NotificationsList initial={notifs.map<NotificationRow>((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          link: n.link,
          readAt: n.readAt,
          createdAt: n.createdAt,
        }))} />
      )}

      <section className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* === Lopende dossiers === */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-4 md:mb-5">
            <h2 className="text-xl md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
              {openDossiers.length === 1 ? 'Uw lopend dossier' : `Uw lopende dossiers (${openDossiers.length})`}
            </h2>
            {dossiers.length > 0 && (
              <Link href="/portaal/dossiers" className="link-underline text-xs md:text-sm">
                Alle dossiers →
              </Link>
            )}
          </div>

          {openDossiers.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-sm text-[var(--color-mute)] italic"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
              {dossiers.length === 0
                ? 'U heeft nog geen dossiers bij ons. Contacteer ons gerust voor een eerste gesprek.'
                : 'Geen lopende dossiers — alleen afgesloten.'}
            </div>
          ) : (
            <ul className="space-y-3 md:space-y-4">
              {openDossiers.slice(0, 3).map((d) => {
                const statusColor = STATUS_COLOR[d.status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252' }
                return (
                  <li key={d.id}>
                    <Link
                      href={`/portaal/dossiers/${d.id}`}
                      className="block p-4 md:p-5 transition-shadow hover:shadow-sm"
                      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] flex items-center gap-1">
                            <Hash className="size-3" />
                            {d.ref ?? d.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-base md:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                            {d.propertyAddress || 'Zoekopdracht'}
                          </p>
                          {d.propertyCity && (
                            <p className="text-xs text-[var(--color-mute)] mt-0.5 flex items-center gap-1">
                              <MapPin className="size-3" />
                              {d.propertyCity}
                            </p>
                          )}
                        </div>
                        <span
                          className="inline-block px-2 py-0.5 text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
                          style={{ background: statusColor.bg, color: statusColor.fg }}
                        >
                          {STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-[var(--color-mute)]"
                        style={{ borderColor: 'var(--color-line)' }}>
                        <div className="flex items-center gap-3 md:gap-4">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            {d.appointmentsCount}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FileText className="size-3" />
                            {d.sharedDocumentsCount}
                          </span>
                          {d.askingPrice && (
                            <span>{formatPrice(d.askingPrice)}</span>
                          )}
                        </div>
                        <ArrowRight className="size-3.5" />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* === Rechter kolom: afspraken + documenten === */}
        <div className="space-y-6 md:space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl mb-3 md:mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Volgende afspraak
            </h2>
            {upcomingAppointments[0] ? (
              <Link
                href="/portaal/afspraken"
                className="block bg-[var(--color-paper)] p-4 md:p-6 hover:shadow-sm transition-shadow"
                style={{ border: '1px solid var(--color-line)' }}
              >
                <p className="eyebrow text-[0.6rem]" style={{ color: 'var(--color-accent)' }}>
                  {new Date(upcomingAppointments[0].start).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="mt-2 text-base md:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  {upcomingAppointments[0].title}
                </p>
                <p className="mt-1 text-xs md:text-sm text-[var(--color-mute)]">
                  Om {new Date(upcomingAppointments[0].start).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                  {upcomingAppointments[0].location && <> · {upcomingAppointments[0].location}</>}
                </p>
                {upcomingAppointments.length > 1 && (
                  <p className="mt-3 text-xs text-[var(--color-mute)]">
                    + {upcomingAppointments.length - 1} verdere afspraak{upcomingAppointments.length - 1 > 1 ? 'en' : ''}
                  </p>
                )}
              </Link>
            ) : (
              <p className="text-sm text-[var(--color-mute)] italic p-4"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Geen afspraken gepland.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-end justify-between mb-3 md:mb-5">
              <h2 className="text-xl md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                Recente documenten
              </h2>
              {documents.length > recentDocuments.length && (
                <Link href="/portaal/documenten" className="link-underline text-xs">
                  Alle →
                </Link>
              )}
            </div>
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-[var(--color-mute)] italic p-4"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Nog geen documenten gedeeld.
              </p>
            ) : (
              <ul className="space-y-2 md:space-y-3">
                {recentDocuments.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/portaal/dossiers/${d.dossierId}`}
                      className="bg-[var(--color-paper)] p-3 md:p-4 flex items-center gap-3 transition-shadow hover:shadow-sm"
                      style={{ border: '1px solid var(--color-line)' }}
                    >
                      <FileText className="size-4 md:size-5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{d.name}</p>
                        <p className="text-xs text-[var(--color-mute)] truncate">
                          {new Date(d.uploadedAt).toLocaleDateString('nl-BE')}
                          {d.sizeBytes && ` · ${formatBytes(d.sizeBytes)}`}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon, label, value, hint, accent, href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  accent?: boolean
  href?: string
}) {
  const inner = (
    <div
      className="bg-[var(--color-paper)] p-4 md:p-5 h-full"
      style={{
        border: '1px solid var(--color-line)',
        borderColor: accent ? 'var(--color-accent)' : 'var(--color-line)',
      }}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="eyebrow text-[0.55rem] sm:text-[0.6rem]">{label}</span>
        <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      </div>
      <p className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-mute)] truncate">{hint}</p>}
    </div>
  )
  if (href) {
    return <Link href={href} className="block">{inner}</Link>
  }
  return inner
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
