'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LogOut, LayoutDashboard, FolderOpen, Calendar, FileText, Menu, X, User,
} from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { signOutAction } from '@/lib/auth/actions'

const NAV: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
}> = [
  { href: '/portaal',            label: 'Overzicht',    icon: LayoutDashboard },
  { href: '/portaal/dossiers',   label: 'Mijn dossiers', icon: FolderOpen },
  { href: '/portaal/afspraken',  label: 'Afspraken',    icon: Calendar },
  { href: '/portaal/documenten', label: 'Documenten',   icon: FileText },
  { href: '/portaal/instellingen', label: 'Instellingen', icon: User },
]

export function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/portaal') return pathname === '/portaal'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-paper-2)' }}>
      {/* === Portal header === */}
      <header
        className="border-b sticky top-0 z-30"
        style={{
          background: 'color-mix(in srgb, var(--color-paper) 95%, transparent)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--color-line)',
        }}
      >
        <div className="container-px mx-auto max-w-screen-2xl flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-[var(--color-ink)] -ml-1 p-1"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
            <Link href="/portaal" className="flex items-center gap-3">
              <BrandLogo height={32} textHeight={32} />
              <span
                className="hidden sm:inline-block ml-1 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em]"
                style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
              >
                Portaal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-sm truncate max-w-[200px]">{user.name}</span>
              <span className="text-xs text-[var(--color-mute)] truncate max-w-[200px]">{user.email}</span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                title="Afmelden"
                className="inline-flex items-center gap-1.5 text-sm link-underline text-[var(--color-mute)] cursor-pointer"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Afmelden</span>
              </button>
            </form>
          </div>
        </div>

        {/* Desktop nav (tabs) */}
        <nav className="hidden md:block border-t" style={{ borderColor: 'var(--color-line)' }}>
          <div className="container-px mx-auto max-w-screen-2xl flex items-center gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2"
                  style={{
                    borderColor: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? 'var(--color-accent)' : 'var(--color-ink)',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col"
            style={{ background: 'var(--color-paper)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
              <BrandLogo height={32} textHeight={32} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-[var(--color-mute)] p-1"
                aria-label="Sluit menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-line)' }}>
              <p className="text-sm truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-mute)] truncate">{user.email}</p>
            </div>
            <nav className="flex-1 py-3">
              <ul>
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
                        style={{
                          background: active ? 'var(--color-paper-2)' : 'transparent',
                          color: active ? 'var(--color-accent)' : 'var(--color-ink)',
                          borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <form action={signOutAction} className="border-t" style={{ borderColor: 'var(--color-line)' }}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              >
                <LogOut className="size-4" />
                Afmelden
              </button>
            </form>
          </aside>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer
        className="border-t mt-12"
        style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper)' }}
      >
        <div className="container-px mx-auto max-w-screen-2xl py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-mute)]">
          <span>Vastgoed Browaeys · BIV 504.553 · Vlaamse Ardennen</span>
          <div className="flex gap-5">
            <Link href="/privacy-verklaring" className="link-underline">Privacy</Link>
            <Link href="/contact" className="link-underline">Hulp nodig?</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
