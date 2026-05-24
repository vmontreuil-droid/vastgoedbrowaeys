'use client'

import { useState, useTransition } from 'react'
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { importLegacyListingsAction, type ImportResult } from './import-legacy-actions'

export function ImportLegacyButton() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ImportResult | null>(null)

  function handleImport() {
    if (!confirm('Importeer alle Zabun-snapshot panden in de DB? Bestaande DB-panden worden NIET overschreven.')) {
      return
    }
    setResult(null)
    startTransition(async () => {
      const res = await importLegacyListingsAction()
      setResult(res)
    })
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={handleImport}
        disabled={pending}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs disabled:opacity-50"
        style={{ border: '1px solid var(--color-line)' }}
        title="Kopieer alle Zabun-snapshot panden naar de DB zodat ze bewerkbaar worden"
      >
        <Download className="size-3.5" />
        {pending ? 'Importeren…' : 'Importeer Zabun-snapshot'}
      </button>
      {result && (
        <span className="inline-flex items-center gap-1.5 text-xs"
          style={{ color: result.ok ? '#166534' : '#b91c1c' }}>
          {result.ok
            ? <><CheckCircle2 className="size-3.5" /> {result.message}</>
            : <><AlertCircle className="size-3.5" /> {result.error}</>}
        </span>
      )}
    </div>
  )
}
