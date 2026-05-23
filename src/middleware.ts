import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware:
 *  1. Verlengt de Supabase-sessie op elk verzoek (rotatie van auth-cookies)
 *  2. Beschermt /portaal/* routes — niet-ingelogde gebruikers worden naar
 *     /portaal/login geredirect
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Indien Supabase nog niet geconfigureerd is, gewoon doorlaten (build/dev zonder env)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl
  const isPortalPath = url.pathname.startsWith('/portaal')
  const isLoginPath = url.pathname.startsWith('/portaal/login') || url.pathname.startsWith('/portaal/wachtwoord-vergeten')

  // Niet-ingelogde gebruiker probeert beschermde portaal-route: redirect naar login
  if (isPortalPath && !isLoginPath && !user) {
    const redirectUrl = url.clone()
    redirectUrl.pathname = '/portaal/login'
    redirectUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Ingelogde gebruiker op login-pagina: direct naar dashboard
  if (isLoginPath && user) {
    const redirectUrl = url.clone()
    redirectUrl.pathname = '/portaal'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Alle requests behalve:
     *  - _next/static (statische assets)
     *  - _next/image (image optimization)
     *  - favicon.ico, robots.txt, sitemap.xml
     *  - publieke bestanden in /
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
