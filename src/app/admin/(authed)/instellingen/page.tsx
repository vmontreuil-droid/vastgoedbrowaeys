import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AddTeamMemberForm } from './add-team-member-form'
import { TeamMemberCard, type TeamMember } from './team-member-card'

export const metadata = {
  title: 'Admin · Instellingen',
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
      title: (u.user_metadata?.title as string | undefined) || undefined,
      phone: (u.user_metadata?.phone as string | undefined) || undefined,
      bivNumber: (u.user_metadata?.biv_number as string | undefined) || undefined,
      active: u.user_metadata?.active !== false,
    }))
    .sort((a, b) => {
      // Actieve eerst, dan op familienaam
      if (a.active !== b.active) return a.active ? -1 : 1
      return a.lastName.localeCompare(b.lastName, 'nl-BE')
    })

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
            <TeamMemberCard
              key={m.id}
              member={m}
              isSelf={currentUser?.id === m.id}
            />
          ))}
        </div>

        <AddTeamMemberForm />
      </section>
    </div>
  )
}
