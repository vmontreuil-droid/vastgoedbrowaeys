import 'server-only'
import { safeFetch, type ScrapedListing, type SearchRegion, type ScrapeResult } from './types'

/**
 * Immoweb scraper via hun publieke search-endpoint dat hun frontend zelf
 * gebruikt: https://www.immoweb.be/nl/zoeken/... met page=N.
 *
 * Strategie: we vragen de HTML-pagina op, en parsen de embedded JSON die
 * Next.js in window.__INITIAL_STATE__ steekt. Daarin staan alle properties
 * met hun adres, prijs, foto, agent.
 *
 * Fragile: als Immoweb hun page-structuur wijzigt, breekt dit. Cloudflare
 * kan blokkeren — dan returnen we { ok: false }.
 */

const SITE = 'Immoweb'
const MAX_PAGES = 2 // 30 listings per page x 2 = 60 max per regio
const PAGE_SIZE = 30

function buildSearchUrl(region: SearchRegion, transaction: 'koop' | 'huur', page: number): string {
  const parts: string[] = []

  // Property types
  const propTypes = region.propertyTypes.length > 0
    ? region.propertyTypes.join(',')
    : 'house,apartment'
  parts.push(`/nl/zoeken/${propTypes}/${transaction === 'koop' ? 'te-koop' : 'te-huur'}`)

  const qs = new URLSearchParams()
  qs.set('countries', 'BE')

  if (region.postcodes.length > 0) {
    qs.set('postalCodes', region.postcodes.join(','))
  } else if (region.cities.length > 0) {
    qs.set('cities', region.cities.join(','))
  }

  if (region.minPrice) qs.set('minPrice', String(region.minPrice))
  if (region.maxPrice) qs.set('maxPrice', String(region.maxPrice))

  qs.set('page', String(page))
  qs.set('orderBy', 'newest')

  return `https://www.immoweb.be${parts.join('')}?${qs.toString()}`
}

type RawImmowebListing = {
  id: number
  property?: {
    type?: string
    subtype?: string
    location?: {
      street?: string
      number?: string
      box?: string
      postalCode?: string
      locality?: string
    }
    pictures?: Array<{ smallUrl?: string; mediumUrl?: string; largeUrl?: string; standardUrl?: string }>
  }
  transaction?: {
    sale?: { price?: number }
    rental?: { monthlyRentalPrice?: number }
    type?: string // SALE | RENTAL
  }
  customerName?: string
  customer?: { name?: string; logo?: string; family?: string }
  flags?: { isPrivateSeller?: boolean }
  publication?: { publisher?: { name?: string; type?: string } }
}

/** Recursief door object zoeken naar een array die op Immoweb-listings lijkt. */
function findImmowebListingsDeep(obj: unknown, depth = 0): RawImmowebListing[] | null {
  if (depth > 8 || !obj || typeof obj !== 'object') return null
  if (Array.isArray(obj)) {
    // Array met objecten die een 'property' + 'transaction' (of 'id') hebben → listings
    if (obj.length > 0) {
      const sample = obj[0]
      if (sample && typeof sample === 'object') {
        const s = sample as Record<string, unknown>
        const looksLikeListing = ('property' in s && typeof s.property === 'object')
          || ('id' in s && 'transaction' in s)
          || ('id' in s && 'price' in s && 'location' in s)
        if (looksLikeListing) return obj as RawImmowebListing[]
      }
    }
    // Anders: in elk item zoeken
    for (const item of obj) {
      const r = findImmowebListingsDeep(item, depth + 1)
      if (r) return r
    }
    return null
  }
  for (const key of Object.keys(obj)) {
    const r = findImmowebListingsDeep((obj as Record<string, unknown>)[key], depth + 1)
    if (r) return r
  }
  return null
}

