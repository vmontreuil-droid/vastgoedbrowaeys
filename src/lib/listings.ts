// === Centrale data-bron voor panden ===
// Echte data, geparseerd uit de Zabun-snapshot (mei 2026).
// Wordt later vervangen door een Supabase-query.

import { LISTING_PHOTOS } from '@/data/listing-photos'
import LISTINGS_DATA from '@/data/listings-data.json'

export type ListingType = 'woning' | 'appartement' | 'bouwgrond' | 'handelspand'
export type ListingStatus = 'te-koop' | 'te-huur' | 'optie' | 'verkocht'

export type ListingField = {
  section: string
  label: string
  value: string
}

export type Listing = {
  id: string
  ref: string
  slug: string
  type: ListingType
  status: ListingStatus
  street: string
  city: string
  zip: string
  title: string
  description: string
  price: number
  priceLabel?: string
  image: string
  gallery: string[]
  fields: ListingField[]
  createdAt: string
}

// Status-overrides per pand-ID (panden die niet meer "te koop" zijn).
const STATUS_OVERRIDES: Record<string, ListingStatus> = {
  '4305961': 'optie',
}

// Display-volgorde — nieuwste eerst. Sleutels die ontbreken zakken naar achter.
const DISPLAY_DATE: Record<string, string> = {
  '4368771': '2026-05-18',
  '4365674': '2026-05-10',
  '4340985': '2026-04-22',
  '4335011': '2026-04-15',
  '4334037': '2026-04-04',
  '4332707': '2026-03-28',
  '4293093': '2026-03-15',
  '4288662': '2026-03-02',
  '4280579': '2026-02-18',
  '4211572': '2026-02-05',
  '4210796': '2026-01-22',
  '4078690': '2025-11-14',
  '4305961': '2025-12-08',
}

// Mapping van Zabun-type-label naar onze enum.
function mapType(zabunType: string): ListingType {
  const lower = (zabunType || '').toLowerCase()
  if (lower.includes('appartement')) return 'appartement'
  if (lower.includes('bouwgrond')) return 'bouwgrond'
  if (lower.includes('handelspand') || lower.includes('handel')) return 'handelspand'
  return 'woning'
}

// Slug genereren uit titel of straat + gemeente.
function makeSlug(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Velden die NIET in de algemene fields-lijst horen — dit zijn makelaar-contactinfo
// of dubbel-info (prijs zit al apart). Plus boodschappen die niet relevant zijn.
const HIDDEN_LABELS = new Set([
  'Naam',
  'GSM',
  'E-mail',
  'Telefoon',  // kantoor-telefoon, niet pand-telefoon
])

type RawListing = {
  id: string
  ref: string
  title: string
  type: string
  price: number
  priceLabel: string
  street: string
  zip: string
  city: string
  description: string
  fields: ListingField[]
}

const RAW_LISTINGS = LISTINGS_DATA as unknown as Record<string, RawListing>

export const LISTINGS: Listing[] = Object.values(RAW_LISTINGS).map((r) => {
  const photos = LISTING_PHOTOS[r.id] ?? []
  const status: ListingStatus = STATUS_OVERRIDES[r.id] ?? 'te-koop'
  const type = mapType(r.type)
  const slugBase = makeSlug(type, r.city)
  const slug = `${r.id}-${slugBase}`

  // Filter makelaar-contact velden eruit
  const fields = (r.fields || []).filter((f) => !HIDDEN_LABELS.has(f.label))

  return {
    id: r.id,
    ref: r.ref || '',
    slug,
    type,
    status,
    street: r.street || '',
    city: r.city || '',
    zip: r.zip || '',
    title: r.title || '',
    description: r.description || '',
    price: r.price || 0,
    priceLabel: r.priceLabel,
    image: photos[0] ?? '/listings/placeholder.jpg',
    gallery: photos.slice(1),
    fields,
    createdAt: DISPLAY_DATE[r.id] ?? '2025-01-01',
  }
})

/* ---------- Type-badges ---------- */

export const TYPE_BADGE: Record<
  ListingType,
  { label: string; bg: string; text: string }
> = {
  woning:      { label: 'Woning',      bg: 'var(--color-accent)',    text: 'var(--color-paper)' },
  appartement: { label: 'Appartement', bg: 'var(--color-clay)',      text: 'var(--color-ink)'   },
  bouwgrond:   { label: 'Bouwgrond',   bg: 'var(--color-moss)',      text: 'var(--color-paper)' },
  handelspand: { label: 'Handelspand', bg: 'var(--color-clay-dark)', text: 'var(--color-paper)' },
}

export const STATUS_LABEL: Record<ListingStatus, string> = {
  'te-koop':  'Te koop',
  'te-huur':  'Te huur',
  optie:      'Onder optie',
  verkocht:   'Verkocht',
}

/* ---------- Field categorisatie ----------
 *
 * Mapping van label → categorie. Zo kunnen we de flat fields-array
 * van Zabun ordenen in zinvolle groepen in de detailpagina.
 */

export type FieldCategory =
  | 'financieel'
  | 'oppervlakte'
  | 'epc'
  | 'indeling'
  | 'voorzieningen'
  | 'bouwtechnisch'
  | 'energie'
  | 'omgeving'
  | 'overig'

export const FIELD_CATEGORY_LABEL: Record<FieldCategory, string> = {
  financieel:     'Financiële info',
  oppervlakte:    'Oppervlaktes en afmetingen',
  indeling:       'Indeling',
  epc:            'EPC en certificaten',
  voorzieningen:  'Voorzieningen',
  bouwtechnisch:  'Bouwtechnisch',
  energie:        'Energie en verwarming',
  omgeving:       'Omgeving en stedenbouw',
  overig:         'Overige info',
}

const CATEGORY_RULES: Array<{ category: FieldCategory; match: (label: string) => boolean }> = [
  { category: 'financieel',    match: (l) => /^(prijs|ki\b|kadastraal|huur|onroerende voorheffing|kosten|servicekost|provisie)/i.test(l) },
  { category: 'oppervlakte',   match: (l) => /(opp\.|oppervlakte|m²|bewoonbaar|perceel|grond|tuin|terras|kavel|frontaal|achtergevel|breedte|diepte|hoogte|grondopp)/i.test(l) },
  { category: 'epc',           match: (l) => /^epc/i.test(l) },
  { category: 'indeling',      match: (l) => /(badkamer|slaapkamer|keuken|leefruimte|eetkamer|berging|garage|inkomhal|wc|toilet|kantoor|bureau|dressing|kelder|zolder|veranda|wasplaats|nachthal|hal)/i.test(l) },
  { category: 'energie',       match: (l) => /(verwarming|stookolie|aardgas|elektriciteit|zonnepanelen|warmtepomp|airco|ventilatie|gaskachel|isolatie)/i.test(l) },
  { category: 'voorzieningen', match: (l) => /(internet|telefoon|riolering|stadswater|kabel|alarm|lift|videofoon|parlofoon|wasmachine|vaatwasser|huisdieren)/i.test(l) },
  { category: 'bouwtechnisch', match: (l) => /(bouwjaar|algemene staat|raamwerk|beglazing|dak|gevel|sanitair|elektriciteitscertificaat|asbest|asbest-attest|conform)/i.test(l) },
  { category: 'omgeving',      match: (l) => /(stedenbouw|bestemming|vergunning|verkavelings|voorkooprecht|dagvaarding|overstroming|signaalgebied|mobiscore|score|gewest|vg\b|wg\b|vv\b|gmo\b|gvkr|beschikbaar)/i.test(l) },
]

export function categorize(field: ListingField): FieldCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.match(field.label)) return rule.category
  }
  return 'overig'
}

