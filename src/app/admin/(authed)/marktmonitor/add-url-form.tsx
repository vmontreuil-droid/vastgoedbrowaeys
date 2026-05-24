'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, AlertCircle, CheckCircle2, Link2 } from 'lucide-react'
import { addMarketLeadByUrlAction } from './actions'

export function AddUrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)
    if (!url.trim()) return
    startTransition(async () => {
      const res = await addMarketLeadByUrlAction(url)
      if (res.ok) {
        setFeedback({ ok: true, msg: 'Pand toegevoegd' })
        setUrl('')
        router.push(`/admin/marktmonitor/${res.id}`)
      } else {
        setFeedback({ ok: false, msg: res.error })
      }
    })
  }

  return (
    <form onSubmit={submit} className="p-4 md:p-5 mb-6"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="text-sm md:text-base mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <Link2 className="size-4" style={{ color: 'var(--color-accent)' }} />
        URL toevoegen
      </h3>
      <p className="text-xs text-[var(--color-mute)] mb-3">
        Plak een link naar een pand op Immoweb, Zimmo, Realo, Hebbes, Logic-Immo, … We lezen de
        publieke meta-data en voegen het toe aan je marktoverzicht.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.immoweb.be/nl/zoekertje/..."
          required
          className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
        <button
          type="submit"
          disabled={pending || !url.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-4" />
          {pending ? 'Bezig…' : 'Toevoegen'}
        </button>
      </div>
      {feedback && (
        <p className="mt-3 text-xs inline-flex items-center gap-1"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
          {feedback.msg}
        </p>
      )}
    </form>
  )
}
