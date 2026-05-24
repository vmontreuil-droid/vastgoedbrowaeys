'use client'

import { useMemo, useState, useTransition } from 'react'
import { Zap, Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react'
import { addTemplateAction, updateTemplateAction, deleteTemplateAction, type TemplateCategory } from './template-actions'
import type { NoteTemplate } from '@/lib/admin-db'

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: 'algemeen', label: 'Algemeen' },
  { value: 'verkoop', label: 'Verkoop' },
  { value: 'verhuur', label: 'Verhuur' },
  { value: 'koop_zoeker', label: 'Koop-zoeker' },
  { value: 'huur_zoeker', label: 'Huur-zoeker' },
]

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  algemeen: 'Algemeen',
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const CATEGORY_COLOR: Record<TemplateCategory, string> = {
  algemeen: '#737373',
  verkoop: '#a25b3a',
  verhuur: '#c98c4f',
  koop_zoeker: '#0b4f58',
  huur_zoeker: '#5a7a48',
}

const CATEGORY_ORDER: TemplateCategory[] = ['algemeen', 'verkoop', 'verhuur', 'koop_zoeker', 'huur_zoeker']

export function TemplatesPanel({ initialTemplates }: { initialTemplates: NoteTemplate[] }) {
  const [items, setItems] = useState<NoteTemplate[]>(initialTemplates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState<TemplateCategory>('algemeen')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const m = new Map<TemplateCategory, NoteTemplate[]>()
    for (const cat of CATEGORY_ORDER) m.set(cat, [])
    for (const t of items) {
      const cat = (CATEGORY_ORDER.includes(t.category) ? t.category : 'algemeen') as TemplateCategory
      m.get(cat)!.push(t)
    }
    return m
  }, [items])

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const label = newLabel.trim()
    const text = newText.trim()
    if (!label || !text) return

    startTransition(async () => {
      const res = await addTemplateAction({ label, text, category: newCategory })
      if (res.ok) {
        setItems((prev) => [
          ...prev,
          {
            id: 'tmp-' + Date.now(),
            label,
            text,
            category: newCategory,
            orderIndex: prev.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        setNewLabel('')
        setNewText('')
        setNewCategory('algemeen')
        setAdding(false)
      } else {
        setError(res.error ?? 'Toevoegen mislukt')
      }
    })
  }

  function handleSave(id: string, label: string, text: string, category: TemplateCategory) {
    setError(null)
    startTransition(async () => {
      const res = await updateTemplateAction(id, { label, text, category })
      if (res.ok) {
        setItems((prev) => prev.map((t) => t.id === id ? { ...t, label, text, category } : t))
        setEditingId(null)
      } else {
        setError(res.error ?? 'Opslaan mislukt')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Verwijder dit sjabloon definitief?')) return
    startTransition(async () => {
      const res = await deleteTemplateAction(id)
      if (res.ok) setItems((prev) => prev.filter((t) => t.id !== id))
      else setError(res.error ?? 'Verwijderen mislukt')
    })
  }

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
            <Zap className="size-5" style={{ color: 'var(--color-accent)' }} />
            Notitie-sjablonen ({items.length})
          </h2>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Snelkoppelingen die op elk dossier verschijnen onder &ldquo;Sjablonen&rdquo;.
            Per categorie (verkoop / verhuur / zoeker) tonen we enkel de relevante sjablonen op het dossier-type.
            Plaatshouders zoals <code>[datum]</code> of <code>[bedrag]</code> worden manueel ingevuld bij gebruik.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setError(null) }}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-[0.1em]"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Plus className="size-3.5" />
            Sjabloon toevoegen
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-3.5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd}
          className="p-4 mb-4 space-y-3"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">Naam (kort)</span>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="bv. Klant nog niet bereikt"
                required
                maxLength={60}
                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">Categorie</span>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TemplateCategory)}
                className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1 block">Tekst die ingevoegd wordt</span>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="bv. 3 maal gebeld zonder antwoord — sms gestuurd ter herinnering."
              rows={3}
              required
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium disabled:opacity-50"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Check className="size-3.5" />
              Bewaar
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewLabel(''); setNewText(''); setNewCategory('algemeen'); setError(null) }}
              className="text-xs link-underline text-[var(--color-mute)]"
            >
              Annuleer
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="p-6 text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          Nog geen sjablonen. Voeg er één toe om sneller terugkerende notities te bewaren.
        </p>
      ) : (
        <div className="space-y-5">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? []
            if (list.length === 0) return null
            return (
              <div key={cat}>
                <h3 className="flex items-center gap-2 mb-2 text-xs uppercase tracking-[0.12em] text-[var(--color-mute)]">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: CATEGORY_COLOR[cat] }}
                  />
                  {CATEGORY_LABEL[cat]}
                  <span className="text-[var(--color-mute)]">({list.length})</span>
                </h3>
                <ul className="divide-y"
                  style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderColor: 'var(--color-line)' }}>
                  {list.map((t) => (
                    <TemplateRow
                      key={t.id}
                      template={t}
                      editing={editingId === t.id}
                      pending={pending}
                      onEditStart={() => setEditingId(t.id)}
                      onEditCancel={() => setEditingId(null)}
                      onSave={(label, text, category) => handleSave(t.id, label, text, category)}
                      onDelete={() => handleDelete(t.id)}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function TemplateRow({
  template, editing, pending, onEditStart, onEditCancel, onSave, onDelete,
}: {
  template: NoteTemplate
  editing: boolean
  pending: boolean
  onEditStart: () => void
  onEditCancel: () => void
  onSave: (label: string, text: string, category: TemplateCategory) => void
  onDelete: () => void
}) {
  const [label, setLabel] = useState(template.label)
  const [text, setText] = useState(template.text)
  const [category, setCategory] = useState<TemplateCategory>(template.category)

  function startEdit() {
    setLabel(template.label)
    setText(template.text)
    setCategory(template.category)
    onEditStart()
  }

  if (editing) {
    return (
      <li className="p-4 space-y-2"
        style={{ background: 'var(--color-paper-2)' }}>
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSave(label, text, category)}
            disabled={pending}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <Check className="size-3" />
            Opslaan
          </button>
          <button
            type="button"
            onClick={onEditCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--color-mute)]"
          >
            <X className="size-3" />
            Annuleer
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="px-4 py-3 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{template.label}</p>
          <p className="text-xs text-[var(--color-mute)] mt-1 whitespace-pre-line">{template.text}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={startEdit}
            className="p-1.5 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            title="Bewerken"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-[var(--color-mute)] hover:text-red-700"
            title="Verwijderen"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  )
}
