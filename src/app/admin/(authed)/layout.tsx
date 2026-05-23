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
    redirect('/portaal/login?redirect=/admin')
  }

  // Check of user de 'admin' rol heeft — anders geen toegang
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/portaal')
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email || 'Agent'

  return (
    <AdminShell user={{ name, email: profile.email || user.email || '' }}>
      {children}
    </AdminShell>
  )
}
