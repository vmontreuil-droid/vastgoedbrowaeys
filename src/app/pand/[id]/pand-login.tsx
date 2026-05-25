import Link from 'next/link'
import { LogIn, User as UserIcon, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Toont:
 * - Niet-ingelogd: "Inloggen" knop → naar /portaal/login met redirect terug
 * - Ingelogd zonder dossier-koppeling: "Mijn portaal" knop
 * - Ingelogd met dossier voor dit pand: "Mijn dossier" badge → naar /portaal/dossiers/[id]
 */
export async function PandLogin({ listingId }: { listingId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href={`/portaal/login?redirect=${encodeURIComponent(`/pand/${listingId}`)}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <LogIn className="size-3.5" />
        <span className="hidden sm:inline">Inloggen</span>
      </Link>
    )
  }

  // Check of de user een dossier heeft voor dit pand
  // (matching via reference of property-address fuzzy match)
  let linkedDossierId: string | null = null
  try {
    const admin = createAdminClient()
    const { data: dossiers } = await admin
      .from('dossiers')
      .select('id, reference, property_address')
      .eq('client_id', user.id)
    if (Array.isArray(dossiers)) {
      type Row = { id: string; reference: string | null; property_address: string | null }
      // Eenvoudige match: reference bevat listingId, of property_address bevat
      // de id (zou later beter via een listing_id-kolom kunnen)
      const match = (dossiers as Row[]).find((d) =>
        (d.reference && d.reference.includes(listingId)) ||
        (d.property_address && d.property_address.includes(listingId)),
      )
      if (match) linkedDossierId = match.id
    }
  } catch {
    // Detectie is best-effort
  }

  if (linkedDossierId) {
    return (
      <Link
        href={`/portaal/dossiers/${linkedDossierId}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        style={{ background: 'var(--color-accent)', color: '#fff' }}
        title="Bekijk uw dossier voor dit pand"
      >
        <FolderOpen className="size-3.5" />
        <span className="hidden sm:inline">Mijn dossier</span>
      </Link>
    )
  }

  return (
    <Link
      href="/portaal"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
      style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
      title="Naar uw klantenportaal"
    >
      <UserIcon className="size-3.5" />
      <span className="hidden sm:inline">Mijn portaal</span>
    </Link>
  )
}
