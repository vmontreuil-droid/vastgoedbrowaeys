'use client'

import { useState, useTransition } from 'react'
import { UserCog, Check, AlertCircle, CalendarOff } from 'lucide-react'
import { setDossierAssigneeAction } from './assignee-actions'

function isOOO(opt: AssigneeOption, now = Date.now()): boolean {
  if (!opt.outOfOfficeUntil) return false
  const u = new Date(opt.outOfOfficeUntil).getTime()
  return !isNaN(u) && now <= u
}

export type AssigneeOption = {
  id: string
  name: string
  email: string
  active: boolean
  outOfOfficeUntil?: string | null
  outOfOfficeReason?: string | null
}

export function AssigneePanel({
  dossierId,
  initialAssigneeId,
  options,
  currentUserId,
}: {
  dossierId: string
  initialAssigneeId: string | null
  options: AssigneeOption[]
  currentUserId: string
}) {
  const [assigneeId, setAssigneeId] = useState<string | null>(initialAssigneeId)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  function handleChange(value: string) {
    const next = value === '' ? null : value
    const prev = assigneeId
    setAssigneeId(next)
    setError(null)
    setSavedAt(null)
    startTransition(async () => {
      const res = await setDossierAssigneeAction(dossierId, next)
      if (!res.ok) {
        setAssigneeId(prev)
        setError(res.error ?? 'Bewaren mislukt')
      } else {
        setSavedAt(Date.now())
      }
    })
  }

  function claim() {
    handleChange(currentUserId)
  }

  const isMine = assigneeId === currentUserId
  const hasAssignee = !!assigneeId

  return (
    <section className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="eyebrow text-[0.55rem] mb-3 flex items-center gap-1.5">
        <UserCog className="size-3" style={{ color: 'var(--color-accent)' }} />
        Toegewezen aan
      </h3>

      <select
        value={assigneeId ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={pending}
        className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
        style={{ border: '1px solid var(--color-line)' }}
      >
        <option value="">— Niemand —</option>
        {options.map((o) => {
          const ooo = isOOO(o)
          return (
            <option key={o.id} value={o.id} disabled={!o.active}>
              {o.name}
              {!o.active ? ' (inactief)' : ''}
              {ooo ? ' (afwezig)' : ''}
              {o.id === currentUserId ? ' (jij)' : ''}
            </option>
          )
        })}
      </select>

      {(() => {
        const selected = options.find((o) => o.id === assigneeId)
        if (selected && isOOO(selected) && selected.id !== currentUserId) {
          return (
            <div className="mt-2 flex items-start gap-1.5 p-2 text-[0.65rem]"
              style={{ background: 'rgba(201,140,79,0.10)', color: '#92400e' }}>
              <CalendarOff className="size-3 mt-0.5 shrink-0" />
              <span>
                {selected.name.split(' ')[0]} is afwezig{selected.outOfOfficeReason ? ` (${selected.outOfOfficeReason})` : ''}
                {selected.outOfOfficeUntil && ` tot ${new Date(selected.outOfOfficeUntil).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}`}.
                Overweeg om aan iemand anders toe te wijzen.
              </span>
            </div>
          )
        }
        return null
      })()}

      {!isMine && hasAssignee && (
        <button
          type="button"
          onClick={claim}
          disabled={pending}
          className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-[0.65rem] disabled:opacity-50"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
        >
          Overname → jij
        </button>
      )}
      {!hasAssignee && (
        <button
          type="button"
          onClick={claim}
          disabled={pending}
          className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-[0.65rem] disabled:opacity-50"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Toewijzen aan mij
        </button>
      )}

      {pending && (
        <p className="mt-2 text-[0.65rem] text-[var(--color-mute)]">Bezig…</p>
      )}
      {savedAt && !pending && !error && (
        <p className="mt-2 text-[0.65rem] inline-flex items-center gap-1" style={{ color: '#166534' }}>
          <Check className="size-3" /> Bewaard
        </p>
      )}
      {error && (
        <div className="mt-2 flex items-start gap-1 text-[0.65rem]" style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-3 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}
