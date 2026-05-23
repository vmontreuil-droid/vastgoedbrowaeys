// === Zabun API client ===
// Typed wrapper rond de Zabun CMS API:
//   https://gateway-cmsapi.v2.zabun.be
//   Wiki: https://gateway-cmsapi.v2.zabun.be/wiki
//   Swagger: https://gateway-cmsapi.v2.zabun.be/swagger/index.html
//
// Authenticatie via 5 headers (api_key + client_id + server_id + X-CLIENT-ID
// + X-USER-ID). Credentials komen uit env-vars; aan te vragen bij Zabun support.

const BASE_URL = 'https://gateway-cmsapi.v2.zabun.be'

export type ZabunCredentials = {
  apiKey: string
  clientId: string
  serverId: string
  xClientId: string
  xUserId: string
}

export function readCredentialsFromEnv(): ZabunCredentials | null {
  const apiKey = process.env.ZABUN_API_KEY
  const clientId = process.env.ZABUN_CLIENT_ID
  const serverId = process.env.ZABUN_SERVER_ID
  const xClientId = process.env.ZABUN_X_CLIENT_ID
  const xUserId = process.env.ZABUN_X_USER_ID
  if (!apiKey || !clientId || !serverId || !xClientId || !xUserId) return null
  return { apiKey, clientId, serverId, xClientId, xUserId }
}

function buildHeaders(creds: ZabunCredentials): HeadersInit {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'api_key': creds.apiKey,
    'client_id': creds.clientId,
    'server_id': creds.serverId,
    'X-CLIENT-ID': creds.xClientId,
    'X-USER-ID': creds.xUserId,
  }
}

export class ZabunApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ZabunApiError'
  }
}

async function request<T>(
  creds: ZabunCredentials,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  const res = await fetch(url, {
    ...init,
    headers: { ...buildHeaders(creds), ...(init.headers || {}) },
    // Caching uit-zetten — wij beheren cache zelf via Supabase
    cache: 'no-store',
  })

  if (!res.ok) {
    let body: unknown
    try { body = await res.json() } catch { body = await res.text().catch(() => null) }
    throw new ZabunApiError(`Zabun ${path} returned ${res.status}`, res.status, body)
  }

  return (await res.json()) as T
}

// ============================================================
// HEARTBEAT — om de verbinding te testen
// ============================================================
export async function heartbeat(creds: ZabunCredentials): Promise<string> {
  return request<string>(creds, '/auth/v1/heartbeat', { method: 'GET' })
}

// ============================================================
// PROPERTIES (Panden)
// ============================================================

export type ZabunSearchRequest = {
  paging?: { page: number; size: number }
  filtering?: Record<string, unknown>
  sorting?: { sort: string; order: 'ASC' | 'DESC' }
}

export type ZabunSearchResponse<T> = {
  total: number
  results: T[]
  page?: number
  size?: number
}

export type ZabunPropertySummary = {
  id: string | number
  reference?: string
  // Zabun retourneert genest data — exacte velden volgen na eerste echte call
  [key: string]: unknown
}

/**
 * Zoekt panden. Met `?extended=true` haal je meer velden mee, anders alleen
 * een minimale summary. Per pand 1 detail-call cachen is best practice.
 */
export async function searchProperties(
  creds: ZabunCredentials,
  body: ZabunSearchRequest = {},
  opts: { extended?: boolean } = {},
): Promise<ZabunSearchResponse<ZabunPropertySummary>> {
  const qs = opts.extended ? '?extended=true' : ''
  const defaults: ZabunSearchRequest = {
    paging: { page: 0, size: 100 },
    sorting: { sort: 'MOST_RECENT', order: 'DESC' },
  }
  return request<ZabunSearchResponse<ZabunPropertySummary>>(
    creds,
    `/property/search${qs}`,
    {
      method: 'POST',
      body: JSON.stringify({ ...defaults, ...body }),
    },
  )
}

export async function getPropertyById(
  creds: ZabunCredentials,
  id: string | number,
): Promise<ZabunPropertySummary> {
  return request<ZabunPropertySummary>(creds, `/property/${id}?extended=true`, { method: 'GET' })
}

// ============================================================
// CONTACTS (Contacten/klanten)
// ============================================================

export type ZabunContactSummary = {
  id: string | number
  [key: string]: unknown
}

export async function searchContacts(
  creds: ZabunCredentials,
  body: ZabunSearchRequest = {},
): Promise<ZabunSearchResponse<ZabunContactSummary>> {
  const defaults: ZabunSearchRequest = {
    paging: { page: 0, size: 100 },
    sorting: { sort: 'MOST_RECENT', order: 'DESC' },
  }
  return request<ZabunSearchResponse<ZabunContactSummary>>(
    creds,
    '/contact/search',
    {
      method: 'POST',
      body: JSON.stringify({ ...defaults, ...body }),
    },
  )
}

// ============================================================
// OPTION ITEMS — keuzelijsten (transactie-types, pand-types, ...)
// ============================================================

export type ZabunOptionItem = {
  id: string | number
  name?: string
  label?: string
  value?: string
  [key: string]: unknown
}

/**
 * Cache deze response voor minstens een dag — keuzelijsten veranderen amper.
 */
export async function getPropertyOptions(
  creds: ZabunCredentials,
): Promise<Record<string, ZabunOptionItem[]>> {
  return request<Record<string, ZabunOptionItem[]>>(
    creds,
    '/property/option_items',
    { method: 'GET' },
  )
}
