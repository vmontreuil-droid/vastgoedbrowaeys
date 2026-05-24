'use client'

import { useState, useTransition } from 'react'
import { Target, CalendarOff, AlertCircle, Check, Pencil, X } from 'lucide-react'
import { setYearlyTargetAction, setOutOfOfficeAction } from './productivity-actions'

export function ProductivityPanel({
  userId,
  initialTarget,
  initialFrom,
  initialUntil,
  initialReason,
  closedYtd,
  canEditTarget,
  canEditOOO,
}: {
  userId: string
  initialTarget: number | null
  initialFrom: string | null
  initialUntil: string | null
  initialReason: string | null
  closedYtd: number
  canEditTarget: boolean
  canEditOOO: boolean
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <TargetCard
        userId={userId}
        initialTarget={initialTarget}
        closedYtd={closedYtd}
        canEdit={canEditTarget}
      />
      <OutOfOfficeCard
        userId={userId}
        initialFrom={initialFrom}
        initialUntil={initialUntil}
        initialReason={initialReason}
        canEdit={canEditOOO}
      />
    </div>
  )
}

function TargetCard({
  userId, initialTarget, closedYtd, canEdit,
}: {
  userId: string
  initialTarget: number | null
  closedYtd: number
  canEdit: boolean
}) {
  const [target, setTarget] = useState<number | null>(initialTarget)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(initialTarget != null ? String(initialTarget) : '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    const trimmed = input.trim()
    const value = trimmed === '' ? null : Number(trimmed)
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setError('Voer een geldig getal in (of laat leeg om uit te zetten).')
      return
    }
    startTransition(async () => {
      const res = await setYearlyTargetAction(userId, value)
      if (res.ok) {
        setTarget(value)
        setEditing(false)
      } else {
        setError(res.error ?? 'Bewaren mislukt')
      }
    })
  }

  const pct = target && target > 0 ? Math.min(100, Math.round((closedYtd / target) * 100)) : 0
  const onTrack = target ? (closedYtd / target) * 12 / Math.max(1, new Date().getMonth() + 1) >= 1 : false

  return (
    <div className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="eyebrow text-[0.55rem] flex items-center gap-1.5">
          <Target className="size-3" style={{ color: 'var(--color-accent)' }} />
          Jaardoel ({new Date().getFullYear()})
        </h3>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => { setEditing(true); setInput(target != null ? String(target) : '') }}
            className="text-[0.65rem] text-[var(--color-mute)] hover:text-[var(--color-ink)] inline-flex items-center gap-1"
            title={target ? 'Doel wijzigen' : 'Doel instellen'}
          >
            <Pencil className="size-3" />
            {target ? 'Wijzig' : 'Stel in'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={1000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="bv. 24"
              className="w-24 px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
            <span className="text-xs text-[var(--color-mute)]">dossiers / jaar</span>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Check className="size-3" /> Bewaar
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null) }}
              className="text-xs text-[var(--color-mute)]"
            >
              Annuleer
            </button>
          </div>
          {error && (
            <p className="text-[0.65rem]" style={{ color: '#b91c1c' }}>
              <AlertCircle className="size-3 inline mr-1" />{error}
            </p>
          )}
        </div>
      ) : target == null ? (
        <p className="text-xs text-[var(--color-mute)] italic">
          Nog geen doel ingesteld{canEdit ? '. Klik "Stel in" om er een te bepalen.' : '.'}
        </p>
      ) : (
        <>
          <p className="text-2xl mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {closedYtd} <span className="text-base text-[var(--color-mute)]">/ {target}</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden"
            style={{ background: 'var(--color-paper-2)' }}>
            <div
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                background: onTrack ? '#16a34a' : '#c98c4f',
              }}
            />
          </div>
          <p className="mt-1.5 text-[0.65rem]" style={{ color: onTrack ? '#16a34a' : '#c98c4f' }}>
            {onTrack ? '✓ Op schema' : '⚠ Achter op schema'} — {pct}% van jaardoel
          </p>
        </>
      )}
    </div>
  )
}

