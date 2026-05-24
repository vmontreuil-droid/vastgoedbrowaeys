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

// Echte Chrome-UA om Cloudflare bot-fingerprint te omzeilen. We identificeren
// ons eveneens via een eigen header zodat sites die meekijken weten wie we zijn.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/**
 * Als SCRAPINGBEE_API_KEY env-var aanwezig is, route de fetch via hun
 * proxy. Werkt door Cloudflare omdat ze residentiële IPs gebruiken.
 * Zonder de key: directe fetch (Cloudflare blokkeert datacenter-IPs).
 */
export async function safeFetch(url: string, timeoutMs = 15000): Promise<Response> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  let fetchUrl = url
  if (apiKey) {
    const params = new URLSearchParams({
      api_key: apiKey,
      url,
      render_js: 'false', // sneller; render_js=true werkt voor SPA's maar kost meer credits
      premium_proxy: 'true', // residentieel — nodig voor Cloudflare-omzeil
      country_code: 'be',
    })
    fetchUrl = `https://app.scrapingbee.com/api/v1/?${params.toString()}`
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(fetchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-BE,nl;q=0.9,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        // Identificeren via eigen header — sites die meekijken zien dit
        'X-VastgoedBrowaeys-Bot': 'true',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

export type DiagnosticInfo = {
  url: string
  ok: boolean
  status: number
  contentLength: number
  isCloudflare: boolean
  hasInitialState: boolean
  hasNextData: boolean
  hasJsonLd: boolean
  responseSnippet: string
  error: string | null
}

/** Test een URL en geef diagnostic info terug. Geen parsing/extraction. */
export async function diagnoseUrl(url: string): Promise<DiagnosticInfo> {
  try {
    const res = await safeFetch(url)
    const text = await res.text()
    const lower = text.toLowerCase().slice(0, 8000)
    const isCloudflare = lower.includes('cf-mitigated')
      || lower.includes('just a moment')
      || lower.includes('cf-ray')
      || lower.includes('challenge-platform')
      || lower.includes('attention required')
    return {
      url,
      ok: res.ok && !isCloudflare,
      status: res.status,
      contentLength: text.length,
      isCloudflare,
      hasInitialState: text.includes('__INITIAL_STATE__'),
      hasNextData: text.includes('__NEXT_DATA__'),
      hasJsonLd: text.includes('application/ld+json'),
      responseSnippet: text.slice(0, 400).replace(/\s+/g, ' ').trim(),
      error: null,
    }
  } catch (e) {
    return {
      url,
      ok: false,
      status: 0,
      contentLength: 0,
      isCloudflare: false,
      hasInitialState: false,
      hasNextData: false,
      hasJsonLd: false,
      responseSnippet: '',
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
