'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle, Trash2 } from 'lucide-react'
import {
  updateMarketLeadStatusAction,
  updateMarketLeadNotesAction,
  deleteMarketLeadAction,
} from '../actions'
import type { MarketLeadStatus } from '@/lib/admin-db'

const STATUS_OPTIONS: { value: MarketLeadStatus; label: string; color: string }[] = [
  { value: 'prospect',            label: 'Prospect',            color: '#0b4f58' },
  { value: 'benaderd',            label: 'Benaderd',            color: '#c98c4f' },
  { value: 'afspraak',            label: 'Afspraak gepland',    color: '#0b4f58' },
  { value: 'klant',               label: 'Klant geworden',      color: '#16a34a' },
  { value: 'niet_geinteresseerd', label: 'Niet geïnteresseerd', color: '#737373' },
  { value: 'reeds_verkocht',      label: 'Reeds verkocht',      color: '#737373' },
]

export function StatusControl({
  leadId,
  initial,
}: {
  leadId: string
  initial: MarketLeadStatus
}) {
  const [status, setStatus] = useState<MarketLeadStatus>(initial)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function change(next: MarketLeadStatus) {
    if (next === status) return
    const prev = status
    setError(null)
    setStatus(next)
    startTransition(async () => {
      const res = await updateMarketLeadStatusAction(leadId, next)
      if (!res.ok) {
        setStatus(prev)
        setError(res.error ?? 'Mislukt')
      }
    })
  }

  return (
    <div>
      <select
        value={status}
        onChange={(e) => change(e.target.value as MarketLeadStatus)}
        disabled={pending}
        className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
        style={{ border: '1px solid var(--color-line)' }}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-[0.65rem] inline-flex items-center gap-1" style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-2.5" />{error}
        </p>
      )}
    </div>
  )
}

export function NotesEditor({
  leadId,
  initial,
}: {
  leadId: string
  initial: string | null
}) {
  const [value, setValue] = useState(initial ?? '')
  const [original, setOriginal] = useState(initial ?? '')
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function save() {
    setFeedback(null)
    startTransition(async () => {
      const res = await updateMarketLeadNotesAction(leadId, value)
      if (res.ok) {
        setOriginal(value)
        setFeedback({ ok: true, msg: 'Bewaard' })
      } else {
        setFeedback({ ok: false, msg: res.error ?? 'Mislukt' })
      }
    })
  }

  const dirty = value !== original

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Eigen notities over deze lead (eigenaar belde terug, herinnering …)"
        className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
        style={{ border: '1px solid var(--color-line)' }}
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Check className="size-3" />
          {pending ? 'Bezig…' : 'Bewaar'}
        </button>
        {feedback && (
          <span className="text-[0.65rem] inline-flex items-center gap-1"
            style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
            {feedback.ok ? <Check className="size-2.5" /> : <AlertCircle className="size-2.5" />}
            {feedback.msg}
          </span>
        )}
      </div>
    </div>
  )
}

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function remove() {
    if (!confirm('Dit pand PERMANENT uit je marktmonitor verwijderen?')) return
    startTransition(async () => {
      const res = await deleteMarketLeadAction(leadId)
      if (res.ok) {
        router.push('/admin/marktmonitor')
      } else {
        alert(res.error ?? 'Verwijderen mislukt')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--color-mute)] hover:text-red-700 transition-colors disabled:opacity-50"
    >
      <Trash2 className="size-3.5" />
      Verwijder uit lijst
    </button>
  )
}
