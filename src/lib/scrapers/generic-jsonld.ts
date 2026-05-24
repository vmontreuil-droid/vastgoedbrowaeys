import 'server-only'
import { safeFetch, type ScrapedListing, type SearchRegion, type ScrapeResult } from './types'

/**
 * Generieke JSON-LD scraper voor immo-sites die hun listings via SEO
 * structured data publiceren. Werkt voor sites zoals Realo, Immo Vlaanderen,
 * Hebbes, Logic-Immo — best-effort, niet zo robuust als de site-specifieke
 * adapters. Bedoeld om snel breedte te krijgen, eventueel later vervangen
 * door een gerichte adapter per site.
 */

type JsonLdItem = {
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
  itemListElement?: Array<{ url?: string; item?: JsonLdItem }>
}

function extractJsonLdBlocks(html: string): JsonLdItem[] {
  const out: JsonLdItem[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim())
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of arr) {
        if (!item || typeof item !== 'object') continue
        // Pak ItemList nested items
        const obj = item as JsonLdItem
        if (Array.isArray(obj.itemListElement)) {
          for (const el of obj.itemListElement) {
            if (el.item) out.push(el.item)
            else if (el.url) out.push(el as JsonLdItem)
          }
        }
        out.push(obj)
      }
    } catch {
      // ignore parse failures
    }
  }
  return out
}

