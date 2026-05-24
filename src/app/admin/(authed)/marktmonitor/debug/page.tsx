import Link from 'next/link'
import { ArrowLeft, Stethoscope, ExternalLink, AlertCircle, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin · Marktmonitor · Debug',
}

type Snapshot = {
  url: string
  host: string
  timestamp: string
  htmlSize: number
  hints: string[]
  htmlSnippet: string
}

export default async function DebugPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const snap = (user?.user_metadata?.last_market_debug as Snapshot | undefined) ?? null

  // Eenvoudige analyse: zoek mogelijke listing-patronen
  let analysis: string[] = []
  if (snap?.htmlSnippet) {
    const html = snap.htmlSnippet
    const patterns: Array<[string, RegExp]> = [
      ['__NEXT_DATA__ blok', /<script\s+id="__NEXT_DATA__"/],
      ['Self.__next_f.push', /self\.__next_f\.push/],
      ['window.__INITIAL_STATE__', /window\.__INITIAL_STATE__/],
      ['JSON-LD type RealEstateListing', /"@type":\s*"RealEstateListing"/],
      ['JSON-LD type Product', /"@type":\s*"Product"/],
      ['JSON-LD type Place', /"@type":\s*"Place"/],
      ['data-test-id attributes', /data-test(?:id|-id)="[^"]+"/g],
      ['data-cy attributes', /data-cy="[^"]+"/g],
      ['data-testid op cards', /data-testid="card/g],
      ['article elements', /<article\b/g],
      ['Class card--result', /class="[^"]*card--result/g],
      ['Class search-result', /class="[^"]*search-result/g],
      ['/zoekertje/ links', /\/zoekertje\//g],
      ['/te-koop/ links', /\/te-koop\//g],
      ['property + transaction velden', /"property"[\s\S]{0,500}"transaction"/g],
    ]
    for (const [label, re] of patterns) {
      const m = html.match(re)
      if (m) analysis.push(`✓ ${label} — ${m.length} match${m.length === 1 ? '' : 'en'}`)
    }
    if (analysis.length === 0) analysis = ['Niets herkend dat op listings lijkt.']
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-8 md:py-12">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-2">Debug</p>
        <h1 className="text-2xl sm:text-3xl flex items-center gap-3"
          style={{ fontFamily: 'var(--font-display)' }}>
          <Stethoscope className="size-6 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Laatste bookmarklet-snapshot
        </h1>
        <p className="mt-3 text-sm text-[var(--color-mute)]">
          Bij elke bookmarklet-klik die geen listings vindt, bewaren we de eerste 30KB HTML
          hier. Vincent gebruikt dit om de parser bij te werken voor nieuwe site-structuren.
        </p>
      </section>

      {!snap ? (
        <div className="p-8 text-center text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen failed-bookmarklet-call geregistreerd. Klik eerst de bookmarklet op een
          immo-site die niet geparsed wordt — daarna verschijnt hier de raw response.
        </div>
      ) : (
        <>
          {/* Meta */}
          <section className="p-4 md:p-5 mb-6"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h2 className="text-base md:text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Snapshot info
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">URL</dt>
              <dd className="break-all">
                <a href={snap.url} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-1">
                  <ExternalLink className="size-2.5 shrink-0" />
                  {snap.url}
                </a>
              </dd>
              <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">Site</dt>
              <dd className="flex items-center gap-1">
                <Globe className="size-3 shrink-0 text-[var(--color-mute)]" />
                {snap.host}
              </dd>
              <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">Tijdstip</dt>
              <dd>{new Date(snap.timestamp).toLocaleString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
              <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">HTML-grootte</dt>
              <dd>{(snap.htmlSize / 1024).toFixed(1)} KB</dd>
              {snap.hints.length > 0 && (
                <>
                  <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">Hints</dt>
                  <dd>{snap.hints.join(', ')}</dd>
                </>
              )}
            </dl>
          </section>

          {/* Analyse */}
          <section className="p-4 md:p-5 mb-6"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h2 className="text-base md:text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Wat staat erin?
            </h2>
            <ul className="text-xs space-y-1 font-mono">
              {analysis.map((a, i) => (
                <li key={i} className={a.startsWith('✓') ? 'text-[#166534]' : 'text-[var(--color-mute)]'}>
                  {a}
                </li>
              ))}
            </ul>
            {analysis.length === 1 && analysis[0].includes('Niets') && (
              <p className="mt-3 text-xs text-[var(--color-mute)] italic">
                Mogelijke oorzaak: de eerste 30KB bevat alleen de HTML &lt;head&gt; en geen
                body-content. Sommige sites lazy-loaden de listings client-side via fetch.
              </p>
            )}
          </section>

          {/* Raw snippet */}
          <section className="p-4 md:p-5"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h2 className="text-base md:text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Raw HTML (eerste 30KB)
            </h2>
            <details>
              <summary className="cursor-pointer text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                Klik om uit te klappen (kan groot zijn)
              </summary>
              <pre className="mt-3 p-3 text-[0.6rem] font-mono whitespace-pre-wrap break-all overflow-y-auto"
                style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)', maxHeight: '500px' }}>
                {snap.htmlSnippet}
              </pre>
            </details>

            <div className="mt-4 p-3 text-xs"
              style={{ background: 'rgba(11,79,88,0.06)', borderLeft: '3px solid var(--color-accent)' }}>
              <p className="font-medium mb-1">📤 Stuur dit naar Vincent</p>
              <p className="text-[var(--color-mute)]">
                Selecteer een groot blok uit de raw HTML (vooral als je &ldquo;@type&rdquo;, &ldquo;property&rdquo;,
                &ldquo;@id&rdquo; ziet) en stuur het naar Vincent. Hij past de parser aan zodat
                deze site werkt.
              </p>
            </div>
          </section>
        </>
      )}

      {snap?.hints.includes('JSON-LD') && (
        <section className="mt-6 p-3 text-xs"
          style={{ background: 'rgba(34,197,94,0.10)', borderLeft: '3px solid #16a34a' }}>
          <AlertCircle className="size-3 inline mr-1" style={{ color: '#16a34a' }} />
          JSON-LD is aanwezig — de generic-jsonld parser zou normaal moeten werken. Mogelijk
          worden alleen niet-listing types gevonden (bv. BreadcrumbList, Organization). Kijk in
          de raw HTML naar &ldquo;@type&rdquo;-waardes om te zien wat erin staat.
        </section>
      )}
    </div>
  )
}
