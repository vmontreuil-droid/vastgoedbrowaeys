import Image from 'next/image'
import Link from 'next/link'
import {
  Radar, MapPin, Tag, Building2, User as UserIcon, Settings, Layers, Stethoscope,
} from 'lucide-react'
import { getMarketLeads, type MarketLead, type MarketLeadStatus } from '@/lib/admin-db'
import { formatPrice } from '@/lib/listings'
import { AddUrlForm } from './add-url-form'
import { ScanAllButton } from './scan-all-button'

export const metadata = {
  title: 'Admin · Marktmonitor',
}

const STATUS_LABEL: Record<MarketLeadStatus, string> = {
  prospect: 'Prospect',
  benaderd: 'Benaderd',
  afspraak: 'Afspraak gepland',
  klant: 'Klant geworden',
  niet_geinteresseerd: 'Niet geïnteresseerd',
  reeds_verkocht: 'Reeds verkocht',
}

const STATUS_COLOR: Record<MarketLeadStatus, { bg: string; fg: string }> = {
  prospect:            { bg: 'rgba(11,79,88,0.12)',   fg: '#0b4f58' },
  benaderd:            { bg: 'rgba(201,140,79,0.18)', fg: '#92400e' },
  afspraak:            { bg: 'rgba(11,79,88,0.18)',   fg: '#0b4f58' },
  klant:               { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  niet_geinteresseerd: { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
  reeds_verkocht:      { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
}

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function MarktmonitorPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const statusFilter = (params.status as string | undefined) ?? 'open'
  const cityFilter = (params.city as string | undefined) ?? ''
  const typeFilter = (params.type as string | undefined) ?? 'alle'

  const { items: allLeads, error } = await getMarketLeads()

  let leads = [...allLeads]
  if (statusFilter === 'open') {
    leads = leads.filter((l) => ['prospect', 'benaderd', 'afspraak'].includes(l.status))
  } else if (statusFilter !== 'alle') {
    leads = leads.filter((l) => l.status === statusFilter)
  }
  if (cityFilter) {
    const needle = cityFilter.toLowerCase()
    leads = leads.filter((l) =>
      l.city?.toLowerCase().includes(needle) ||
      l.postcode?.includes(cityFilter)
    )
  }
  if (typeFilter !== 'alle') leads = leads.filter((l) => l.listingType === typeFilter)

  // Gemeenten-suggesties (top 8 op aantal)
  const cityCounts = new Map<string, number>()
  for (const l of allLeads) {
    if (!l.city) continue
    cityCounts.set(l.city, (cityCounts.get(l.city) ?? 0) + 1)
  }
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const stats = {
    prospect: allLeads.filter((l) => l.status === 'prospect').length,
    benaderd: allLeads.filter((l) => l.status === 'benaderd').length,
    klant: allLeads.filter((l) => l.status === 'klant').length,
    particulier: allLeads.filter((l) => l.isParticulier).length,
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Marktmonitor</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl flex items-center gap-3">
            <Radar className="size-6 md:size-7" style={{ color: 'var(--color-accent)' }} />
            Marktmonitor <span className="text-[var(--color-mute)] text-xl md:text-2xl">({allLeads.length})</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
            Dagelijks geautomatiseerd overzicht van panden in jouw zones — uit Immoweb, Zimmo,
            Realo, Immo Vlaanderen, Hebbes en Logic-Immo. Plus manuele URL-toevoeging.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/marktmonitor/regions"
            className="inline-flex items-center gap-2 px-3 py-2.5 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
          >
            <Settings className="size-3.5" />
            Mijn zones
          </Link>
          <Link
            href="/admin/marktmonitor/diagnose"
            className="inline-flex items-center gap-2 px-3 py-2.5 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
            title="Test of de scrapers werken vanaf de server"
          >
            <Stethoscope className="size-3.5" />
            Diagnose
          </Link>
          <ScanAllButton />
        </div>
      </section>

      {error && (
        <div className="p-3 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Prospects" value={stats.prospect} />
        <MiniStat label="Benaderd" value={stats.benaderd} accent="#c98c4f" />
        <MiniStat label="Klant geworden" value={stats.klant} accent="#16a34a" />
        <MiniStat label="Particulier" value={stats.particulier} />
      </section>

      <AddUrlForm />

      {/* Filters */}
      <section className="p-3 md:p-4 mb-5 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <FilterPills
          label="Status"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'alle', label: 'Alle' },
            { value: 'prospect', label: 'Prospect' },
            { value: 'benaderd', label: 'Benaderd' },
            { value: 'afspraak', label: 'Afspraak' },
            { value: 'klant', label: 'Klant' },
            { value: 'niet_geinteresseerd', label: 'Niet' },
            { value: 'reeds_verkocht', label: 'Verkocht' },
          ]}
          current={statusFilter}
          queryKey="status"
          otherKeyValues={{ city: cityFilter, type: typeFilter }}
        />
        <FilterPills
          label="Type"
          options={[
            { value: 'alle', label: 'Alle' },
            { value: 'verkoop', label: 'Verkoop' },
            { value: 'verhuur', label: 'Verhuur' },
            { value: 'onbekend', label: 'Onbekend' },
          ]}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ status: statusFilter, city: cityFilter }}
        />
        {topCities.length > 0 && (
          <div className="inline-flex items-center gap-1 flex-wrap basis-full mt-1">
            <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-mute)] mr-1">Gemeente:</span>
            <CityPill label="Alle" target="" current={cityFilter} other={{ status: statusFilter, type: typeFilter }} />
            {topCities.map(([city, n]) => (
              <CityPill key={city} label={city} count={n} target={city} current={cityFilter} other={{ status: statusFilter, type: typeFilter }} />
            ))}
          </div>
        )}
      </section>

      {/* Lijst */}
      {leads.length === 0 ? (
        <div className="p-10 text-center text-sm text-[var(--color-mute)]"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          {allLeads.length === 0
            ? 'Nog geen panden in je marktmonitor. Plak een URL hierboven om te beginnen.'
            : 'Geen resultaten voor deze filters.'}
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </ul>
      )}
    </div>
  )
}

