'use client'

import { useState, useTransition } from 'react'
import { Zap, Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react'
import { addTemplateAction, updateTemplateAction, deleteTemplateAction } from './template-actions'
import type { NoteTemplate } from '@/lib/admin-db'

export function TemplatesPanel({ initialTemplates }: { initialTemplates: NoteTemplate[] }) {
  const [items, setItems] = useState<NoteTemplate[]>(initialTemplates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newText, setNewText] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const label = newLabel.trim()
    const text = newText.trim()
    if (!label || !text) return

    startTransition(async () => {
      const res = await addTemplateAction({ label, text })
      if (res.ok) {
        // optimistisch toevoegen — full refresh komt via revalidatePath
        setItems((prev) => [
          ...prev,
          { id: 'tmp-' + Date.now(), label, text, orderIndex: prev.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ])
        setNewLabel('')
        setNewText('')
        setAdding(false)
      } else {
        setError(res.error ?? 'Toevoegen mislukt')
      }
    })
  }

  function handleSave(id: string, label: string, text: string) {
    setError(null)
    startTransition(async () => {
      const res = await updateTemplateAction(id, { label, text })
      if (res.ok) {
        setItems((prev) => prev.map((t) => t.id === id ? { ...t, label, text } : t))
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
              onClick={() => { setAdding(false); setNewLabel(''); setNewText(''); setError(null) }}
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
        <ul className="divide-y"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)', borderColor: 'var(--color-line)' }}>
          {items.map((t) => (
            <TemplateRow
              key={t.id}
              template={t}
              editing={editingId === t.id}
              pending={pending}
              onEditStart={() => setEditingId(t.id)}
              onEditCancel={() => setEditingId(null)}
              onSave={(label, text) => handleSave(t.id, label, text)}
              onDelete={() => handleDelete(t.id)}
            />
          ))}
        </ul>
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
  onSave: (label: string, text: string) => void
  onDelete: () => void
}) {
  const [label, setLabel] = useState(template.label)
  const [text, setText] = useState(template.text)

  function startEdit() {
    setLabel(template.label)
    setText(template.text)
    onEditStart()
  }

  if (editing) {
    return (
      <li className="p-4 space-y-2"
        style={{ background: 'var(--color-paper-2)' }}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={60}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
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
            onClick={() => onSave(label, text)}
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
