import Link from 'next/link'
import { FolderOpen, Plus, AlertCircle, Download } from 'lucide-react'
import { DossierBulkGrid } from './bulk-grid'
import { getAdminDossiers, getTeamMembers } from '@/lib/admin-db'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/listings'
import { DonutChart } from '@/components/admin/charts'

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
  const tagFilter = (params.tag as string | undefined) ?? ''
  const assigneeFilter = (params.assignee as string | undefined) ?? 'alle'

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const [{ items: allDossiers, error }, { items: team }] = await Promise.all([
    getAdminDossiers(),
    getTeamMembers(currentUser?.id),
  ])

  let dossiers = [...allDossiers]
  if (statusFilter === 'open_lopend') {
    dossiers = dossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
  } else if (statusFilter !== 'alle') {
    dossiers = dossiers.filter((d) => d.status === statusFilter)
  }
  if (typeFilter !== 'alle') dossiers = dossiers.filter((d) => d.type === typeFilter)
  if (tagFilter) dossiers = dossiers.filter((d) => d.tags.includes(tagFilter))
  if (assigneeFilter === 'mij' && currentUser) {
    dossiers = dossiers.filter((d) => d.assignedTo === currentUser.id)
  } else if (assigneeFilter === 'niemand') {
    dossiers = dossiers.filter((d) => !d.assignedTo)
  } else if (assigneeFilter !== 'alle') {
    dossiers = dossiers.filter((d) => d.assignedTo === assigneeFilter)
  }

  const tagCounts = new Map<string, number>()
  for (const d of allDossiers) {
    for (const t of d.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  }
  const allTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  const byType = [
    { name: 'Verkoop',     value: allDossiers.filter((d) => d.type === 'verkoop').length,     color: '#0b4f58' },
    { name: 'Verhuur',     value: allDossiers.filter((d) => d.type === 'verhuur').length,     color: '#8c6b2e' },
    { name: 'Koop-zoeker', value: allDossiers.filter((d) => d.type === 'koop_zoeker').length, color: '#a25b3a' },
    { name: 'Huur-zoeker', value: allDossiers.filter((d) => d.type === 'huur_zoeker').length, color: '#5a7a48' },
  ].filter((d) => d.value > 0)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Dossiers</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <FolderOpen className="size-7" style={{ color: 'var(--color-accent)' }} />
            Dossiers <span className="text-[var(--color-mute)] text-2xl">({allDossiers.length})</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/dossiers/export?status=${encodeURIComponent(statusFilter)}`}
            className="inline-flex items-center gap-2 px-3 py-2.5 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
            title="Download alle gefilterde dossiers met commissies als CSV (Excel-compatibel)"
          >
            <Download className="size-3.5" />
            Export CSV
          </a>
          <Link
            href="/admin/dossiers/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Plus className="size-3.5" />
            Nieuw dossier
          </Link>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 p-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>Kon dossiers niet laden: {error}</span>
        </div>
      )}

      {/* Stats */}
      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per type</h3>
          {byType.length > 0 ? (
            <DonutChart data={byType} total={allDossiers.length} centerLabel="dossiers" />
          ) : (
            <p className="text-sm text-[var(--color-mute)] py-12 text-center">Nog geen dossiers.</p>
          )}
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniStat label="Open"        value={allDossiers.filter((d) => d.status === 'open').length} accent="#16a34a" />
          <MiniStat label="In behandeling" value={allDossiers.filter((d) => d.status === 'in_behandeling').length} accent="#0b4f58" />
          <MiniStat label="Onder optie" value={allDossiers.filter((d) => d.status === 'onder_optie').length} accent="#c98c4f" />
          <MiniStat label="Afgesloten"  value={allDossiers.filter((d) => ['verkocht','verhuurd','geannuleerd'].includes(d.status)).length} accent="#9b6e7b" />
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
          otherKeyValues={{ type: typeFilter, tag: tagFilter, assignee: assigneeFilter }}
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
          otherKeyValues={{ status: statusFilter, tag: tagFilter, assignee: assigneeFilter }}
        />
        <FilterPills
          label="Eigenaar"
          options={[
            { value: 'alle',    label: 'Alle' },
            { value: 'mij',     label: 'Mijn' },
            { value: 'niemand', label: 'Niet toegewezen' },
            ...team.filter((m) => m.active && m.id !== currentUser?.id).map((m) => ({
              value: m.id,
              label: m.firstName || m.email.split('@')[0],
            })),
          ]}
          current={assigneeFilter}
          queryKey="assignee"
          otherKeyValues={{ status: statusFilter, type: typeFilter, tag: tagFilter }}
        />
        {allTags.length > 0 && (
          <div className="inline-flex items-center gap-1 flex-wrap basis-full mt-1">
            <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-mute)] mr-1">Tag:</span>
            <Link
              href={(() => {
                const p = new URLSearchParams()
                if (statusFilter !== 'alle') p.set('status', statusFilter)
                if (typeFilter !== 'alle') p.set('type', typeFilter)
                if (assigneeFilter !== 'alle') p.set('assignee', assigneeFilter)
                return `?${p.toString()}`
              })()}
              className="px-2 py-1 text-[0.65rem] transition-colors"
              style={{
                background: tagFilter === '' ? 'var(--color-ink)' : 'transparent',
                color: tagFilter === '' ? 'var(--color-paper)' : 'var(--color-mute)',
                border: tagFilter === '' ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
              }}
            >
              Alle
            </Link>
            {allTags.map(([t, n]) => {
              const p = new URLSearchParams()
              if (statusFilter !== 'alle') p.set('status', statusFilter)
              if (typeFilter !== 'alle') p.set('type', typeFilter)
              if (assigneeFilter !== 'alle') p.set('assignee', assigneeFilter)
              p.set('tag', t)
              const active = tagFilter === t
              return (
                <Link
                  key={t}
                  href={`?${p.toString()}`}
                  className="px-2 py-1 text-[0.65rem] transition-colors inline-flex items-center gap-1"
                  style={{
                    background: active ? 'var(--color-ink)' : 'transparent',
                    color: active ? 'var(--color-paper)' : 'var(--color-mute)',
                    border: active ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
                  }}
                >
                  {t}
                  <span className="opacity-60">({n})</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* List */}
      {dossiers.length === 0 ? (
        <div className="p-10 text-center text-sm text-[var(--color-mute)]"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          {allDossiers.length === 0
            ? 'Nog geen dossiers. Maak er een aan via "+ Nieuw dossier".'
            : 'Geen dossiers voor deze filters.'}
        </div>
      ) : (
        <DossierBulkGrid
          assignOptions={team.map((m) => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`.trim() || m.email,
            active: m.active,
          }))}
          dossiers={dossiers.map((d) => ({
            id: d.id,
            ref: d.ref,
            clientName: d.clientName,
            type: d.type,
            status: d.status,
            propertyAddress: d.propertyAddress,
            propertyCity: d.propertyCity,
            askingPrice: d.askingPrice,
            openedAt: d.openedAt,
            appointmentsCount: d.appointmentsCount,
            documentsCount: d.documentsCount,
            tags: d.tags,
            assignedToName: d.assignedTo === currentUser?.id ? 'Jij' : d.assignedToName,
          }))}
        />
      )}
    </div>
  )
}


function MiniStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="p-4" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-[0.55rem]">{label}</span>
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
      </div>
      <p className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
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
