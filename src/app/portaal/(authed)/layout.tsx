import { PortalShell } from '@/components/portal-shell'

// TODO: Vervangen door een echte Supabase-auth check.
// Voor nu: hardcoded "demo"-gebruiker zodat het skelet zichtbaar is.
const DEMO_USER = {
  name: 'Pieter De Smet',
  email: 'pieter.desmet@example.be',
}

export default function PortalAuthedLayout({ children }: { children: React.ReactNode }) {
  // Hier komt later: redirect naar /portaal/login als geen sessie.
  return <PortalShell user={DEMO_USER}>{children}</PortalShell>
}
