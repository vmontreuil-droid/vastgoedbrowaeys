'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  Bell, Check, Trash2, ArrowUpRight, Mail, FileText, FolderClock, MapPin, Target,
} from 'lucide-react'
import { markNotificationReadAction, deleteNotificationAction } from './actions'
import type { AdminNotification, NotificationType } from '@/lib/admin-db'

const TYPE_LABEL: Record<NotificationType, string> = {
  new_match: 'Match',
  new_document: 'Document',
  appointment_reminder: 'Afspraak',
  dossier_update: 'Dossier',
  message: 'Bericht',
}

const TYPE_COLOR: Record<NotificationType, string> = {
  new_match: '#0b4f58',
  new_document: '#c98c4f',
  appointment_reminder: '#5a7a48',
  dossier_update: '#a25b3a',
  message: '#737373',
}

function TypeIcon({ type }: { type: NotificationType }) {
  if (type === 'new_match') return <Target className="size-3" />
  if (type === 'new_document') return <FileText className="size-3" />
  if (type === 'appointment_reminder') return <FolderClock className="size-3" />
  if (type === 'dossier_update') return <MapPin className="size-3" />
  if (type === 'message') return <Mail className="size-3" />
  return <Bell className="size-3" />
}

export function NotificationRow({ n }: { n: AdminNotification }) {
  const [pending, startTransition] = useTransition()
  const [optimisticRead, setOptimisticRead] = useState(!!n.readAt)
  const [hidden, setHidden] = useState(false)

  function toggleRead() {
    setOptimisticRead((r) => !r)
    startTransition(async () => {
      await markNotificationReadAction(n.id, !optimisticRead)
    })
  }

  function onDelete() {
    setHidden(true)
    startTransition(async () => {
      const res = await deleteNotificationAction(n.id)
      if (!res.ok) setHidden(false)
    })
  }

  if (hidden) return null

  return (
    <li
      className="grid grid-cols-[auto_1fr_auto] gap-3 px-4 py-3"
      style={{
        opacity: optimisticRead ? 0.55 : 1,
        background: optimisticRead ? 'transparent' : 'var(--color-paper-2)',
      }}
    >
      <span
        className="inline-flex items-center justify-center size-7 text-white shrink-0"
        style={{ background: TYPE_COLOR[n.type] }}
      >
        <TypeIcon type={n.type} />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-block px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
            style={{ background: TYPE_COLOR[n.type], color: '#fff' }}
          >
            {TYPE_LABEL[n.type]}
          </span>
          <span className="text-xs text-[var(--color-mute)]">
            voor{' '}
            <Link href={`/admin/klanten/${n.userId}`} className="link-underline">
              {n.userName}
            </Link>
          </span>
          <span className="text-[0.65rem] text-[var(--color-mute)]">
            · {new Date(n.createdAt).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className={`text-sm mt-0.5 ${optimisticRead ? '' : 'font-medium'}`}>{n.title}</p>
        {n.body && (
          <p className="text-xs text-[var(--color-mute)] mt-0.5">{n.body}</p>
        )}
        {n.link && (
          <Link
            href={n.link}
            className="mt-1 inline-flex items-center gap-1 text-xs link-underline"
            style={{ color: 'var(--color-accent)' }}
          >
            Bekijken <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={toggleRead}
          disabled={pending}
          title={optimisticRead ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
          className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          title="Verwijder"
          className="p-1.5 text-[var(--color-mute)] hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  )
}