function inferListingType(url: string, html: string): 'verkoop' | 'verhuur' | 'onbekend' {
  const all = `${url} ${html.slice(0, 8000)}`.toLowerCase()
  if (/te[\s-]?huur|huurprijs|for[\s-]?rent|\/huur\//.test(all)) return 'verhuur'
  if (/te[\s-]?koop|verkoopprijs|for[\s-]?sale|\/koop\//.test(all)) return 'verkoop'
  return 'onbekend'
}

function mapItem(
  item: JsonLdItem,
  siteName: string,
  hostFilter: string,
  defaultListingType: 'verkoop' | 'verhuur' | 'onbekend',
): ScrapedListing | null {
  const type = Array.isArray(item['@type']) ? item['@type'][0] : item['@type']
  if (!type) return null
  if (!/(Residence|RealEstate|Apartment|House|Place|Product|Offer|SingleFamilyResidence|Listing)/i.test(type)) return null
  if (!item.url) return null
  if (!item.url.includes(hostFilter)) return null

  const street = item.address?.streetAddress?.trim() || null
  const city = item.address?.addressLocality?.trim() || null
  const postcode = item.address?.postalCode?.trim() || null
  const rawPrice = item.offers?.price
  const price = rawPrice
    ? typeof rawPrice === 'string'
      ? parseFloat(rawPrice.replace(/[^\d.]/g, '')) || null
      : rawPrice
    : null
  const image = Array.isArray(item.image) ? item.image[0] : item.image ?? null

  // Sla items zonder adres/prijs/url over — te weinig info
  if (!postcode && !street && !price) return null

  return {
    sourceUrl: item.url.startsWith('http') ? item.url : `https://${hostFilter}${item.url}`,
    sourceSite: siteName,
    title: item.name ?? null,
    street,
    city,
    postcode,
    price,
    propertyType: type === 'Apartment' ? 'Appartement' : type === 'House' || type === 'SingleFamilyResidence' ? 'Woning' : null,
    listingType: defaultListingType,
    imageUrl: image,
    agentName: null,
    isParticulier: false,
  }
}

/** Pure functie: parse JSON-LD listings uit HTML voor een specifieke site. */
export function extractJsonLdListingsFromHtml(
  html: string,
  url: string,
  siteName: string,
  hostFilter: string,
): ScrapedListing[] {
  const blocks = extractJsonLdBlocks(html)
  const listingType = inferListingType(url, html)
  return blocks
    .map((b) => mapItem(b, siteName, hostFilter, listingType))
    .filter((x): x is ScrapedListing => x !== null)
}

/** Probeert listings te halen via JSON-LD scraping van een search-URL. */
export async function scrapeViaJsonLd(
  siteName: string,
  hostFilter: string,
  searchUrls: Array<{ url: string; listingType: 'verkoop' | 'verhuur' }>,
): Promise<ScrapeResult> {
  const all: ScrapedListing[] = []
  const errors: string[] = []

  for (const { url, listingType } of searchUrls) {
    try {
      const res = await safeFetch(url)
      if (!res.ok) {
        errors.push(`HTTP ${res.status} ${url}`)
        continue
      }
      const html = await res.text()
      if (html.includes('cf-mitigated') || html.includes('Just a moment...')) {
        errors.push(`Cloudflare-blokkade ${url}`)
        continue
      }
      const blocks = extractJsonLdBlocks(html)
      const inferredType = inferListingType(url, html)
      const finalType: 'verkoop' | 'verhuur' | 'onbekend' = listingType ?? inferredType
      for (const block of blocks) {
        const mapped = mapItem(block, siteName, hostFilter, finalType)
        if (mapped) all.push(mapped)
      }
      await new Promise((r) => setTimeout(r, 800))
    } catch (e) {
      errors.push(`Fetch-error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (all.length === 0 && errors.length > 0) {
    return { ok: false, site: siteName, error: errors.join('; ') }
  }
  return { ok: true, site: siteName, listings: all }
}

function pickLocationParam(region: SearchRegion): string {
  if (region.postcodes.length > 0) return region.postcodes.join(',')
  if (region.cities.length > 0) return region.cities.join(',')
  return ''
}

export async function scrapeRealo(region: SearchRegion): Promise<ScrapeResult> {
  const loc = pickLocationParam(region)
  if (!loc) return { ok: false, site: 'Realo', error: 'Geen locatie ingesteld' }

  const buildUrl = (tx: 'koop' | 'huur') => {
    const transactionPath = tx === 'koop' ? 'te-koop' : 'te-huur'
    return `https://www.realo.be/nl/${transactionPath}/${encodeURIComponent(loc)}?priceMin=${region.minPrice ?? ''}&priceMax=${region.maxPrice ?? ''}`
  }

  const txs: Array<'koop' | 'huur'> =
    region.listingType === 'verkoop' ? ['koop'] :
    region.listingType === 'verhuur' ? ['huur'] :
    ['koop', 'huur']
  const urls = txs.map((tx) => ({ url: buildUrl(tx), listingType: (tx === 'koop' ? 'verkoop' : 'verhuur') as 'verkoop' | 'verhuur' }))

  return scrapeViaJsonLd('Realo', 'realo.be', urls)
}

export async function scrapeImmovlan(region: SearchRegion): Promise<ScrapeResult> {
  const loc = pickLocationParam(region)
  if (!loc) return { ok: false, site: 'Immo Vlaanderen', error: 'Geen locatie ingesteld' }

  const buildUrl = (tx: 'koop' | 'huur') => {
    const transactionPath = tx === 'koop' ? 'kopen' : 'huren'
    const qs = new URLSearchParams()
    qs.set('searchtransaction', transactionPath)
    qs.set('searchlocation', loc)
    if (region.minPrice) qs.set('searchpricemin', String(region.minPrice))
    if (region.maxPrice) qs.set('searchpricemax', String(region.maxPrice))
    return `https://immovlan.be/nl/vastgoed?${qs.toString()}`
  }

  const txs: Array<'koop' | 'huur'> =
    region.listingType === 'verkoop' ? ['koop'] :
    region.listingType === 'verhuur' ? ['huur'] :
    ['koop', 'huur']
  const urls = txs.map((tx) => ({ url: buildUrl(tx), listingType: (tx === 'koop' ? 'verkoop' : 'verhuur') as 'verkoop' | 'verhuur' }))

  return scrapeViaJsonLd('Immo Vlaanderen', 'immovlan.be', urls)
}

export async function scrapeHebbes(region: SearchRegion): Promise<ScrapeResult> {
  const loc = pickLocationParam(region)
  if (!loc) return { ok: false, site: 'Hebbes', error: 'Geen locatie ingesteld' }

  const buildUrl = (tx: 'koop' | 'huur') => {
    const transactionPath = tx === 'koop' ? 'koop' : 'huur'
    const qs = new URLSearchParams()
    qs.set('locatie', loc)
    if (region.minPrice) qs.set('prijs_van', String(region.minPrice))
    if (region.maxPrice) qs.set('prijs_tot', String(region.maxPrice))
    return `https://www.hebbes.be/vastgoed/${transactionPath}?${qs.toString()}`
  }

  const txs: Array<'koop' | 'huur'> =
    region.listingType === 'verkoop' ? ['koop'] :
    region.listingType === 'verhuur' ? ['huur'] :
    ['koop', 'huur']
  const urls = txs.map((tx) => ({ url: buildUrl(tx), listingType: (tx === 'koop' ? 'verkoop' : 'verhuur') as 'verkoop' | 'verhuur' }))

  return scrapeViaJsonLd('Hebbes', 'hebbes.be', urls)
}

export async function scrapeLogicImmo(region: SearchRegion): Promise<ScrapeResult> {
  const loc = pickLocationParam(region)
  if (!loc) return { ok: false, site: 'Logic-Immo', error: 'Geen locatie ingesteld' }

  const buildUrl = (tx: 'koop' | 'huur') => {
    const transactionPath = tx === 'koop' ? 'kopen' : 'huren'
    return `https://www.logic-immo.be/nl/${transactionPath}/zoekresultaten.html?loc=${encodeURIComponent(loc)}${
      region.minPrice ? `&pmin=${region.minPrice}` : ''
    }${region.maxPrice ? `&pmax=${region.maxPrice}` : ''}`
  }

  const txs: Array<'koop' | 'huur'> =
    region.listingType === 'verkoop' ? ['koop'] :
    region.listingType === 'verhuur' ? ['huur'] :
    ['koop', 'huur']
  const urls = txs.map((tx) => ({ url: buildUrl(tx), listingType: (tx === 'koop' ? 'verkoop' : 'verhuur') as 'verkoop' | 'verhuur' }))

  return scrapeViaJsonLd('Logic-Immo', 'logic-immo.be', urls)
}
