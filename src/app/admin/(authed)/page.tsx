import Link from 'next/link'
import { ArrowRight, Users, FolderOpen, Calendar, MessageSquare, Plus, Home, FileText, BellRing } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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

// Voor nu placeholder-data — wordt later uit Supabase gehaald
const STATS = [
  { label: 'Lopende dossiers',    value: '4',  hint: '2 verkoop · 2 zoeker',   icon: FolderOpen, href: '/admin/dossiers' },
  { label: 'Actieve klanten',     value: '12', hint: '3 nieuw deze maand',     icon: Users,      href: '/admin/klanten' },
  { label: 'Panden online',       value: '13', hint: '1 onder optie',          icon: Home,       href: '/admin/aanbod' },
  { label: 'Afspraken deze week', value: '6',  hint: '4 bezichtigingen',       icon: Calendar,   href: '/admin/afspraken' },
]

const RECENT_ACTIONS = [
  { time: '15:42', who: 'Familie Decoster', what: 'Vraag info over Karaktervolle hoevewoning Horebeke', type: 'lead' },
  { time: '14:18', who: 'Bart Verbruggen',  what: 'Bezichtiging bevestigd — vr 24/5 om 14u',             type: 'appointment' },
  { time: '11:30', who: 'Mevr. Van Daele',  what: 'Compromis ondertekend — Sint-Maria-Horebeke',         type: 'milestone' },
  { time: '09:05', who: 'Nieuwe inschrijving', what: 'Zoekt woning in Zwalm of Brakel, max €350k',       type: 'lead' },
]

const QUICK_ACTIONS = [
  { label: 'Nieuwe klant',   href: '/admin/klanten/nieuw',  icon: Users },
  { label: 'Nieuw dossier',  href: '/admin/dossiers/nieuw', icon: FolderOpen },
  { label: 'Pand toevoegen', href: '/admin/aanbod/nieuw',   icon: Home },
  { label: 'Afspraak plannen', href: '/admin/afspraken/nieuw', icon: Calendar },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const firstName = user?.user_metadata?.first_name as string | undefined
  const displayName = deriveDisplayName(firstName, user?.email ?? null)

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      {/* === Welkom === */}
      <section className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">Admin · Dashboard</p>
          <h1 className="text-3xl md:text-5xl">
            Welkom terug,{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              {displayName}.
            </span>
          </h1>
          <p className="mt-3 text-[var(--color-mute)] max-w-2xl">
            Alles wat je vandaag nodig hebt — dossiers, afspraken, klanten — op één plek.
          </p>
        </div>

        {/* Snelle acties */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <Link
                key={a.href}
                href={a.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors"
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

      {/* === Stats === */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className="block bg-[var(--color-paper)] p-5 transition-shadow hover:shadow-md"
              style={{ border: '1px solid var(--color-line)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="eyebrow text-[0.6rem]">{s.label}</span>
                <span style={{ color: 'var(--color-accent)' }}><Icon className="size-5" /></span>
              </div>
              <p className="text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
              <p className="mt-1.5 text-xs text-[var(--color-mute)]">{s.hint}</p>
            </Link>
          )
        })}
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        {/* === Recente activiteit === */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl">Recente activiteit</h2>
            <Link href="/admin/berichten" className="link-underline text-sm">Alle berichten →</Link>
          </div>
          <div className="bg-[var(--color-paper)]" style={{ border: '1px solid var(--color-line)' }}>
            <ul className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
              {RECENT_ACTIONS.map((a, i) => (
                <li key={i} className="p-5 flex items-start gap-4">
                  <span
                    className="size-9 grid place-items-center shrink-0 rounded-full"
                    style={{
                      background: a.type === 'lead' ? 'var(--color-accent-soft)' :
                                  a.type === 'milestone' ? 'var(--color-sand)' :
                                  'var(--color-paper-2)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {a.type === 'lead' && <BellRing className="size-4" />}
                    {a.type === 'appointment' && <Calendar className="size-4" />}
                    {a.type === 'milestone' && <FileText className="size-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <strong className="text-[var(--color-ink)]">{a.who}</strong>{' '}
                      <span style={{ color: 'var(--color-mute)' }}>· {a.what}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-mute)' }}>Vandaag · {a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* === Vandaag === */}
        <div>
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl">Vandaag</h2>
            <Link href="/admin/afspraken" className="link-underline text-sm">Agenda →</Link>
          </div>
          <div className="space-y-4">
            <div className="bg-[var(--color-paper)] p-5" style={{ border: '1px solid var(--color-line)' }}>
              <p className="eyebrow text-[0.6rem]" style={{ color: 'var(--color-accent)' }}>14u00</p>
              <p className="mt-2 text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Bezichtiging — Karaktervolle hoevewoning
              </p>
              <p className="mt-1 text-sm text-[var(--color-mute)]">9667 Horebeke · met Familie Decoster</p>
              <Link href="/admin/afspraken" className="mt-3 inline-flex items-center gap-1.5 text-xs link-underline" style={{ color: 'var(--color-accent)' }}>
                Open details →
              </Link>
            </div>
            <div className="bg-[var(--color-paper)] p-5" style={{ border: '1px solid var(--color-line)' }}>
              <p className="eyebrow text-[0.6rem]" style={{ color: 'var(--color-accent)' }}>16u30</p>
              <p className="mt-2 text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Schattingsverslag opstellen
              </p>
              <p className="mt-1 text-sm text-[var(--color-mute)]">Eigendom Geraardsbergen · dossier #4288662</p>
            </div>
          </div>
        </div>
      </section>

      {/* === Aandachtspunten === */}
      <section className="mt-14">
        <h2 className="text-2xl mb-5">Aandachtspunten</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Action
            title="3 ongelezen contactberichten"
            href="/admin/berichten"
            ctaLabel="Open inbox"
          />
          <Action
            title="EPC verloopt binnen 30 dagen voor 1 pand"
            href="/admin/aanbod"
            ctaLabel="Bekijk pand"
          />
          <Action
            title="Nieuwe match voor 2 zoekers"
            href="/admin/klanten"
            ctaLabel="Bekijk matches"
          />
        </div>
      </section>
    </div>
  )
}

function Action({ title, href, ctaLabel }: { title: string; href: string; ctaLabel: string }) {
  return (
    <Link
      href={href}
      className="block p-5 bg-[var(--color-paper)] transition-colors group"
      style={{ border: '1px solid var(--color-line)' }}
    >
      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-ink)' }}>{title}</p>
      <span className="inline-flex items-center gap-1.5 text-xs link-underline group-hover:gap-2 transition-all" style={{ color: 'var(--color-accent)' }}>
        {ctaLabel}
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  )
}
