'use client'

import { useState, useTransition } from 'react'
import { Sparkles, CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import { runTeamSeedAction, type SeedResult, type SeedResultRow } from './seed-actions'

export function SeedTeamButton() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<SeedResult | null>(null)

  function run() {
    if (!confirm('Support-team importeren? Kimberly, Flore en Thomas worden aangemaakt (als ze nog niet bestaan) en alle 4 portretfoto\'s worden geüpload.')) return
    setResult(null)
    startTransition(async () => {
      const res = await runTeamSeedAction()
      setResult(res)
    })
  }

  return (
    <section className="mb-8 p-5"
      style={{ background: 'var(--color-paper)', border: '1px dashed var(--color-line)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Sparkles className="size-4" style={{ color: 'var(--color-accent)' }} />
            Support-team importeren
          </h3>
          <p className="mt-1 text-xs text-[var(--color-mute)]">
            Eenmalige actie — maakt accounts aan voor Kimberly, Flore en Thomas (indien nog niet aanwezig)
            en uploadt de portretfoto&apos;s uit <code>public/team/</code> voor alle 4 (incl. Stefanie).
            Idempotent: bestaande accounts en foto&apos;s worden overgeslagen.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium shrink-0 disabled:opacity-60"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Sparkles className="size-3.5" />
          {pending ? 'Bezig…' : 'Importeer team'}
        </button>
      </div>

      {result && !result.ok && (
        <div className="flex items-start gap-2 p-3 mt-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {result && result.ok && (
        <div className="mt-3 space-y-2">
          <ul className="space-y-1">
            {result.rows.map((r) => (
              <RowDisplay key={r.email} row={r} />
            ))}
          </ul>
          {hasNewPasswords(result.rows) && (
            <div className="p-3 mt-3"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#166534' }}>
                Initiële wachtwoorden — bewaar veilig &amp; communiceer via een veilig kanaal
              </p>
              <ul className="text-[0.7rem] font-mono space-y-1">
                {result.rows.filter((r) => r.password).map((r) => (
                  <li key={r.email}>
                    {r.email.padEnd(40, ' ')} {r.password}
                  </li>
                ))}
              </ul>
              <p className="text-[0.65rem] text-[var(--color-mute)] mt-2">
                Elke werknemer kan dit later wijzigen via /admin/team → Bewerken.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function hasNewPasswords(rows: SeedResultRow[]): boolean {
  return rows.some((r) => !!r.password)
}

function RowDisplay({ row }: { row: SeedResultRow }) {
  const statusColor =
    row.status === 'created' ? '#166534' :
    row.status === 'updated' ? '#166534' :
    row.status === 'failed'  ? '#b91c1c' :
    '#737373'

  const statusLabel =
    row.status === 'created' ? 'Aangemaakt' :
    row.status === 'updated' ? 'Geüpdatet' :
    row.status === 'failed'  ? 'Mislukt' :
    'Bestond al'

  const Icon = row.status === 'failed' ? AlertCircle : CheckCircle2

  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon className="size-3.5 mt-0.5 shrink-0" style={{ color: statusColor }} />
      <div className="min-w-0 flex-1">
        <span className="font-medium">{row.name}</span>{' '}
        <span className="text-[var(--color-mute)]">({row.email})</span>{' '}
        <span style={{ color: statusColor }}>· {statusLabel}</span>
        {row.photoStatus && row.photoStatus !== 'skipped' && (
          <span className="inline-flex items-center gap-1 ml-2 text-[var(--color-mute)]">
            <Camera className="size-3" />
            {row.photoStatus === 'uploaded' ? 'foto geüpload' : 'foto-upload mislukt'}
          </span>
        )}
        {row.error && (
          <p className="mt-0.5" style={{ color: '#b91c1c' }}>{row.error}</p>
        )}
      </div>
    </li>
  )
}
