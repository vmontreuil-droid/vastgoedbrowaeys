'use client'

import { useState, useTransition } from 'react'
import { MailX, Mail } from 'lucide-react'
import { adminToggleOptOutAction } from './opt-out-actions'

export function OptOutToggle({ userId, initialOptOut }: { userId: string; initialOptOut: boolean }) {
  const [optOut, setOptOut] = useState(initialOptOut)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const next = !optOut
    setOptOut(next)
    startTransition(async () => {
      const res = await adminToggleOptOutAction(userId, next)
      if (!res.ok) setOptOut(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={optOut ? 'Klant is uitgeschreven uit nieuwsbrief — klik om terug in te schrijven' : 'Uitschrijven van nieuwsbrief'}
      className="inline-flex items-center justify-center p-1 disabled:opacity-50"
      style={{ color: optOut ? '#b91c1c' : 'var(--color-mute)' }}
    >
      {optOut ? <MailX className="size-3.5" /> : <Mail className="size-3.5" />}
    </button>
  )
}
