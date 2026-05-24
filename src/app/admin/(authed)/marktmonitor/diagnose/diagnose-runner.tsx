'use client'

import { useState, useTransition } from 'react'
import {
  Stethoscope, CheckCircle2, AlertCircle, ShieldAlert, ExternalLink, PlayCircle,
} from 'lucide-react'
import { runDiagnoseAction, type DiagnoseResult } from './actions'

export function DiagnoseRunner() {
  const [pending, startTransition] = useTransition()
  const [results, setResults] = useState<DiagnoseResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run() {
    setError(null)
    setResults(null)
    startTransition(async () => {
      try {
        const r = await runDiagnoseAction()
        setResults(r)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50 mb-6"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <PlayCircle className="size-4" />
        {pending ? 'Bezig met testen (≤30s)…' : 'Start diagnose-scan'}
      </button>

      {error && (
        <p className="p-3 text-sm mb-4"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {results && (
        <ul className="space-y-3">
          {results.map(({ site, diag }) => (
            <li key={site} className="p-4"
              style={{
                background: 'var(--color-paper)',
                border: `1px solid ${diag.ok ? 'rgba(34,197,94,0.3)' : diag.isCloudflare ? 'rgba(201,140,79,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {diag.ok ? (
                    <CheckCircle2 className="size-5" style={{ color: '#166534' }} />
                  ) : diag.isCloudflare ? (
                    <ShieldAlert className="size-5" style={{ color: '#92400e' }} />
                  ) : (
                    <AlertCircle className="size-5" style={{ color: '#b91c1c' }} />
                  )}
                  <h3 className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                    {site}
                  </h3>
                </div>
                <a href={diag.url} target="_blank" rel="noopener"
                  className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] inline-flex items-center gap-1">
                  <ExternalLink className="size-3" />
                  Open test-URL
                </a>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs mb-2">
                <Item label="HTTP status" value={diag.status === 0 ? 'geen' : String(diag.status)}
                  good={diag.status >= 200 && diag.status < 300} />
                <Item label="Cloudflare" value={diag.isCloudflare ? 'ja' : 'nee'}
                  bad={diag.isCloudflare} />
                <Item label="Response" value={`${(diag.contentLength / 1024).toFixed(1)} KB`}
                  bad={diag.contentLength < 500} />
                <Item label="Data" value={
                  diag.hasInitialState ? '__INITIAL_STATE__' :
                  diag.hasNextData ? '__NEXT_DATA__' :
                  diag.hasJsonLd ? 'JSON-LD' : 'geen'
                } good={diag.hasInitialState || diag.hasNextData || diag.hasJsonLd} />
              </dl>

              {diag.error && (
                <p className="text-xs mt-2" style={{ color: '#b91c1c' }}>
                  <AlertCircle className="size-3 inline mr-1" />
                  {diag.error}
                </p>
              )}

              {diag.responseSnippet && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                    Response snippet (eerste 400 chars)
                  </summary>
                  <pre className="mt-2 p-2 text-[0.65rem] overflow-x-auto whitespace-pre-wrap font-mono"
                    style={{ background: 'var(--color-paper-2)' }}>
                    {diag.responseSnippet}
                  </pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 p-4 text-xs"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          <p className="font-medium mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Wat betekenen de resultaten?
          </p>
          <ul className="space-y-1 text-[var(--color-mute)]">
            <li>✓ <strong>HTTP 200 + data-flag</strong>: site werkt, scraper kan parsen.</li>
            <li>⚠ <strong>Cloudflare ja</strong>: anti-bot heeft Vercel-IP geblokkeerd. Oplossing = scraper-API ($).</li>
            <li>✗ <strong>HTTP 403/429</strong>: rate-limited of geblokkeerd. Oplossing = lagere frequentie of API.</li>
            <li>✗ <strong>HTTP 200 maar geen data</strong>: site-structuur veranderd, scraper-code moet bijgewerkt.</li>
          </ul>
          <p className="mt-3 text-[var(--color-mute)]">
            Als alle sites op Cloudflare blijven hangen: switch naar manuele URL-paste
            (fase 1, werkt 100%) of investeer in een scraper-API zoals ScrapingBee (~€30/maand
            geeft je residential IPs die niet geblokkeerd worden).
          </p>
        </div>
      )}
    </div>
  )
}

function Item({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = good ? '#166534' : bad ? '#b91c1c' : 'inherit'
  return (
    <>
      <dt className="text-[var(--color-mute)] uppercase tracking-[0.1em] text-[0.55rem]">{label}</dt>
      <dd className="font-medium" style={{ color }}>{value}</dd>
    </>
  )
}
