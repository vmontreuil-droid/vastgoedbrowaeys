'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase-client voor gebruik in client components.
 * Leest env-variabelen die met NEXT_PUBLIC_ beginnen (publiek leesbaar — anon key alleen).
 *
 * Vercel's Supabase integratie gebruikt SUPABASE_URL (zonder prefix);
 * voor client-side gebruik moet je hetzelfde toevoegen als NEXT_PUBLIC_SUPABASE_URL.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase client: NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreken in env.',
    )
  }
  return createBrowserClient(url, key)
}
