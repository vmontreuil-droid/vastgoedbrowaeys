import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ForgotPasswordForm } from './form'

export const metadata = {
  title: 'Admin — wachtwoord vergeten',
  robots: { index: false, follow: false },
}

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-paper)' }}>
      <div className="container-px mx-auto max-w-screen-2xl py-8">
        <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <ArrowLeft className="size-4" />
          Terug naar admin-login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <BrandLogo height={36} />
            <span
              className="px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em]"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              Admin
            </span>
          </div>

          <h1 className="text-3xl mb-2">Wachtwoord vergeten</h1>
          <p className="text-sm text-[var(--color-mute)] mb-8">
            Vul je admin-e-mailadres in. Je ontvangt een bericht met een link om een nieuw wachtwoord in te stellen.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
