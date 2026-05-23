import { Mail, Phone, BadgeCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AddTeamMemberForm } from './add-team-member-form'
import { DeleteTeamMemberButton } from './delete-team-member-button'

export const metadata = {
  title: 'Admin · Instellingen',
}

type TeamMember = {
  id: string
  email: string
  firstName: string
  lastName: string
  title?: string
  phone?: string
  bivNumber?: string
  createdAt: string
}

export default async function InstellingenPage() {
  // Wie ben ik?
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Lijst van admin-users via Admin API
  const admin = createAdminClient()
  const { data: usersData, error: listErr } = await admin.auth.admin.listUsers()

  const team: TeamMember[] = (usersData?.users ?? [])
    .filter((u) => u.user_metadata?.role === 'admin' && u.email)
    .map((u) => ({
      id: u.id,
      email: u.email || '',
      firstName: (u.user_metadata?.first_name as string) || '',
      lastName: (u.user_metadata?.last_name as string) || '',
      title: u.user_metadata?.title as string | undefined,
      phone: u.user_metadata?.phone as string | undefined,
      bivNumber: u.user_metadata?.biv_number as string | undefined,
      createdAt: u.created_at || '',
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'nl-BE'))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <section className="mb-12">
        <p className="eyebrow mb-3">Admin · Instellingen</p>
        <h1 className="text-3xl md:text-5xl">Team & instellingen</h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-2xl">
          Beheer de medewerkers met toegang tot het beheerderspaneel.
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl flex items-center gap-3">
              <Users className="size-5" style={{ color: 'var(--color-accent)' }} />
              Werknemers ({team.length})
            </h2>
            <p className="mt-1 text-sm text-[var(--color-mute)]">
              Iedereen in deze lijst kan inloggen op het beheerderspaneel.
            </p>
          </div>
        </div>

        {listErr && (
          <p className="text-sm text-red-700">
            Kon team-lijst niet ophalen: {listErr.message}
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {team.map((m) => (
            <article
              key={m.id}
              className="p-5"
              style={{
                background: 'var(--color-paper)',
                border: '1px solid var(--color-line)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {m.firstName} {m.lastName}
                  </p>
                  {m.title && (
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">{m.title}</p>
                  )}
                </div>
                <DeleteTeamMemberButton
                  userId={m.id}
                  name={`${m.firstName} ${m.lastName}`}
                  isSelf={currentUser?.id === m.id}
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <a
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-2 text-[var(--color-ink)] link-underline truncate"
                >
                  <Mail className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <span className="truncate">{m.email}</span>
                </a>
                {m.phone && (
                  <a
                    href={`tel:${m.phone.replace(/\s|\//g, '')}`}
                    className="flex items-center gap-2 text-[var(--color-ink)] link-underline"
                  >
                    <Phone className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    {m.phone}
                  </a>
                )}
                {m.bivNumber && (
                  <p className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                    <BadgeCheck className="size-3.5 shrink-0" />
                    BIV {m.bivNumber}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        <AddTeamMemberForm />
      </section>
    </div>
  )
}
