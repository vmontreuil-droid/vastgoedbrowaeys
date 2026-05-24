'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  Building2, User as UserIcon, Layers, CheckSquare, Square,
  X, Trash2, AlertCircle, CheckCircle2, ExternalLink,
} from 'lucide-react'
import { formatPrice } from '@/lib/listings'
import type { MarketLead, MarketLeadStatus } from '@/lib/admin-db'
import {
  bulkUpdateMarketLeadStatusAction,
  bulkDeleteMarketLeadsAction,
} from './actions'

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

export function MarketLeadsBulkGrid({ leads }: { leads: MarketLead[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected((prev) => prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id)))
  }
  function clear() {
    setSelected(new Set())
    setResult(null)
  }

  function bulkStatus(status: MarketLeadStatus) {
    if (selected.size === 0) return
    setResult(null)
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkUpdateMarketLeadStatusAction(ids, status)
      if (res.ok) {
        setResult({ ok: true, msg: `${res.updated} lead(s) op "${STATUS_LABEL[status]}" gezet.` })
        setSelected(new Set())
      } else {
        setResult({ ok: false, msg: res.error ?? 'Mislukt' })
      }
    })
  }

  function bulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} lead(s) permanent verwijderen?`)) return
    setResult(null)
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkDeleteMarketLeadsAction(ids)
      if (res.ok) {
        setResult({ ok: true, msg: `${res.updated} lead(s) verwijderd.` })
        setSelected(new Set())
      } else {
        setResult({ ok: false, msg: res.error ?? 'Mislukt' })
      }
    })
  }

  return (
    <>
      {/* Sticky bulk-actiebalk */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 mb-4 flex items-center gap-2 flex-wrap"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          <button type="button" onClick={clear} className="hover:opacity-70" title="Selectie wissen">
            <X className="size-4" />
          </button>
          <span className="text-sm font-medium">
            {selected.size}/{leads.length} geselecteerd
          </span>
          <span className="opacity-60">|</span>
          <span className="text-[0.6rem] uppercase tracking-[0.12em] opacity-70">Status →</span>
          <BulkBtn onClick={() => bulkStatus('benaderd')}            disabled={pending}>Benaderd</BulkBtn>
          <BulkBtn onClick={() => bulkStatus('afspraak')}            disabled={pending}>Afspraak</BulkBtn>
          <BulkBtn onClick={() => bulkStatus('klant')}               disabled={pending}>Klant</BulkBtn>
          <BulkBtn onClick={() => bulkStatus('niet_geinteresseerd')} disabled={pending}>Niet</BulkBtn>
          <BulkBtn onClick={() => bulkStatus('reeds_verkocht')}      disabled={pending}>Verkocht</BulkBtn>
          <span className="opacity-60">|</span>
          <button
            type="button"
            onClick={bulkDelete}
            disabled={pending}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs disabled:opacity-50"
            style={{ background: '#b91c1c', color: '#fff' }}
          >
            <Trash2 className="size-3" />
            Wis
          </button>
          {result && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs"
              style={{ color: result.ok ? '#86efac' : '#fca5a5' }}>
              {result.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
              {result.msg}
            </span>
          )}
        </div>
      )}

      {/* Toggle-all knop */}
      <div className="mb-3 flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        >
          {selected.size === leads.length ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
          {selected.size === leads.length ? 'Selectie wissen' : 'Alles selecteren'}
        </button>
        {result && selected.size === 0 && (
          <span className="inline-flex items-center gap-1"
            style={{ color: result.ok ? '#166534' : '#b91c1c' }}>
            {result.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
            {result.msg}
          </span>
        )}
      </div>

      {/* Kaarten-grid — compacter, meer kolommen */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            selected={selected.has(lead.id)}
            onToggle={() => toggle(lead.id)}
          />
        ))}
      </ul>
    </>
  )
}

function BulkBtn({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="px-2 py-1 text-xs disabled:opacity-50"
      style={{ background: 'rgba(255,255,255,0.15)', color: 'inherit' }}>
      {children}
    </button>
  )
}

function LeadCard({ lead, selected, onToggle }: { lead: MarketLead; selected: boolean; onToggle: () => void }) {
  const statusColor = STATUS_COLOR[lead.status]
  const address = [lead.street, lead.postcode, lead.city].filter(Boolean).join(' · ')
  const titleText = address
    || (lead.title && lead.title.length > 4 && !/^(ai|nieuw|new|huis|appartement)$/i.test(lead.title.trim()) ? lead.title : null)
    || 'Adres onbekend'

  return (
    <li className="relative">
      {/* Selectie-checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-1 left-1 z-10 size-6 grid place-items-center"
        style={{
          background: selected ? 'var(--color-accent)' : 'rgba(255,255,255,0.9)',
          color: selected ? '#fff' : 'var(--color-mute)',
          backdropFilter: 'blur(6px)',
        }}
        aria-label={selected ? 'Deselecteer' : 'Selecteer'}
      >
        {selected ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
      </button>

      {/* Externe link naar origineel zoekertje (verrijking-workflow) */}
      <a
        href={lead.sourceUrl}
        target="_blank"
        rel="noopener"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 z-10 size-6 grid place-items-center"
        style={{
          background: 'rgba(255,255,255,0.9)',
          color: 'var(--color-accent)',
          backdropFilter: 'blur(6px)',
        }}
        title="Open op origineel zoekertje (om foto's en details binnen te halen via bookmark)"
        aria-label="Open op originele site"
      >
        <ExternalLink className="size-3" />
      </a>

      <Link
        href={`/admin/marktmonitor/${lead.id}`}
        className="block overflow-hidden transition-shadow hover:shadow-sm h-full"
        style={{
          background: 'var(--color-paper)',
          border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-line)',
        }}
      >
        <div className="relative aspect-square" style={{ background: 'var(--color-paper-2)' }}>
          {lead.imageUrl ? (
            <Image
              src={lead.imageUrl}
              alt={titleText}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Building2 className="size-6 text-[var(--color-mute)]" />
            </div>
          )}
          {/* Mini-status-pill */}
          <span
            className="absolute top-1 left-1/2 -translate-x-1/2 inline-block px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.08em] font-medium"
            style={{ background: statusColor.bg, color: statusColor.fg, backdropFilter: 'blur(8px)' }}
          >
            {STATUS_LABEL[lead.status].slice(0, 8)}
          </span>
          {lead.isParticulier && (
            <span
              className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 px-1 py-0.5 text-[0.5rem] uppercase tracking-[0.08em] font-medium"
              style={{ background: '#16a34a', color: '#fff' }}
              title="Particuliere verkoper"
            >
              <UserIcon className="size-2" />
              Part.
            </span>
          )}
          {lead.extraSourceUrls.length > 0 && (
            <span
              className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 px-1 py-0.5 text-[0.5rem]"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
              title={`Ook op ${lead.extraSourceUrls.length} ander(e) site(s)`}>
              <Layers className="size-2" />
              +{lead.extraSourceUrls.length}
            </span>
          )}
        </div>
        <div className="p-2">
          {lead.price ? (
            <p className="text-sm italic truncate" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
              {formatPrice(lead.price)}
              {lead.listingType === 'verhuur' && <span className="text-[0.6rem] text-[var(--color-mute)]">/m</span>}
            </p>
          ) : (
            <p className="text-[0.65rem] italic text-[var(--color-mute)]">Geen prijs</p>
          )}
          <p className="text-[0.7rem] truncate leading-tight">{titleText}</p>
          <p className="text-[0.55rem] uppercase tracking-[0.08em] text-[var(--color-mute)] truncate mt-0.5">
            {lead.sourceSite ?? '—'}
            {lead.propertyType && <> · {lead.propertyType}</>}
          </p>
        </div>
      </Link>
    </li>
  )
}
