'use client'

import { useEffect, useState, useTransition } from 'react'
import NextLink from 'next/link'
import {
  RefreshCw, Bookmark, Copy, Check, AlertCircle, ExternalLink,
  Search, MousePointerClick, CheckCircle2, HelpCircle,
} from 'lucide-react'
import { regenerateMarketImportTokenAction } from './actions'

export function BookmarkletCard({
  initialToken,
  origin,
}: {
  initialToken: string | null
  origin: string
}) {
  const [token, setToken] = useState<string | null>(initialToken)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [bookmarkletJs, setBookmarkletJs] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setBookmarkletJs('')
      return
    }
    // Bookmarklet body: leest huidige HTML + URL en POST't naar onze API.
    // We gebruiken btoa op de body niet — bookmarklets hebben karakter-limieten
    // dus we houden het zo compact mogelijk.
    const apiUrl = `${origin}/api/market-leads/import-html`
    const body = `(async()=>{try{const r=await fetch(${JSON.stringify(apiUrl)},{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ${token}'},body:JSON.stringify({url:location.href,html:document.documentElement.outerHTML})});const d=await r.json();alert('Browaeys: '+(d.message||d.error||JSON.stringify(d)));}catch(e){alert('Browaeys fout: '+e.message);}})();`
    setBookmarkletJs(`javascript:${encodeURIComponent(body)}`)
  }, [token, origin])

  function regenerate() {
    setError(null)
    setCopied(false)
    startTransition(async () => {
      const res = await regenerateMarketImportTokenAction()
      if (res.ok) {
        setToken(res.token)
      } else {
        setError(res.error)
      }
    })
  }

  function copy() {
    if (!bookmarkletJs) return
    navigator.clipboard.writeText(bookmarkletJs).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-6">
      {/* Stap 1 — token */}
      <section className="p-4 md:p-5"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
        <h2 className="text-base md:text-lg mb-2 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}>
          <span className="inline-flex size-6 items-center justify-center text-xs font-medium"
            style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '50%' }}>1</span>
          Persoonlijk import-token
        </h2>
        {token ? (
          <div className="flex items-center gap-2 mb-2">
            <code className="px-2 py-1 text-[0.7rem] font-mono flex-1 overflow-x-auto whitespace-nowrap"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              {token}
            </code>
            <button type="button" onClick={regenerate} disabled={pending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
              title="Genereer een nieuw token — de oude bookmarklet werkt dan niet meer">
              <RefreshCw className="size-3" />
              Vernieuw
            </button>
          </div>
        ) : (
          <button type="button" onClick={regenerate} disabled={pending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
            <RefreshCw className="size-4" />
            {pending ? 'Genereren…' : 'Genereer token'}
          </button>
        )}
        {error && (
          <p className="mt-2 text-xs inline-flex items-center gap-1" style={{ color: '#b91c1c' }}>
            <AlertCircle className="size-3" />{error}
          </p>
        )}
        <p className="mt-3 text-[0.65rem] text-[var(--color-mute)]">
          Het token verbindt de bookmarklet met jouw Browaeys-account. Deel het niet — als
          iemand het heeft, kan die in jouw marktmonitor importeren. Vernieuw als je twijfelt.
        </p>
      </section>

      {/* Stap 2 — installatie */}
      {token && (
        <section className="p-4 md:p-5"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h2 className="text-base md:text-lg mb-2 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            <span className="inline-flex size-6 items-center justify-center text-xs font-medium"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '50%' }}>2</span>
            Bookmarklet installeren
          </h2>

          <p className="text-sm mb-3">
            <strong>Sleep deze knop</strong> naar je bookmarks-balk:
          </p>

          {bookmarkletJs && (
            <a
              href={bookmarkletJs}
              draggable
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm cursor-grab active:cursor-grabbing"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
              title="Sleep naar bookmarks-balk"
            >
              <Bookmark className="size-4" />
              Import naar Browaeys
            </a>
          )}

          <p className="mt-3 text-xs text-[var(--color-mute)]">
            Werkt niet? Tip: maak handmatig een bookmark met een willekeurige URL en bewerk
            daarna. Plak dan deze code als URL:
          </p>
          <div className="mt-2 flex items-stretch gap-2">
            <code className="flex-1 px-3 py-2 text-[0.6rem] font-mono whitespace-pre overflow-x-auto"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)', maxHeight: '120px' }}>
              {bookmarkletJs}
            </code>
            <button type="button" onClick={copy}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs shrink-0"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              {copied ? <Check className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
              {copied ? 'Gekopieerd' : 'Kopieer'}
            </button>
          </div>

          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-[var(--color-mute)] hover:text-[var(--color-ink)]">
              Hoe maak ik mijn bookmarks-balk zichtbaar?
            </summary>
            <ul className="mt-2 pl-4 list-disc text-[var(--color-mute)] space-y-1">
              <li><strong>Chrome / Edge / Brave:</strong> Ctrl + Shift + B (Windows) of ⌘ + Shift + B (Mac)</li>
              <li><strong>Firefox:</strong> rechts-klik op het tabblad-balk → &ldquo;Bladwijzerbalk&rdquo;</li>
              <li><strong>Safari:</strong> Beeld → Bladwijzerbalk tonen</li>
            </ul>
          </details>
        </section>
      )}

      {/* Stap 3 — gebruik */}
      {token && (
        <section className="p-4 md:p-5"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h2 className="text-base md:text-lg mb-1 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            <span className="inline-flex size-6 items-center justify-center text-xs font-medium"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '50%' }}>3</span>
            Hoe gebruik je het?
          </h2>
          <p className="text-xs text-[var(--color-mute)] mb-5">
            Drie stappen die je telkens herhaalt wanneer je iets interessant tegenkomt.
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {/* Stap A */}
            <div className="p-4"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex size-8 items-center justify-center text-sm font-medium"
                  style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '50%' }}>A</span>
                <Search className="size-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm font-medium">Zoeken op immo-site</span>
              </div>
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Ga naar Immoweb (of Zimmo/Realo/…) en zoek panden in jouw streek. Filter op
                regio, prijs, type — net zoals je normaal doet.
              </p>
              <div className="text-[0.65rem] font-mono px-2 py-1.5 truncate"
                style={{ background: 'var(--color-paper)', border: '1px dashed var(--color-line)' }}>
                immoweb.be/nl/zoeken/...
              </div>
            </div>

            {/* Stap B */}
            <div className="p-4"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex size-8 items-center justify-center text-sm font-medium"
                  style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: '50%' }}>B</span>
                <MousePointerClick className="size-4" style={{ color: 'var(--color-accent)' }} />
                <span className="text-sm font-medium">Klik de bookmark</span>
              </div>
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Eén klik op &ldquo;Import naar Browaeys&rdquo; in je bookmarks-balk. Geen tabs
                wisselen, geen URLs kopiëren — gebeurt allemaal in de achtergrond.
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-1 text-[0.65rem]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}>
                <Bookmark className="size-3" />
                Import naar Browaeys
              </div>
            </div>

            {/* Stap C */}
            <div className="p-4"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex size-8 items-center justify-center text-sm font-medium"
                  style={{ background: '#16a34a', color: '#fff', borderRadius: '50%' }}>C</span>
                <CheckCircle2 className="size-4" style={{ color: '#16a34a' }} />
                <span className="text-sm font-medium">Bevestiging</span>
              </div>
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Een mini pop-up verschijnt: aantal nieuwe, samengevoegde en reeds gekende
                panden. Daarna staan ze allemaal in je marktmonitor.
              </p>
              <div className="text-[0.65rem] px-2 py-1.5"
                style={{ background: 'rgba(34,197,94,0.10)', color: '#166534', border: '1px solid rgba(34,197,94,0.3)' }}>
                Browaeys: 3 nieuw · 1 samengevoegd · 2 reeds bekend
              </div>
            </div>
          </div>

          {/* CTA */}
          <NextLink
            href="/admin/marktmonitor"
            className="mt-5 inline-flex items-center gap-2 text-sm link-underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <ExternalLink className="size-3.5" />
            Bekijk je marktmonitor
          </NextLink>

          {/* Praktische tips */}
          <div className="mt-6 p-3 text-xs"
            style={{ background: 'rgba(11,79,88,0.06)', borderLeft: '3px solid var(--color-accent)' }}>
            <p className="font-medium mb-1">💡 Goed om te weten</p>
            <ul className="space-y-1 pl-4 list-disc text-[var(--color-mute)]">
              <li>Werkt op <strong>zoek-resultaten</strong> (lijst van panden) <em>en</em> op <strong>detail-pagina&apos;s</strong> (1 pand).</li>
              <li><strong>Dedup</strong>: hetzelfde pand op Immoweb + Zimmo wordt automatisch één lead met beide bron-URLs.</li>
              <li>Reeds bekende panden worden overgeslagen — je kan dus zonder zorgen meermaals klikken.</li>
              <li>Niets te installeren op de andere sites — het is gewoon een bookmark in je browser.</li>
            </ul>
          </div>

          {/* FAQ */}
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer flex items-center gap-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)]">
              <HelpCircle className="size-3" />
              Wat als het niet werkt?
            </summary>
            <div className="mt-2 pl-5 space-y-2 text-[var(--color-mute)]">
              <p>
                <strong>&ldquo;Geen listings herkend in deze pagina&rdquo;:</strong> je staat
                waarschijnlijk op een homepage of een algemene pagina. Voer eerst een zoekopdracht
                uit en klik dan op de bookmark op de resultaten-pagina.
              </p>
              <p>
                <strong>&ldquo;Token niet herkend&rdquo;:</strong> de oude bookmarklet werkt niet
                meer (bv. omdat je vernieuwd hebt). Sleep de nieuwe bookmarklet hierboven naar
                je bookmarks-balk (en vervang de oude).
              </p>
              <p>
                <strong>Niets gebeurt na klikken:</strong> je bookmarks-balk is misschien
                verborgen. Druk Ctrl+Shift+B (Windows) of ⌘+Shift+B (Mac) om hem te tonen.
              </p>
              <p>
                <strong>Werkt niet op site X:</strong> we ondersteunen Immoweb, Zimmo, Realo,
                Immo Vlaanderen, Hebbes en Logic-Immo. Andere sites geven &ldquo;geen listings herkend&rdquo;
                — daar kan je nog steeds de URL manueel plakken op
                <NextLink href="/admin/marktmonitor" className="link-underline mx-1">/admin/marktmonitor</NextLink>.
              </p>
            </div>
          </details>
        </section>
      )}

      {/* Test-link */}
      {token && (
        <section className="p-4 md:p-5 text-xs"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="eyebrow text-[0.55rem] mb-2">Snelle testlink</h3>
          <p className="text-[var(--color-mute)] mb-2">
            Open één van deze, klik dan op de bookmarklet om te testen:
          </p>
          <ul className="flex flex-wrap gap-2">
            {[
              { label: 'Immoweb · Vlaamse Ardennen', href: 'https://www.immoweb.be/nl/zoeken/huis,appartement/te-koop?countries=BE&postalCodes=9667,9700,9620,9660&orderBy=newest' },
              { label: 'Zimmo · 9667', href: 'https://www.zimmo.be/nl/zoeken/?status=ForSale&transactie=koop&plaats=9667' },
              { label: 'Realo · 9667', href: 'https://www.realo.be/nl/te-koop/9667' },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[0.65rem] link-underline"
                  style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
                  <ExternalLink className="size-2.5" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

