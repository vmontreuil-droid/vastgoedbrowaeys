import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalShell } from '@/components/portal-shell'

export default async function PortalAuthedLayout({ children }: { children: React.ReactNode }) {
  // Indien Supabase nog niet geconfigureerd is (lokaal zonder env), demo-modus
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <PortalShell user={{ name: 'Demo gebruiker', email: 'demo@vastgoedbrowaeys.be' }}>
        {children}
      </PortalShell>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/portaal/login')
  }

  // Haal profiel op voor naam-display
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .single()

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email || 'Klant'

  return (
    <PortalShell user={{ name, email: profile?.email || user.email || '' }}>
      {children}
    </PortalShell>
  )
}
