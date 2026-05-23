import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client — heeft volledige database-toegang, OMZEILT alle RLS.
 *
 * ⚠️ Gebruik ALLEEN in server-side code (server actions, route handlers, scripts).
 * Nooit in client components of openbaar-toegankelijke endpoints zonder
 * eigen authorisatie-laag.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Supabase admin client: SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten gezet zijn.')
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
