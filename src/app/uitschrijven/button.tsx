'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { setOptOutAction } from './actions'

export function UnsubscribeButton({
  userId,
  email,
  token,
  action,
  label,
}: {
  userId: string
  email: string
  token: string
  action: 'unsubscribe' | 'resubscribe'
  label: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const res = await setOptOutAction({
        userId,
        email,
        token,
        optOut: action === 'unsubscribe',
      })
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error ?? 'Onbekende fout.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium disabled:opacity-50"
        style={{
          background: action === 'unsubscribe' ? 'var(--color-ink)' : 'var(--color-accent)',
          color: 'var(--color-paper)',
        }}
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {label}
      </button>
      {error && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs" style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}
    </>
  )
}
