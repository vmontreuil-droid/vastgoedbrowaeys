import Link from 'next/link'
import {
  ArrowRight, Users, FolderOpen, Calendar, MessageSquare, Plus, Home,
  ArrowUpRight, HardDrive, Calculator, FileText, Image as ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getAdminClients, getAdminDossiers, getAdminAppointments, getAdminLeads, getAdminTrends,
  getStorageStats, computeCommission, getCommissionHistory, getTeamMembers,
} from '@/lib/admin-db'
import { getListings, formatPrice } from '@/lib/listings'
import { DonutChart, TrendArea, StackedBars, SimpleLine } from '@/components/admin/charts'

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

function formatRelative(iso: string, now = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} u`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name as string | undefined
  const displayName = deriveDisplayName(firstName, user?.email ?? null)

  const [
    { items: allClients },
    { items: allDossiers },
    { items: allAppointments },
    { items: allLeads },
    trends,
    storage,
    commissionHistory,
    { items: team },
  ] = await Promise.all([
    getAdminClients(),
    getAdminDossiers(),
    getAdminAppointments(),
    getAdminLeads(),
    getAdminTrends(),
    getStorageStats(),
    getCommissionHistory(12),
    getTeamMembers(user?.id),
  ])

  // Team-belasting: lopend + afgesloten dossiers per actieve werknemer
  const teamLoad = team
    .filter((m) => m.active)
    .map((m) => {
      const memberDossiers = allDossiers.filter((d) => d.assignedTo === m.id)
      const lopend = memberDossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status)).length
      const afgesloten = memberDossiers.filter((d) => ['verkocht', 'verhuurd'].includes(d.status)).length
      return {
        x: m.firstName || m.email.split('@')[0],
        Lopend: lopend,
        Afgesloten: afgesloten,
      }
    })
    .filter((row) => row.Lopend > 0 || row.Afgesloten > 0)
    .sort((a, b) => (b.Lopend + b.Afgesloten) - (a.Lopend + a.Afgesloten))
  const unassignedOpenCount = allDossiers
    .filter((d) => !d.assignedTo && ['open', 'in_behandeling', 'onder_optie'].includes(d.status))
    .length


  const openDossiers = allDossiers.filter((d) => ['open', 'in_behandeling', 'onder_optie'].includes(d.status))

  // Commissie-pipeline: som verwachte commissies (excl. BTW) van lopende dossiers
  const commissionPipeline = openDossiers.reduce((sum, d) => sum + computeCommission(d), 0)
  const commissionRealised = allDossiers
    .filter((d) => d.status === 'verkocht' || d.status === 'verhuurd')
    .reduce((sum, d) => sum + computeCommission(d), 0)
  const commissionUnderOption = allDossiers
    .filter((d) => d.status === 'onder_optie')
    .reduce((sum, d) => sum + computeCommission(d), 0)

  const onlineListings = getListings({ status: ['te-koop', 'te-huur', 'optie'] })
  const allListings = getListings()
  const now = Date.now()
  const upcomingThisWeek = allAppointments.filter((a) => {
    const t = new Date(a.start).getTime()
    return t >= now && t < now + 7 * 24 * 3600 * 1000 && a.status !== 'cancelled'
  })
  const unreadLeads = allLeads.filter((l) => !l.readAt)

  // Dossiers per type (donut)
  const dossierByType = [
    { name: 'Verkoop',     value: allDossiers.filter((d) => d.type === 'verkoop').length,     color: '#0b4f58' },
    { name: 'Verhuur',     value: allDossiers.filter((d) => d.type === 'verhuur').length,     color: '#8c6b2e' },
    { name: 'Koop-zoeker', value: allDossiers.filter((d) => d.type === 'koop_zoeker').length, color: '#a25b3a' },
    { name: 'Huur-zoeker', value: allDossiers.filter((d) => d.type === 'huur_zoeker').length, color: '#5a7a48' },
  ].filter((d) => d.value > 0)

  const listingByStatus = [
    { name: 'Te koop',     value: allListings.filter((l) => l.status === 'te-koop').length,  color: '#0b4f58' },
    { name: 'Te huur',     value: allListings.filter((l) => l.status === 'te-huur').length,  color: '#5a7a48' },
    { name: 'Onder optie', value: allListings.filter((l) => l.status === 'optie').length,    color: '#c98c4f' },
    { name: 'Verkocht',    value: allListings.filter((l) => l.status === 'verkocht').length, color: '#9b6e7b' },
  ].filter((d) => d.value > 0)

  // Recente activiteit = recentste 6 leads
  const recentActions = allLeads.slice(0, 6).map((l) => ({
    id: l.id,
    when: l.receivedAt,
    title: l.subject,
    who: l.fromName,
    href: `/admin/berichten/${l.id}`,
    type: l.type,
    isUnread: !l.readAt,
  }))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
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

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard icon={<FolderOpen className="size-4" />} label="Lopende dossiers" value={openDossiers.length}
          hint={`${allDossiers.filter((d) => d.status === 'onder_optie').length} onder optie`} href="/admin/dossiers" />
        <KpiCard icon={<Users className="size-4" />} label="Klanten" value={allClients.length}
          hint={`${allClients.filter((c) => c.status === 'lead').length} leads`} href="/admin/klanten" />
        <KpiCard icon={<Home className="size-4" />} label="Panden online" value={onlineListings.length}
          hint={`${allListings.filter((l) => l.status === 'optie').length} onder optie`} href="/admin/aanbod" />
        <KpiCard icon={<Calendar className="size-4" />} label="Afspraken (7 dgn)" value={upcomingThisWeek.length}
          hint={`${allAppointments.filter((a) => a.status === 'completed').length} voltooid totaal`} href="/admin/afspraken" />
      </section>

      <section className="grid lg:grid-cols-3 gap-6 mb-10">
        <ChartCard title="Dossiers per type" subtitle="Verdeling van alle dossiers">
          {dossierByType.length > 0 ? (
            <DonutChart data={dossierByType} total={allDossiers.length} centerLabel="totaal" />
          ) : (
            <EmptyChart text="Nog geen dossiers" />
          )}
        </ChartCard>

        <ChartCard title="Aanbod per status" subtitle="Live panden + recent verkocht/verhuurd">
          {listingByStatus.length > 0 ? (
            <DonutChart data={listingByStatus} total={allListings.length} centerLabel="panden" />
          ) : (
            <EmptyChart text="Nog geen panden" />
          )}
        </ChartCard>

        <ChartCard title="Berichten" subtitle="Inbox onbehandeld + totaal">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-5xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
              {unreadLeads.length}
            </p>
            <p className="text-xs text-[var(--color-mute)] uppercase tracking-[0.16em]">onbehandeld</p>
            <p className="text-sm text-[var(--color-mute)] mt-4">van {allLeads.length} berichten</p>
            <Link href="/admin/berichten" className="mt-4 inline-flex items-center gap-1 text-sm link-underline"
              style={{ color: 'var(--color-accent)' }}>
              <MessageSquare className="size-3.5" />
              Naar inbox
            </Link>
          </div>
        </ChartCard>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Leads & bezichtigingen" subtitle="Per week — laatste 8 weken">
          {trends.weekTrend.some((w) => w.Leads > 0 || w.Bezichtigingen > 0) ? (
            <TrendArea data={trends.weekTrend} dataKeys={[
              { key: 'Leads',          label: 'Leads',          color: '#0b4f58' },
              { key: 'Bezichtigingen', label: 'Bezichtigingen', color: '#8c6b2e' },
            ]} />
          ) : (
            <EmptyChart text="Nog geen data — leads en afspraken verschijnen hier zodra ze binnenkomen" />
          )}
        </ChartCard>

        <ChartCard title="Dossiers per maand" subtitle="Geopend dossiers — laatste 6 maanden">
          {trends.dossierMonthly.some((m) => m.Verkoop + m.Verhuur + m['Koop-zoeker'] + m['Huur-zoeker'] > 0) ? (
            <StackedBars data={trends.dossierMonthly} dataKeys={[
              { key: 'Verkoop',       label: 'Verkoop',      color: '#0b4f58' },
              { key: 'Verhuur',       label: 'Verhuur',      color: '#8c6b2e' },
              { key: 'Koop-zoeker',   label: 'Koop-zoeker',  color: '#a25b3a' },
              { key: 'Huur-zoeker',   label: 'Huur-zoeker',  color: '#5a7a48' },
            ]} />
          ) : (
            <EmptyChart text="Nog geen dossiers in de laatste 6 maanden" />
          )}
        </ChartCard>
      </section>

      {/* === Commissie-historiek (laatste 12 maanden) === */}
      <section className="mb-10">
        <ChartCard
          title="Commissie-historiek"
          subtitle={`Gerealiseerde commissies per maand (excl. BTW) — laatste 12 maanden · totaal ${formatPrice(commissionHistory.reduce((s, m) => s + m.Gerealiseerd, 0))}`}
          actionHref="/admin/dossiers/export?status=gerealiseerd"
          actionLabel="Export CSV →"
        >
          {commissionHistory.some((m) => m.Gerealiseerd > 0) ? (
            <SimpleLine
              data={commissionHistory}
              dataKeys={[{ key: 'Gerealiseerd', label: 'Commissie € (excl BTW)', color: '#0b4f58' }]}
              height={260}
            />
          ) : (
            <EmptyChart text="Nog geen gerealiseerde commissies. Sluit een dossier af als 'verkocht' of 'verhuurd' om hier verschijning te krijgen." />
          )}
        </ChartCard>
      </section>

      {/* === Team-belasting === */}
      <section className="mb-10">
        <ChartCard
          title="Team-belasting"
          subtitle={
            unassignedOpenCount > 0
              ? `Dossiers per werknemer (lopend = open / in behandeling / onder optie) — ${unassignedOpenCount} lopend dossier(s) nog niet toegewezen`
              : 'Dossiers per werknemer (lopend = open / in behandeling / onder optie)'
          }
          actionHref="/admin/team"
          actionLabel="Team-overzicht →"
        >
          {teamLoad.length > 0 ? (
            <>
              <StackedBars
                data={teamLoad}
                dataKeys={[
                  { key: 'Lopend', label: 'Lopend', color: '#0b4f58' },
                  { key: 'Afgesloten', label: 'Afgesloten', color: '#5a7a48' },
                ]}
                height={260}
              />
              {teamLoad.some((m) => m.Lopend >= 15) && (
                <p className="mt-3 text-xs" style={{ color: '#92400e' }}>
                  ⚠ Eén of meer werknemers hebben 15+ lopende dossiers — overweeg her te verdelen via Bulk-acties op /admin/dossiers.
                </p>
              )}
            </>
          ) : (
            <EmptyChart text="Nog geen dossiers toegewezen aan werknemers." />
          )}
        </ChartCard>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Eerstvolgende afspraken" subtitle="Komende 7 dagen" actionHref="/admin/afspraken" actionLabel="Volledige agenda">
          <div className="space-y-3">
            {upcomingThisWeek.slice(0, 5).map((a) => {
              const dt = new Date(a.start)
              return (
                <Link key={a.id} href={`/admin/afspraken/${a.id}`} className="flex items-start gap-3 group">
                  <div className="flex flex-col items-center justify-center py-2 px-3 shrink-0"
                    style={{ background: 'var(--color-paper-2)', minWidth: 56 }}>
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
                      {a.location && <> · {a.location}</>}
                      {' · '}
                      <span className="italic">{a.clientName}</span>
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

        <ChartCard title="Recente berichten" subtitle="Laatste binnenkomende vragen" actionHref="/admin/berichten" actionLabel="Alle berichten">
          <div className="space-y-3">
            {recentActions.map((a) => (
              <Link key={a.id} href={a.href} className="flex items-start gap-3 group">
                <span className="size-2 rounded-full mt-2 shrink-0"
                  style={{
                    background:
                      a.type === 'lead' ? '#16a34a' :
                      a.type === 'schatting' ? '#c98c4f' :
                      a.type === 'visit_request' ? '#a25b3a' :
                      a.type === 'vraag' ? '#0b4f58' :
                      '#737373',
                  }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate group-hover:underline ${a.isUnread ? 'font-medium' : ''}`}>
                    {a.title}
                  </p>
                  <p className="text-xs text-[var(--color-mute)] mt-0.5">
                    <span className="italic">{a.who}</span> · {formatRelative(a.when)} geleden
                  </p>
                </div>
                <ArrowUpRight className="size-3.5 text-[var(--color-mute)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {recentActions.length === 0 && (
              <p className="text-sm text-[var(--color-mute)] italic">Nog geen berichten ontvangen.</p>
            )}
          </div>
        </ChartCard>
      </section>

      {/* === Commissie-pipeline + Storage === */}
      <section className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
        <ChartCard
          title="Commissie-pijplijn"
          subtitle="Verwachte commissies (excl. BTW)"
          actionHref="/admin/dossiers"
          actionLabel="Alle dossiers"
        >
          <div className="space-y-4">
            <CommissionLine
              label="Lopende dossiers"
              value={commissionPipeline}
              accent="#0b4f58"
            />
            <CommissionLine
              label="Onder optie"
              value={commissionUnderOption}
              accent="#c98c4f"
            />
            <CommissionLine
              label="Gerealiseerd"
              value={commissionRealised}
              accent="#16a34a"
              hint="verkocht + verhuurd dossiers"
            />
            <p className="text-[0.65rem] text-[var(--color-mute)] pt-3 border-t"
              style={{ borderColor: 'var(--color-line)' }}>
              Berekend op basis van de commissie ingesteld per dossier.
              Bedragen zijn excl. 21% BTW.
            </p>
          </div>
        </ChartCard>

        <ChartCard
          title="Opslag"
          subtitle="Documenten + pand-foto's"
          actionHref="/admin/aanbod"
          actionLabel="Aanbod →"
        >
          <div className="space-y-4">
            <StorageLine
              icon={<FileText className="size-4" />}
              label="Documenten"
              count={storage.documentsCount}
              bytes={storage.documentsBytes}
              hint={`bij dossiers`}
            />
            <StorageLine
              icon={<ImageIcon className="size-4" />}
              label="Pand-foto's"
              count={storage.photosCount}
              bytes={storage.photosBytes}
              hint={`${storage.listingsWithPhotos} panden met foto's`}
            />
            <div className="pt-3 border-t flex items-baseline justify-between"
              style={{ borderColor: 'var(--color-line)' }}>
              <span className="text-xs uppercase tracking-[0.12em]">Totaal gebruikt</span>
              <span className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                {formatBytes(storage.totalBytes)}
              </span>
            </div>
            <p className="text-[0.65rem] text-[var(--color-mute)]">
              Supabase Free: 1 GB · Pro: 100 GB. Geen zorgen voorlopig.
            </p>
          </div>
        </ChartCard>

        <ChartCard
          title="Documenten per type"
          subtitle="Verdeling over alle dossiers"
        >
          {storage.documentsByCategory.length > 0 ? (
            <DonutChart
              data={storage.documentsByCategory.map((c, i) => ({
                name: docCategoryLabel(c.category),
                value: c.count,
                color: ['#0b4f58','#c98c4f','#5a7a48','#a25b3a','#9b6e7b','#8c6b2e','#6e828b','#c4a37f','#737373'][i % 9],
              }))}
              total={storage.documentsCount}
              centerLabel="documenten"
            />
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-sm text-[var(--color-mute)] italic text-center max-w-xs">
                Nog geen documenten geüpload bij dossiers.
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Snelle stats"
          subtitle="Overzicht in cijfers"
        >
          <div className="grid grid-cols-2 gap-3 text-center">
            <MiniBlock
              icon={<HardDrive className="size-4" />}
              value={storage.documentsCount + storage.photosCount}
              label="bestanden"
            />
            <MiniBlock
              icon={<Calculator className="size-4" />}
              value={openDossiers.filter((d) => d.commissionType !== 'none').length}
              label="dossiers met commissie"
            />
            <MiniBlock
              icon={<FolderOpen className="size-4" />}
              value={openDossiers.length}
              label="lopende dossiers"
            />
            <MiniBlock
              icon={<Users className="size-4" />}
              value={allClients.length}
              label="klanten in DB"
            />
          </div>
        </ChartCard>
      </section>
    </div>
  )
}

