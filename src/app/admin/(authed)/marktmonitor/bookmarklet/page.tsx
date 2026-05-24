import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowLeft, Bookmark, Zap, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BookmarkletCard } from './bookmarklet-card'

export const metadata = {
  title: 'Admin · Marktmonitor · Bookmarklet',
}

export default async function BookmarkletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const initialToken = (user?.user_metadata?.market_import_token as string | undefined) ?? null

  const hdr = await headers()
  const host = hdr.get('host') ?? 'vastgoedbrowaeys.vercel.app'
  const proto = hdr.get('x-forwarded-proto') ?? 'https'
  const origin = `${proto}://${host}`

  const scrapingBeeEnabled = !!process.env.SCRAPINGBEE_API_KEY

  return (
    <div className="container-px mx-auto max-w-3xl py-8 md:py-10">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-4 md:mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-6 md:mb-8">
        <p className="eyebrow mb-2 md:mb-3">Admin · Marktmonitor</p>
        <h1 className="text-2xl sm:text-3xl flex items-center gap-3">
          <Bookmark className="size-6 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Import-bookmarklet
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          Een knop in je browser-bookmarks die — met één klik vanaf Immoweb/Zimmo/Realo/... —
          de huidige zoekresultaten of detail-pagina naar Browaeys importeert.
        </p>
      </section>

      <div className="mb-6 p-3 text-xs"
        style={{ background: 'rgba(201,140,79,0.10)', borderLeft: '3px solid #c98c4f' }}>
        <p className="flex items-start gap-2">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>Waarom een bookmarklet?</strong> De dagelijkse server-scan vanaf Vercel
            wordt door Immoweb/Zimmo geblokkeerd (Cloudflare anti-bot). Met de bookmarklet
            doet jouw eigen browser het werk — Cloudflare ziet je als een gewone bezoeker.
            Gratis, volledig legaal, geen extra infrastructuur.
          </span>
        </p>
      </div>

      <BookmarkletCard initialToken={initialToken} origin={origin} />

      {/* ScrapingBee alternatief */}
      <section className="mt-10 p-4 md:p-5"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <h2 className="text-base md:text-lg mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}>
          <Zap className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
          Alternatief: ScrapingBee voor volautomatische scan
        </h2>

        <p className="text-sm mb-3">
          Als je liever volledig automatisch wil scannen (zonder elke keer de bookmarklet te
          klikken), kan je <a href="https://www.scrapingbee.com" target="_blank" rel="noopener" className="link-underline">ScrapingBee</a> activeren.
          Dat is een betaalde proxy-dienst die residentiële IPs gebruikt zodat Cloudflare
          niet blokkeert. De dagelijkse cron-scan + de &ldquo;Scan nu&rdquo;-knoppen werken
          dan wel.
        </p>

        <div className="mb-4 p-3 text-xs"
          style={{ background: scrapingBeeEnabled ? 'rgba(34,197,94,0.10)' : 'var(--color-paper-2)' }}>
          <strong>Status: </strong>
          {scrapingBeeEnabled ? (
            <span style={{ color: '#166534' }}>✓ Actief (SCRAPINGBEE_API_KEY is ingesteld in Vercel)</span>
          ) : (
            <span style={{ color: 'var(--color-mute)' }}>Niet geactiveerd</span>
          )}
        </div>

        <h3 className="text-sm font-medium mb-2 mt-4">Hoe activeer je het?</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="text-[var(--color-mute)] shrink-0">①</span>
            <span>
              Maak een account aan op{' '}
              <a href="https://www.scrapingbee.com/pricing/" target="_blank" rel="noopener" className="link-underline">
                scrapingbee.com/pricing
              </a>. Goedkoopste plan is <strong>~€49/maand voor 250.000 API-calls</strong>{' '}
              met &ldquo;premium proxy&rdquo; — meer dan genoeg voor dagelijks 1 scan per zone.
              Er is ook een gratis trial van 1000 calls om te testen.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-mute)] shrink-0">②</span>
            <span>
              In je ScrapingBee-dashboard onder <em>API Key</em>: kopieer de string (begint
              meestal met letters/cijfers, ~40 tekens lang).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-mute)] shrink-0">③</span>
            <span>
              Ga naar <a href="https://vercel.com/dashboard" target="_blank" rel="noopener" className="link-underline">vercel.com/dashboard</a>{' '}
              → vastgoedbrowaeys project → <strong>Settings → Environment Variables</strong>.
              Voeg toe:
              <div className="mt-2 p-2 font-mono text-xs"
                style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
                Name: <strong>SCRAPINGBEE_API_KEY</strong><br />
                Value: jouw-api-key-uit-stap-2<br />
                Environment: alle drie aanvinken (Production / Preview / Development)
              </div>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-mute)] shrink-0">④</span>
            <span>
              Klik <em>Save</em>. Vercel zal automatisch een nieuwe deploy starten — wacht ~1
              min. Daarna doet elke server-scan automatisch via ScrapingBee.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--color-mute)] shrink-0">⑤</span>
            <span>
              Test via <Link href="/admin/marktmonitor/diagnose" className="link-underline">/admin/marktmonitor/diagnose</Link>.
              De HTTP-status zou nu <strong>200</strong> moeten zijn op alle sites.
            </span>
          </li>
        </ol>

        <h3 className="text-sm font-medium mb-2 mt-5">Wat kost een scan?</h3>
        <ul className="text-xs text-[var(--color-mute)] space-y-1 pl-4 list-disc">
          <li>Per regio: ~6 sites × 2 pagina&apos;s × eventueel 2 (verkoop + verhuur) = ~25 calls/scan</li>
          <li>Premium proxy kost <strong>25 credits per call</strong> bij ScrapingBee.</li>
          <li>1 regio × 1× per dag × 30 dagen = ~18.750 credits/maand. Het €49-plan geeft 250.000 credits — ruim voldoende voor 10+ regio&apos;s.</li>
        </ul>

        <h3 className="text-sm font-medium mb-2 mt-5">Hoe weet ik dat het werkt?</h3>
        <p className="text-sm text-[var(--color-mute)]">
          Op <Link href="/admin/marktmonitor/regions" className="link-underline">/admin/marktmonitor/regions</Link>{' '}
          klik je <em>Scan nu</em> op een zone. Bij geactiveerde ScrapingBee zou je
          &ldquo;X nieuw · Y samengevoegd · 5+/6 sites OK&rdquo; moeten zien (i.p.v. de huidige 0/6).
        </p>

        <h3 className="text-sm font-medium mb-2 mt-5">Bookmarklet of ScrapingBee — wat kies ik?</h3>
        <div className="text-xs text-[var(--color-mute)] space-y-2">
          <p>
            <strong>Bookmarklet (gratis):</strong> Je beslist zelf wanneer je importeert,
            tussen door werk in. Snel voor 5-20 listings per week. Geen abonnement.
          </p>
          <p>
            <strong>ScrapingBee (~€49/m):</strong> Volautomatisch elke ochtend om 6u. Geen
            tussenkomst nodig. Loont als je 50+ panden per week wil monitoren en als de
            opvolg-tijd belangrijk is.
          </p>
          <p>
            <strong>Beide combineren:</strong> ook prima. Cron doet de dagelijkse sweep,
            bookmarklet voor losse vondsten die je intussen tegenkomt.
          </p>
        </div>
      </section>
    </div>
  )
}
