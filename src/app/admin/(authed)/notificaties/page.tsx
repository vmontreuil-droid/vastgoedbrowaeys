import Link from 'next/link'
import { Bell, AlertCircle } from 'lucide-react'
import { getAdminNotifications, type NotificationType } from '@/lib/admin-db'
import { NotificationRow } from './notification-row'
import { MarkAllReadButton } from './mark-all-button'

export const metadata = {
  title: 'Admin · Meldingen',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'alle',                  label: 'Alle' },
  { value: 'new_match',             label: 'Matches' },
  { value: 'new_document',          label: 'Documenten' },
  { value: 'appointment_reminder',  label: 'Afspraken' },
  { value: 'dossier_update',        label: 'Dossiers' },
  { value: 'message',               label: 'Berichten' },
]

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'alle',        label: 'Alle' },
  { value: 'onbehandeld', label: 'Onbehandeld' },
  { value: 'gelezen',     label: 'Gelezen' },
]

export default async function NotificatiesPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const typeFilter = (params.type as string | undefined) ?? 'alle'
  const statusFilter = (params.status as string | undefined) ?? 'alle'

  const { items: all, error } = await getAdminNotifications(300)

  let filtered = [...all]
  if (typeFilter !== 'alle') filtered = filtered.filter((n) => n.type === typeFilter)
  if (statusFilter === 'onbehandeld') filtered = filtered.filter((n) => !n.readAt)
  else if (statusFilter === 'gelezen') filtered = filtered.filter((n) => n.readAt)

  const unreadCount = all.filter((n) => !n.readAt).length

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Meldingen</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Bell className="size-7" style={{ color: 'var(--color-accent)' }} />
            Meldingen{' '}
            <span className="text-[var(--color-mute)] text-2xl">
              ({unreadCount > 0 ? `${unreadCount} onbehandeld · ` : ''}{all.length} totaal)
            </span>
          </h1>
          <p className="text-sm text-[var(--color-mute)] mt-2 max-w-2xl">
            Interne meldingen voor je klanten: nieuwe pand-matches op hun zoekfiches,
            nieuwe documenten, herinneringen voor afspraken, dossier-updates.
          </p>
        </div>
        <MarkAllReadButton unreadCount={unreadCount} />
      </section>

      {error && (
        <div className="flex items-start gap-3 p-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>Kon meldingen niet laden: {error}</span>
        </div>
      )}

      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <FilterPills
          label="Status"
          options={STATUS_OPTIONS}
          current={statusFilter}
          queryKey="status"
          otherKeyValues={{ type: typeFilter }}
        />
        <FilterPills
          label="Type"
          options={TYPE_OPTIONS}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ status: statusFilter }}
        />
      </section>

      <section
        className="divide-y"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--color-mute)] italic">
            {all.length === 0
              ? 'Nog geen meldingen. Wanneer je een nieuw pand toevoegt dat past bij een open zoekfiche verschijnt hier een melding.'
              : 'Geen meldingen voor deze filters.'}
          </p>
        ) : (
          <ul>
            {filtered.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function FilterPills({
  label, options, current, queryKey, otherKeyValues,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  current: string
  queryKey: string
  otherKeyValues: Record<string, string>
}) {
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-mute)] mr-1">{label}:</span>
      {options.map((o) => {
        const params = new URLSearchParams()
        Object.entries(otherKeyValues).forEach(([k, v]) => {
          if (v && v !== 'alle') params.set(k, v)
        })
        if (o.value !== 'alle') params.set(queryKey, o.value)
        const href = `?${params.toString()}`
        const active = o.value === current
        return (
          <Link
            key={o.value}
            href={href}
            className="px-2 py-1 text-[0.65rem] transition-colors"
            style={{
              background: active ? 'var(--color-ink)' : 'transparent',
              color: active ? 'var(--color-paper)' : 'var(--color-mute)',
              border: active ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
            }}
          >
            {o.label}
          </Link>
        )
      })}
    </div>
  )
}
