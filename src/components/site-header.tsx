'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Home, KeyRound, Briefcase, Users, MessageCircle, Lock, Info, Menu, X, Phone, Mail } from 'lucide-react'
import { SiteTopbar } from './site-topbar'
import { BrandLogo } from './brand-logo'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (pathname: string) => boolean
}

const NAV: NavItem[] = [
  { href: '/te-koop',          label: 'Te koop',   icon: Home,          match: (p) => p === '/te-koop' || p.startsWith('/aanbod/') },
  { href: '/te-huur',          label: 'Te huur',   icon: KeyRound,      match: (p) => p === '/te-huur' },
  { href: '/diensten/verkoop', label: 'Diensten',  icon: Briefcase,     match: (p) => p.startsWith('/diensten/') },
  { href: '/info',             label: 'Info',      icon: Info,          match: (p) => p.startsWith('/info') },
  { href: '/ons-team',         label: 'Ons team',  icon: Users,         match: (p) => p === '/ons-team' },
  { href: '/contact',          label: 'Contact',   icon: MessageCircle, match: (p) => p === '/contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Sluit menu wanneer route verandert
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Voorkom body-scroll wanneer drawer open is
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div
      className="sticky top-0 z-40"
      style={{
        background: 'color-mix(in srgb, var(--color-paper) 92%, transparent)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        boxShadow: '0 6px 24px -16px rgba(11, 79, 88, 0.18), 0 2px 4px -2px rgba(11, 79, 88, 0.05)',
      }}
    >
      <SiteTopbar />

      <header
        className="border-b"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="container-px mx-auto max-w-screen-2xl flex items-center justify-between h-20">
          {/* === Logo (officieel, horizontaal) === */}
          <Link href="/" className="block transition-opacity hover:opacity-85">
            <BrandLogo height={44} priority />
          </Link>

          {/* === Navigatie === */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active || undefined}
                  className="nav-link inline-flex items-center gap-1.5"
                >
                  <Icon className="size-3.5 opacity-70" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* === Rechtse acties — desktop === */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/portaal/login"
              data-active={pathname.startsWith('/portaal') || undefined}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors data-[active=true]:bg-[var(--color-paper-2)]"
              style={{ color: 'var(--color-mute)', border: '1px solid var(--color-line)' }}
            >
              <Lock className="size-3.5" />
              <span>Klantenportaal</span>
            </Link>
            <Link href="/gratis-schatting" className="pill-cta">
              Gratis schatting
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* === Hamburger — mobile === */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden grid place-items-center size-11"
            style={{ color: 'var(--color-ink)' }}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {/* === Subtiel accent-lijntje onder de header — clay-dark gradient === */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, color-mix(in srgb, var(--color-clay-dark) 55%, transparent) 25%, color-mix(in srgb, var(--color-clay-dark) 55%, transparent) 75%, transparent 100%)',
        }}
      />

      {/* === Mobile drawer === */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Sluit menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0"
            style={{
              background: 'color-mix(in srgb, #1a1a1a 50%, transparent)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel — één scrollable container, geen flex-1 (was bug op iOS Safari) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm overflow-y-auto overscroll-contain"
            style={{
              background: 'var(--color-paper)',
              boxShadow: '-12px 0 32px -8px rgba(0,0,0,0.25)',
              animation: 'vb-drawer-in 280ms cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            <style>{`
              @keyframes vb-drawer-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Sticky header binnen scrollable container */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 h-20"
              style={{
                background: 'var(--color-paper)',
                borderBottom: '1px solid var(--color-line)',
              }}
            >
              <BrandLogo height={36} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Sluit menu"
                className="grid place-items-center size-10"
                style={{ color: 'var(--color-ink)' }}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="px-6 py-6">
              <ul>
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active = item.match(pathname)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 py-4 text-xl transition-colors"
                        style={{
                          color: active ? 'var(--color-accent)' : 'var(--color-ink)',
                          fontFamily: 'var(--font-display)',
                          borderBottom: '1px solid var(--color-line)',
                        }}
                      >
                        <Icon className="size-4 opacity-60" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <Link
                    href="/portaal/login"
                    className="flex items-center gap-3 py-4 text-xl"
                    style={{
                      color: pathname.startsWith('/portaal') ? 'var(--color-accent)' : 'var(--color-ink)',
                      fontFamily: 'var(--font-display)',
                      borderBottom: '1px solid var(--color-line)',
                    }}
                  >
                    <Lock className="size-4 opacity-60" />
                    Klantenportaal
                  </Link>
                </li>
              </ul>
            </nav>

            {/* CTA + contact onderaan, in dezelfde scroll-flow */}
            <div
              className="px-6 py-8 mt-2"
              style={{ borderTop: '1px solid var(--color-line)', background: 'var(--color-paper-2)' }}
            >
              <Link
                href="/gratis-schatting"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium"
                style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
              >
                Gratis schatting aanvragen
                <ArrowRight className="size-4" />
              </Link>
              <div className="mt-6 flex flex-col gap-3 text-sm" style={{ color: 'var(--color-mute)' }}>
                <a href="tel:+3255595010" className="inline-flex items-center gap-2">
                  <Phone className="size-3.5" />
                  +32 (0)55 59 50 10
                </a>
                <a href="mailto:info@vastgoedbrowaeys.be" className="inline-flex items-center gap-2">
                  <Mail className="size-3.5" />
                  info@vastgoedbrowaeys.be
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
