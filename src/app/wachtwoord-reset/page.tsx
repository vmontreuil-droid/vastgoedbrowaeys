import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ResetPasswordForm } from './reset-form'

export const metadata = {
  title: 'Wachtwoord wijzigen',
  description: 'Stel een nieuw wachtwoord in voor uw Vastgoed Browaeys-account.',
  robots: { index: false, follow: false },
}

export default function WachtwoordResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-paper)' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)] mb-8">
          <ArrowLeft className="size-4" />
          Terug
        </Link>

        <div className="mb-10">
          <BrandLogo height={40} />
        </div>

        <h1 className="text-3xl md:text-4xl mb-3">Nieuw wachtwoord</h1>
        <p className="text-[var(--color-mute)] mb-10">
          Kies een sterk wachtwoord van minstens 8 tekens.
        </p>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
