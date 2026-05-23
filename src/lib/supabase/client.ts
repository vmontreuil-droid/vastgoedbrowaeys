'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase-client voor gebruik in client components.
 * Leest env-variabelen die met NEXT_PUBLIC_ beginnen (publiek leesbaar — anon key alleen).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
