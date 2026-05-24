import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Mail, Phone, BadgeCheck, Crown, Wrench, User as UserIcon,
  FolderOpen, Calendar, Hash, MapPin, Banknote,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getAdminAppointments,
  getAdminDossiers,
  getTeamMembers,
  computeCommission,
  type AdminDossier,
} from '@/lib/admin-db'
import { hasFullAccess, getEffectiveTeamRole, TEAM_ROLE_LABEL, TEAM_ROLE_COLOR } from '@/lib/permissions'
import { formatPrice } from '@/lib/listings'
import { ProductivityPanel } from '../productivity-panel'

export const metadata = {
  title: 'Admin · Werknemer',
}

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  open:           { bg: 'rgba(34,197,94,0.15)',  fg: '#166534' },
  in_behandeling: { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58' },
  onder_optie:    { bg: 'rgba(201,140,79,0.20)', fg: '#92400e' },
  verkocht:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  verhuurd:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  geannuleerd:    { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
}

export default async function TeamMemberDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const [{ items: team }, { items: dossiers }, { items: appointments }] = await Promise.all([
    getTeamMembers(currentUser?.id),
    getAdminDossiers(),
    getAdminAppointments(),
  ])

  const member = team.find((m) => m.id === id)
  if (!member) notFound()

  const currentRole = currentUser
    ? getEffectiveTeamRole(currentUser.user_metadata as Record<string, unknown>, currentUser.email ?? null)
    : 'assistent'
  const canManageTeam = hasFullAccess(currentRole)

  const memberDossiers = dossiers.filter((d) => d.assignedTo === member.id)
  const openDossiers = memberDossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
  const closedDossiers = memberDossiers.filter((d) => ['verkocht', 'verhuurd'].includes(d.status))

  // Commissie YTD (gerealiseerd)
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime()
  const ytdRealized = closedDossiers
    .filter((d) => d.closedAt && new Date(d.closedAt).getTime() >= yearStart)
    .reduce((sum, d) => sum + computeCommission(d), 0)

  // Komende afspraken (gerelateerd aan member's dossiers)
  const memberDossierIds = new Set(memberDossiers.map((d) => d.id))
  const upcomingAppointments = appointments
    .filter((a) => memberDossierIds.has(a.dossierId))
    .filter((a) => new Date(a.start).getTime() >= Date.now())
    .filter((a) => a.status !== 'cancelled')
    .slice(0, 8)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar team
      </Link>

      <section className="mb-10 grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Foto + rol */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden"
            style={{ background: 'var(--color-paper-2)' }}>
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={`${member.firstName} ${member.lastName}`}
                fill
                sizes="280px"
                className="object-cover"
                style={{ objectPosition: 'center 20%' }}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mute)' }}>
                  {(member.firstName[0] || '') + (member.lastName[0] || '')}
                </span>
              </div>
            )}
          </div>
          <span
            className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
            style={{ background: TEAM_ROLE_COLOR[member.teamRole], color: '#fff' }}
          >
            <RoleIcon role={member.teamRole} />
            {TEAM_ROLE_LABEL[member.teamRole]}
          </span>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow mb-3">Admin · Werknemer</p>
          <h1 className="text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            {member.firstName} {member.lastName}
          </h1>
          {member.title && (
            <p className="mt-2 text-lg italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
              {member.title}
            </p>
          )}
          <div className="mt-6 space-y-2 text-sm">
            <a href={`mailto:${member.email}`} className="flex items-center gap-2 link-underline">
              <Mail className="size-4" style={{ color: 'var(--color-accent)' }} />
              {member.email}
            </a>
            {member.phone && (
              <a href={`tel:${member.phone.replace(/\s|\//g, '')}`} className="flex items-center gap-2 link-underline">
                <Phone className="size-4" style={{ color: 'var(--color-accent)' }} />
                {member.phone}
              </a>
            )}
            {member.bivNumber && (
              <p className="flex items-center gap-2 text-[var(--color-mute)]">
                <BadgeCheck className="size-4" />
                BIV {member.bivNumber}
              </p>
            )}
          </div>

          {!member.active && (
            <p className="mt-4 inline-block px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] font-medium"
              style={{ background: 'rgba(115,115,115,0.15)', color: '#525252' }}>
              Gedeactiveerd
            </p>
          )}
        </div>
      </section>

      {/* Productivity: target + afwezigheid */}
      <section className="mb-8">
        <ProductivityPanel
          userId={member.id}
          initialTarget={member.targetYearlyDossiers ?? null}
          initialFrom={member.outOfOfficeFrom ?? null}
          initialUntil={member.outOfOfficeUntil ?? null}
          initialReason={member.outOfOfficeReason ?? null}
          closedYtd={closedDossiers.filter((d) => d.closedAt && new Date(d.closedAt).getTime() >= yearStart).length}
          canEditTarget={canManageTeam}
          canEditOOO={canManageTeam || currentUser?.id === member.id}
        />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Lopend" value={openDossiers.length} icon={<FolderOpen className="size-4" style={{ color: '#16a34a' }} />} />
        <StatCard label="Afgesloten totaal" value={closedDossiers.length} icon={<FolderOpen className="size-4" style={{ color: 'var(--color-accent)' }} />} />
        <StatCard label="Afspraken" value={upcomingAppointments.length} icon={<Calendar className="size-4" style={{ color: 'var(--color-accent)' }} />} />
        <StatCard label="Commissie YTD" value={formatPrice(ytdRealized)} icon={<Banknote className="size-4" style={{ color: 'var(--color-accent)' }} />} isCurrency />
      </section>

      {/* Lopende dossiers */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <FolderOpen className="size-5" style={{ color: 'var(--color-accent)' }} />
            Lopende dossiers ({openDossiers.length})
          </h2>
          {openDossiers.length > 0 && (
            <Link
              href={`/admin/dossiers?assignee=${member.id}&status=open_lopend`}
              className="text-xs link-underline"
            >
              Alle bekijken →
            </Link>
          )}
        </div>
        {openDossiers.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-mute)] italic"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen lopende dossiers toegewezen aan {member.firstName}.
          </p>
        ) : (
          <ul className="space-y-2">
            {openDossiers.slice(0, 10).map((d) => (
              <DossierRow key={d.id} dossier={d} />
            ))}
          </ul>
        )}
      </section>

      {/* Komende afspraken */}
      <section className="mb-10">
        <h2 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Calendar className="size-5" style={{ color: 'var(--color-accent)' }} />
          Komende afspraken ({upcomingAppointments.length})
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-mute)] italic"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen geplande afspraken op dossiers van {member.firstName}.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingAppointments.map((a) => (
              <li key={a.id} className="flex items-center gap-4 p-3"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                <div className="text-center shrink-0 w-12">
                  <p className="text-[0.55rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
                    {new Date(a.start).toLocaleDateString('nl-BE', { month: 'short' })}
                  </p>
                  <p className="text-xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    {new Date(a.start).getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.title}</p>
                  <p className="text-xs text-[var(--color-mute)]">
                    {new Date(a.start).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                    {a.location && <> · {a.location}</>}
                    {' · '}
                    <Link href={`/admin/dossiers/${a.dossierId}`} className="link-underline">
                      {a.dossierRef ?? a.clientName}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!canManageTeam && (
        <p className="mt-8 text-xs text-[var(--color-mute)] italic">
          Alleen de Zaakvoerder of Webbeheerder kan {member.firstName}&apos;s account beheren.
        </p>
      )}
    </div>
  )
}

