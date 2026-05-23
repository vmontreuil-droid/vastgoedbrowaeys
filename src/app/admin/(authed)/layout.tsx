import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell, type AdminNavBadges } from '@/components/admin-shell'
import { MESSAGES } from '@/data/admin-mock'
import { getListings } from '@/lib/listings'
import { getAdminClients, getAdminDossiers, getAdminAppointments } from '@/lib/admin-db'

const DEMO_AGENT = {
  name: 'Stefanie Browaeys',
  email: 'stefanie@vastgoedbrowaeys.be',
}

async function computeBadges(): Promise<AdminNavBadges> {
  const now = Date.now()
  const weekMs = 7 * 24 * 3600 * 1000

  const [{ items: clients }, { items: dossiers }, { items: appointments }] = await Promise.all([
    getAdminClients(),
    getAdminDossiers(),
    getAdminAppointments(),
  ])

  const openDossiers = dossiers.filter((d) =>
    ['open', 'in_behandeling', 'onder_optie'].includes(d.status),
  ).length

  const onlineListings = getListings({ status: ['te-koop', 'te-huur', 'optie'] }).length

  const upcomingThisWeek = appointments.filter((a) => {
    const t = new Date(a.start).getTime()
    return t >= now && t < now + weekMs && a.status !== 'cancelled'
  }).length

  const total = MESSAGES.length
  const unread = MESSAGES.filter((m) => !m.readAt).length

  return {
    klanten: clients.length,
    dossiers: openDossiers,
    aanbod: onlineListings,
    afspraken: upcomingThisWeek,
    berichten: { total, unread },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = await computeBadges()

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
