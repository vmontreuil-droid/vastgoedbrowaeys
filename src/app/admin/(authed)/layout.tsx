import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin-shell'

const DEMO_AGENT = {
  name: 'Stefanie Browaeys',
  email: 'stefanie@vastgoedbrowaeys.be',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Demo-modus indien Supabase nog niet geconfigureerd is
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    return <AdminShell user={DEMO_AGENT}>{children}</AdminShell>
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

  const first = user.user_metadata?.first_name as string | undefined
  const last = user.user_metadata?.last_name as string | undefined
  const name = [first, last].filter(Boolean).join(' ') || user.email || 'Beheerder'

  return (
    <AdminShell user={{ name, email: user.email || '' }}>
      {children}
    </AdminShell>
  )
}
