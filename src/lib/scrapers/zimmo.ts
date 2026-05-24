import 'server-only'
import { safeFetch, type ScrapedListing, type SearchRegion, type ScrapeResult } from './types'

/**
 * Zimmo scraper — leest hun publieke search-resultaten HTML.
 * Zimmo gebruikt server-side rendering met data-attributes op de cards,
 * en JSON-LD blokken per listing. We parsen die om de listings te
 * extraheren.
 *
 * Fragile: structuur kan veranderen. Cloudflare-blokkade is mogelijk.
 */

const SITE = 'Zimmo'
const MAX_PAGES = 2

function buildSearchUrl(region: SearchRegion, transaction: 'koop' | 'huur', page: number): string {
  // Zimmo URL-structuur: https://www.zimmo.be/nl/zoeken/?status=ForSale&transactie=koop&type=woning,appartement&plaats=9667&pagina=1
  const qs = new URLSearchParams()
  qs.set('status', transaction === 'koop' ? 'ForSale' : 'ForRent')
  qs.set('transactie', transaction)

  if (region.propertyTypes.length > 0) {
    qs.set('type', region.propertyTypes.join(','))
  } else {
    qs.set('type', 'woning,appartement')
  }

  if (region.postcodes.length > 0) {
    qs.set('plaats', region.postcodes.join(','))
  } else if (region.cities.length > 0) {
    qs.set('plaats', region.cities.join(','))
  }

  if (region.minPrice) qs.set('prijsMin', String(region.minPrice))
  if (region.maxPrice) qs.set('prijsMax', String(region.maxPrice))

  qs.set('pagina', String(page))

  return `https://www.zimmo.be/nl/zoeken/?${qs.toString()}`
}

type ZimmoJsonLd = {
  '@type'?: string | string[]
  url?: string
  name?: string
  description?: string
  image?: string | string[]
  offers?: { price?: number | string; priceCurrency?: string }
  address?: {
    streetAddress?: string
    addressLocality?: string
    postalCode?: string
  }
}

function extractJsonLdBlocks(html: string): ZimmoJsonLd[] {
  const out: ZimmoJsonLd[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim())
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of arr) {
        if (item && typeof item === 'object') out.push(item as ZimmoJsonLd)
      }
    } catch {
      // ignore
    }
  }
  return out
}

function mapJsonLd(item: ZimmoJsonLd, transaction: 'koop' | 'huur'): ScrapedListing | null {
  // Type-check op Real-Estate-ish entries
  const type = Array.isArray(item['@type']) ? item['@type'][0] : item['@type']
  if (!type || !item.url) return null
  if (!/(Residence|RealEstate|Apartment|House|Place|Product|Offer)/i.test(type)) return null

  // URL moet naar Zimmo verwijzen
  const url = item.url
  if (!url.includes('zimmo.be')) return null

  const street = item.address?.streetAddress?.trim() || null
  const city = item.address?.addressLocality?.trim() || null
  const postcode = item.address?.postalCode?.trim() || null
  const price = item.offers?.price
    ? typeof item.offers.price === 'string'
      ? parseFloat(item.offers.price.replace(/[^\d.]/g, '')) || null
      : item.offers.price
    : null
  const image = Array.isArray(item.image) ? item.image[0] : item.image ?? null

  return {
    sourceUrl: url.startsWith('http') ? url : `https://www.zimmo.be${url}`,
    sourceSite: SITE,
    title: item.name ?? null,
    street,
    city,
    postcode,
    price,
    propertyType: type === 'Apartment' ? 'Appartement' : type === 'House' ? 'Woning' : null,
    listingType: transaction === 'koop' ? 'verkoop' : 'verhuur',
    imageUrl: image,
    agentName: null,
    isParticulier: false,
  }
}

/** Pure functie: parse Zimmo-listings uit HTML. Gebruikt door bookmarklet-import. */
export function extractZimmoListingsFromHtml(html: string, url: string): ScrapedListing[] {
  const jsonLd = extractJsonLdBlocks(html)
  const transaction: 'koop' | 'huur' = /huur|verhuur/i.test(url) ? 'huur' : 'koop'
  return jsonLd
    .map((item) => mapJsonLd(item, transaction))
    .filter((x): x is ScrapedListing => x !== null)
}

export async function scrapeZimmo(region: SearchRegion): Promise<ScrapeResult> {
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

        const jsonLd = extractJsonLdBlocks(html)
        const pageListings = jsonLd
          .map((item) => mapJsonLd(item, tx))
          .filter((x): x is ScrapedListing => x !== null)

        if (pageListings.length === 0) break
        allListings.push(...pageListings)

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