export function groupFields(fields: ListingField[]): Record<FieldCategory, ListingField[]> {
  const result: Record<FieldCategory, ListingField[]> = {
    financieel: [], oppervlakte: [], indeling: [], epc: [], voorzieningen: [],
    bouwtechnisch: [], energie: [], omgeving: [], overig: [],
  }
  // Deduplicate (Zabun's parser kan dezelfde label/value combos opleveren in meerdere sub-secties)
  const seen = new Set<string>()
  for (const f of fields) {
    const key = `${f.label}|${f.value}`
    if (seen.has(key)) continue
    seen.add(key)
    result[categorize(f)].push(f)
  }
  return result
}

/* ---------- Helpers ---------- */

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function listingHref(listing: Pick<Listing, 'id' | 'slug'>): string {
  // Standaard naar de premium pand-microsite. Klassieke weergave blijft
  // beschikbaar via /aanbod/[id] (te bereiken via footer-link op /pand/).
  return `/pand/${listing.id}-${listing.slug.replace(/^\d+-/, '')}`
}

export function getListings(opts: {
  status?: ListingStatus | ListingStatus[]
  limit?: number
  sortBy?: 'newest' | 'price-asc' | 'price-desc'
} = {}): Listing[] {
  const statuses = opts.status
    ? Array.isArray(opts.status) ? opts.status : [opts.status]
    : null

  let result = LISTINGS.filter((l) => !statuses || statuses.includes(l.status))

  switch (opts.sortBy ?? 'newest') {
    case 'newest':
      result = [...result].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      break
    case 'price-asc':
      result = [...result].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result = [...result].sort((a, b) => b.price - a.price)
      break
  }

  if (opts.limit != null) result = result.slice(0, opts.limit)
  return result
}

export function uniqueCities(listings: Listing[] = LISTINGS): string[] {
  return Array.from(new Set(listings.map((l) => l.city))).sort()
}

// Hulp-helpers voor de detail-pagina
export function findField(listing: Listing, labelRegex: RegExp): string | undefined {
  const f = listing.fields.find((x) => labelRegex.test(x.label) && x.value)
  return f?.value
}

export function findFieldNumber(listing: Listing, labelRegex: RegExp): number | undefined {
  const v = findField(listing, labelRegex)
  if (!v) return undefined
  const m = v.match(/[\d\.,]+/)
  if (!m) return undefined
  return parseInt(m[0].replace(/[\.,]/g, ''), 10)
}
