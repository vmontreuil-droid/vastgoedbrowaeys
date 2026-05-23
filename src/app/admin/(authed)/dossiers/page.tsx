import Link from 'next/link'
import { FolderOpen, Plus, ArrowRight, Hash, Check, Clock, X } from 'lucide-react'
import { DOSSIERS, formatDate } from '@/data/admin-mock'
import { formatPrice } from '@/lib/listings'
import { DonutChart, StackedBars } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Dossiers',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

export default async function DossiersPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const statusFilter = (params.status as string | undefined) ?? 'open_lopend'
  const typeFilter = (params.type as string | undefined) ?? 'alle'
  const agentFilter = (params.agent as string | undefined) ?? 'alle'

  let dossiers = [...DOSSIERS]
  if (statusFilter === 'open_lopend') {
    dossiers = dossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
  } else if (statusFilter !== 'alle') {
    dossiers = dossiers.filter((d) => d.status === statusFilter)
  }
  if (typeFilter !== 'alle') dossiers = dossiers.filter((d) => d.type === typeFilter)
  if (agentFilter !== 'alle') dossiers = dossiers.filter((d) => d.agent === agentFilter)
  dossiers.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())

  // Donut per type
  const byType = [
    { name: 'Verkoop',     value: DOSSIERS.filter((d) => d.type === 'verkoop').length,     color: '#0b4f58' },
    { name: 'Verhuur',     value: DOSSIERS.filter((d) => d.type === 'verhuur').length,     color: '#8c6b2e' },
    { name: 'Koop-zoeker', value: DOSSIERS.filter((d) => d.type === 'koop_zoeker').length, color: '#a25b3a' },
    { name: 'Huur-zoeker', value: DOSSIERS.filter((d) => d.type === 'huur_zoeker').length, color: '#5a7a48' },
  ].filter((d) => d.value > 0)

  // Stacked bars: dossiers geopend per maand
  const monthly = ['Dec', 'Jan', 'Feb', 'Mrt', 'Apr', 'Mei'].map((m, i) => ({
    x: m,
    Verkoop:     [1, 0, 2, 1, 0, 1][i],
    Verhuur:     [1, 0, 0, 0, 0, 0][i],
    'Koop-zoeker': [0, 0, 1, 1, 1, 0][i],
    'Huur-zoeker': [0, 0, 0, 1, 0, 0][i],
  }))

  const agents = Array.from(new Set(DOSSIERS.map((d) => d.agent)))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Dossiers</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <FolderOpen className="size-7" style={{ color: 'var(--color-accent)' }} />
            Dossiers <span className="text-[var(--color-mute)] text-2xl">({DOSSIERS.length})</span>
          </h1>
        </div>
        <Link
          href="/admin/dossiers/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-3.5" />
          Nieuw dossier
        </Link>
      </section>

      {/* Stats + chart */}
      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <div
          className="p-5"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per type</h3>
          <DonutChart data={byType} total={DOSSIERS.length} centerLabel="dossiers" />
        </div>
        <div
          className="lg:col-span-2 p-5"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Geopend per maand</h3>
          <StackedBars data={monthly} dataKeys={[
            { key: 'Verkoop',      label: 'Verkoop',      color: '#0b4f58' },
            { key: 'Verhuur',      label: 'Verhuur',      color: '#8c6b2e' },
            { key: 'Koop-zoeker',  label: 'Koop-zoeker',  color: '#a25b3a' },
            { key: 'Huur-zoeker',  label: 'Huur-zoeker',  color: '#5a7a48' },
          ]} height={240} />
        </div>
      </section>

      {/* Filters */}
      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <FilterPills
          label="Status"
          options={[
            { value: 'open_lopend',    label: 'Lopend' },
            { value: 'alle',           label: 'Alle' },
            { value: 'open',           label: 'Open' },
            { value: 'in_behandeling', label: 'In behandeling' },
            { value: 'onder_optie',    label: 'Onder optie' },
            { value: 'verkocht',       label: 'Verkocht' },
            { value: 'verhuurd',       label: 'Verhuurd' },
          ]}
          current={statusFilter}
          queryKey="status"
          otherKeyValues={{ type: typeFilter, agent: agentFilter }}
        />
        <FilterPills
          label="Type"
          options={[
            { value: 'alle', label: 'Alle' },
            { value: 'verkoop', label: 'Verkoop' },
            { value: 'verhuur', label: 'Verhuur' },
            { value: 'koop_zoeker', label: 'Koper' },
            { value: 'huur_zoeker', label: 'Huurder' },
          ]}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ status: statusFilter, agent: agentFilter }}
        />
        <FilterPills
          label="Werknemer"
          options={[
            { value: 'alle', label: 'Iedereen' },
            ...agents.map((a) => ({ value: a, label: a })),
          ]}
          current={agentFilter}
          queryKey="agent"
          otherKeyValues={{ status: statusFilter, type: typeFilter }}
        />
      </section>

      {/* List */}
      <section className="grid lg:grid-cols-2 gap-4">
        {dossiers.map((d) => {
          const doneSteps = d.steps.filter((s) => s.doneAt).length
          const totalSteps = d.steps.length
          const progress = (doneSteps / totalSteps) * 100
          return (
            <Link
              key={d.id}
              href={`/admin/dossiers/${d.id}`}
              className="p-5 transition-all hover:shadow-sm"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                    <Hash className="size-3" />
                    {d.ref}
                    <span>·</span>
                    <span>{TYPE_LABEL[d.type]}</span>
                  </div>
                  <p className="mt-1.5 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {d.property || `Zoekopdracht — ${d.clientName}`}
                  </p>
                  {d.propertyCity && (
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">{d.propertyCity}</p>
                  )}
                </div>
                <DossierStatusBadge status={d.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-3 my-3 border-y" style={{ borderColor: 'var(--color-line)' }}>
                <StatTiny label="Klant" value={d.clientName} />
                <StatTiny
                  label={d.type === 'verkoop' || d.type === 'verhuur' ? 'Vraagprijs' : 'Budget'}
                  value={d.askingPrice ? formatPrice(d.askingPrice) : '—'}
                />
                <StatTiny label="Werknemer" value={d.agent} />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                    Stappen
                  </span>
                  <span className="text-xs text-[var(--color-mute)]">{doneSteps} / {totalSteps}</span>
                </div>
                <div className="h-1.5 w-full" style={{ background: 'var(--color-paper-2)' }}>
                  <div
                    className="h-full"
                    style={{
                      background: 'var(--color-accent)',
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-mute)] mt-3">
                <span>Geopend {formatDate(d.openedAt)}</span>
                <div className="flex items-center gap-3">
                  <span title="Afspraken">📅 {d.appointmentsCount}</span>
                  <span title="Documenten">📄 {d.documentsCount}</span>
                  <span title="Biedingen">💼 {d.offersCount}</span>
                </div>
              </div>
            </Link>
          )
        })}
        {dossiers.length === 0 && (
          <div className="lg:col-span-2 p-10 text-center text-sm text-[var(--color-mute)]"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen dossiers voor deze filters.
          </div>
        )}
      </section>
    </div>
  )
}

function DossierStatusBadge({ status }: { status: string }) {
  const cfg = {
    open:            { bg: 'rgba(34,197,94,0.15)',  fg: '#166534', icon: <Clock className="size-3" /> },
    in_behandeling:  { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58', icon: <Clock className="size-3" /> },
    onder_optie:     { bg: 'rgba(201,140,79,0.20)', fg: '#92400e', icon: <Clock className="size-3" /> },
    verkocht:        { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d', icon: <Check className="size-3" /> },
    verhuurd:        { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d', icon: <Check className="size-3" /> },
    geannuleerd:     { bg: 'rgba(115,115,115,0.18)',fg: '#525252', icon: <X className="size-3" /> },
  }[status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252', icon: <Clock className="size-3" /> }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.icon}
      {STATUS_LABEL[status]}
    </span>
  )
}

function StatTiny({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">{label}</p>
      <p className="mt-0.5 truncate">{value}</p>
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
