import { headers } from 'next/headers'
import Link from 'next/link'
import { UserCog, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getNoteTemplates } from '@/lib/admin-db'
import { IcalPanel } from './ical-panel'
import { TemplatesPanel } from './templates-panel'

export const metadata = {
  title: 'Admin · Instellingen',
}

export default async function InstellingenPage() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const hdr = await headers()
  const host = hdr.get('host') ?? 'vastgoedbrowaeys.vercel.app'
  const proto = hdr.get('x-forwarded-proto') ?? 'https'
  const baseUrl = `${proto}://${host}`
  const icalToken = (currentUser?.user_metadata?.ical_token as string | undefined) ?? null

  const { items: templates } = await getNoteTemplates()

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <section className="mb-12">
        <p className="eyebrow mb-3">Admin · Instellingen</p>
        <h1 className="text-3xl md:text-5xl">Instellingen</h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-2xl">
          Configuratie voor agenda-feeds, notitie-sjablonen en algemene voorkeuren.
        </p>
      </section>

      <IcalPanel initialToken={icalToken} baseUrl={baseUrl} />

      <TemplatesPanel initialTemplates={templates} />

      <section className="mb-10">
        <Link
          href="/admin/team"
          className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[var(--color-paper-2)]"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <UserCog className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
            <div className="min-w-0">
              <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Werknemers verhuisd naar Team
              </h2>
              <p className="mt-1 text-sm text-[var(--color-mute)]">
                Beheer de medewerkers met toegang tot het paneel, hun dossiers en toewijzingen.
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-[var(--color-mute)]" />
        </Link>
      </section>
    </div>
  )
}
