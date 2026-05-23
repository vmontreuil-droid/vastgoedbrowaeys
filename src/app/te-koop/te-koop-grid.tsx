'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { LayoutGrid, Map as MapIcon } from 'lucide-react'
import { ListingCard } from '@/components/listing-card'
import { TYPE_BADGE, formatPrice, type Listing, type ListingType } from '@/lib/listings'

// react-leaflet vereist window-toegang — dynamisch laden zonder SSR.
const ListingsMap = dynamic(() => import('@/components/listings-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] grid place-items-center" style={{ background: 'var(--color-paper-2)' }}>
      <p className="text-sm text-[var(--color-mute)]">Kaart laden…</p>
    </div>
  ),
})

type SortKey = 'newest' | 'price-asc' | 'price-desc'

const TYPE_OPTIONS: ListingType[] = ['woning', 'appartement', 'bouwgrond', 'handelspand']

export function TeKoopGrid({ listings, cities }: { listings: Listing[]; cities: string[] }) {
  const [selectedTypes, setSelectedTypes] = useState<Set<ListingType>>(new Set())
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [view, setView] = useState<'grid' | 'map'>('grid')

  const maxPriceCap = useMemo(() => {
    const max = Math.max(...listings.map((l) => l.price))
    return Math.ceil(max / 50000) * 50000
  }, [listings])

  function toggleType(t: ListingType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  function clearFilters() {
    setSelectedTypes(new Set())
    setSelectedCity('')
    setMaxPrice(0)
  }

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(l.type)) return false
      if (selectedCity && l.city !== selectedCity) return false
      if (maxPrice > 0 && l.price > maxPrice) return false
      return true
    })
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        result = [...result].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    return result
  }, [listings, selectedTypes, selectedCity, maxPrice, sortBy])

  const hasActiveFilters = selectedTypes.size > 0 || selectedCity || maxPrice > 0

  return (
    <>
      {/* === Filter-bar === */}
      <section
        className="border-y"
        style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper)' }}
      >
        <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
          <div className="grid lg:grid-cols-12 gap-y-6 gap-x-8 items-start">
            {/* Type-chips */}
            <div className="lg:col-span-5">
              <p className="eyebrow mb-3">Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const isActive = selectedTypes.has(t)
                  const badge = TYPE_BADGE[t]
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className="px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium transition-all"
                      style={{
                        background: isActive ? badge.bg : 'transparent',
                        color: isActive ? badge.text : 'var(--color-ink)',
                        border: `1px solid ${isActive ? badge.bg : 'var(--color-line)'}`,
                      }}
                    >
                      {badge.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Gemeente */}
            <div className="lg:col-span-3">
              <p className="eyebrow mb-3">Gemeente</p>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-transparent transition-colors focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              >
                <option value="">Alle gemeenten</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Max prijs */}
            <div className="lg:col-span-2">
              <p className="eyebrow mb-3">
                Max prijs {maxPrice > 0 && <span className="text-[var(--color-accent)]">· {formatPrice(maxPrice)}</span>}
              </p>
              <input
                type="range"
                min={0}
                max={maxPriceCap}
                step={25000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <p className="eyebrow mb-3">Sorteer</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="w-full px-4 py-2.5 text-sm bg-transparent transition-colors focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              >
                <option value="newest">Nieuwste eerst</option>
                <option value="price-asc">Prijs (laag → hoog)</option>
                <option value="price-desc">Prijs (hoog → laag)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--color-mute)]">
              {filtered.length} {filtered.length === 1 ? 'pand' : 'panden'} gevonden
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-4 link-underline text-[var(--color-accent)]"
                >
                  Filters wissen ×
                </button>
              )}
            </span>

            {/* View-toggle (lijst / kaart) */}
            <div
              className="inline-flex"
              style={{ border: '1px solid var(--color-line)' }}
            >
              <button
                onClick={() => setView('grid')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-colors"
                style={{
                  background: view === 'grid' ? 'var(--color-ink)' : 'transparent',
                  color: view === 'grid' ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
                aria-pressed={view === 'grid'}
              >
                <LayoutGrid className="size-3.5" />
                Lijst
              </button>
              <button
                onClick={() => setView('map')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-colors"
                style={{
                  background: view === 'map' ? 'var(--color-ink)' : 'transparent',
                  color: view === 'map' ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
                aria-pressed={view === 'map'}
              >
                <MapIcon className="size-3.5" />
                Kaart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === Grid of Map === */}
      {view === 'map' ? (
        <section className="w-full py-6">
          <ListingsMap listings={filtered} />
        </section>
      ) : (
        <section className="container-px mx-auto max-w-screen-2xl py-16 md:py-20">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-[var(--color-mute)]">
                Geen panden gevonden met deze filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 link-underline text-[var(--color-accent)]"
              >
                Filters wissen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
              {filtered.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  priority={i < 3}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}