function OutOfOfficeCard({
  userId, initialFrom, initialUntil, initialReason, canEdit,
}: {
  userId: string
  initialFrom: string | null
  initialUntil: string | null
  initialReason: string | null
  canEdit: boolean
}) {
  const [from, setFrom] = useState<string | null>(initialFrom)
  const [until, setUntil] = useState<string | null>(initialUntil)
  const [reason, setReason] = useState<string | null>(initialReason)
  const [editing, setEditing] = useState(false)
  const [draftFrom, setDraftFrom] = useState(initialFrom ? initialFrom.slice(0, 10) : '')
  const [draftUntil, setDraftUntil] = useState(initialUntil ? initialUntil.slice(0, 10) : '')
  const [draftReason, setDraftReason] = useState(initialReason ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    if (!draftFrom || !draftUntil) {
      setError('Vul startdatum en einddatum in (of klik Wis).')
      return
    }
    startTransition(async () => {
      const fromIso = new Date(draftFrom + 'T00:00:00').toISOString()
      const untilIso = new Date(draftUntil + 'T23:59:59').toISOString()
      const res = await setOutOfOfficeAction(userId, fromIso, untilIso, draftReason || null)
      if (res.ok) {
        setFrom(fromIso)
        setUntil(untilIso)
        setReason(draftReason || null)
        setEditing(false)
      } else {
        setError(res.error ?? 'Bewaren mislukt')
      }
    })
  }

  function clear() {
    setError(null)
    if (!confirm('Afwezigheid wissen?')) return
    startTransition(async () => {
      const res = await setOutOfOfficeAction(userId, null, null, null)
      if (res.ok) {
        setFrom(null); setUntil(null); setReason(null)
        setDraftFrom(''); setDraftUntil(''); setDraftReason('')
        setEditing(false)
      } else {
        setError(res.error ?? 'Wissen mislukt')
      }
    })
  }

  const isActive = from && until && (() => {
    const now = Date.now()
    return now >= new Date(from).getTime() && now <= new Date(until).getTime()
  })()

  return (
    <div className="p-4"
      style={{
        background: isActive ? 'rgba(201,140,79,0.08)' : 'var(--color-paper)',
        border: `1px solid ${isActive ? '#c98c4f' : 'var(--color-line)'}`,
      }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="eyebrow text-[0.55rem] flex items-center gap-1.5">
          <CalendarOff className="size-3" style={{ color: isActive ? '#c98c4f' : 'var(--color-accent)' }} />
          Afwezigheid
        </h3>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[0.65rem] text-[var(--color-mute)] hover:text-[var(--color-ink)] inline-flex items-center gap-1"
          >
            <Pencil className="size-3" />
            {from && until ? 'Wijzig' : 'Plan'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[0.6rem] text-[var(--color-mute)] block mb-1">Van</span>
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
            <label className="block">
              <span className="text-[0.6rem] text-[var(--color-mute)] block mb-1">Tot</span>
              <input
                type="date"
                value={draftUntil}
                onChange={(e) => setDraftUntil(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
          </div>
          <input
            type="text"
            value={draftReason}
            onChange={(e) => setDraftReason(e.target.value)}
            placeholder="Reden (optioneel) — bv. Vakantie, Ziekte"
            maxLength={60}
            className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Check className="size-3" /> Bewaar
            </button>
            {(from || until) && (
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                style={{ color: '#b91c1c' }}
              >
                <X className="size-3" /> Wis
              </button>
            )}
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null) }}
              className="ml-auto text-xs text-[var(--color-mute)]"
            >
              Annuleer
            </button>
          </div>
          {error && (
            <p className="text-[0.65rem]" style={{ color: '#b91c1c' }}>
              <AlertCircle className="size-3 inline mr-1" />{error}
            </p>
          )}
        </div>
      ) : from && until ? (
        <>
          <p className="text-sm" style={{ color: isActive ? '#92400e' : 'inherit' }}>
            {isActive ? '⚠ Momenteel afwezig' : 'Gepland'}
            {reason && <span className="text-[var(--color-mute)] ml-1">— {reason}</span>}
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">
            {new Date(from).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
            {' → '}
            {new Date(until).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </>
      ) : (
        <p className="text-xs text-[var(--color-mute)] italic">
          Geen afwezigheid gepland{canEdit ? '. Klik "Plan" om vakantie/ziekte in te geven.' : '.'}
        </p>
      )}
    </div>
  )
}
