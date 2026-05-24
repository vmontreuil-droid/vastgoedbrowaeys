import 'server-only'

export type ScrapedListing = {
  sourceUrl: string
  sourceSite: string
  title: string | null
  street: string | null
  city: string | null
  postcode: string | null
  price: number | null
  propertyType: string | null
  listingType: 'verkoop' | 'verhuur' | 'onbekend'
  imageUrl: string | null
  agentName: string | null
  isParticulier: boolean
}

export type SearchRegion = {
  id: string
  label: string
  postcodes: string[]
  cities: string[]
  listingType: 'verkoop' | 'verhuur' | 'beide'
  minPrice: number | null
  maxPrice: number | null
  propertyTypes: string[]
}

export type ScrapeResult =
  | { ok: true; site: string; listings: ScrapedListing[] }
  | { ok: false; site: string; error: string }

/**
 * Genereert een fingerprint voor dedup: postcode + genormaliseerde straat +
 * prijs-bucket (op 5% nauwkeurig). Twee listings die hetzelfde pand zijn
 * via andere kanalen krijgen dezelfde key.
 */
export function dedupKey(l: { postcode: string | null; street: string | null; price: number | null }): string | null {
  if (!l.postcode || !l.street) return null
  const street = l.street
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^(de|het|den|sint|st)/, '')
    .slice(0, 40)
  if (!street) return null
  const priceBucket = l.price ? Math.round(l.price / 5000) * 5000 : 0
  return `${l.postcode}|${street}|${priceBucket}`
}

const USER_AGENT = 'Mozilla/5.0 (compatible; VastgoedBrowaeysScanner/1.0; +https://vastgoedbrowaeys.be) gecko'

export async function safeFetch(url: string, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/html;q=0.9, */*;q=0.5',
        'Accept-Language': 'nl-BE,nl;q=0.9,en;q=0.7',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}
