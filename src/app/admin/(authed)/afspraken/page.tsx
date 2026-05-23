import Link from 'next/link'
import { Calendar, Plus, Clock, MapPin, User, Check, X } from 'lucide-react'
import { APPOINTMENTS, type AppointmentType, type AppointmentStatus } from '@/data/admin-mock'
import { DonutChart, SimpleLine } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Afspraken',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const TYPE_LABEL: Record<AppointmentType, string> = {
  bezichtiging: 'Bezichtiging',
  schatting:    'Schatting',
  intake:       'Intake',
  compromis:    'Compromis',
  akte:         'Akte',
  overig:       'Overig',
}

const TYPE_COLOR: Record<AppointmentType, string> = {
  bezichtiging: '#0b4f58',
  schatting:    '#c98c4f',
  intake:       '#5a7a48',
  compromis:    '#a25b3a',
  akte:         '#0b4f58',
  overig:       '#9b6e7b',
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  planned:   'Gepland',
  confirmed: 'Bevestigd',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
}

export default async function AfsprakenPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const range = (params.range as string | undefined) ?? 'week'
  const typeFilter = (params.type as string | undefined) ?? 'alle'
  const agentFilter = (params.agent as string | undefined) ?? 'alle'

  const now = new Date('2026-05-23T12:00:00+02:00')
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
  const ranges: Record<string, number> = {
    today: 1,
    week:  7,
    month: 30,
  }
  const days = ranges[range] ?? 7
  const endTs = startOfDay.getTime() + days * 24 * 3600 * 1000

  let upcoming = APPOINTMENTS.filter((a) => {
    const t = new Date(a.start).getTime()
    return t >= startOfDay.getTime() && t < endTs
  })

  if (typeFilter !== 'alle') upcoming = upcoming.filter((a) => a.type === typeFilter)
  if (agentFilter !== 'alle') upcoming = upcoming.filter((a) => a.agent === agentFilter)
  upcoming.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const past = APPOINTMENTS
    .filter((a) => new Date(a.start).getTime() < startOfDay.getTime())
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .slice(0, 5)

  // Group by day
  const grouped = new Map<string, typeof upcoming>()
  upcoming.forEach((a) => {
    const day = new Date(a.start).toISOString().split('T')[0]
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(a)
  })

  // Stats
  const byType = (Object.keys(TYPE_LABEL) as AppointmentType[])
    .map((t) => ({
      name: TYPE_LABEL[t],
      value: APPOINTMENTS.filter((a) => a.type === t && a.status !== 'cancelled').length,
      color: TYPE_COLOR[t],
    }))
    .filter((d) => d.value > 0)

  // Trend per week mock
  const weekTrend = ['W17', 'W18', 'W19', 'W20', 'W21'].map((w, i) => ({
    x: w,
    Gepland: [3, 4, 5, 6, 7][i],
    Voltooid: [2, 3, 5, 4, 6][i],
  }))

  const agents = Array.from(new Set(APPOINTMENTS.map((a) => a.agent)))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Afspraken</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Calendar className="size-7" style={{ color: 'var(--color-accent)' }} />
            Agenda <span className="text-[var(--color-mute)] text-2xl">({upcoming.length} komende)</span>
          </h1>
        </div>
        <Link
          href="/admin/afspraken/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-3.5" />
          Afspraak plannen
        </Link>
      </section>

      {/* Charts */}
      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Afspraken per week</h3>
          <SimpleLine data={weekTrend} dataKeys={[
            { key: 'Gepland',  label: 'Gepland',  color: '#0b4f58' },
            { key: 'Voltooid', label: 'Voltooid', color: '#5a7a48' },
          ]} height={220} />
        </div>
        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per type</h3>
          <DonutChart data={byType} centerLabel="afspraken" />
        </div>
      </section>

      {/* Filters */}
      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <FilterPills
          label="Periode"
          options={[
            { value: 'today', label: 'Vandaag' },
            { value: 'week',  label: 'Deze week' },
            { value: 'month', label: '30 dagen' },
          ]}
          current={range}
          queryKey="range"
          otherKeyValues={{ type: typeFilter, agent: agentFilter }}
        />
        <FilterPills
          label="Type"
          options={[
            { value: 'alle', label: 'Alle' },
            ...Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v })),
          ]}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ range, agent: agentFilter }}
        />
        <FilterPills
          label="Werknemer"
          options={[
            { value: 'alle', label: 'Iedereen' },
            ...agents.map((a) => ({ value: a, label: a })),
          ]}
          current={agentFilter}
          queryKey="agent"
          otherKeyValues={{ range, type: typeFilter }}
        />
      </section>

      {/* Agenda gegroepeerd per dag */}
      <section className="space-y-6">
        {Array.from(grouped.entries()).map(([day, items]) => {
          const dt = new Date(day + 'T00:00:00')
          return (
            <div key={day}>
              <h2 className="text-sm uppercase tracking-[0.16em] text-[var(--color-mute)] mb-3 flex items-baseline gap-3">
                <span style={{ color: 'var(--color-ink)' }}>
                  {dt.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <span className="text-[0.7rem]">{items.length} afspra{items.length === 1 ? 'ak' : 'ken'}</span>
              </h2>
              <div className="space-y-2">
                {items.map((a) => (
                  <article
                    key={a.id}
                    className="grid grid-cols-[80px_1fr_auto] gap-4 p-4 items-start"
                    style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {new Date(a.start).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[0.6rem] text-[var(--color-mute)] flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {a.durationMin} min
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="inline-block px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
                          style={{ background: TYPE_COLOR[a.type], color: '#fff' }}
                        >
                          {TYPE_LABEL[a.type]}
                        </span>
                        <AppointmentStatusBadge status={a.status} />
                      </div>
                      <p className="text-base mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{a.title}</p>
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-[var(--color-mute)]">
                        <span className="flex items-center gap-1">
                          <User className="size-3" /> {a.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {a.location}
                        </span>
                        <span className="italic">{a.agent}</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/afspraken/${a.id}`}
                      className="text-xs link-underline shrink-0 self-center text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    >
                      Details →
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
        {grouped.size === 0 && (
          <div className="p-10 text-center text-sm text-[var(--color-mute)]"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen afspraken in deze periode.
          </div>
        )}
      </section>

      {/* Recente / voltooide afspraken */}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm uppercase tracking-[0.16em] text-[var(--color-mute)] mb-3">
            Recent voltooid
          </h2>
          <div
            className="overflow-x-auto"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
          >
            <table className="w-full text-sm">
              <tbody>
                {past.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: 'var(--color-line)' }}>
                    <td className="px-4 py-3 text-xs text-[var(--color-mute)]">
                      {new Date(a.start).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">{a.title}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-mute)]">{a.clientName}</td>
                    <td className="px-4 py-3"><AppointmentStatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = {
    planned:   { bg: 'rgba(115,115,115,0.15)', fg: '#525252', icon: <Clock className="size-3" /> },
    confirmed: { bg: 'rgba(11,79,88,0.15)',    fg: '#0b4f58', icon: <Check className="size-3" /> },
    completed: { bg: 'rgba(34,197,94,0.18)',   fg: '#14532d', icon: <Check className="size-3" /> },
    cancelled: { bg: 'rgba(239,68,68,0.10)',   fg: '#b91c1c', icon: <X className="size-3" /> },
  }[status]
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.icon}
      {STATUS_LABEL[status]}
    </span>
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
