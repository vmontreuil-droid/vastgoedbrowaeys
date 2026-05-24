'use client'

import { useState, useTransition } from 'react'
import { Crown, Trash2, AlertCircle, Check } from 'lucide-react'
import { promoteToAdminAction, deleteUserByIdAction } from './actions'

export function DiagnoseActions({
  userId,
  email,
  canPromote,
  canDelete,
}: {
  userId: string
  email: string
  canPromote: boolean
  canDelete: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function promote() {
    setFeedback(null)
    startTransition(async () => {
      const res = await promoteToAdminAction(userId)
      setFeedback({ ok: res.ok, msg: res.ok ? (res.message ?? 'OK') : (res.error ?? 'Mislukt') })
    })
  }

  function remove() {
    if (!confirm(`User ${email} (${userId.slice(0, 8)}…) PERMANENT verwijderen?`)) return
    setFeedback(null)
    startTransition(async () => {
      const res = await deleteUserByIdAction(userId)
      setFeedback({ ok: res.ok, msg: res.ok ? (res.message ?? 'OK') : (res.error ?? 'Mislukt') })
    })
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-2">
        {canPromote && (
          <button
            type="button"
            onClick={promote}
            disabled={pending}
            className="inline-flex items-center gap-1 px-2 py-1 text-[0.7rem] disabled:opacity-50"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            title="Zet role=admin in user_metadata"
          >
            <Crown className="size-3" />
            Maak admin
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 px-2 py-1 text-[0.7rem] disabled:opacity-50"
            style={{ background: '#b91c1c', color: '#fff' }}
            title="Verwijder deze user permanent"
          >
            <Trash2 className="size-3" />
            Wis
          </button>
        )}
      </div>
      {feedback && (
        <p className="text-[0.65rem] inline-flex items-center gap-1"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <Check className="size-2.5" /> : <AlertCircle className="size-2.5" />}
          {feedback.msg}
        </p>
      )}
    </div>
  )
}
