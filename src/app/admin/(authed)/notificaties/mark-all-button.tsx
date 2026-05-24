'use client'

import { useState, useTransition } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { markAllNotificationsReadAction } from './actions'

export function MarkAllReadButton({ unreadCount }: { unreadCount: number }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (unreadCount === 0) return null

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const res = await markAllNotificationsReadAction()
      if (!res.ok) setError(res.error ?? 'Onbekende fout')
    })
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <Check className="size-3.5" />
        {pending ? 'Bezig…' : `Markeer alle (${unreadCount}) als gelezen`}
      </button>
      {error && (
        <span className="text-xs inline-flex items-center gap-1" style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-3" />
          {error}
        </span>
      )}
    </div>
  )
}
