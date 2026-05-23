'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LogOut,
  LayoutDashboard,
  Users,
  FolderOpen,
  Home,
  Calendar,
  MessageSquare,
  Settings,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { signOutAction } from '@/lib/auth/actions'

export type AdminNavBadges = {
  klanten?: number
  dossiers?: number
  aanbod?: number
  afspraken?: number
  berichten?: { total: number; unread: number }
}

const NAV: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
  badgeKey?: keyof AdminNavBadges
}> = [
  { href: '/admin',              label: 'Overzicht',    icon: LayoutDashboard },
  { href: '/admin/klanten',      label: 'Klanten',      icon: Users,          badgeKey: 'klanten' },
  { href: '/admin/dossiers',     label: 'Dossiers',     icon: FolderOpen,     badgeKey: 'dossiers' },
  { href: '/admin/aanbod',       label: 'Aanbod',       icon: Home,           badgeKey: 'aanbod' },
  { href: '/admin/afspraken',    label: 'Afspraken',    icon: Calendar,       badgeKey: 'afspraken' },
  { href: '/admin/berichten',    label: 'Berichten',    icon: MessageSquare,  badgeKey: 'berichten' },
  { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
]

export function AdminShell({
  children,
  user,
  badges = {},
}: {
  children: React.ReactNode
  user: { name: string; email: string }
  badges?: AdminNavBadges
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function renderBadge(item: (typeof NAV)[number]) {
    if (!item.badgeKey) return null
    const v = badges[item.badgeKey]
    if (v === undefined) return null
    if (typeof v === 'number') {
      if (v <= 0) return null
      return (
        <span
          className="ml-auto inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[0.65rem] font-medium"
          style={{
            background: 'var(--color-paper-2)',
            color: 'var(--color-mute)',
          }}
        >
          {v}
        </span>
      )
    }
    // berichten badge: unread highlight
    const { total, unread } = v
    if (total <= 0) return null
    return (
      <span
        className="ml-auto inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[0.65rem] font-medium"
        style={{
          background: unread > 0 ? '#b91c1c' : 'var(--color-paper-2)',
          color: unread > 0 ? '#fff' : 'var(--color-mute)',
        }}
      >
        {unread > 0 ? unread : total}
      </span>
    )
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebar = (
    <aside
      className="flex flex-col h-full"
      style={{
        background: 'var(--color-paper)',
        borderRight: '1px solid var(--color-line)',
      }}
    >
      {/* Logo + Admin badge */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--color-line)' }}
      >
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <BrandLogo height={28} textHeight={28} />
          <span
            className="px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            Admin
          </span>
        </Link>
        <button
          type="button"
          className="ml-auto md:hidden text-[var(--color-mute)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Sluit menu"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                  style={{
                    background: active ? 'var(--color-paper-2)' : 'transparent',
                    color: active ? 'var(--color-ink)' : 'var(--color-mute)',
                    borderLeft: active
                      ? '2px solid var(--color-accent)'
                      : '2px solid transparent',
                    paddingLeft: '14px',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon
                    className="size-4 shrink-0"
                    style={{ color: active ? 'var(--color-accent)' : 'currentColor' }}
                  />
                  <span>{item.label}</span>
                  {renderBadge(item)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + logout */}
      <div
        className="px-3 py-3 space-y-1"
        style={{ borderTop: '1px solid var(--color-line)' }}
      >
        <div className="px-3 py-2">
          <p className="text-sm truncate">{user.name}</p>
          <p className="text-xs text-[var(--color-mute)] truncate">{user.email}</p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ExternalLink className="size-3.5" />
          Bekijk publieke site
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >
            <LogOut className="size-3.5" />
            Afmelden
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-paper-2)' }}
    >
      {/* Mobile top bar */}
      <div
        className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{
          background: 'var(--color-paper)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-[var(--color-ink)]"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
        <BrandLogo height={26} textHeight={26} />
        <span
          className="px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.18em]"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          Admin
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      <div className="md:grid" style={{ gridTemplateColumns: '240px 1fr' }}>
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">
          {sidebar}
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
