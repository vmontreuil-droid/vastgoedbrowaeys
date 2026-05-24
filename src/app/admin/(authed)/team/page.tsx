import Link from 'next/link'
import { UserCog, FolderOpen, Award, AlertCircle, CalendarOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAdminDossiers, getTeamMembers, isOutOfOfficeNow } from '@/lib/admin-db'
import { getEffectiveTeamRole, hasFullAccess } from '@/lib/permissions'
import { TeamMemberCard } from '../instellingen/team-member-card'
import { AddTeamMemberForm } from '../instellingen/add-team-member-form'
import { SeedTeamButton } from './seed-button'
import { RoleBadge } from './role-badge'

export const metadata = {
  title: 'Admin · Team',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const [{ items: team, error: teamErr }, { items: dossiers }] = await Promise.all([
    getTeamMembers(currentUser?.id),
    getAdminDossiers(),
  ])

  const currentRole = currentUser
    ? getEffectiveTeamRole(currentUser.user_metadata as Record<string, unknown>, currentUser.email ?? null)
    : 'assistent'
  const canManageTeam = hasFullAccess(currentRole)

  const openDossiersByMember = new Map<string, number>()
  const closedDossiersByMember = new Map<string, number>()
  const unassignedOpen = dossiers.filter((d) =>
    !d.assignedTo && ['open', 'in_behandeling', 'onder_optie'].includes(d.status),
  ).length
  for (const d of dossiers) {
    if (!d.assignedTo) continue
    if (['open', 'in_behandeling', 'onder_optie'].includes(d.status)) {
      openDossiersByMember.set(d.assignedTo, (openDossiersByMember.get(d.assignedTo) ?? 0) + 1)
    } else {
      closedDossiersByMember.set(d.assignedTo, (closedDossiersByMember.get(d.assignedTo) ?? 0) + 1)
    }
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <section className="mb-10">
        <p className="eyebrow mb-3">Admin · Team</p>
        <h1 className="text-3xl md:text-5xl flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <UserCog className="size-8" style={{ color: 'var(--color-accent)' }} />
          Werknemers <span className="text-[var(--color-mute)] text-2xl">({team.length})</span>
        </h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-2xl">
          Iedereen in deze lijst kan inloggen op het beheerderspaneel.
          Dossiers worden toegewezen aan een werknemer, maar elk teamlid kan dossiers van een
          collega overpakken bij afwezigheid.
        </p>
      </section>

      {/* Stats */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Actieve werknemers"
          value={team.filter((m) => m.active).length}
          icon={<UserCog className="size-4" style={{ color: 'var(--color-accent)' }} />}
        />
        <StatCard
          label="Open dossiers"
          value={dossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status)).length}
          icon={<FolderOpen className="size-4" style={{ color: 'var(--color-accent)' }} />}
        />
        <StatCard
          label="Nog niet toegewezen"
          value={unassignedOpen}
          icon={<FolderOpen className="size-4" style={{ color: '#c98c4f' }} />}
          accent={unassignedOpen > 0 ? '#c98c4f' : undefined}
        />
        <StatCard
          label="Afgesloten totaal"
          value={dossiers.filter((d) => ['verkocht', 'verhuurd', 'geannuleerd'].includes(d.status)).length}
          icon={<Award className="size-4" style={{ color: 'var(--color-accent)' }} />}
        />
      </section>

      {team.length < 4 && <SeedTeamButton />}

      {teamErr && (
        <div
          className="flex items-start gap-3 p-4 mb-6 text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.25)' }}
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="font-medium">Kon team-lijst niet volledig ophalen</p>
            <p className="text-xs">{teamErr}</p>
            <ul className="text-xs list-disc pl-4 space-y-0.5 text-[var(--color-mute)]">
              <li>Herlaad de pagina (vaak transient).</li>
              <li>Check op <a href="https://status.supabase.com" target="_blank" rel="noopener" className="link-underline">status.supabase.com</a> of er een incident is.</li>
              <li>
                Open <Link href="/admin/team/diagnose" className="link-underline">/admin/team/diagnose</Link>{' '}
                om te isoleren welk record listUsers laat falen.
              </li>
            </ul>
          </div>
        </div>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {team.map((m) => {
          const open = openDossiersByMember.get(m.id) ?? 0
          const closed = closedDossiersByMember.get(m.id) ?? 0
          const canEditRole = canManageTeam && m.id !== currentUser?.id
          return (
            <div key={m.id} className="relative flex flex-col h-full">
              <RoleBadge userId={m.id} initialRole={m.teamRole} canEdit={canEditRole} />
              {isOutOfOfficeNow(m) && (
                <span
                  className="absolute -top-2 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em] font-medium z-10"
                  style={{ background: '#c98c4f', color: '#fff' }}
                  title={`${m.outOfOfficeReason ?? 'Afwezig'} tot ${new Date(m.outOfOfficeUntil!).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}`}
                >
                  <CalendarOff className="size-2.5" />
                  Afwezig
                </span>
              )}
              <div className="flex-1 flex flex-col">
                <TeamMemberCard
                  member={m}
                  isSelf={currentUser?.id === m.id}
                  viewerCanManage={canManageTeam}
                />
              </div>
              <div
                className="flex items-center justify-between gap-3 px-5 py-2.5 text-xs"
                style={{
                  background: 'var(--color-paper-2)',
                  borderLeft: '1px solid var(--color-line)',
                  borderRight: '1px solid var(--color-line)',
                  borderBottom: '1px solid var(--color-line)',
                  marginTop: '-1px',
                }}
              >
                <Link
                  href={`/admin/team/${m.id}`}
                  className="inline-flex items-center gap-1.5 link-underline text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                >
                  <FolderOpen className="size-3" />
                  {open} lopend
                </Link>
                <Link
                  href={`/admin/team/${m.id}`}
                  className="link-underline text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                >
                  {closed} afgesloten
                </Link>
              </div>
            </div>
          )
        })}
      </section>

      {canManageTeam ? (
        <AddTeamMemberForm />
      ) : (
        <p className="text-xs text-[var(--color-mute)] italic">
          Alleen de Zaakvoerder kan werknemers toevoegen of beheren.
        </p>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon, accent,
}: {
  label: string
  value: number
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="p-4"
      style={{
        background: 'var(--color-paper)',
        border: accent ? `1px solid ${accent}` : '1px solid var(--color-line)',
      }}>
      <div className="flex items-center gap-2 eyebrow text-[0.55rem]">
        {icon}
        {label}
      </div>
      <p
        className="mt-2 text-3xl"
        style={{
          fontFamily: 'var(--font-display)',
          color: accent ?? 'inherit',
        }}
      >
        {value}
      </p>
    </div>
  )
}
