import Link from 'next/link'
import {
  ArrowRight,
  Users,
  FolderOpen,
  Calendar,
  MessageSquare,
  Plus,
  Home,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CLIENTS, DOSSIERS, APPOINTMENTS, MESSAGES, formatRelative } from '@/data/admin-mock'
import { getListings, formatPrice } from '@/lib/listings'
import { DonutChart, TrendArea, StackedBars } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Overzicht',
}

function deriveDisplayName(firstName: string | undefined, email: string | null) {
  const first = firstName?.trim()
  if (first) return first
  if (email) {
    const local = email.split('@')[0]
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return 'Beheerder'
}

const QUICK_ACTIONS = [
  { label: 'Nieuwe klant',     href: '/admin/klanten/nieuw',  icon: Users },
  { label: 'Nieuw dossier',    href: '/admin/dossiers/nieuw', icon: FolderOpen },
  { label: 'Pand toevoegen',   href: '/admin/aanbod/nieuw',   icon: Home },
  { label: 'Afspraak plannen', href: '/admin/afspraken/nieuw',icon: Calendar },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name as string | undefined
  const displayName = deriveDisplayName(firstName, user?.email ?? null)

  // ===== Stats =====
  const openDossiers = DOSSIERS.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
  const activeClients = CLIENTS.filter((c) => c.status === 'actief' || c.status === 'lead')
  const onlineListings = getListings({ status: ['te-koop', 'te-huur', 'optie'] })
  const now = Date.now()
  const upcomingThisWeek = APPOINTMENTS.filter((a) => {
    const t = new Date(a.start).getTime()
    return t >= now && t < now + 7 * 24 * 3600 * 1000 && a.status !== 'cancelled'
  })
  const unreadMessages = MESSAGES.filter((m) => !m.readAt)

  // ===== Donut: dossiers per type =====
  const dossierByType = [
    { name: 'Verkoop',     value: DOSSIERS.filter((d) => d.type === 'verkoop').length,     color: '#0b4f58' },
    { name: 'Verhuur',     value: DOSSIERS.filter((d) => d.type === 'verhuur').length,     color: '#8c6b2e' },
    { name: 'Koop-zoeker', value: DOSSIERS.filter((d) => d.type === 'koop_zoeker').length, color: '#a25b3a' },
    { name: 'Huur-zoeker', value: DOSSIERS.filter((d) => d.type === 'huur_zoeker').length, color: '#5a7a48' },
  ].filter((d) => d.value > 0)

  // ===== Donut: aanbod per status =====
  const allListings = getListings()
  const listingByStatus = [
    { name: 'Te koop',  value: allListings.filter((l) => l.status === 'te-koop').length,  color: '#0b4f58' },
    { name: 'Te huur',  value: allListings.filter((l) => l.status === 'te-huur').length,  color: '#5a7a48' },
    { name: 'Onder optie', value: allListings.filter((l) => l.status === 'optie').length, color: '#c98c4f' },
    { name: 'Verkocht', value: allListings.filter((l) => l.status === 'verkocht').length, color: '#9b6e7b' },
  ].filter((d) => d.value > 0)

  // ===== Trend: leads + bezichtigingen per week (laatste 8) =====
  const weeks = ['W14', 'W15', 'W16', 'W17', 'W18', 'W19', 'W20', 'W21']
  const trendData = weeks.map((w, i) => ({
    x: w,
    Leads: [4, 6, 5, 8, 7, 9, 11, 10][i],
    Bezichtigingen: [3, 5, 4, 6, 8, 7, 9, 12][i],
  }))

  // ===== Bar: omzet per maand (gerealiseerd vs in-onderhandeling) =====
  const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei']
  const revenueData = months.map((m, i) => ({
    x: m,
    Gerealiseerd: [0, 18500, 22000, 0, 0][i],
    'In behandeling': [4500, 8000, 12000, 19000, 24000][i],
  }))

  // ===== Recent activity feed =====
  const recentActions = MESSAGES.slice(0, 6).map((m) => ({
    id: m.id,
    when: m.receivedAt,
    title: m.subject,
    who: m.fromName,
    href: `/admin/berichten/${m.id}`,
    type: m.type,
  }))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      {/* === Welkom === */}
      <section className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">Admin · Dashboard</p>
          <h1 className="text-3xl md:text-4xl">
            Welkom terug,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              {displayName}.
            </span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
            Alles wat je vandaag nodig hebt — dossiers, afspraken, klanten — op één plek.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <Link
                key={a.href}
                href={a.href}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                <Plus className="size-3" />
                <Icon className="size-3.5" />
                {a.label}
              </Link>
            )
          })}
        </div>
      </section>

      {/* === KPI cards === */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard icon={<FolderOpen className="size-4" />} label="Lopende dossiers" value={openDossiers.length} hint={`${DOSSIERS.filter((d) => d.status === 'onder_optie').length} onder optie`} href="/admin/dossiers" trend="+2" />
        <KpiCard icon={<Users className="size-4" />}      label="Actieve klanten"  value={activeClients.length}  hint={`${CLIENTS.filter((c) => c.status === 'lead').length} nieuwe leads`} href="/admin/klanten" trend="+3" />
        <KpiCard icon={<Home className="size-4" />}       label="Panden online"    value={onlineListings.length} hint={`${allListings.filter((l) => l.status === 'optie').length} onder optie`} href="/admin/aanbod" />
        <KpiCard icon={<Calendar className="size-4" />}   label="Afspraken (7 dgn)" value={upcomingThisWeek.length} hint={`${APPOINTMENTS.filter((a) => a.type === 'bezichtiging' && new Date(a.start).getTime() > now).length} bezichtigingen`} href="/admin/afspraken" />
      </section>

      {/* === Grafiekenrij === */}
      <section className="grid lg:grid-cols-3 gap-6 mb-10">
        <ChartCard title="Dossiers per type" subtitle="Verdeling van alle lopende dossiers">
          <DonutChart data={dossierByType} total={DOSSIERS.length} centerLabel="totaal" />
        </ChartCard>

        <ChartCard title="Aanbod per status" subtitle="Live panden + recent verkocht/verhuurd">
          <DonutChart data={listingByStatus} total={allListings.length} centerLabel="panden" />
        </ChartCard>

        <ChartCard title="Berichten" subtitle="Inkomende vragen + onbehandeld">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-5xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
              {unreadMessages.length}
            </p>
            <p className="text-xs text-[var(--color-mute)] uppercase tracking-[0.16em]">onbehandeld</p>
            <p className="text-sm text-[var(--color-mute)] mt-4">van {MESSAGES.length} berichten</p>
            <Link
              href="/admin/berichten"
              className="mt-4 inline-flex items-center gap-1 text-sm link-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              <MessageSquare className="size-3.5" />
              Naar inbox
            </Link>
          </div>
        </ChartCard>
      </section>

      {/* === Trends rij === */}
      <section className="grid lg:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Leads & bezichtigingen" subtitle="Per week — laatste 8 weken">
          <TrendArea data={trendData} dataKeys={[
            { key: 'Leads',          label: 'Leads',          color: '#0b4f58' },
            { key: 'Bezichtigingen', label: 'Bezichtigingen', color: '#8c6b2e' },
          ]} />
        </ChartCard>

        <ChartCard title="Omzet-pijplijn" subtitle="Commissies per maand (in €1.000)">
          <StackedBars data={revenueData} dataKeys={[
            { key: 'Gerealiseerd',    label: 'Gerealiseerd',    color: '#0b4f58' },
            { key: 'In behandeling',  label: 'In behandeling',  color: '#c98c4f' },
          ]} />
        </ChartCard>
      </section>

      {/* === Onderaan: agenda + activity === */}
      <section className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Eerstvolgende afspraken" subtitle="Komende 7 dagen" actionHref="/admin/afspraken" actionLabel="Volledige agenda">
          <div className="space-y-3">
            {upcomingThisWeek.slice(0, 5).map((a) => {
              const dt = new Date(a.start)
              return (
                <Link key={a.id} href="/admin/afspraken" className="flex items-start gap-3 group">
                  <div
                    className="flex flex-col items-center justify-center py-2 px-3 shrink-0"
                    style={{ background: 'var(--color-paper-2)', minWidth: 56 }}
                  >
                    <span className="text-[0.6rem] uppercase tracking-[0.12em]" style={{ color: 'var(--color-accent)' }}>
                      {dt.toLocaleDateString('nl-BE', { month: 'short' })}
                    </span>
                    <span className="text-xl leading-none mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                      {dt.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm group-hover:underline">{a.title}</p>
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">
                      {dt.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {a.location}
                      {' · '}
                      <span className="italic">{a.agent}</span>
                    </p>
                  </div>
                </Link>
              )
            })}
            {upcomingThisWeek.length === 0 && (
              <p className="text-sm text-[var(--color-mute)] italic">Geen afspraken in de komende 7 dagen.</p>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Recente activiteit" subtitle="Berichten & contacten" actionHref="/admin/berichten" actionLabel="Alle berichten">
          <div className="space-y-3">
            {recentActions.map((a) => (
              <Link key={a.id} href={a.href} className="flex items-start gap-3 group">
                <span
                  className="size-2 rounded-full mt-2 shrink-0"
                  style={{
                    background:
                      a.type === 'lead' ? '#16a34a' :
                      a.type === 'schatting' ? '#c98c4f' :
                      a.type === 'visit_request' ? '#0b4f58' :
                      '#737373',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:underline">{a.title}</p>
                  <p className="text-xs text-[var(--color-mute)] mt-0.5">
                    <span className="italic">{a.who}</span> · {formatRelative(a.when)}
                  </p>
                </div>
                <ArrowUpRight className="size-3.5 text-[var(--color-mute)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </ChartCard>
      </section>
    </div>
  )
}

function KpiCard({
  icon, label, value, hint, href, trend,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  hint?: string
  href?: string
  trend?: string
}) {
  const inner = (
    <div
      className="p-5 transition-all hover:shadow-sm h-full"
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[0.55rem]">{label}</span>
        <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
        {trend && (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#166534' }}>
            <TrendingUp className="size-3" />
            {trend}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-[var(--color-mute)]">{hint}</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function ChartCard({
  title, subtitle, children, actionHref, actionLabel,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <section
      className="p-5 md:p-6 h-full"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <header className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          {subtitle && <p className="text-xs text-[var(--color-mute)] mt-0.5">{subtitle}</p>}
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-xs link-underline"
          >
            {actionLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}
