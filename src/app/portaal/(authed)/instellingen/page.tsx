import { User, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm, PasswordForm, NewsletterToggle } from './settings-forms'

export const metadata = {
  title: 'Instellingen',
}

export default async function PortalSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="container-px mx-auto max-w-screen-2xl py-10">
        <p>Niet ingelogd.</p>
      </div>
    )
  }

  const md = user.user_metadata as Record<string, unknown>
  const firstName = (md?.first_name as string) || ''
  const lastName = (md?.last_name as string) || ''
  const phone = (md?.phone as string) || ''
  const optOut = md?.newsletter_opt_out === true

  return (
    <div className="container-px mx-auto max-w-3xl py-8 md:py-14">
      <section className="mb-8 md:mb-10">
        <p className="eyebrow mb-2 md:mb-3">Klantenportaal</p>
        <h1 className="text-2xl sm:text-3xl md:text-5xl flex items-center gap-3">
          <User className="size-6 md:size-8 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Instellingen
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--color-mute)] max-w-2xl">
          Beheer uw persoonlijke gegevens, wachtwoord en nieuwsbrief-voorkeuren.
        </p>
      </section>

      <section className="mb-10 p-4 md:p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <h2 className="text-lg md:text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <User className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
          Mijn gegevens
        </h2>
        <ProfileForm initial={{
          firstName, lastName, phone,
          email: user.email ?? '',
        }} />
      </section>

      <section className="mb-10 p-4 md:p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <h2 className="text-lg md:text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Lock className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
          Wachtwoord wijzigen
        </h2>
        <PasswordForm />
      </section>

      <section className="mb-10 p-4 md:p-6"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <h2 className="text-lg md:text-xl mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Mail className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
          Nieuwsbrief
        </h2>
        <p className="text-sm text-[var(--color-mute)] mb-4">
          Krijgt u onze nieuwsbrief met nieuwe panden en marktinzichten? Schrijf u hier in of uit.
        </p>
        <NewsletterToggle initialOptOut={optOut} />
      </section>
    </div>
  )
}
