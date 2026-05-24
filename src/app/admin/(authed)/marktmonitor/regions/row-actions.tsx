'use client'

import { useState, useTransition } from 'react'
import { PlayCircle, Power, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  toggleRegionEnabledAction,
  deleteRegionAction,
  scanRegionNowAction,
} from '../regions-actions'

export function RegionRowActions({ id, enabled }: { id: string; enabled: boolean }) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function toggle() {
    startTransition(async () => {
      const res = await toggleRegionEnabledAction(id, !enabled)
      if (!res.ok) setFeedback({ ok: false, msg: res.error ?? 'Mislukt' })
    })
  }

  function scanNow() {
    setFeedback({ ok: true, msg: 'Bezig met scannen — kan tot 30s duren…' })
    startTransition(async () => {
      const res = await scanRegionNowAction(id)
      if (res.ok) {
        const siteCount = Object.values(res.perSite).filter((s) => s.ok).length
        setFeedback({
          ok: true,
          msg: `${res.newLeads} nieuwe + ${res.mergedLeads} samengevoegd · ${siteCount}/${Object.keys(res.perSite).length} sites OK`,
        })
      } else {
        setFeedback({ ok: false, msg: res.error })
      }
    })
  }

  function remove() {
    if (!confirm('Deze zone permanent verwijderen? Bestaande leads blijven behouden.')) return
    startTransition(async () => {
      const res = await deleteRegionAction(id)
      if (!res.ok) setFeedback({ ok: false, msg: res.error ?? 'Mislukt' })
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={scanNow}
        disabled={pending}
        title="Scan deze zone nu"
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <PlayCircle className="size-3" />
        Scan nu
      </button>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        title={enabled ? 'Pauzeer' : 'Activeer'}
        className="p-2 text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
      >
        <Power className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        title="Verwijder"
        className="p-2 text-[var(--color-mute)] hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
      {feedback && (
        <span className="text-[0.65rem] ml-2 inline-flex items-center gap-1 max-w-[200px]"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
          <span className="truncate">{feedback.msg}</span>
        </span>
      )}
    </div>
  )
}
