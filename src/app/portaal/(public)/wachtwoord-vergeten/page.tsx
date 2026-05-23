import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { ForgotPasswordForm } from './form'

export const metadata = {
  title: 'Wachtwoord vergeten',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-paper)' }}>
      <div className="container-px mx-auto max-w-screen-2xl py-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo height={36} textHeight={36} />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl mb-2">Wachtwoord vergeten</h1>
          <p className="text-sm text-[var(--color-mute)] mb-8">
            Vul uw e-mailadres in. U ontvangt een bericht met een link om uw wachtwoord opnieuw in te stellen.
          </p>

          <ForgotPasswordForm />

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <Link href="/portaal/login" className="text-sm link-underline">
              ← Terug naar inloggen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