function LeadCard({ lead }: { lead: MarketLead }) {
  const statusColor = STATUS_COLOR[lead.status]
  return (
    <li>
      <Link
        href={`/admin/marktmonitor/${lead.id}`}
        className="block overflow-hidden transition-shadow hover:shadow-sm h-full"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <div className="relative aspect-[4/3]" style={{ background: 'var(--color-paper-2)' }}>
          {lead.imageUrl ? (
            <Image
              src={lead.imageUrl}
              alt={lead.title ?? 'Pand'}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Building2 className="size-10 text-[var(--color-mute)]" />
            </div>
          )}
          <span
            className="absolute top-2 right-2 inline-block px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
            style={{ background: statusColor.bg, color: statusColor.fg, backdropFilter: 'blur(8px)' }}
          >
            {STATUS_LABEL[lead.status]}
          </span>
          {lead.isParticulier && (
            <span
              className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
              style={{ background: '#16a34a', color: '#fff' }}
            >
              <UserIcon className="size-2.5" />
              Particulier
            </span>
          )}
        </div>
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.1em] text-[var(--color-mute)]">
            <span className="inline-flex items-center gap-1">
              {lead.sourceSite ?? '—'}
              {lead.extraSourceUrls.length > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 normal-case tracking-normal text-[0.55rem]"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                  title={`Ook gevonden op ${lead.extraSourceUrls.length} ander(e) site(s)`}>
                  <Layers className="size-2" />
                  +{lead.extraSourceUrls.length}
                </span>
              )}
            </span>
            <span>{lead.listingType === 'verkoop' ? 'Te koop' : lead.listingType === 'verhuur' ? 'Te huur' : 'Onbekend'}</span>
          </div>
          {lead.price && (
            <p className="mt-1 text-base md:text-lg italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
              {formatPrice(lead.price)}
              {lead.listingType === 'verhuur' && <span className="text-xs text-[var(--color-mute)]"> / maand</span>}
            </p>
          )}
          <p className="mt-1 text-sm truncate">
            {[lead.street, lead.postcode, lead.city].filter(Boolean).join(' · ') || lead.title || 'Adres onbekend'}
          </p>
          <div className="mt-2 flex items-center justify-between text-[0.65rem] text-[var(--color-mute)]">
            <span className="inline-flex items-center gap-1 truncate">
              {lead.propertyType && <><Tag className="size-3" />{lead.propertyType}</>}
            </span>
            {lead.agentName && (
              <span className="truncate text-right max-w-[60%]" title={lead.agentName}>{lead.agentName}</span>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="p-3 md:p-4" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="eyebrow text-[0.55rem]">{label}</span>
        {accent && <span className="size-1.5 rounded-full" style={{ background: accent }} />}
      </div>
      <p className="text-xl md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
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
        const p = new URLSearchParams()
        Object.entries(otherKeyValues).forEach(([k, v]) => { if (v && v !== 'alle') p.set(k, v) })
        if (o.value !== 'alle' && o.value !== 'open') p.set(queryKey, o.value)
        else if (o.value === 'alle') p.set(queryKey, 'alle')
        const href = `?${p.toString()}`
        const active = o.value === current
        return (
          <Link key={o.value} href={href}
            className="px-2 py-1 text-[0.65rem] transition-colors"
            style={{
              background: active ? 'var(--color-ink)' : 'transparent',
              color: active ? 'var(--color-paper)' : 'var(--color-mute)',
              border: active ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
            }}>
            {o.label}
          </Link>
        )
      })}
    </div>
  )
}

function CityPill({
  label, count, target, current, other,
}: {
  label: string
  count?: number
  target: string
  current: string
  other: Record<string, string>
}) {
  const p = new URLSearchParams()
  Object.entries(other).forEach(([k, v]) => { if (v && v !== 'alle') p.set(k, v) })
  if (target) p.set('city', target)
  const active = current === target
  return (
    <Link href={`?${p.toString()}`}
      className="px-2 py-1 text-[0.65rem] transition-colors inline-flex items-center gap-1"
      style={{
        background: active ? 'var(--color-ink)' : 'transparent',
        color: active ? 'var(--color-paper)' : 'var(--color-mute)',
        border: active ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
      }}>
      <MapPin className="size-2.5" />
      {label}
      {count != null && <span className="opacity-60">({count})</span>}
    </Link>
  )
}
