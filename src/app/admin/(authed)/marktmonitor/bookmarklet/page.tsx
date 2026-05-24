import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'node:crypto'
import { BookmarkletSimple } from './bookmarklet-simple'

export const metadata = {
  title: 'Admin · Marktmonitor · Bookmarklet',
}

async function ensureToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const existing = user.user_metadata?.market_import_token as string | undefined
  if (existing && existing.length > 10) return existing

  // Auto-genereer
  const token = randomBytes(24).toString('base64url')
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      market_import_token: token,
    },
  })
  return token
}

export default async function BookmarkletPage() {
  const token = await ensureToken()
  const hdr = await headers()
  const host = hdr.get('host') ?? 'vastgoedbrowaeys.vercel.app'
  const proto = hdr.get('x-forwarded-proto') ?? 'https'
  const origin = `${proto}://${host}`
  const scrapingBeeEnabled = !!process.env.SCRAPINGBEE_API_KEY

  if (!token) {
    return (
      <div className="container-px mx-auto max-w-2xl py-10">
        <p>Niet ingelogd.</p>
      </div>
    )
  }

  return (
    <div className="container-px mx-auto max-w-2xl py-8 md:py-12">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-2">Admin · Marktmonitor</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl flex items-center gap-3"
          style={{ fontFamily: 'var(--font-display)' }}>
          <Bookmark className="size-6 md:size-8 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Snel-import knop
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--color-mute)]">
          Eén knop in je browser waarmee je vanaf Immoweb, Zimmo of Realo direct panden
          in je marktmonitor zet.
        </p>
      </section>

      <BookmarkletSimple
        token={token}
        origin={origin}
        scrapingBeeEnabled={scrapingBeeEnabled}
      />
    </div>
  )
}
