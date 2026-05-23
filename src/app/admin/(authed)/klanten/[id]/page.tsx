import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Mail, Phone, MapPin, FolderOpen, Calendar,
  Users, Plus, Hash,
} from 'lucide-react'
import {
  getAdminClient, getAdminDossiers, getAdminAppointments,
} from '@/lib/admin-db'
import { formatPrice } from '@/lib/listings'

export const metadata = {
  title: 'Admin · Klant',
}

const KIND_LABEL: Record<string, string> = {
  koper: 'Koper',
  verkoper: 'Verkoper',
  huurder: 'Huurder',
  verhuurder: 'Verhuurder',
}

const STATUS_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  actief:   { bg: 'rgba(34,197,94,0.15)',   fg: '#166534', label: 'Actief' },
  lead:     { bg: 'rgba(201,140,79,0.18)',  fg: '#92400e', label: 'Lead' },
  inactief: { bg: 'rgba(115,115,115,0.18)', fg: '#525252', label: 'Inactief' },
}

const DOSSIER_STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getAdminClient(id)
  if (!client) notFound()

  const [{ items: allDossiers }, { items: allAppointments }] = await Promise.all([
    getAdminDossiers(),
    getAdminAppointments(),
  ])

  const dossiers = allDossiers.filter((d) => d.clientId === client.id)
  const appointments = allAppointments
    .filter((a) => dossiers.some((d) => d.id === a.dossierId))
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())

  const status = STATUS_BADGE[client.status] ?? STATUS_BADGE.actief
  const displayName = (client.firstName || client.lastName) ? `${client.firstName} ${client.lastName}`.trim() : client.email

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/klanten"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar klanten
      </Link>

      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Klant</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3 flex-wrap">
            <Users className="size-7" style={{ color: 'var(--color-accent)' }} />
            {displayName}
            <span
              className="inline-block px-2 py-1 text-[0.6rem] uppercase tracking-[0.1em] font-medium"
              style={{ background: status.bg, color: status.fg }}
            >
              {status.label}
            </span>
            {!client.hasAuthAccount && (
              <span className="text-[0.6rem] uppercase tracking-[0.1em] text-[var(--color-mute)]">geen login</span>
            )}
          </h1>
          {client.kinds.length > 0 && (
            <p className="mt-2 text-sm text-[var(--color-mute)]">
              {client.kinds.map((k) => KIND_LABEL[k] ?? k).join(' · ')}
              {client.agent && <> · Werknemer: <span className="italic">{client.agent}</span></>}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/dossiers/nieuw?client_id=${client.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.1em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Plus className="size-3" />
            <FolderOpen className="size-3.5" />
            Nieuw dossier
          </Link>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-6">
          <Card title="Contact">
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${client.email}`} className="flex items-start gap-2 link-underline">
                  <Mail className="size-3.5 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <span className="break-all">{client.email}</span>
                </a>
              </li>
              {client.phone && (
                <li>
                  <a href={`tel:${client.phone.replace(/\s|\//g, '')}`} className="flex items-center gap-2 link-underline">
                    <Phone className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    {client.phone}
                  </a>
                </li>
              )}
              {client.city && (
                <li className="flex items-center gap-2 text-[var(--color-mute)]">
                  <MapPin className="size-3.5 shrink-0" />
                  {client.city}
                </li>
              )}
            </ul>
          </Card>

          {client.budget && (
            <Card title="Budget">
              <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
                {formatPrice(client.budget)}
              </p>
            </Card>
          )}

          {(client.searchCity.length > 0 || client.searchType.length > 0) && (
            <Card title="Zoekcriteria">
              {client.searchCity.length > 0 && (
                <div className="mb-3">
                  <p className="eyebrow text-[0.55rem] mb-1">Locaties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.searchCity.map((c) => (
                      <span key={c} className="px-2 py-0.5 text-xs" style={{ background: 'var(--color-paper-2)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.searchType.length > 0 && (
                <div>
                  <p className="eyebrow text-[0.55rem] mb-1">Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.searchType.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-xs" style={{ background: 'var(--color-paper-2)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card title="Historiek">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)]">Klant sinds</span>
                <span>{new Date(client.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </li>
            </ul>
          </Card>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <FolderOpen className="size-5" style={{ color: 'var(--color-accent)' }} />
                Dossiers ({dossiers.length})
              </h2>
            </div>
            {dossiers.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-mute)] italic"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Nog geen dossiers.
              </p>
            ) : (
              <div className="space-y-3">
                {dossiers.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/dossiers/${d.id}`}
                    className="block p-4 transition-all hover:shadow-sm"
                    style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                          <Hash className="size-2.5" />
                          {d.ref ?? d.id.slice(0, 8)}
                          <span>·</span>
                          <span>{d.type.replace('_', '-')}</span>
                        </div>
                        <p className="mt-1 text-base" style={{ fontFamily: 'var(--font-display)' }}>
                          {d.propertyAddress || 'Zoekopdracht'}
                        </p>
                        {d.propertyCity && (
                          <p className="text-xs text-[var(--color-mute)]">{d.propertyCity}</p>
                        )}
                      </div>
                      <span
                        className="inline-block px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
                        style={{
                          background: d.status === 'onder_optie' ? 'rgba(201,140,79,0.18)' :
                                     d.status === 'verkocht' || d.status === 'verhuurd' ? 'rgba(34,197,94,0.18)' :
                                     'rgba(11,79,88,0.12)',
                          color: d.status === 'onder_optie' ? '#92400e' :
                                 d.status === 'verkocht' || d.status === 'verhuurd' ? '#14532d' :
                                 '#0b4f58',
                        }}
                      >
                        {DOSSIER_STATUS_LABEL[d.status] ?? d.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-[var(--color-mute)]">
                      <div className="flex items-center gap-4">
                        {d.askingPrice && (
                          <span style={{ color: 'var(--color-accent)' }}>{formatPrice(d.askingPrice)}</span>
                        )}
                        <span>📅 {d.appointmentsCount}</span>
                        <span>📄 {d.documentsCount}</span>
                      </div>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Calendar className="size-5" style={{ color: 'var(--color-accent)' }} />
                Afspraken ({appointments.length})
              </h2>
            </div>
            {appointments.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-mute)] italic"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Nog geen afspraken.
              </p>
            ) : (
              <ul className="space-y-2">
                {appointments.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-4 p-3 text-sm"
                    style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                  >
                    <div className="text-center shrink-0">
                      <p className="text-[0.55rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
                        {new Date(a.start).toLocaleDateString('nl-BE', { month: 'short' })}
                      </p>
                      <p className="text-lg leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {new Date(a.start).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{a.title}</p>
                      <p className="text-xs text-[var(--color-mute)]">
                        {new Date(a.start).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {a.location && <> · {a.location}</>}
                      </p>
                    </div>
                    <span className="text-[0.6rem] uppercase tracking-[0.1em] text-[var(--color-mute)] shrink-0">
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {client.notes && (
            <section>
              <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Notities</h2>
              <div
                className="p-4 text-sm whitespace-pre-line"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
              >
                {client.notes}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <h3 className="eyebrow text-[0.55rem] mb-3">{title}</h3>
      {children}
    </section>
  )
}
