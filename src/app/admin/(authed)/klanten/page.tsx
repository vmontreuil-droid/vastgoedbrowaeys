import Link from 'next/link'
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, ArrowRight, AlertCircle, Download } from 'lucide-react'
import { getAdminClients, getAdminDossiers } from '@/lib/admin-db'
import { DonutChart } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Klanten',
}

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = (params.q as string | undefined)?.toLowerCase() ?? ''
  const statusFilter = (params.status as string | undefined) ?? 'alle'
  const kindFilter = (params.kind as string | undefined) ?? 'alle'

  const [{ items: allClients, error: clientsErr }, { items: allDossiers }] =
    await Promise.all([getAdminClients(), getAdminDossiers()])

  let clients = [...allClients]
  if (statusFilter !== 'alle') clients = clients.filter((c) => c.status === statusFilter)
  if (kindFilter !== 'alle') clients = clients.filter((c) => c.kinds.includes(kindFilter))
  if (q) {
    clients = clients.filter((c) =>
      ((c.firstName + ' ' + c.lastName + ' ' + c.email + ' ' + (c.city ?? '')).toLowerCase()).includes(q),
    )
  }

  const totalDossiersByClient = new Map<string, number>()
  allDossiers.forEach((d) => totalDossiersByClient.set(d.clientId, (totalDossiersByClient.get(d.clientId) ?? 0) + 1))

  const byStatus = [
    { name: 'Actief',   value: allClients.filter((c) => c.status === 'actief').length,   color: '#0b4f58' },
    { name: 'Lead',     value: allClients.filter((c) => c.status === 'lead').length,     color: '#c98c4f' },
    { name: 'Inactief', value: allClients.filter((c) => c.status === 'inactief').length, color: '#9b6e7b' },
  ].filter((d) => d.value > 0)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Klanten</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Users className="size-7" style={{ color: 'var(--color-accent)' }} />
            Klanten <span className="text-[var(--color-mute)] text-2xl">({allClients.length})</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/klanten/export?status=${encodeURIComponent(statusFilter)}&kind=${encodeURIComponent(kindFilter)}`}
            className="inline-flex items-center gap-2 px-3 py-2.5 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
            title="Download de huidige gefilterde klantenlijst als CSV (Excel-compatibel, GDPR-data)"
          >
            <Download className="size-3.5" />
            Export CSV
          </a>
          <Link
            href="/admin/klanten/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Plus className="size-3.5" />
            Nieuwe klant
          </Link>
        </div>
      </section>

      {clientsErr && (
        <div
          className="flex items-start gap-3 p-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>Kon klant-lijst niet volledig laden: {clientsErr}</span>
        </div>
      )}

      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <MiniStat label="Verkopers"   value={allClients.filter((c) => c.kinds.includes('verkoper')).length}   accent="#0b4f58" />
          <MiniStat label="Kopers"      value={allClients.filter((c) => c.kinds.includes('koper')).length}      accent="#8c6b2e" />
          <MiniStat label="Huur"        value={allClients.filter((c) => c.kinds.includes('huurder') || c.kinds.includes('verhuurder')).length} accent="#5a7a48" />
          <MiniStat label="Leads"       value={allClients.filter((c) => c.status === 'lead').length}            accent="#c98c4f" />
          <MiniStat label="Met dossier" value={Array.from(totalDossiersByClient.keys()).length}                 accent="#0b4f58" />
          <MiniStat label="Inactief"    value={allClients.filter((c) => c.status === 'inactief').length}        accent="#9b6e7b" />
        </div>
        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Verdeling</h3>
          {byStatus.length > 0 ? (
            <DonutChart data={byStatus} centerLabel="klanten" />
          ) : (
            <p className="text-sm text-[var(--color-mute)] py-12 text-center">Nog geen klanten.</p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <form className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="size-4 text-[var(--color-mute)]" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Zoek op naam, email of stad…"
            className="flex-1 px-2 py-1.5 text-sm bg-transparent focus:outline-none"
          />
          {statusFilter !== 'alle' && <input type="hidden" name="status" value={statusFilter} />}
          {kindFilter !== 'alle' && <input type="hidden" name="kind" value={kindFilter} />}
        </form>
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-[var(--color-mute)]" />
          <FilterPills
            label="Status"
            options={[
              { value: 'alle', label: 'Alle' },
              { value: 'actief', label: 'Actief' },
              { value: 'lead', label: 'Lead' },
              { value: 'inactief', label: 'Inactief' },
            ]}
            current={statusFilter}
            queryKey="status"
            otherKeyValues={{ q, kind: kindFilter }}
          />
          <FilterPills
            label="Type"
            options={[
              { value: 'alle', label: 'Alle' },
              { value: 'koper', label: 'Koper' },
              { value: 'verkoper', label: 'Verkoper' },
              { value: 'huurder', label: 'Huurder' },
              { value: 'verhuurder', label: 'Verhuurder' },
            ]}
            current={kindFilter}
            queryKey="kind"
            otherKeyValues={{ q, status: statusFilter }}
          />
        </div>
      </section>

      <section>
        <div
          className="overflow-x-auto"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-paper-2)' }}>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem]">Naam</th>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem]">Status</th>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem]">Type</th>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem]">Contact</th>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem] hidden md:table-cell">Stad</th>
                <th className="text-left px-4 py-3 eyebrow text-[0.55rem] hidden md:table-cell">Aangemaakt</th>
                <th className="text-right px-4 py-3 eyebrow text-[0.55rem]">Dossiers</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const dossierCount = totalDossiersByClient.get(c.id) ?? 0
                return (
                  <tr key={c.id} className="border-t" style={{ borderColor: 'var(--color-line)' }}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/klanten/${c.id}`} className="link-underline">
                        {c.firstName || c.lastName ? `${c.firstName} ${c.lastName}`.trim() : c.email}
                      </Link>
                      {!c.hasAuthAccount && (
                        <span className="ml-2 text-[0.55rem] uppercase tracking-[0.1em] text-[var(--color-mute)]">geen login</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-mute)]">
                      {c.kinds.length > 0 ? c.kinds.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2 text-[var(--color-ink)] truncate max-w-[200px]">
                        <Mail className="size-3 shrink-0 text-[var(--color-mute)]" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-2 text-[var(--color-mute)] mt-0.5">
                          <Phone className="size-3 shrink-0" />
                          {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell text-[var(--color-mute)]">
                      {c.city ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {c.city}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-mute)] hidden md:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {dossierCount > 0 ? (
                        <span
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[0.65rem]"
                          style={{ background: 'var(--color-paper-2)' }}
                        >
                          {dossierCount}
                        </span>
                      ) : (
                        <span className="text-[var(--color-mute)] text-xs">—</span>
                      )}
                    </td>
                    <td className="pr-4">
                      <Link href={`/admin/klanten/${c.id}`}>
                        <ArrowRight className="size-4 text-[var(--color-mute)] hover:text-[var(--color-ink)]" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--color-mute)]">
                    {allClients.length === 0
                      ? 'Nog geen klanten. Maak er een aan via "+ Nieuwe klant".'
                      : 'Geen klanten gevonden voor deze filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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

function StatusBadge({ status }: { status: 'actief' | 'inactief' | 'lead' }) {
  const cfg = {
    actief:   { bg: 'rgba(34,197,94,0.15)',  fg: '#166534', label: 'Actief' },
    lead:     { bg: 'rgba(201,140,79,0.18)', fg: '#92400e', label: 'Lead' },
    inactief: { bg: 'rgba(115,115,115,0.18)',fg: '#525252', label: 'Inactief' },
  }[status]
  return (
    <span
      className="inline-block px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.label}
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
    <div className="inline-flex items-center gap-1">
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
