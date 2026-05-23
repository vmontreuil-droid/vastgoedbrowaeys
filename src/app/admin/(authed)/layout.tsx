import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell, type AdminNavBadges } from '@/components/admin-shell'
import { CLIENTS, DOSSIERS, APPOINTMENTS, MESSAGES } from '@/data/admin-mock'
import { getListings } from '@/lib/listings'

const DEMO_AGENT = {
  name: 'Stefanie Browaeys',
  email: 'stefanie@vastgoedbrowaeys.be',
}

function computeBadges(): AdminNavBadges {
  const now = new Date()
  const nowMs = now.getTime()
  const weekMs = 7 * 24 * 3600 * 1000

  const openDossiers = DOSSIERS.filter((d) =>
    ['open', 'in_behandeling', 'onder_optie'].includes(d.status),
  ).length

  const activeClients = CLIENTS.filter((c) => c.status === 'actief' || c.status === 'lead').length
  const onlineListings = getListings({ status: ['te-koop', 'te-huur', 'optie'] }).length

  const upcomingThisWeek = APPOINTMENTS.filter((a) => {
    const t = new Date(a.start).getTime()
    return t >= nowMs && t < nowMs + weekMs && a.status !== 'cancelled'
  }).length

  const total = MESSAGES.length
  const unread = MESSAGES.filter((m) => !m.readAt).length

  return {
    klanten: activeClients,
    dossiers: openDossiers,
    aanbod: onlineListings,
    afspraken: upcomingThisWeek,
    berichten: { total, unread },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = computeBadges()

  // Demo-modus indien Supabase nog niet geconfigureerd is
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    return <AdminShell user={DEMO_AGENT} badges={badges}>{children}</AdminShell>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Rol-check via JWT user_metadata (omzeilt PostgREST schema-cache issues)
  if (user.user_metadata?.role !== 'admin') {
    redirect('/portaal')
  }
  // Gedeactiveerde admins worden uitgelogd en teruggestuurd naar login
  if (user.user_metadata?.active === false) {
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    redirect('/admin/login?error=deactivated')
  }

  const first = user.user_metadata?.first_name as string | undefined
  const last = user.user_metadata?.last_name as string | undefined
  const name = [first, last].filter(Boolean).join(' ') || user.email || 'Beheerder'

  return (
    <AdminShell user={{ name, email: user.email || '' }} badges={badges}>
      {children}
    </AdminShell>
  )
}