function RoleIcon({ role }: { role: ReturnType<typeof getEffectiveTeamRole> }) {
  if (role === 'zaakvoerder')  return <Crown className="size-2.5" />
  if (role === 'webbeheerder') return <Wrench className="size-2.5" />
  if (role === 'makelaar')     return <BadgeCheck className="size-2.5" />
  return <UserIcon className="size-2.5" />
}

function StatCard({
  label, value, icon, isCurrency = false,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  isCurrency?: boolean
}) {
  return (
    <div className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center gap-2 eyebrow text-[0.55rem]">
        {icon}
        {label}
      </div>
      <p className={`mt-2 ${isCurrency ? 'text-xl' : 'text-3xl'}`}
        style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </p>
    </div>
  )
}

function DossierRow({ dossier }: { dossier: AdminDossier }) {
  const statusColor = STATUS_COLOR[dossier.status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252' }
  return (
    <li>
      <Link
        href={`/admin/dossiers/${dossier.id}`}
        className="flex items-center gap-4 p-3 transition-colors hover:bg-[var(--color-paper-2)]"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] shrink-0">
          <Hash className="size-3" />
          {dossier.ref ?? dossier.id.slice(0, 8)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {dossier.propertyAddress || `Zoekopdracht — ${dossier.clientName}`}
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-0.5 flex items-center gap-2 truncate">
            {dossier.propertyCity && <><MapPin className="size-3 shrink-0" />{dossier.propertyCity} ·</>}
            <span>{TYPE_LABEL[dossier.type] ?? dossier.type}</span>
            <span>·</span>
            <span>{dossier.clientName}</span>
          </p>
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
          style={{ background: statusColor.bg, color: statusColor.fg }}
        >
          {STATUS_LABEL[dossier.status] ?? dossier.status}
        </span>
      </Link>
    </li>
  )
}
