import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PortalShell } from '@/components/portal-shell'

export default async function PortalAuthedLayout({ children }: { children: React.ReactNode }) {
  // Demo-modus indien Supabase nog niet geconfigureerd is
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
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

  // Rol + naam via JWT user_metadata (omzeilt PostgREST schema-cache issues)
  const first = user.user_metadata?.first_name as string | undefined
  const last = user.user_metadata?.last_name as string | undefined
  const name = [first, last].filter(Boolean).join(' ') || user.email || 'Klant'
  const isAdmin = user.user_metadata?.role === 'admin'

  return (
    <>
      {isAdmin && (
        <div
          className="w-full text-center text-xs uppercase tracking-[0.18em] font-medium py-2 px-4"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <span className="inline-flex items-center gap-2 flex-wrap justify-center">
            <ShieldCheck className="size-3.5" />
            U bekijkt het klantenportaal in beheerder-modus —
            <Link href="/admin" className="underline">terug naar admin →</Link>
          </span>
        </div>
      )}
      <PortalShell user={{ name, email: user.email || '' }}>
        {children}
      </PortalShell>
    </>
  )
}
