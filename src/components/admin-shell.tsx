'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Send,
} from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { signOutAction } from '@/lib/auth/actions'

export type AdminNavBadges = {
  klanten?: number
  dossiers?: number
  aanbod?: number
  afspraken?: number
  berichten?: { total: number; unread: number }
  notificaties?: { total: number; unread: number }
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
  { href: '/admin/notificaties', label: 'Meldingen',    icon: Bell,           badgeKey: 'notificaties' },
  { href: '/admin/nieuwsbrief',  label: 'Nieuwsbrief',  icon: Send },
  { href: '/admin/instellingen', label: 'Instellingen', icon: Settings },
]

const STORAGE_KEY = 'vb-admin-sidebar-collapsed'

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
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === '1') setCollapsed(true)
    setHydrated(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
      return next
    })
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  function badgeValue(item: (typeof NAV)[number]): { count: number; urgent: boolean } | null {
    if (!item.badgeKey) return null
    const v = badges[item.badgeKey]
    if (v === undefined) return null
    if (typeof v === 'number') {
      if (v <= 0) return null
      return { count: v, urgent: false }
    }
    if (v.total <= 0) return null
    return { count: v.unread > 0 ? v.unread : v.total, urgent: v.unread > 0 }
  }

  function renderBadgeChip(item: (typeof NAV)[number]) {
    const b = badgeValue(item)
    if (!b) return null
    return (
      <span
        className="ml-auto inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[0.65rem] font-medium"
        style={{
          background: b.urgent ? '#b91c1c' : 'var(--color-paper-2)',
          color: b.urgent ? '#fff' : 'var(--color-mute)',
        }}
      >
        {b.count}
      </span>
    )
  }

  function renderBadgeDot(item: (typeof NAV)[number]) {
    const b = badgeValue(item)
    if (!b) return null
    return (
      <span
        className="absolute -top-1.5 -right-2 inline-flex items-center justify-center text-[0.55rem] font-medium leading-none rounded-full"
        style={{
          background: b.urgent ? '#b91c1c' : 'var(--color-accent)',
          color: '#fff',
          minWidth: 14,
          height: 14,
          padding: '0 4px',
        }}
      >
        {b.count}
      </span>
    )
  }

  const sidebar = (forMobile: boolean) => {
    const isCollapsed = !forMobile && collapsed && hydrated
    return (
      <aside
        className="flex flex-col h-full"
        style={{
          background: 'var(--color-paper)',
          borderRight: '1px solid var(--color-line)',
          width: '100%',
        }}
      >
        {/* Logo */}
        <div
          className="px-3 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-line)' }}
        >
          <Link
            href="/admin"
            className="flex items-center min-w-0"
            onClick={() => setMobileOpen(false)}
            title="Vastgoed Browaeys — Admin"
          >
            {isCollapsed ? (
              <BrandLogo height={26} textHeight={0} />
            ) : (
              <BrandLogo height={26} textHeight={26} />
            )}
          </Link>

          {forMobile && (
            <button
              type="button"
              className="text-[var(--color-mute)] hover:text-[var(--color-ink)] shrink-0"
              onClick={() => setMobileOpen(false)}
              aria-label="Sluit menu"
            >
              <X className="size-5" />
            </button>
          )}
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
                    title={isCollapsed ? item.label : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors relative"
                    style={{
                      background: active ? 'var(--color-paper-2)' : 'transparent',
                      color: active ? 'var(--color-ink)' : 'var(--color-mute)',
                      borderLeft: active
                        ? '2px solid var(--color-accent)'
                        : '2px solid transparent',
                      paddingLeft: isCollapsed ? '11px' : '14px',
                      paddingRight: isCollapsed ? '11px' : '12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <span className="relative shrink-0">
                      <Icon
                        className="size-4"
                        style={{ color: active ? 'var(--color-accent)' : 'currentColor' }}
                      />
                      {isCollapsed && renderBadgeDot(item)}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {renderBadgeChip(item)}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only, onderaan boven user-info) */}
        {!forMobile && (
          <div
            className={isCollapsed ? 'flex justify-center py-2' : 'flex justify-end px-3 py-2'}
            style={{ borderTop: '1px solid var(--color-line)' }}
          >
            <button
              type="button"
              className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Klap sidebar uit' : 'Klap sidebar in'}
              title={isCollapsed ? 'Klap uit' : 'Klap in'}
            >
              {isCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </button>
          </div>
        )}

        {/* User + logout */}
        <div
          className="py-3"
          style={{ borderTop: '1px solid var(--color-line)' }}
        >
          {!isCollapsed && (
            <div className="px-5 py-2">
              <p className="text-sm truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-mute)] truncate">{user.email}</p>
            </div>
          )}
          <div className={isCollapsed ? 'flex flex-col items-center gap-1' : 'px-3 space-y-1'}>
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              title="Bekijk publieke site"
              className={
                isCollapsed
                  ? 'p-2 text-[var(--color-mute)] hover:text-[var(--color-ink)]'
                  : 'flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors'
              }
            >
              <ExternalLink className="size-3.5" />
              {!isCollapsed && <span>Bekijk publieke site</span>}
            </Link>
            <form action={signOutAction} className={isCollapsed ? '' : 'w-full'}>
              <button
                type="submit"
                title="Afmelden"
                className={
                  isCollapsed
                    ? 'p-2 text-[var(--color-mute)] hover:text-[var(--color-ink)]'
                    : 'w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors'
                }
              >
                <LogOut className="size-3.5" />
                {!isCollapsed && <span>Afmelden</span>}
              </button>
            </form>
          </div>
        </div>
      </aside>
    )
  }

  const desktopWidth = collapsed && hydrated ? '64px' : '240px'

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
          className="px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.18em]"
          style={{ border: '1px solid var(--color-line)', color: 'var(--color-mute)' }}
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
            {sidebar(true)}
          </div>
        </div>
      )}

      <div className="md:grid transition-[grid-template-columns]" style={{ gridTemplateColumns: `${desktopWidth} 1fr` }}>
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">
          {sidebar(false)}
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
