'use client'

import { useState, useTransition } from 'react'
import { Tag, Plus, X, AlertCircle } from 'lucide-react'
import { setDossierTagsAction } from './tags-actions'

const SUGGESTED_TAGS = [
  'urgent',
  'vip',
  'opvolgen',
  'wacht-op-klant',
  'wacht-op-notaris',
  'prijsdaling',
  'nieuwe-foto',
  'koud',
  'warm',
]

export function TagsPanel({
  dossierId,
  initialTags,
}: {
  dossierId: string
  initialTags: string[]
}) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function persist(next: string[]) {
    setError(null)
    setTags(next)
    startTransition(async () => {
      const res = await setDossierTagsAction(dossierId, next)
      if (!res.ok) {
        setError(res.error ?? 'Bewaren mislukt')
      } else if (res.tags) {
        setTags(res.tags)
      }
    })
  }

  function addTag(raw: string) {
    const clean = raw.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 32)
    if (!clean) return
    if (tags.includes(clean)) {
      setInput('')
      return
    }
    persist([...tags, clean])
    setInput('')
  }

  function removeTag(t: string) {
    persist(tags.filter((x) => x !== t))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const suggestions = SUGGESTED_TAGS.filter((s) => !tags.includes(s))

  return (
    <section className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="eyebrow text-[0.55rem] mb-3 flex items-center gap-1.5">
        <Tag className="size-3" style={{ color: 'var(--color-accent)' }} />
        Tags / labels
      </h3>

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((t) => (
            <li key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.7rem]"
              style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                disabled={pending}
                className="text-[var(--color-mute)] hover:text-red-700 disabled:opacity-50"
                aria-label={`Verwijder ${t}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nieuwe tag…"
          maxLength={32}
          className="flex-1 px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
        <button
          type="button"
          onClick={() => addTag(input)}
          disabled={pending || !input.trim()}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs disabled:opacity-40"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-3" />
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="text-[0.6rem] text-[var(--color-mute)]">
          <p className="mb-1 uppercase tracking-[0.1em]">Suggesties</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                disabled={pending}
                className="px-1.5 py-0.5 text-[0.65rem] text-[var(--color-mute)] hover:text-[var(--color-ink)] disabled:opacity-50"
                style={{ border: '1px dashed var(--color-line)' }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 mt-3 text-[0.65rem]"
          style={{ color: '#b91c1c' }}>
          <AlertCircle className="size-3 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}
