import Link from 'next/link'
import Image from 'next/image'
import { Home, Plus, Eye, Pencil, MapPin } from 'lucide-react'
import { getListings, formatPrice, type ListingStatus, type ListingType } from '@/lib/listings'
import { DonutChart, SimpleLine } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Aanbod',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const STATUS_LABEL: Record<string, string> = {
  'te-koop': 'Te koop',
  'te-huur': 'Te huur',
  'optie':   'Onder optie',
  'verkocht':'Verkocht',
}

export default async function AanbodPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const statusFilter = (params.status as string | undefined) ?? 'online'
  const typeFilter = (params.type as string | undefined) ?? 'alle'

  const all = getListings()
  let filtered = [...all]

  if (statusFilter === 'online') {
    filtered = filtered.filter((l) => l.status === 'te-koop' || l.status === 'te-huur' || l.status === 'optie')
  } else if (statusFilter !== 'alle') {
    filtered = filtered.filter((l) => l.status === statusFilter as ListingStatus)
  }
  if (typeFilter !== 'alle') filtered = filtered.filter((l) => l.type === typeFilter as ListingType)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const byStatus = [
    { name: 'Te koop',     value: all.filter((l) => l.status === 'te-koop').length,  color: '#0b4f58' },
    { name: 'Te huur',     value: all.filter((l) => l.status === 'te-huur').length,  color: '#5a7a48' },
    { name: 'Onder optie', value: all.filter((l) => l.status === 'optie').length,    color: '#c98c4f' },
    { name: 'Verkocht',    value: all.filter((l) => l.status === 'verkocht').length, color: '#9b6e7b' },
  ].filter((d) => d.value > 0)

  const byType = [
    { name: 'Woning',      value: all.filter((l) => l.type === 'woning').length,      color: '#0b4f58' },
    { name: 'Appartement', value: all.filter((l) => l.type === 'appartement').length, color: '#8c6b2e' },
    { name: 'Bouwgrond',   value: all.filter((l) => l.type === 'bouwgrond').length,   color: '#5a7a48' },
    { name: 'Handelspand', value: all.filter((l) => l.type === 'handelspand').length, color: '#a25b3a' },
  ].filter((d) => d.value > 0)

  // Trend: panden online per maand (mock)
  const trend = ['Dec', 'Jan', 'Feb', 'Mrt', 'Apr', 'Mei'].map((m, i) => ({
    x: m,
    Online: [9, 10, 11, 12, 13, 13][i],
    Verkocht: [73, 75, 78, 82, 85, 87][i],
  }))

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
        <Link
          href="/admin/aanbod/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-3.5" />
          Pand toevoegen
        </Link>
      </section>

      {/* Stats grafieken */}
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
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Trend 6 maanden</h3>
          <SimpleLine data={trend} dataKeys={[
            { key: 'Online',   label: 'Online',   color: '#0b4f58' },
            { key: 'Verkocht', label: 'Verkocht (cumulatief)', color: '#9b6e7b' },
          ]} height={220} />
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
            { value: 'online', label: 'Online' },
            { value: 'alle', label: 'Alle' },
            { value: 'te-koop', label: 'Te koop' },
            { value: 'te-huur', label: 'Te huur' },
            { value: 'optie', label: 'Onder optie' },
            { value: 'verkocht', label: 'Verkocht' },
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

      {/* Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((l) => (
          <article
            key={l.id}
            className="overflow-hidden flex flex-col"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
          >
            <Link href={`/aanbod/${l.id}`} target="_blank" rel="noopener" className="relative block aspect-[4/3]">
              <Image
                src={l.image}
                alt={l.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
              />
              <span
                className="absolute top-3 left-3 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
                style={{
                  background:
                    l.status === 'verkocht' ? 'rgba(155,110,123,0.95)' :
                    l.status === 'optie'    ? 'rgba(201,140,79,0.95)' :
                    l.status === 'te-huur'  ? 'rgba(90,122,72,0.95)' :
                    'rgba(11,79,88,0.95)',
                  color: '#fff',
                }}
              >
                {STATUS_LABEL[l.status] ?? l.status}
              </span>
              {l.status === 'verkocht' && (
                <span
                  className="absolute top-3 right-3 px-2 py-1 text-[0.55rem] uppercase tracking-[0.12em] font-medium"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  Niet zichtbaar
                </span>
              )}
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-[0.55rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                {l.type} · #{l.ref}
              </div>
              <h3 className="mt-1 text-base leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                {l.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-mute)] flex items-center gap-1">
                <MapPin className="size-3" />
                {l.zip} {l.city}
              </p>
              <p className="mt-3 text-lg italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
                {l.priceLabel || formatPrice(l.price)}
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
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-10 text-center text-sm text-[var(--color-mute)]"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen panden voor deze filters.
          </div>
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
