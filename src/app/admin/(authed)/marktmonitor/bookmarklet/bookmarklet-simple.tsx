'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { MoveRight, RefreshCw, Settings2, Copy, Check } from 'lucide-react'
import { regenerateMarketImportTokenAction } from './actions'

/** Escape voor inside HTML attribute (alleen wat nodig is voor href). */
function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function BookmarkletSimple({
  token: initialToken,
  origin,
  scrapingBeeEnabled,
}: {
  token: string
  origin: string
  scrapingBeeEnabled: boolean
}) {
  const [token, setToken] = useState(initialToken)
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const bookmarkletJs = useMemo(() => {
    const apiUrl = `${origin}/api/market-leads/import-html`
    const body = `(async()=>{try{const r=await fetch(${JSON.stringify(apiUrl)},{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ${token}'},body:JSON.stringify({url:location.href,html:document.documentElement.outerHTML})});const d=await r.json();alert('Browaeys: '+(d.message||d.error||'klaar'));}catch(e){alert('Browaeys fout: '+e.message);}})();`
    return `javascript:${encodeURIComponent(body)}`
  }, [origin, token])

  function regenerate() {
    if (!confirm('De huidige bookmark werkt daarna niet meer en moet vervangen worden. Doorgaan?')) return
    startTransition(async () => {
      const res = await regenerateMarketImportTokenAction()
      if (res.ok) setToken(res.token)
    })
  }

  function copyJs() {
    navigator.clipboard.writeText(bookmarkletJs).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="space-y-8">
      {/* === Hoofdactie === */}
      <section
        className="p-6 md:p-8 text-center"
        style={{
          background: 'var(--color-paper)',
          border: '2px dashed var(--color-accent)',
        }}
      >
        <p className="text-base md:text-lg mb-4">
          <strong>Sleep deze knop</strong> naar je favorieten-balk{' '}
          <span aria-hidden>👇</span>
        </p>

        <div className="flex items-center justify-center gap-4 my-6">
          {/* React 19 blokkeert javascript: URLs in JSX. We renderen het anchor
              daarom via dangerouslySetInnerHTML zodat de echte URL meeslepbaar is. */}
          <div
            dangerouslySetInnerHTML={{
              __html: `<a
                href="${escapeHtmlAttr(bookmarkletJs)}"
                draggable="true"
                onclick="event.preventDefault();alert('Sleep deze knop naar je favorieten-balk in plaats van te klikken.');return false;"
                title="Sleep mij naar je favorieten-balk"
                style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;font-size:1rem;background:var(--color-accent);color:#fff;cursor:grab;user-select:none;text-decoration:none;font-family:inherit;"
              ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>Import naar Browaeys</a>`
            }}
          />
          <MoveRight className="size-6 hidden sm:block text-[var(--color-mute)]" />
        </div>

        <p className="text-xs text-[var(--color-mute)]">
          Geen favorieten-balk? Druk <kbd className="px-1.5 py-0.5 text-[0.7rem]"
            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 text-[0.7rem]"
            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>Shift</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 text-[0.7rem]"
            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>B</kbd>{' '}
          om hem te tonen.
        </p>
      </section>

      {/* === En dan? === */}
      <section>
        <h2 className="text-lg md:text-xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          En dan?
        </h2>

        <ol className="space-y-3">
          <li className="flex items-start gap-3 p-3"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>1</span>
            <div className="text-sm">
              Ga naar <strong>Immoweb</strong>, <strong>Zimmo</strong> of <strong>Realo</strong>{' '}
              en zoek panden in jouw streek zoals je normaal doet.
            </div>
          </li>
          <li className="flex items-start gap-3 p-3"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>2</span>
            <div className="text-sm">
              Klik op de <strong>&ldquo;Import naar Browaeys&rdquo;</strong>-knop in je favorieten-balk.
            </div>
          </li>
          <li className="flex items-start gap-3 p-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
              style={{ background: '#16a34a', color: '#fff' }}>3</span>
            <div className="text-sm">
              Klaar! Een berichtje verschijnt zoals{' '}
              <em>&ldquo;Browaeys: 3 nieuw · 1 samengevoegd · 2 reeds bekend&rdquo;</em>.
              Alle gevonden panden staan dan in <Link href="/admin/marktmonitor" className="link-underline">je marktmonitor</Link>.
            </div>
          </li>
        </ol>
      </section>

      {/* === Geavanceerd === */}
      <details className="mt-4">
        <summary className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] cursor-pointer">
          <Settings2 className="size-3.5" />
          Geavanceerd
        </summary>

        <div className="mt-4 space-y-4 text-xs">
          {/* Token-regeneratie */}
          <div className="p-3"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <p className="font-medium mb-1">Knop vernieuwen</p>
            <p className="text-[var(--color-mute)] mb-2">
              Als de knop niet meer werkt of je vermoedt dat iemand anders hem heeft,
              kan je een nieuwe genereren. Je moet daarna de nieuwe knop opnieuw naar
              je favorieten-balk slepen.
            </p>
            <button type="button" onClick={regenerate} disabled={pending}
              className="inline-flex items-center gap-1 px-3 py-1.5 disabled:opacity-50"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              <RefreshCw className="size-3" />
              {pending ? 'Bezig…' : 'Vernieuw knop'}
            </button>
          </div>

          {/* Code voor handmatige installatie */}
          <div className="p-3"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <p className="font-medium mb-1">Manueel installeren (als slepen niet werkt)</p>
            <p className="text-[var(--color-mute)] mb-2">
              Maak een nieuwe bookmark (rechts-klik op de favorieten-balk → &ldquo;Bookmark
              toevoegen&rdquo;) en plak deze code als URL:
            </p>
            <div className="flex items-stretch gap-2">
              <code className="flex-1 px-2 py-1.5 text-[0.6rem] font-mono whitespace-pre overflow-x-auto"
                style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)', maxHeight: '80px' }}>
                {bookmarkletJs}
              </code>
              <button type="button" onClick={copyJs}
                className="inline-flex items-center gap-1 px-2 shrink-0"
                style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
                {copied ? <Check className="size-3" style={{ color: '#16a34a' }} /> : <Copy className="size-3" />}
                {copied ? 'OK' : 'Kopieer'}
              </button>
            </div>
          </div>

          {/* ScrapingBee */}
          <div className="p-3"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <p className="font-medium mb-1">
              Volautomatische scan (ScrapingBee)
              {scrapingBeeEnabled && <span className="ml-2 text-[0.65rem]" style={{ color: '#166534' }}>✓ actief</span>}
            </p>
            <p className="text-[var(--color-mute)]">
              Wil je niet manueel klikken? <Link
                href="/admin/marktmonitor/bookmarklet/scrapingbee"
                className="link-underline">
                Activeer ScrapingBee
              </Link>{' '}
              voor volautomatische dagelijkse scans (~€49/maand). Zie pagina voor uitleg.
            </p>
          </div>
        </div>
      </details>
    </div>
  )
}
