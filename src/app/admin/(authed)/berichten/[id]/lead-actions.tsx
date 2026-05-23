'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, MailOpen, Mail, Archive, AlertCircle } from 'lucide-react'
import { markLeadReadAction, archiveLeadAction } from '../actions'

export function LeadActions({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggleRead() {
    setError(null)
    startTransition(async () => {
      const res = await markLeadReadAction(id, !isRead)
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function archive() {
    setError(null)
    startTransition(async () => {
      const res = await archiveLeadAction(id)
      if (!res.ok) {
        setError(res.error)
      } else {
        router.push('/admin/berichten')
      }
    })
  }

  return (
    <div className="p-4 space-y-2" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="eyebrow text-[0.55rem] mb-2">Acties</h3>
      {error && (
        <p className="text-xs flex items-start gap-1.5" style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-3 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={toggleRead}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-paper-2)' }}
      >
        {isRead ? <Mail className="size-3.5" /> : <Check className="size-3.5" />}
        {isRead ? 'Markeer als onbehandeld' : 'Markeer als behandeld'}
      </button>
      <button
        type="button"
        onClick={archive}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-paper-2)' }}
      >
        <Archive className="size-3.5" />
        Archiveer
      </button>
    </div>
  )
}
