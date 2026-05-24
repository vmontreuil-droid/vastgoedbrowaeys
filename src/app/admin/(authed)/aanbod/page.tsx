import Link from 'next/link'
import { Home, Plus, Eye, Pencil, MapPin, AlertCircle } from 'lucide-react'
import { getDbListings, type ListingDb } from '@/lib/listings-db'
import { formatPrice } from '@/lib/listings'
import { DonutChart, SimpleLine } from '@/components/admin/charts'
import { ImportLegacyButton } from './import-legacy-button'

export const metadata = {
  title: 'Admin · Aanbod',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const STATUS_LABEL: Record<string, string> = {
  'te-koop': 'Te koop',
  'te-huur': 'Te huur',
  'optie':   'Onder optie',
  'verkocht':'Verkocht',
  'verhuurd':'Verhuurd',
  'concept': 'Concept',
}

export default async function AanbodPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const statusFilter = (params.status as string | undefined) ?? 'online'
  const typeFilter = (params.type as string | undefined) ?? 'alle'

  const all = await getDbListings()
  let filtered = [...all]

  if (statusFilter === 'online') {
    filtered = filtered.filter((l) => ['te-koop', 'te-huur', 'optie'].includes(l.status))
  } else if (statusFilter !== 'alle') {
    filtered = filtered.filter((l) => l.status === statusFilter)
  }
  if (typeFilter !== 'alle') filtered = filtered.filter((l) => l.type === typeFilter)

  const byStatus = [
    { name: 'Te koop',     value: all.filter((l) => l.status === 'te-koop').length,  color: '#0b4f58' },
    { name: 'Te huur',     value: all.filter((l) => l.status === 'te-huur').length,  color: '#5a7a48' },
    { name: 'Onder optie', value: all.filter((l) => l.status === 'optie').length,    color: '#c98c4f' },
    { name: 'Verkocht',    value: all.filter((l) => l.status === 'verkocht').length, color: '#9b6e7b' },
    { name: 'Verhuurd',    value: all.filter((l) => l.status === 'verhuurd').length, color: '#9b6e7b' },
    { name: 'Concept',     value: all.filter((l) => l.status === 'concept').length,  color: '#737373' },
  ].filter((d) => d.value > 0)

  const byType = [
    { name: 'Woning',      value: all.filter((l) => l.type === 'woning').length,      color: '#0b4f58' },
    { name: 'Appartement', value: all.filter((l) => l.type === 'appartement').length, color: '#8c6b2e' },
    { name: 'Bouwgrond',   value: all.filter((l) => l.type === 'bouwgrond').length,   color: '#5a7a48' },
    { name: 'Handelspand', value: all.filter((l) => l.type === 'handelspand').length, color: '#a25b3a' },
  ].filter((d) => d.value > 0)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Aanbod</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Home className="size-7" style={{ color: 'var(--color-accent)' }} />
            Aanbod <span className="text-[var(--color-mute)] text-2xl">({all.length})</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportLegacyButton />
          <Link
            href="/admin/aanbod/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Plus className="size-3.5" />
            Pand toevoegen
          </Link>
        </div>
      </section>

      {all.length === 0 && (
        <div className="flex items-start gap-3 p-4 mb-6 text-sm"
          style={{ background: 'rgba(11,79,88,0.08)', color: '#0b4f58' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>
            Nog geen panden in de DB. Klik op <strong>"Importeer Zabun-snapshot"</strong> hierboven om de 13 bestaande
            Zabun-panden in één keer in de DB te zetten — daarna kan je ze bewerken (foto's vervangen, prijzen
            wijzigen, etc.).
          </span>
        </div>
      )}

      {all.length > 0 && (
        <section className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per status</h3>
            <DonutChart data={byStatus} total={all.length} centerLabel="panden" />
          </div>
          <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per type</h3>
            <DonutChart data={byType} total={all.length} centerLabel="panden" />
          </div>
          <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Te koop vs te huur</h3>
            <SimpleLine
              data={[
                { x: 'Te koop', Aantal: all.filter((l) => l.status === 'te-koop').length },
                { x: 'Optie',   Aantal: all.filter((l) => l.status === 'optie').length },
                { x: 'Verkocht', Aantal: all.filter((l) => l.status === 'verkocht').length },
                { x: 'Te huur', Aantal: all.filter((l) => l.status === 'te-huur').length },
              ]}
              dataKeys={[{ key: 'Aantal', label: 'Aantal', color: '#0b4f58' }]}
              height={200}
            />
          </div>
        </section>
      )}

      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <FilterPills
          label="Status"
          options={[
            { value: 'online', label: 'Online' },
            { value: 'alle', label: 'Alle' },
            { value: 'te-koop', label: 'Te koop' },
            { value: 'te-huur', label: 'Te huur' },
            { value: 'optie', label: 'Onder optie' },
            { value: 'verkocht', label: 'Verkocht' },
            { value: 'concept', label: 'Concept' },
          ]}
          current={statusFilter}
          queryKey="status"
          otherKeyValues={{ type: typeFilter }}
        />
        <FilterPills
          label="Type"
          options={[
            { value: 'alle', label: 'Alle' },
            { value: 'woning', label: 'Woning' },
            { value: 'appartement', label: 'Appartement' },
            { value: 'bouwgrond', label: 'Bouwgrond' },
            { value: 'handelspand', label: 'Handelspand' },
          ]}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ status: statusFilter }}
        />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-10 text-center text-sm text-[var(--color-mute)]"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            {all.length === 0 ? 'Importeer eerst de Zabun-snapshot of voeg een nieuw pand toe.' : 'Geen panden voor deze filters.'}
          </div>
        )}
      </section>
    </div>
  )
}

function ListingCard({ listing: l }: { listing: ListingDb }) {
  const cover = l.cover_photo || l.gallery[0]
  return (
    <article
      className="overflow-hidden flex flex-col"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <Link href={`/admin/aanbod/${l.id}`} className="relative block aspect-[4/3]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={l.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ background: 'var(--color-paper-2)' }}>
            <span className="text-xs text-[var(--color-mute)] italic">Geen foto</span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
          style={{
            background:
              l.status === 'verkocht' || l.status === 'verhuurd' ? 'rgba(155,110,123,0.95)' :
              l.status === 'optie'    ? 'rgba(201,140,79,0.95)' :
              l.status === 'te-huur'  ? 'rgba(90,122,72,0.95)' :
              l.status === 'concept'  ? 'rgba(115,115,115,0.95)' :
              'rgba(11,79,88,0.95)',
            color: '#fff',
          }}
        >
          {STATUS_LABEL[l.status] ?? l.status}
        </span>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[0.55rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
          {l.type}{l.ref && ` · #${l.ref}`}
        </div>
        <h3 className="mt-1 text-base leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {l.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-mute)] flex items-center gap-1">
          <MapPin className="size-3" />
          {l.zip ? `${l.zip} ` : ''}{l.city}
        </p>
        <p className="mt-3 text-lg italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
          {l.price_label || formatPrice(l.price)}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs">
          <Link
            href={`/aanbod/${l.id}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-[var(--color-mute)] hover:text-[var(--color-ink)] link-underline"
          >
            <Eye className="size-3" />
            Publiek
          </Link>
          <Link
            href={`/admin/aanbod/${l.id}`}
            className="inline-flex items-center gap-1 px-2 py-1"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Pencil className="size-3" />
            Bewerken
          </Link>
        </div>
      </div>
    </article>
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
        if (o.value !== 'alle' && o.value !== 'online') params.set(queryKey, o.value)
        else if (o.value === 'online' && queryKey === 'status') params.set(queryKey, 'online')
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