function CommissionLine({ label, value, accent, hint }: { label: string; value: number; accent: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: accent }} />
          {label}
        </span>
        <span className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
          {formatPrice(value)}
        </span>
      </div>
      {hint && <p className="text-[0.65rem] text-[var(--color-mute)] mt-0.5 pl-4">{hint}</p>}
    </div>
  )
}

function StorageLine({ icon, label, count, bytes, hint }: { icon: React.ReactNode; label: string; count: number; bytes: number; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm flex items-center gap-2">
          <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
          {label}
        </span>
        <span className="text-sm">
          {count} · <span className="text-[var(--color-mute)]">{formatBytes(bytes)}</span>
        </span>
      </div>
      {hint && <p className="text-[0.65rem] text-[var(--color-mute)] mt-0.5 pl-6">{hint}</p>}
    </div>
  )
}

function MiniBlock({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="p-3" style={{ background: 'var(--color-paper-2)' }}>
      <div className="flex items-center justify-center mb-1" style={{ color: 'var(--color-accent)' }}>
        {icon}
      </div>
      <p className="text-2xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      <p className="text-[0.6rem] text-[var(--color-mute)] mt-1">{label}</p>
    </div>
  )
}

function docCategoryLabel(c: string): string {
  return {
    compromis: 'Compromis',
    schatting: 'Schatting',
    epc: 'EPC',
    asbest: 'Asbest',
    stedenbouw: 'Stedenbouw',
    plaatsbeschrijving: 'Plaatsbeschr.',
    huurcontract: 'Huurcontract',
    foto: "Foto's",
    overig: 'Overig',
  }[c] ?? c
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function KpiCard({
  icon, label, value, hint, href,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  hint?: string
  href?: string
}) {
  const inner = (
    <div className="p-5 transition-all hover:shadow-sm h-full"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[0.55rem]">{label}</span>
        <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      </div>
      <p className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
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
    <section className="p-5 md:p-6 h-full"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <header className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          {subtitle && <p className="text-xs text-[var(--color-mute)] mt-0.5">{subtitle}</p>}
        </div>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="inline-flex items-center gap-1 text-xs link-underline">
            {actionLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-56 flex items-center justify-center">
      <p className="text-sm text-[var(--color-mute)] italic text-center max-w-xs">{text}</p>
    </div>
  )
}
