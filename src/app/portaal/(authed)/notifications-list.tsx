'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Bell, Target, Check, CheckCheck } from 'lucide-react'
import { markMyNotificationReadAction, markAllMyNotificationsReadAction } from './notification-actions'

export type NotificationRow = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

export function NotificationsList({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = useState<NotificationRow[]>(initial)
  const [pending, startTransition] = useTransition()

  const unreadCount = items.filter((n) => !n.readAt).length

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    startTransition(async () => {
      await markMyNotificationReadAction(id)
    })
  }

  function markAll() {
    setItems((prev) => prev.map((n) => n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    startTransition(async () => {
      await markAllMyNotificationsReadAction()
    })
  }

  return (
    <section className="mb-10 md:mb-14">
      <div className="flex items-end justify-between mb-4 md:mb-5">
        <h2 className="text-xl md:text-2xl flex items-center gap-2 md:gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <Bell className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
          Meldingen
          {unreadCount > 0 && (
            <span className="text-[0.6rem] uppercase tracking-[0.12em] font-medium px-2 py-0.5"
              style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}>
              {unreadCount} nieuw
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs link-underline text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
          >
            <CheckCheck className="size-3" />
            Alles markeren als gelezen
          </button>
        )}
      </div>
      <ul className="divide-y"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderColor: 'var(--color-line)' }}>
        {items.slice(0, 5).map((n) => (
          <li key={n.id}
            className="flex items-start gap-3 px-3 sm:px-4 py-3"
            style={{ background: n.readAt ? 'transparent' : 'var(--color-paper-2)' }}>
            <span className="inline-flex items-center justify-center size-7 shrink-0 mt-0.5"
              style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}>
              {n.type === 'new_match' ? <Target className="size-3" /> : <Bell className="size-3" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${n.readAt ? '' : 'font-medium'}`}>{n.title}</p>
              {n.body && (
                <p className="text-xs text-[var(--color-mute)] mt-0.5">{n.body}</p>
              )}
              <p className="text-[0.65rem] text-[var(--color-mute)] mt-1">
                {new Date(n.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {n.link && (
                <Link href={n.link}
                  className="text-xs link-underline"
                  style={{ color: 'var(--color-accent)' }}>
                  →
                </Link>
              )}
              {!n.readAt && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  disabled={pending}
                  className="text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
                  title="Markeer als gelezen"
                >
                  <Check className="size-3.5" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <p className="text-xs text-[var(--color-mute)] mt-2 text-right">
          + {items.length - 5} oudere meldingen
        </p>
      )}
    </section>
  )
}
