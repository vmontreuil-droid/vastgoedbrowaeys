// === Zabun → Supabase sync ===
// Mapt Zabun-property velden naar onze public.listings tabel.
// Wordt aangeroepen door /api/cron/sync-zabun (Vercel Cron of handmatig).

import { createAdminClient } from '@/lib/supabase/admin'
import {
  readCredentialsFromEnv,
  searchProperties,
  type ZabunPropertySummary,
} from '@/lib/zabun-api'
import { slugify } from '@/lib/listings-db'

const TYPE_MAP: Record<string, 'woning' | 'appartement' | 'bouwgrond' | 'handelspand'> = {
  // Zabun-type-strings (best-guess, te verifiëren met echte data)
  'huis': 'woning',
  'woning': 'woning',
  'villa': 'woning',
  'hoeve': 'woning',
  'appartement': 'appartement',
  'studio': 'appartement',
  'penthouse': 'appartement',
  'duplex': 'appartement',
  'bouwgrond': 'bouwgrond',
  'grond': 'bouwgrond',
  'handelspand': 'handelspand',
  'kantoor': 'handelspand',
  'horeca': 'handelspand',
}

const STATUS_MAP: Record<string, 'te-koop' | 'te-huur' | 'optie' | 'verkocht' | 'verhuurd'> = {
  'te koop': 'te-koop',
  'sale': 'te-koop',
  'for_sale': 'te-koop',
  'te huur': 'te-huur',
  'rent': 'te-huur',
  'for_rent': 'te-huur',
  'optie': 'optie',
  'under_option': 'optie',
  'verkocht': 'verkocht',
  'sold': 'verkocht',
  'verhuurd': 'verhuurd',
  'rented': 'verhuurd',
}

function readString(p: ZabunPropertySummary, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = p[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function readNumber(p: ZabunPropertySummary, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = p[k]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim()) {
      const n = parseFloat(v.replace(/[\s\.]/g, '').replace(',', '.'))
      if (Number.isFinite(n)) return n
    }
  }
  return undefined
}

function mapType(raw: string | undefined): 'woning' | 'appartement' | 'bouwgrond' | 'handelspand' {
  if (!raw) return 'woning'
  const key = raw.toLowerCase().trim()
  return TYPE_MAP[key] ?? 'woning'
}

function mapStatus(raw: string | undefined): 'te-koop' | 'te-huur' | 'optie' | 'verkocht' | 'verhuurd' | 'concept' {
  if (!raw) return 'te-koop'
  const key = raw.toLowerCase().trim()
  return STATUS_MAP[key] ?? 'te-koop'
}

/**
 * Mapt één Zabun-pand naar onze listings-tabel structuur.
 * Bewust voorzichtig: onbekende velden vallen terug op defaults.
 * Na de eerste echte API-call moeten we deze mapping aanscherpen.
 */
export function mapZabunToListing(p: ZabunPropertySummary): Record<string, unknown> {
  const title = readString(p, 'title', 'name', 'street_description') ?? 'Pand zonder titel'
  const ref = readString(p, 'reference', 'ref', 'external_reference')
  const street = readString(p, 'street', 'address')
  const city = readString(p, 'city', 'town', 'municipality') ?? 'Onbekend'
  const zip = readString(p, 'zip', 'postal_code', 'postcode')
  const description = readString(p, 'description', 'description_nl', 'long_description')
  const price = readNumber(p, 'price', 'sale_price', 'rent_price') ?? 0
  const typeRaw = readString(p, 'type', 'main_type', 'property_type')
  const statusRaw = readString(p, 'status', 'transaction', 'transaction_type')

  // Zabun-id is hun primary key — gebruik die ook als onze id om dubbele
  // imports te vermijden (upsert on conflict on id)
  const zabunId = String(p.id)

  return {
    id: zabunId,
    ref: ref ?? null,
    title,
    slug: slugify(`${zabunId}-${title}`),
    type: mapType(typeRaw),
    status: mapStatus(statusRaw),
    street: street ?? null,
    zip: zip ?? null,
    city,
    price,
    description: description ?? null,
    bedrooms: readNumber(p, 'bedrooms', 'bedroom_count'),
    bathrooms: readNumber(p, 'bathrooms', 'bathroom_count'),
    living_area: readNumber(p, 'living_area', 'living_surface'),
    plot_area: readNumber(p, 'plot_area', 'ground_surface'),
    build_year: readNumber(p, 'build_year', 'construction_year'),
    epc_score: readString(p, 'epc', 'epc_score', 'energy_score'),
    // Foto's volgen na detail-call met ?extended=true
    is_published: true,
  }
}

export type SyncResult = {
  ok: boolean
  fetched: number
  upserted: number
  skipped: number
  errors: string[]
}

export async function syncZabunListings(): Promise<SyncResult> {
  const creds = readCredentialsFromEnv()
  if (!creds) {
    return {
      ok: false,
      fetched: 0,
      upserted: 0,
      skipped: 0,
      errors: ['Zabun credentials niet ingesteld in env (ZABUN_API_KEY, ZABUN_CLIENT_ID, ZABUN_SERVER_ID, ZABUN_X_CLIENT_ID, ZABUN_X_USER_ID).'],
    }
  }

  const errors: string[] = []
  let fetched = 0
  let upserted = 0
  let skipped = 0

  try {
    // Eerste call: max 100 panden tegelijk. Voor grotere portfolios paging.
    const resp = await searchProperties(creds, { paging: { page: 0, size: 100 } }, { extended: true })
    fetched = resp.results.length

    const admin = createAdminClient()

    for (const property of resp.results) {
      try {
        const row = mapZabunToListing(property)
        const { error } = await admin
          .from('listings')
          .upsert(row, { onConflict: 'id' })
        if (error) {
          errors.push(`Pand ${property.id}: ${error.message}`)
          skipped++
        } else {
          upserted++
        }
      } catch (e) {
        errors.push(`Pand ${property.id}: ${e instanceof Error ? e.message : String(e)}`)
        skipped++
      }
    }
  } catch (e) {
    errors.push(`Zabun fetch: ${e instanceof Error ? e.message : String(e)}`)
  }

  return { ok: errors.length === 0, fetched, upserted, skipped, errors }
}
