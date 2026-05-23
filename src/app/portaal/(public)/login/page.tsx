import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { LoginForm } from './login-form'

export const metadata = {
  title: 'Klantenportaal — inloggen',
  description: 'Toegang tot uw persoonlijk dossier bij Vastgoed Browaeys.',
}

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--color-paper)' }}>
      {/* === Linkerkant — quote === */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
      >
        <span
          aria-hidden
          className="absolute select-none pointer-events-none leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '480px',
            color: 'var(--color-clay)',
            opacity: 0.16,
            top: '-0.18em',
            right: '-0.08em',
          }}
        >
          “
        </span>
        <div className="relative">
          <p className="eyebrow" style={{ color: 'var(--color-clay)' }}>
            Klantenportaal
          </p>
        </div>
        <div className="relative max-w-md">
          <p
            className="text-3xl md:text-4xl leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Uw dossier,{' '}
            <span className="italic" style={{ color: 'var(--color-clay)' }}>
              transparant op één plek.
            </span>
          </p>
          <p
            className="mt-6 text-base leading-relaxed"
            style={{ color: 'rgba(250, 248, 244, 0.85)' }}
          >
            Bekijk uw lopende verkoop- of huurdossier, geplande bezichtigingen, gedeelde
            documenten en uw persoonlijke zoekcriteria — wanneer het u uitkomt.
          </p>
        </div>
        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-clay)' }}
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

          <div className="mb-10">
            <BrandLogo height={40} />
          </div>

          <h1 className="text-3xl md:text-4xl mb-3">Inloggen</h1>
          <p className="text-[var(--color-mute)] mb-10">
            Toegang tot uw persoonlijk dossier.
          </p>

          <Suspense fallback={<div className="h-64" />}>
            <LoginForm />
          </Suspense>

          <p className="mt-10 pt-6 border-t text-sm text-[var(--color-mute)]" style={{ borderColor: 'var(--color-line)' }}>
            Nog geen toegang? Uw makelaar maakt uw account aan zodra uw dossier opgestart wordt.
            <br />
            <Link href="/contact" className="link-underline text-[var(--color-ink)] mt-2 inline-block">
              Contacteer ons →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
