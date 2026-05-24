import Link from 'next/link'
import {
  Radar, Plus, ArrowLeft, MapPin, Tag, Banknote, Power, Pencil, PlayCircle, Building2,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { RegionRowActions } from './row-actions'

export const metadata = {
  title: 'Admin · Marktmonitor · Zones',
}

type RegionRow = {
  id: string
  label: string
  postcodes: string[] | null
  cities: string[] | null
  listing_type: 'verkoop' | 'verhuur' | 'beide'
  min_price: number | null
  max_price: number | null
  property_types: string[] | null
  enabled: boolean
  last_scan_at: string | null
  last_scan_count: number | null
}

export default async function MarktmonitorRegionsPage() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('market_search_regions')
    .select('*')
    .order('enabled', { ascending: false })
    .order('created_at', { ascending: false })

  const regions = (data ?? []) as RegionRow[]

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-4 md:mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Marktmonitor</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl flex items-center gap-3">
            <Radar className="size-6 md:size-7" style={{ color: 'var(--color-accent)' }} />
            Mijn zones <span className="text-[var(--color-mute)] text-xl md:text-2xl">({regions.length})</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
            Stel de gebieden in die je dagelijks automatisch wil opvolgen. Per zone scant het
            systeem Immoweb, Zimmo, Realo, Immo Vlaanderen, Hebbes en Logic-Immo.
          </p>
        </div>
        <Link href="/admin/marktmonitor/regions/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          <Plus className="size-3.5" />
          Nieuwe zone
        </Link>
      </section>

      {error && (
        <p className="p-3 mb-6 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          {error.message}
        </p>
      )}

      {regions.length === 0 ? (
        <div className="p-10 text-center text-sm text-[var(--color-mute)]"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen zones ingesteld. Klik <em>Nieuwe zone</em> om je eerste gebied te definiëren.
        </div>
      ) : (
        <ul className="grid gap-3">
          {regions.map((r) => (
            <RegionCard key={r.id} region={r} />
          ))}
        </ul>
      )}
    </div>
  )
}

function RegionCard({ region }: { region: RegionRow }) {
  const locations = [...(region.postcodes ?? []), ...(region.cities ?? [])]

  return (
    <li className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
        opacity: region.enabled ? 1 : 0.6,
      }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}>
              <Radar className="size-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
              {region.label}
            </h3>
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--color-mute)] mt-0.5">
              {region.listing_type === 'verkoop' ? 'Te koop' :
                region.listing_type === 'verhuur' ? 'Te huur' : 'Te koop + te huur'}
              {region.enabled ? '' : ' · gepauzeerd'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
            style={{
              background: region.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(115,115,115,0.18)',
              color: region.enabled ? '#166534' : '#525252',
            }}>
            <Power className="size-2.5" />
            {region.enabled ? 'Actief' : 'Uit'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {locations.length === 0 && (
            <span className="text-[0.65rem] italic text-[var(--color-mute)]">Geen locaties</span>
          )}
          {locations.slice(0, 12).map((loc) => (
            <span key={loc} className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.65rem]"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              <MapPin className="size-2.5 text-[var(--color-mute)]" />
              {loc}
            </span>
          ))}
          {locations.length > 12 && (
            <span className="text-[0.65rem] text-[var(--color-mute)]">+ {locations.length - 12}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[0.7rem] text-[var(--color-mute)]">
          {(region.min_price || region.max_price) && (
            <span className="inline-flex items-center gap-1">
              <Banknote className="size-3" />
              {region.min_price ? `€${region.min_price.toLocaleString('nl-BE')}` : '—'}
              {' → '}
              {region.max_price ? `€${region.max_price.toLocaleString('nl-BE')}` : '—'}
            </span>
          )}
          {region.property_types && region.property_types.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3" />
              {region.property_types.length} type{region.property_types.length === 1 ? '' : 's'}
            </span>
          )}
          {region.last_scan_at && (
            <span className="inline-flex items-center gap-1">
              <PlayCircle className="size-3" />
              Laatste scan: {new Date(region.last_scan_at).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {region.last_scan_count != null && ` · ${region.last_scan_count} listings`}
            </span>
          )}
        </div>
      </div>

      <div className="flex md:flex-col items-center gap-2 shrink-0">
        <RegionRowActions id={region.id} enabled={region.enabled} />
        <Link href={`/admin/marktmonitor/regions/${region.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          <Pencil className="size-3" />
          Bewerken
        </Link>
      </div>
    </li>
  )
}
