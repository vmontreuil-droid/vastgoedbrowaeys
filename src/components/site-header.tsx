'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Home, KeyRound, Briefcase, Users, MessageCircle, Lock, Info } from 'lucide-react'
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

          {/* === Rechtse CTA + portaal === */}
          <div className="flex items-center gap-3">
            <Link
              href="/portaal/login"
              data-active={pathname.startsWith('/portaal') || undefined}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors data-[active=true]:bg-[var(--color-paper-2)]"
              style={{ color: 'var(--color-mute)', border: '1px solid var(--color-line)' }}
            >
              <Lock className="size-3.5" />
              <span className="hidden lg:inline">Klantenportaal</span>
            </Link>
            <Link href="/gratis-schatting" className="pill-cta">
              Gratis schatting
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
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
    </div>
  )
}
