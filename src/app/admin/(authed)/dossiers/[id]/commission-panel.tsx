'use client'

import { useMemo, useState, useTransition } from 'react'
import { Calculator, Pencil, Check, X, AlertCircle } from 'lucide-react'
import { updateCommissionAction } from './commission-actions'

export type CommissionData = {
  dossierId: string
  type: 'percentage' | 'fixed' | 'none'
  rate: number | null
  fixed: number | null
  vatIncluded: boolean
  notes: string | null
  askingPrice: number | null
}

const VAT_RATE = 0.21

function formatEur(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function computeAmount(type: CommissionData['type'], rate: number | null, fixed: number | null, askingPrice: number | null): number {
  if (type === 'none') return 0
  if (type === 'percentage') {
    if (!askingPrice || !rate) return 0
    return Math.round(askingPrice * (rate / 100))
  }
  if (type === 'fixed') return fixed ?? 0
  return 0
}

export function CommissionPanel({ initial }: { initial: CommissionData }) {
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<CommissionData['type']>(initial.type)
  const [rate, setRate] = useState<string>(initial.rate?.toString() ?? '3')
  const [fixed, setFixed] = useState<string>(initial.fixed?.toString() ?? '')
  const [vatIncluded, setVatIncluded] = useState(initial.vatIncluded)
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Saved values voor view-mode
  const [saved, setSaved] = useState<CommissionData>(initial)

  const previewAmount = useMemo(() => {
    return computeAmount(type, parseFloat(rate) || null, parseFloat(fixed) || null, saved.askingPrice)
  }, [type, rate, fixed, saved.askingPrice])

  const savedAmount = useMemo(
    () => computeAmount(saved.type, saved.rate, saved.fixed, saved.askingPrice),
    [saved],
  )

  const vatPart = vatIncluded ? 0 : Math.round(previewAmount * VAT_RATE)
  const totalIncl = previewAmount + vatPart
  const savedVatPart = saved.vatIncluded ? 0 : Math.round(savedAmount * VAT_RATE)
  const savedTotalIncl = savedAmount + savedVatPart

  function cancel() {
    setType(saved.type)
    setRate(saved.rate?.toString() ?? '3')
    setFixed(saved.fixed?.toString() ?? '')
    setVatIncluded(saved.vatIncluded)
    setNotes(saved.notes ?? '')
    setEditing(false)
    setError(null)
  }

  function save() {
    setError(null)
    startTransition(async () => {
      const res = await updateCommissionAction({
        dossierId: initial.dossierId,
        type,
        rate: type === 'percentage' ? parseFloat(rate) || null : null,
        fixed: type === 'fixed' ? parseFloat(fixed) || null : null,
        vatIncluded,
        notes: notes.trim() || null,
      })
      if (res.ok) {
        setSaved({
          ...initial,
          type,
          rate: type === 'percentage' ? parseFloat(rate) || null : null,
          fixed: type === 'fixed' ? parseFloat(fixed) || null : null,
          vatIncluded,
          notes: notes.trim() || null,
        })
        setEditing(false)
      } else {
        setError(res.error ?? 'Opslaan mislukt')
      }
    })
  }

  return (
    <section className="p-5"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-base flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Calculator className="size-4" style={{ color: 'var(--color-accent)' }} />
          Commissie
        </h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs link-underline text-[var(--color-mute)]">
            <Pencil className="size-3" /> Bewerken
          </button>
        )}
      </header>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!editing ? (
        saved.type === 'none' ? (
          <p className="text-sm text-[var(--color-mute)] italic">Geen commissie ingesteld.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[var(--color-mute)] text-xs">
                {saved.type === 'percentage'
                  ? `${saved.rate ?? 0}% van ${saved.askingPrice ? formatEur(saved.askingPrice) : '—'}`
                  : 'Vast bedrag'}
              </span>
              <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }} className="text-xl">
                {formatEur(savedAmount)}
              </span>
            </div>
            {!saved.vatIncluded && savedAmount > 0 && (
              <div className="flex items-baseline justify-between text-xs text-[var(--color-mute)]">
                <span>BTW 21%</span>
                <span>{formatEur(savedVatPart)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
              <span className="text-xs uppercase tracking-[0.12em]">Totaal {saved.vatIncluded ? '(BTW incl.)' : '(excl. BTW)'}</span>
              <span className="font-medium">{formatEur(saved.vatIncluded ? savedAmount : savedTotalIncl)}</span>
            </div>
            {saved.notes && (
              <p className="text-xs text-[var(--color-mute)] mt-3 pt-3 border-t whitespace-pre-line italic"
                style={{ borderColor: 'var(--color-line)' }}>
                {saved.notes}
              </p>
            )}
          </div>
        )
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1.5 block">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CommissionData['type'])}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            >
              <option value="percentage">Percentage van vraagprijs</option>
              <option value="fixed">Vast bedrag</option>
              <option value="none">Geen commissie</option>
            </select>
          </label>

          {type === 'percentage' && (
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1.5 block">Percentage (%)</span>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="bv. 3"
                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
              {saved.askingPrice && rate && (
                <p className="text-xs text-[var(--color-mute)] mt-1">
                  {rate}% van {formatEur(saved.askingPrice)} = <strong>{formatEur(previewAmount)}</strong>
                </p>
              )}
            </label>
          )}

          {type === 'fixed' && (
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1.5 block">Vast bedrag (€)</span>
              <input
                type="number"
                step="100"
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
                placeholder="bv. 5000"
                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
          )}

          {type !== 'none' && previewAmount > 0 && (
            <div className="p-3 text-xs space-y-1"
              style={{ background: 'var(--color-paper-2)' }}>
              <div className="flex items-baseline justify-between">
                <span>Commissie (excl. BTW)</span>
                <span>{formatEur(previewAmount)}</span>
              </div>
              <div className="flex items-baseline justify-between text-[var(--color-mute)]">
                <span>BTW 21%</span>
                <span>{formatEur(Math.round(previewAmount * VAT_RATE))}</span>
              </div>
              <div className="flex items-baseline justify-between font-medium pt-1 border-t"
                style={{ borderColor: 'var(--color-line)' }}>
                <span>Totaal incl. BTW</span>
                <span>{formatEur(totalIncl)}</span>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={vatIncluded}
              onChange={(e) => setVatIncluded(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            <span>Bedrag is reeds <strong>inclusief BTW</strong></span>
          </label>

          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1.5 block">Notitie (optioneel)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="bv. Afspraak met klant: 2.5% i.p.v. 3%"
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={save} disabled={pending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
              <Check className="size-3.5" />
              {pending ? 'Opslaan…' : 'Opslaan'}
            </button>
            <button type="button" onClick={cancel} disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-[var(--color-mute)]">
              <X className="size-3.5" />
              Annuleer
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
