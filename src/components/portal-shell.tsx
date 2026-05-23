import Link from 'next/link'
import { LogOut, LayoutDashboard, FolderOpen, BellRing, Calendar, FileText } from 'lucide-react'
import { BrandLogo } from './brand-logo'

const NAV = [
  { href: '/portaal',            label: 'Overzicht',    icon: LayoutDashboard },
  { href: '/portaal/dossiers',   label: 'Mijn dossiers', icon: FolderOpen },
  { href: '/portaal/zoekcriteria', label: 'Zoekcriteria', icon: BellRing },
  { href: '/portaal/afspraken',  label: 'Afspraken',    icon: Calendar },
  { href: '/portaal/documenten', label: 'Documenten',   icon: FileText },
]

export function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
}) {
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
        <div className="container-px mx-auto max-w-screen-2xl flex items-center justify-between h-16">
          <Link href="/portaal" className="flex items-center gap-3">
            <BrandLogo height={36} textHeight={36} />
            <span
              className="hidden sm:inline-block ml-2 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em]"
              style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
            >
              Klantenportaal
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-sm">{user.name}</span>
              <span className="text-xs text-[var(--color-mute)]">{user.email}</span>
            </div>
            <Link
              href="/portaal/login?action=logout"
              className="inline-flex items-center gap-1.5 text-sm link-underline text-[var(--color-mute)]"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Afmelden</span>
            </Link>
          </div>
        </div>

        {/* Secundaire nav (tabs) */}
        <nav className="border-t" style={{ borderColor: 'var(--color-line)' }}>
          <div className="container-px mx-auto max-w-screen-2xl flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors hover:text-[var(--color-accent)] border-b-2"
                  style={{ borderColor: 'transparent', color: 'var(--color-ink)' }}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* === Content === */}
      <main className="flex-1">{children}</main>

      {/* === Sober portal footer === */}
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
