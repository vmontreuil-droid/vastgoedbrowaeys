import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { AdminLoginForm } from './login-form'

export const metadata = {
  title: 'Admin — inloggen',
  description: 'Beheer-toegang voor Vastgoed Browaeys medewerkers.',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--color-paper)' }}>
      {/* === Linkerkant — donker, admin-vibe === */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <span
          aria-hidden
          className="absolute select-none pointer-events-none leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '420px',
            color: 'var(--color-accent)',
            opacity: 0.18,
            bottom: '-0.32em',
            right: '-0.06em',
          }}
        >
          VB
        </span>
        <div className="relative">
          <p className="eyebrow" style={{ color: 'var(--color-accent-light)' }}>
            Admin · Beheer
          </p>
        </div>
        <div className="relative max-w-md">
          <ShieldCheck className="size-10 mb-6" style={{ color: 'var(--color-accent-light)' }} />
          <p
            className="text-3xl md:text-4xl leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vastgoed Browaeys{' '}
            <span className="italic" style={{ color: 'var(--color-accent-light)' }}>
              beheer.
            </span>
          </p>
          <p
            className="mt-6 text-base leading-relaxed"
            style={{ color: 'rgba(250, 248, 244, 0.75)' }}
          >
            Toegang voor erkende medewerkers van het kantoor. Dossiers, klanten,
            afspraken en het volledige aanbod — op één plek.
          </p>
        </div>
        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-accent-light)' }}
          >
            <ArrowLeft className="size-4" />
            Terug naar de site
          </Link>
        </div>
      </aside>

      {/* === Rechterkant — formulier === */}
      <section className="flex flex-col justify-center px-6 py-12 md:p-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)]">
              <ArrowLeft className="size-4" />
              Terug
            </Link>
          </div>

          <div className="mb-10 flex items-center gap-3">
            <BrandLogo height={40} />
            <span
              className="px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em]"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              Admin
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl mb-3">Beheer-login</h1>
          <p className="text-[var(--color-mute)] mb-10">
            Enkel voor medewerkers van Vastgoed Browaeys.
          </p>

          <Suspense fallback={<div className="h-64" />}>
            <AdminLoginForm />
          </Suspense>

          <p className="mt-10 pt-6 border-t text-sm text-[var(--color-mute)]" style={{ borderColor: 'var(--color-line)' }}>
            Bent u een klant? Ga naar het{' '}
            <Link href="/portaal/login" className="link-underline text-[var(--color-ink)]">
              klantenportaal →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
