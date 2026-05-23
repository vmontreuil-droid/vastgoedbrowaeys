'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { deleteTeamMemberAction } from './actions'

export function DeleteTeamMemberButton({
  userId,
  name,
  isSelf,
}: {
  userId: string
  name: string
  isSelf: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (isSelf) {
    return (
      <span className="text-xs text-[var(--color-mute)] italic">jij</span>
    )
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const res = await deleteTeamMemberAction(userId)
      if (!res.ok) {
        setError(res.error)
      } else {
        setConfirming(false)
      }
    })
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-red-700 transition-colors"
        aria-label={`Verwijder ${name}`}
      >
        <Trash2 className="size-3.5" />
        Verwijderen
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <span className="text-xs text-red-700 flex items-center gap-1">
          <AlertCircle className="size-3" />
          {error}
        </span>
      )}
      <div className="flex items-center gap-2 text-xs">
        <span>Zeker?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="px-2 py-1 text-white disabled:opacity-50"
          style={{ background: '#b91c1c' }}
        >
          {pending ? '…' : 'Ja, verwijder'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false)
            setError(null)
          }}
          className="link-underline"
        >
          Annuleer
        </button>
      </div>
    </div>
  )
}
