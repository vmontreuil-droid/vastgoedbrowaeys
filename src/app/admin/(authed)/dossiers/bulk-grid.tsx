'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  Hash, Check, Clock, X, Trash2, CheckSquare, Square, AlertCircle, CheckCircle2, UserCog, ChevronDown,
} from 'lucide-react'
import {
  bulkSetDossierStatusAction, bulkDeleteDossiersAction, bulkAssignDossiersAction, type BulkStatus,
} from './bulk-actions'

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_behandeling: 'In behandeling', onder_optie: 'Onder optie',
  verkocht: 'Verkocht', verhuurd: 'Verhuurd', geannuleerd: 'Geannuleerd',
}
const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop', verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker', huur_zoeker: 'Huur-zoeker',
}

export type DossierCard = {
  id: string
  ref: string | null
  clientName: string
  type: string
  status: string
  propertyAddress: string | null
  propertyCity: string | null
  askingPrice: number | null
  openedAt: string
  appointmentsCount: number
  documentsCount: number
  tags: string[]
  assignedToName: string | null
}

function formatPrice(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    open:           { bg: 'rgba(34,197,94,0.15)',  fg: '#166534', icon: <Clock className="size-3" /> },
    in_behandeling: { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58', icon: <Clock className="size-3" /> },
    onder_optie:    { bg: 'rgba(201,140,79,0.20)', fg: '#92400e', icon: <Clock className="size-3" /> },
    verkocht:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d', icon: <Check className="size-3" /> },
    verhuurd:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d', icon: <Check className="size-3" /> },
    geannuleerd:    { bg: 'rgba(115,115,115,0.18)',fg: '#525252', icon: <X className="size-3" /> },
  }[status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252', icon: <Clock className="size-3" /> }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
      style={{ background: cfg.bg, color: cfg.fg }}>
      {cfg.icon}
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export type BulkAssignOption = { id: string; name: string; active: boolean }

export function DossierBulkGrid({
  dossiers,
  assignOptions = [],
}: {
  dossiers: DossierCard[]
  assignOptions?: BulkAssignOption[]
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)

  const allSelected = selected.size > 0 && selected.size === dossiers.length

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(dossiers.map((d) => d.id)))
  }

  function bulkStatus(newStatus: BulkStatus) {
    if (selected.size === 0) return
    const closing = ['verkocht', 'verhuurd', 'geannuleerd'].includes(newStatus)
    if (closing) {
      if (!confirm(`${selected.size} dossier(s) markeren als "${STATUS_LABEL[newStatus]}"? Dit zet closed_at op vandaag.`)) return
    }
    setResult(null)
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkSetDossierStatusAction(ids, newStatus)
      if (res.ok) {
        setResult({ ok: true, message: `${res.updated} dossier(s) bijgewerkt naar "${STATUS_LABEL[newStatus]}".` })
        setSelected(new Set())
      } else {
        setResult({ ok: false, message: res.error ?? 'Bijwerken mislukt' })
      }
    })
  }

  function bulkAssign(assigneeId: string | null, assigneeName: string) {
    if (selected.size === 0) return
    setResult(null)
    setAssignOpen(false)
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkAssignDossiersAction(ids, assigneeId)
      if (res.ok) {
        setResult({ ok: true, message: `${res.updated} dossier(s) toegewezen aan ${assigneeName}.` })
        setSelected(new Set())
      } else {
        setResult({ ok: false, message: res.error ?? 'Toewijzen mislukt' })
      }
    })
  }

  function bulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} dossier(s) PERMANENT verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return
    setResult(null)
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkDeleteDossiersAction(ids)
      if (res.ok) {
        setResult({ ok: true, message: `${res.updated} dossier(s) verwijderd.` })
        setSelected(new Set())
      } else {
        setResult({ ok: false, message: res.error ?? 'Verwijderen mislukt' })
      }
    })
  }

  return (
    <>
      {/* Bulk-actiebalk */}
      <div
        className="sticky top-0 z-20 -mx-2 px-2 py-2 mb-4 flex flex-wrap items-center gap-2"
        style={{
          background: selected.size > 0 ? 'var(--color-ink)' : 'transparent',
          color: selected.size > 0 ? 'var(--color-paper)' : 'inherit',
          transition: 'background 0.15s',
        }}
      >
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-2 text-xs"
          title={allSelected ? 'Deselecteer alles' : 'Selecteer alles'}
        >
          {allSelected ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
          {selected.size > 0 ? `${selected.size} geselecteerd` : 'Selecteer alles'}
        </button>

        {selected.size > 0 && (
          <>
            <span className="opacity-60 text-xs">|</span>
            <span className="text-[0.6rem] uppercase tracking-[0.12em] opacity-70">Status →</span>
            <BulkBtn onClick={() => bulkStatus('in_behandeling')} disabled={pending}>In behandeling</BulkBtn>
            <BulkBtn onClick={() => bulkStatus('onder_optie')}    disabled={pending}>Onder optie</BulkBtn>
            <BulkBtn onClick={() => bulkStatus('verkocht')}       disabled={pending}>Verkocht</BulkBtn>
            <BulkBtn onClick={() => bulkStatus('verhuurd')}       disabled={pending}>Verhuurd</BulkBtn>
            <BulkBtn onClick={() => bulkStatus('geannuleerd')}    disabled={pending}>Geannuleerd</BulkBtn>
            {assignOptions.length > 0 && (
              <>
                <span className="opacity-60 text-xs">|</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAssignOpen((v) => !v)}
                    disabled={pending}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                  >
                    <UserCog className="size-3" />
                    Toewijzen
                    <ChevronDown className={`size-3 transition-transform ${assignOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {assignOpen && (
                    <ul
                      className="absolute z-30 top-full left-0 mt-1 min-w-[180px] py-1"
                      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', color: 'var(--color-ink)' }}
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() => bulkAssign(null, 'niemand')}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-paper-2)] italic text-[var(--color-mute)]"
                        >
                          — Niemand —
                        </button>
                      </li>
                      {assignOptions.filter((o) => o.active).map((o) => (
                        <li key={o.id}>
                          <button
                            type="button"
                            onClick={() => bulkAssign(o.id, o.name)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-paper-2)]"
                          >
                            {o.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            <span className="opacity-60 text-xs">|</span>
            <button
              type="button"
              onClick={bulkDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs disabled:opacity-50"
              style={{ background: '#b91c1c', color: '#fff' }}
            >
              <Trash2 className="size-3" />
              Verwijder
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="text-xs ml-auto link-underline">
              Annuleer selectie
            </button>
          </>
        )}
      </div>

      {result && (
        <div
          className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: result.ok ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.08)', color: result.ok ? '#166534' : '#b91c1c' }}
        >
          {result.ok ? <CheckCircle2 className="size-3.5 mt-0.5" /> : <AlertCircle className="size-3.5 mt-0.5" />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Grid */}
      <section className="grid lg:grid-cols-2 gap-4">
        {dossiers.map((d) => {
          const isSelected = selected.has(d.id)
          return (
            <div
              key={d.id}
              className="p-5 transition-all"
              style={{
                background: 'var(--color-paper)',
                border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-line)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => toggle(d.id)}
                  className="mt-0.5 shrink-0"
                  title={isSelected ? 'Deselecteer' : 'Selecteer'}
                >
                  {isSelected
                    ? <CheckSquare className="size-4" style={{ color: 'var(--color-accent)' }} />
                    : <Square className="size-4 text-[var(--color-mute)]" />}
                </button>
                <Link href={`/admin/dossiers/${d.id}`} className="min-w-0 flex-1 block">
                  <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                    <Hash className="size-3" />
                    {d.ref ?? d.id.slice(0, 8)}
                    <span>·</span>
                    <span>{TYPE_LABEL[d.type] ?? d.type}</span>
                  </div>
                  <p className="mt-1.5 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {d.propertyAddress || `Zoekopdracht — ${d.clientName}`}
                  </p>
                  {d.propertyCity && (
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">{d.propertyCity}</p>
                  )}
                </Link>
                <StatusBadge status={d.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-3 my-3 border-y" style={{ borderColor: 'var(--color-line)' }}>
                <Stat label="Klant" value={d.clientName} />
                <Stat label={d.type === 'verkoop' || d.type === 'verhuur' ? 'Vraagprijs' : 'Budget'} value={formatPrice(d.askingPrice)} />
                <Stat label="Geopend" value={new Date(d.openedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })} />
              </div>

              {d.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1 mb-2">
                  {d.tags.map((t) => (
                    <li key={t}
                      className="inline-block px-1.5 py-0.5 text-[0.6rem]"
                      style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)', color: 'var(--color-mute)' }}>
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-mute)]">
                <span className="inline-flex items-center gap-1 truncate min-w-0">
                  <UserCog className="size-3 shrink-0" />
                  {d.assignedToName ?? <span className="italic">Niet toegewezen</span>}
                </span>
                <span className="inline-flex items-center gap-3 shrink-0">
                  <span title="Afspraken">📅 {d.appointmentsCount}</span>
                  <span title="Documenten">📄 {d.documentsCount}</span>
                </span>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}

function BulkBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 text-xs disabled:opacity-50"
      style={{ background: 'rgba(255,255,255,0.15)', color: 'inherit' }}
    >
      {children}
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">{label}</p>
      <p className="mt-0.5 truncate">{value}</p>
    </div>
  )
}
