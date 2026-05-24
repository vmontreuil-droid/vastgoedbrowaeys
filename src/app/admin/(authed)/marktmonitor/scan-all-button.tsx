'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

export function ScanAllButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function go() {
    if (!confirm('Alle actieve zones nu scannen? Dit kan tot een minuut duren afhankelijk van het aantal zones.')) return
    setFeedback({ ok: true, msg: 'Bezig…' })
    startTransition(async () => {
      try {
        const res = await fetch('/api/cron/market-scan', { method: 'GET' })
        if (!res.ok) {
          if (res.status === 401) {
            setFeedback({ ok: false, msg: 'Autorisatie vereist — CRON_SECRET niet correct of mist' })
            return
          }
          setFeedback({ ok: false, msg: `HTTP ${res.status}` })
          return
        }
        const data = await res.json() as {
          ok: boolean
          totals?: { regions: number; new: number; scraped: number }
          totals_runs?: number
          error?: string
        } & { totals: { regions: number; new: number; scraped: number; mergedLeads: number; newLeads: number } }
        if (data.ok) {
          setFeedback({
            ok: true,
            msg: `${data.totals.regions} zone(s) gescand · ${data.totals.newLeads} nieuw · ${data.totals.mergedLeads} samengevoegd · ${data.totals.scraped} totaal`,
          })
          router.refresh()
        } else {
          setFeedback({ ok: false, msg: data.error ?? 'Onbekende fout' })
        }
      } catch (e) {
        setFeedback({ ok: false, msg: e instanceof Error ? e.message : 'Fetch error' })
      }
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={go}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <PlayCircle className="size-3.5" />
        {pending ? 'Scannen…' : 'Scan alle zones nu'}
      </button>
      {feedback && (
        <span className="text-xs inline-flex items-center gap-1"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
          {feedback.msg}
        </span>
      )}
    </div>
  )
}
