import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase-client voor server components, route handlers en server actions.
 * Gebruikt cookies om de gebruikerssessie te lezen/schrijven.
 */
export async function createClient() {
  const cookieStore = await cookies()
  // Server-side mag beide namen accepteren (Vercel integratie + standaard)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase server: env-variabelen ontbreken.')
  }
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll kan falen in server components — wordt afgevangen door middleware
          }
        },
      },
    },
  )
}
