import Link from 'next/link'
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribeToken, makeUnsubscribeToken } from '@/lib/unsubscribe-token'
import { UnsubscribeButton } from './button'

export const metadata = {
  title: 'Uitschrijven',
  robots: { index: false, follow: false },
}

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function UnsubscribePage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const token = (params.t as string | undefined) ?? ''
  const email = (params.e as string | undefined)?.toLowerCase() ?? ''

  if (!token || !email) {
    return <UnsubscribeShell><InvalidLink reason="missing-params" /></UnsubscribeShell>
  }

  const result = verifyUnsubscribeToken(token, email)
  if (!result.ok) {
    return <UnsubscribeShell><InvalidLink reason="invalid-token" /></UnsubscribeShell>
  }

  // Haal user op via admin client om huidige status te tonen
  const admin = createAdminClient()
  const { data: userResp, error: userErr } = await admin.auth.admin.getUserById(result.userId)
  if (userErr || !userResp.user) {
    return <UnsubscribeShell><InvalidLink reason="user-not-found" /></UnsubscribeShell>
  }
  const user = userResp.user
  if ((user.email ?? '').toLowerCase() !== email) {
    return <UnsubscribeShell><InvalidLink reason="email-mismatch" /></UnsubscribeShell>
  }

  const alreadyOptedOut = user.user_metadata?.newsletter_opt_out === true

  // Recompute fresh token (om sub-action te gebruiken)
  const verifyToken = makeUnsubscribeToken(user.id, email)

  return (
    <UnsubscribeShell>
      <div className="text-center">
        <Mail className="size-10 mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
        <h1 className="text-2xl md:text-3xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          {alreadyOptedOut ? 'U bent uitgeschreven' : 'Uitschrijven uit nieuwsbrief'}
        </h1>
        <p className="text-sm text-[var(--color-mute)] mb-1">
          Beheer-account:
        </p>
        <p className="text-sm font-medium mb-6">{email}</p>

        {alreadyOptedOut ? (
          <>
            <div
              className="inline-flex items-start gap-2 p-3 mb-6 text-sm"
              style={{ background: 'rgba(34,197,94,0.10)', color: '#166534' }}
            >
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>U ontvangt geen nieuwsbrieven meer van Vastgoed Browaeys.</span>
            </div>
            <UnsubscribeButton
              userId={user.id}
              email={email}
              token={verifyToken}
              action="resubscribe"
              label="Toch terug inschrijven"
            />
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--color-mute)] mb-6 max-w-md mx-auto">
              We versturen geen nieuwsbrieven meer naar dit adres. Belangrijke
              berichten over uw eigen dossier blijven u uiteraard wel bereiken.
            </p>
            <UnsubscribeButton
              userId={user.id}
              email={email}
              token={verifyToken}
              action="unsubscribe"
              label="Bevestig — schrijf me uit"
            />
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-line)' }}>
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)]">
          <ArrowLeft className="size-3" />
          Terug naar de site
        </Link>
      </div>
    </UnsubscribeShell>
  )
}

function InvalidLink({ reason }: { reason: string }) {
  return (
    <div className="text-center">
      <AlertCircle className="size-10 mx-auto mb-4" style={{ color: '#b91c1c' }} />
      <h1 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
        Ongeldige uitschrijflink
      </h1>
      <p className="text-sm text-[var(--color-mute)]">
        {reason === 'missing-params' && 'De link is incompleet — controleer of u de volledige URL geopend hebt.'}
        {reason === 'invalid-token' && 'De link is niet langer geldig of werd aangepast.'}
        {reason === 'user-not-found' && 'Uw account is niet meer in ons systeem gevonden.'}
        {reason === 'email-mismatch' && 'Het e-mailadres komt niet overeen met uw account.'}
      </p>
      <p className="text-xs text-[var(--color-mute)] mt-4">
        Stuur ons gerust een mail op{' '}
        <a href="mailto:info@vastgoedbrowaeys.be" className="link-underline">
          info@vastgoedbrowaeys.be
        </a>
        {' '}met de vraag tot uitschrijving.
      </p>
    </div>
  )
}

function UnsubscribeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-paper)' }}>
      <header className="container-px mx-auto max-w-screen-2xl py-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo height={36} textHeight={36} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <section className="w-full max-w-md p-8"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          {children}
        </section>
      </main>
    </div>
  )
}
