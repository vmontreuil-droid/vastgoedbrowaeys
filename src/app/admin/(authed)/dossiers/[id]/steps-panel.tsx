'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { Check, X, Plus, Trash2, AlertCircle, Clock } from 'lucide-react'
import { setStepStatusAction, addStepAction, deleteStepAction, type StepStatus } from './step-actions'

export type StepRow = {
  id: string
  label: string
  status: StepStatus
  doneAt: string | null
  orderIndex: number
}

export function StepsPanel({
  dossierId,
  initialSteps,
}: {
  dossierId: string
  initialSteps: StepRow[]
}) {
  const [steps, setSteps] = useState<StepRow[]>(initialSteps)
  const [newLabel, setNewLabel] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const done = steps.filter((s) => s.status === 'done').length
  const skipped = steps.filter((s) => s.status === 'skipped').length
  const active = steps.length - done - skipped
  const progress = steps.length === 0 ? 0 : Math.round((done / (steps.length - skipped || 1)) * 100)

  function toggleStep(step: StepRow) {
    const nextStatus: StepStatus = step.status === 'done' ? 'pending' : 'done'
    setSteps((prev) => prev.map((s) => s.id === step.id
      ? { ...s, status: nextStatus, doneAt: nextStatus === 'done' ? new Date().toISOString() : null }
      : s))
    startTransition(async () => {
      const res = await setStepStatusAction(step.id, nextStatus)
      if (!res.ok) {
        setError(res.error ?? 'Wijzigen mislukt')
        setSteps((prev) => prev.map((s) => s.id === step.id ? step : s))
      }
    })
  }

  function skipStep(step: StepRow) {
    const nextStatus: StepStatus = step.status === 'skipped' ? 'pending' : 'skipped'
    setSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, status: nextStatus, doneAt: null } : s))
    startTransition(async () => {
      const res = await setStepStatusAction(step.id, nextStatus)
      if (!res.ok) {
        setError(res.error ?? 'Wijzigen mislukt')
        setSteps((prev) => prev.map((s) => s.id === step.id ? step : s))
      }
    })
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const label = newLabel.trim()
    if (!label) return
    setNewLabel('')
    setError(null)

    const optimistic: StepRow = {
      id: 'tmp-' + Date.now(),
      label,
      status: 'pending',
      doneAt: null,
      orderIndex: (steps.at(-1)?.orderIndex ?? -1) + 1,
    }
    setSteps((prev) => [...prev, optimistic])

    startTransition(async () => {
      const res = await addStepAction({ dossierId, label })
      if (!res.ok) {
        setError(res.error ?? 'Toevoegen mislukt')
        setSteps((prev) => prev.filter((s) => s.id !== optimistic.id))
        setNewLabel(label)
      }
    })
  }

  function handleDelete(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id))
    setConfirmDeleteId(null)
    startTransition(async () => {
      const res = await deleteStepAction(id)
      if (!res.ok) setError(res.error ?? 'Verwijderen mislukt')
    })
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          Stappen ({done}/{steps.length - skipped})
        </h2>
        <div className="text-xs text-[var(--color-mute)]">
          {active} open · {skipped > 0 && `${skipped} overgeslagen · `}
          {progress}% klaar
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full mb-4" style={{ background: 'var(--color-paper-2)' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ol className="space-y-1.5 p-4"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        {steps.length === 0 ? (
          <li className="text-sm text-[var(--color-mute)] italic">Geen stappen gedefinieerd.</li>
        ) : steps.map((s, idx) => {
          const isDone = s.status === 'done'
          const isSkipped = s.status === 'skipped'
          return (
            <li key={s.id} className="group flex items-start gap-3 py-1.5">
              <button
                type="button"
                onClick={() => toggleStep(s)}
                disabled={pending}
                className="mt-0.5 size-5 grid place-items-center shrink-0 transition-colors"
                style={{
                  background: isDone ? 'var(--color-accent)' : 'transparent',
                  border: '2px solid ' + (isDone ? 'var(--color-accent)' : isSkipped ? 'var(--color-line)' : 'var(--color-mute)'),
                  color: '#fff',
                }}
                title={isDone ? 'Markeer als open' : 'Markeer als afgevinkt'}
              >
                {isDone && <Check className="size-3" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${isDone ? 'line-through text-[var(--color-mute)]' : isSkipped ? 'text-[var(--color-mute)] italic' : ''}`}>
                  <span className="text-[0.65rem] text-[var(--color-mute)] mr-2">{idx + 1}.</span>
                  {s.label}
                </p>
                {s.doneAt && isDone && (
                  <p className="text-[0.65rem] text-[var(--color-mute)] mt-0.5">
                    afgevinkt op {new Date(s.doneAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>

              {confirmDeleteId === s.id ? (
                <div className="flex items-center gap-2 text-xs">
                  <button type="button" onClick={() => handleDelete(s.id)} className="px-2 py-1 text-white" style={{ background: '#b91c1c' }}>
                    Ja
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)} className="link-underline">
                    Annuleer
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => skipStep(s)}
                    disabled={pending}
                    className="p-1 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    title={isSkipped ? 'Niet meer overslaan' : 'Overslaan'}
                  >
                    {isSkipped ? <Clock className="size-3" /> : <X className="size-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(s.id)}
                    disabled={pending}
                    className="p-1 text-[var(--color-mute)] hover:text-red-700"
                    title="Verwijder"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              )}
            </li>
          )
        })}

        <li className="pt-3 mt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nieuwe stap toevoegen…"
              className="flex-1 px-3 py-1.5 text-sm bg-transparent focus:outline-none"
              style={{ border: '1px solid var(--color-line)' }}
            />
            <button
              type="submit"
              disabled={pending || !newLabel.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Plus className="size-3.5" />
              Toevoegen
            </button>
          </form>
        </li>
      </ol>
    </section>
  )
}
