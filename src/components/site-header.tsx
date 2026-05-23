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
  icon: React.ComponentType<{ className?: string; size?: number | string; style?: React.CSSProperties }>
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

      {/* === Mobile menu — alles inline-styles, geen Tailwind/CSS-vars ===
          iOS Safari was inconsistent met var()-bg op fixed overlays. */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#faf8f4',
            zIndex: 9999,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: '80px',
              borderBottom: '1px solid #e6e1d7',
            }}
          >
            <BrandLogo height={36} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Sluit menu"
              style={{
                width: '44px',
                height: '44px',
                display: 'grid',
                placeItems: 'center',
                color: '#1a1a1a',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ padding: '16px 24px' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {NAV.map((item) => {
                const Icon = item.icon
                const active = item.match(pathname)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 0',
                        fontSize: '20px',
                        color: active ? '#0b4f58' : '#1a1a1a',
                        fontFamily: "'Fraunces', Georgia, serif",
                        borderBottom: '1px solid #e6e1d7',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={16} style={{ opacity: 0.6 }} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link
                  href="/portaal/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 0',
                    fontSize: '20px',
                    color: pathname.startsWith('/portaal') ? '#0b4f58' : '#1a1a1a',
                    fontFamily: "'Fraunces', Georgia, serif",
                    borderBottom: '1px solid #e6e1d7',
                    textDecoration: 'none',
                  }}
                >
                  <Lock size={16} style={{ opacity: 0.6 }} />
                  Klantenportaal
                </Link>
              </li>
            </ul>
          </nav>

          {/* CTA + contact */}
          <div
            style={{
              padding: '32px 24px',
              marginTop: '8px',
              borderTop: '1px solid #e6e1d7',
              backgroundColor: '#f3efe7',
            }}
          >
            <Link
              href="/gratis-schatting"
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: '#0b4f58',
                color: '#faf8f4',
                textDecoration: 'none',
              }}
            >
              Gratis schatting aanvragen
              <ArrowRight size={16} />
            </Link>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#6b6b6b' }}>
              <a
                href="tel:+3255595010"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
              >
                <Phone size={14} />
                +32 (0)55 59 50 10
              </a>
              <a
                href="mailto:info@vastgoedbrowaeys.be"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
              >
                <Mail size={14} />
                info@vastgoedbrowaeys.be
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
