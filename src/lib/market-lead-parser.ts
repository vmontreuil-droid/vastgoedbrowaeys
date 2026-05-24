import 'server-only'

/**
 * Parse Open Graph + JSON-LD metadata uit een immo-site HTML pagina.
 * Werkt zonder scraping — leest alleen de meta-tags die de site zelf
 * publiek publiceert (voor sociale media previews).
 */

export type ParsedListing = {
  sourceSite: string | null
  title: string | null
  street: string | null
  city: string | null
  postcode: string | null
  price: number | null
  propertyType: string | null
  listingType: 'verkoop' | 'verhuur' | 'onbekend'
  imageUrl: string | null
  isParticulier: boolean
  agentName: string | null
}

function getMetaContent(html: string, selector: RegExp): string | null {
  const match = html.match(selector)
  return match ? decodeHtml(match[1]) : null
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}

function deriveSourceSite(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    if (host.includes('immoweb')) return 'Immoweb'
    if (host.includes('zimmo')) return 'Zimmo'
    if (host.includes('realo')) return 'Realo'
    if (host.includes('logic-immo') || host.includes('logicimmo')) return 'Logic-Immo'
    if (host.includes('immovlan')) return 'Immo Vlaanderen'
    if (host.includes('hebbes')) return 'Hebbes'
    if (host.includes('immoscoop')) return 'Immoscoop'
    return host
  } catch {
    return null
  }
}

function parsePrice(text: string): number | null {
  // Match patronen zoals "395.000 €", "€ 1.250,00 / maand", "1250 EUR"
  const cleaned = text.replace(/&euro;/g, '€').replace(/&nbsp;/g, ' ')
  const m = cleaned.match(/([\d][\d.\s ]*[\d])\s*(?:€|EUR|euro)/i)
    || cleaned.match(/(?:€|EUR|euro)\s*([\d][\d.\s ]*[\d])/i)
  if (!m) return null
  const raw = m[1].replace(/[.\s ]/g, '').replace(/,(\d{1,2})$/, '.$1')
  const num = parseFloat(raw)
  return Number.isFinite(num) && num > 0 ? num : null
}

function parseListingType(url: string, title: string | null, description: string | null): 'verkoop' | 'verhuur' | 'onbekend' {
  const all = `${url} ${title ?? ''} ${description ?? ''}`.toLowerCase()
  if (/te[\s-]?huur|huurprijs|location|for[\s-]?rent|\/huur\//.test(all)) return 'verhuur'
  if (/te[\s-]?koop|verkoopprijs|vente|for[\s-]?sale|\/koop\//.test(all)) return 'verkoop'
  return 'onbekend'
}

function parsePropertyType(text: string | null): string | null {
  if (!text) return null
  const lower = text.toLowerCase()
  const types: Array<[string, string]> = [
    ['villa', 'Villa'],
    ['appartement', 'Appartement'],
    ['herenhuis', 'Herenhuis'],
    ['woning', 'Woning'],
    ['huis', 'Huis'],
    ['studio', 'Studio'],
    ['loft', 'Loft'],
    ['penthouse', 'Penthouse'],
    ['grond', 'Bouwgrond'],
    ['bouwgrond', 'Bouwgrond'],
    ['hoeve', 'Hoeve'],
    ['handelspand', 'Handelspand'],
    ['kantoor', 'Kantoor'],
    ['garage', 'Garage'],
  ]
  for (const [needle, label] of types) {
    if (lower.includes(needle)) return label
  }
  return null
}

function parseAddress(text: string | null): { street: string | null; city: string | null; postcode: string | null } {
  if (!text) return { street: null, city: null, postcode: null }
  // Typische Belgische adres-patronen
  const postcodeMatch = text.match(/\b([1-9]\d{3})\b/)
  const postcode = postcodeMatch ? postcodeMatch[1] : null

  let city: string | null = null
  if (postcode) {
    // Stad meestal direct na postcode
    const cityMatch = text.match(new RegExp(`${postcode}\\s+([A-ZÀ-ÿ][A-Za-zÀ-ÿ\\-' ]{1,40})`))
    city = cityMatch ? cityMatch[1].trim().split(/\s*[,·•|]\s*/)[0].trim() : null
  }

  // Straat heuristiek: alles vóór postcode (als die in tekst staat)
  let street: string | null = null
  if (postcode) {
    const parts = text.split(postcode)
    if (parts[0]) {
      const cand = parts[0].trim().replace(/[,;·•|]+$/, '').trim()
      // Pak alleen de laatste betekenisvolle regel
      const lastBit = cand.split(/[·•|,]+/).pop()?.trim()
      if (lastBit && lastBit.length < 80) street = lastBit
    }
  }

  return { street, city, postcode }
}

function detectParticulier(html: string, description: string | null): boolean {
  const all = `${html.slice(0, 5000)} ${description ?? ''}`.toLowerCase()
  return /particulier|door eigenaar|by owner|priv[ée][\s-]?verkoop/.test(all)
}

function extractAgentName(html: string): string | null {
  // JSON-LD RealEstateAgent / Organization
  const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (ldMatch) {
    try {
      const parsed = JSON.parse(ldMatch[1].trim())
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const c of candidates) {
        if (c && typeof c === 'object') {
          const obj = c as Record<string, unknown>
          if (obj['@type'] === 'RealEstateAgent' || obj['@type'] === 'Organization') {
            const name = obj.name
            if (typeof name === 'string' && name.length < 80) return name
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return null
}

export async function parseListingUrl(url: string): Promise<{ ok: true; data: ParsedListing } | { ok: false; error: string }> {
  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        // Pretend we are a normal browser fetching for social-preview
        'User-Agent': 'Mozilla/5.0 (compatible; VastgoedBrowaeysBot/1.0; +https://vastgoedbrowaeys.be)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
  } catch (e) {
    return { ok: false, error: `Kon URL niet ophalen: ${e instanceof Error ? e.message : String(e)}` }
  }
  if (!res.ok) {
    return { ok: false, error: `URL gaf HTTP ${res.status}` }
  }

  const html = await res.text()
  if (html.length < 200) {
    return { ok: false, error: 'Pagina is leeg of geblokkeerd' }
  }

  const ogTitle = getMetaContent(html, /<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i)
  const ogDesc = getMetaContent(html, /<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i)
  const ogImage = getMetaContent(html, /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
  const docTitle = getMetaContent(html, /<title[^>]*>([^<]+)<\/title>/i)
  const description = ogDesc ?? getMetaContent(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)

  const title = ogTitle ?? docTitle ?? null
  const combinedText = `${title ?? ''} ${description ?? ''}`

  const { street, city, postcode } = parseAddress(combinedText)
  const price = parsePrice(combinedText) ?? parsePrice(html.slice(0, 30000))
  const propertyType = parsePropertyType(combinedText)
  const listingType = parseListingType(url, title, description)
  const sourceSite = deriveSourceSite(url)
  const isParticulier = detectParticulier(html, description)
  const agentName = isParticulier ? null : extractAgentName(html)

  return {
    ok: true,
    data: {
      sourceSite,
      title,
      street,
      city,
      postcode,
      price,
      propertyType,
      listingType,
      imageUrl: ogImage,
      isParticulier,
      agentName,
    },
  }
}