function extractInitialState(html: string): { results?: RawImmowebListing[] } | null {
  // 1) window.__INITIAL_STATE__
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]+?});?\s*<\/script>/)
  if (stateMatch) {
    try {
      const parsed = JSON.parse(stateMatch[1])
      const found = findImmowebListingsDeep(parsed)
      if (found && found.length > 0) return { results: found }
    } catch {
      // ignore parse failure
    }
  }

  // 2) <script id="__NEXT_DATA__">
  const nextMatch = html.match(/<script\s+id=["']__NEXT_DATA__["'][^>]*>([\s\S]+?)<\/script>/)
  if (nextMatch) {
    try {
      const parsed = JSON.parse(nextMatch[1])
      const found = findImmowebListingsDeep(parsed)
      if (found && found.length > 0) return { results: found }
    } catch {
      // ignore
    }
  }

  // 3) Andere inline JSON in <script>-tags (bv. self.__next_f.push(...))
  // Zoek alle script-tags die JSON-achtige content bevatten en probeer ze te parsen
  const scriptRegex = /<script[^>]*>([\s\S]{200,}?)<\/script>/g
  let m: RegExpExecArray | null
  while ((m = scriptRegex.exec(html)) !== null) {
    const content = m[1]
    // Snelle filter: moet 'property' EN 'transaction' bevatten om het proberen waard te zijn
    if (!content.includes('"property"') || !content.includes('"transaction"')) continue
    // Probeer alle JSON-objecten in de string te extracten
    const jsonStart = content.indexOf('{')
    if (jsonStart < 0) continue
    const candidate = content.slice(jsonStart)
    try {
      // Probeer tot een geldig JSON-object te parsen — niet perfect maar best-effort
      // Sommige scripts hebben 'self.__next_f.push([1, "..."])' formaat — daarbij is de JSON een geëncoded string
      const parsed = JSON.parse(candidate)
      const found = findImmowebListingsDeep(parsed)
      if (found && found.length > 0) return { results: found }
    } catch {
      // ignore
    }
  }

  return null
}

function mapImmowebListing(raw: RawImmowebListing): ScrapedListing | null {
  if (!raw.id) return null

  const loc = raw.property?.location
  const postcode = loc?.postalCode ? String(loc.postalCode) : null
  const city = loc?.locality ?? null
  const street = loc?.street
    ? `${loc.street}${loc.number ? ' ' + loc.number : ''}${loc.box ? '/' + loc.box : ''}`
    : null

  const txType = raw.transaction?.type?.toUpperCase()
  const isVerkoop = txType === 'SALE' || !!raw.transaction?.sale
  const isVerhuur = txType === 'RENTAL' || !!raw.transaction?.rental
  const price = isVerkoop
    ? raw.transaction?.sale?.price ?? null
    : isVerhuur
      ? raw.transaction?.rental?.monthlyRentalPrice ?? null
      : null

  const propertyType = raw.property?.subtype || raw.property?.type || null
  const imageUrl = raw.property?.pictures?.[0]?.largeUrl
    ?? raw.property?.pictures?.[0]?.mediumUrl
    ?? raw.property?.pictures?.[0]?.standardUrl
    ?? raw.property?.pictures?.[0]?.smallUrl
    ?? null

  const isParticulier = raw.flags?.isPrivateSeller === true
    || raw.publication?.publisher?.type?.toLowerCase() === 'private'
    || raw.customer?.family === 'PRIVATE'
  const agentName = isParticulier ? null : (raw.customer?.name ?? raw.customerName ?? raw.publication?.publisher?.name ?? null)

  const transactionPath = isVerkoop ? 'te-koop' : isVerhuur ? 'te-huur' : 'detail'
  const cityPath = city ? city.toLowerCase().replace(/\s+/g, '-') : 'be'
  const sourceUrl = `https://www.immoweb.be/nl/zoekertje/${(propertyType ?? 'pand').toLowerCase()}/${transactionPath}/${cityPath}/${postcode ?? ''}/${raw.id}`

  return {
    sourceUrl,
    sourceSite: SITE,
    title: street && city ? `${street}, ${postcode ?? ''} ${city}` : null,
    street,
    city,
    postcode,
    price,
    propertyType,
    listingType: isVerkoop ? 'verkoop' : isVerhuur ? 'verhuur' : 'onbekend',
    imageUrl,
    agentName,
    isParticulier,
  }
}

/** Pure functie: parse Immoweb-listings uit HTML. Gebruikt door de bookmarklet-import. */
export function extractImmowebListingsFromHtml(html: string): ScrapedListing[] {
  const state = extractInitialState(html)
  if (!state || !state.results) return []
  return state.results
    .map(mapImmowebListing)
    .filter((x): x is ScrapedListing => x !== null)
}

export async function scrapeImmoweb(region: SearchRegion): Promise<ScrapeResult> {
  const transactions: Array<'koop' | 'huur'> =
    region.listingType === 'verkoop' ? ['koop'] :
    region.listingType === 'verhuur' ? ['huur'] :
    ['koop', 'huur']

  const allListings: ScrapedListing[] = []
  const errors: string[] = []

  for (const tx of transactions) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = buildSearchUrl(region, tx, page)
      try {
        const res = await safeFetch(url)
        if (!res.ok) {
          errors.push(`HTTP ${res.status} op page ${page} (${tx})`)
          break
        }
        const html = await res.text()
        if (html.includes('cf-mitigated') || html.includes('Just a moment...')) {
          errors.push(`Cloudflare-blokkade op page ${page} (${tx})`)
          break
        }

        const state = extractInitialState(html)
        if (!state || !state.results || state.results.length === 0) {
          // Geen resultaten of structuur veranderd — stop voor dit transaction-type
          break
        }

        for (const raw of state.results) {
          const mapped = mapImmowebListing(raw)
          if (mapped) allListings.push(mapped)
        }

        if (state.results.length < PAGE_SIZE) break // laatste pagina

        // Wees lief: kleine wachttijd tussen pages
        await new Promise((r) => setTimeout(r, 800))
      } catch (e) {
        errors.push(`Fetch-error page ${page} (${tx}): ${e instanceof Error ? e.message : String(e)}`)
        break
      }
    }
  }

  if (allListings.length === 0 && errors.length > 0) {
    return { ok: false, site: SITE, error: errors.join('; ') }
  }
  return { ok: true, site: SITE, listings: allListings }
}
