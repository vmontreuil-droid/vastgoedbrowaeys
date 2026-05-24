import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ListingDb } from '@/lib/listings-db'

export type ZoekficheMatch = {
  dossierId: string
  dossierRef: string | null
  dossierType: 'koop_zoeker' | 'huur_zoeker'
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  budget: number | null
  searchCity: string[]
  searchType: string[]
  matchedOn: Array<'stad' | 'type' | 'budget'>
}

const onlineSale = ['te-koop', 'optie'] as const
const onlineRent = ['te-huur'] as const

/**
 * Vindt alle open koop/huur-zoekfiches die matchen op:
 *  - status van de listing
 *  - stad (case-insensitive, exact match — geen fuzzy yet)
 *  - type (woning / appartement / bouwgrond / handelspand)
 *  - budget (listing.price <= zoekfiche.budget; mag ook leeg zijn)
 *
 * Zoekcriteria zelf zitten in auth.users.user_metadata van de klant
 * (search_city / search_type / budget). Een dossier van type
 * koop_zoeker of huur_zoeker met status 'open' of 'in_behandeling'
 * telt als actieve zoekfiche.
 */
export async function findMatchingZoekfiches(listing: ListingDb): Promise<ZoekficheMatch[]> {
  if (!listing.is_published) return []

  let wantedType: 'koop_zoeker' | 'huur_zoeker'
  if ((onlineSale as readonly string[]).includes(listing.status)) wantedType = 'koop_zoeker'
  else if ((onlineRent as readonly string[]).includes(listing.status)) wantedType = 'huur_zoeker'
  else return []

  const admin = createAdminClient()

  const { data: dossiers, error } = await admin
    .from('dossiers')
    .select('id, reference, client_id, type, status')
    .eq('type', wantedType)
    .in('status', ['open', 'in_behandeling'])

  if (error || !dossiers || dossiers.length === 0) return []

  // Eén keer alle users ophalen
  const { data: usersData } = await admin.auth.admin.listUsers()
  const usersById = new Map((usersData?.users ?? []).map((u) => [u.id, u]))

  const matches: ZoekficheMatch[] = []

  for (const d of dossiers as Array<{ id: string; reference: string | null; client_id: string; type: 'koop_zoeker' | 'huur_zoeker' }>) {
    const user = usersById.get(d.client_id)
    if (!user) continue

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const firstName = (meta.first_name as string | undefined) ?? ''
    const lastName = (meta.last_name as string | undefined) ?? ''
    const searchCity = (meta.search_city as string[] | undefined) ?? []
    const searchType = (meta.search_type as string[] | undefined) ?? []
    const budget = (meta.budget as number | undefined) ?? null
    const phone = (meta.phone as string | undefined) ?? null

    const reasons: Array<'stad' | 'type' | 'budget'> = []

    // STAD — als geen criteria ingegeven, niet gematcht (te weinig signaal)
    if (searchCity.length === 0) continue
    const cityHit = searchCity.some((c) => c.trim().toLowerCase() === listing.city.trim().toLowerCase())
    if (!cityHit) continue
    reasons.push('stad')

    // TYPE — leeg = match alles
    if (searchType.length > 0) {
      if (!searchType.includes(listing.type)) continue
      reasons.push('type')
    }

    // BUDGET — leeg = match alles
    if (typeof budget === 'number' && budget > 0) {
      if (listing.price > budget) continue
      reasons.push('budget')
    }

    matches.push({
      dossierId: d.id,
      dossierRef: d.reference,
      dossierType: d.type,
      clientId: d.client_id,
      clientName: `${firstName} ${lastName}`.trim() || user.email || '(onbekend)',
      clientEmail: user.email ?? '',
      clientPhone: phone,
      budget,
      searchCity,
      searchType,
      matchedOn: reasons,
    })
  }

  return matches.sort((a, b) => b.matchedOn.length - a.matchedOn.length)
}

/**
 * Schrijft één notification-rij per match in public.notifications.
 * Wordt geroepen wanneer een listing nieuw of geüpdatet wordt.
 */
export async function persistMatchNotifications(listing: ListingDb, matches: ZoekficheMatch[]): Promise<number> {
  if (matches.length === 0) return 0
  const admin = createAdminClient()
  const rows = matches.map((m) => ({
    user_id: m.clientId,
    type: 'new_match',
    title: `Nieuw pand dat past bij uw zoekopdracht: ${listing.title}`,
    body: `${listing.city}${listing.zip ? ' ' + listing.zip : ''} — ${formatPriceEur(listing.price)}`,
    link: `/aanbod/${listing.id}`,
  }))
  const { error } = await admin.from('notifications').insert(rows)
  if (error) {
    console.warn('[matching] persistMatchNotifications:', error.message)
    return 0
  }
  return rows.length
}

function formatPriceEur(price: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}
