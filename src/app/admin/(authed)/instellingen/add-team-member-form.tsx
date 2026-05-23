'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { addTeamMemberAction, type ActionResult } from './actions'

export function AddTeamMemberForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await addTeamMemberAction(formData)
      setResult(res)
      if (res.ok) {
        formRef.current?.reset()
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <div className="space-y-3">
        {result?.ok && (
          <div
            className="flex items-start gap-3 p-3 text-sm"
            style={{ background: 'rgba(34, 197, 94, 0.10)', color: '#166534' }}
          >
            <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
            <span>{result.message}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setResult(null)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Plus className="size-3" />
          <UserPlus className="size-3.5" />
          Werknemer toevoegen
        </button>
      </div>
    )
  }

  return (
    <div
      className="p-6 md:p-8"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
          Nieuwe werknemer
        </h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setResult(null)
          }}
          className="text-xs text-[var(--color-mute)] link-underline"
        >
          Annuleren
        </button>
      </div>

      {result && !result.ok && (
        <div
          className="flex items-start gap-3 p-3 mb-5 text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c' }}
          role="alert"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow text-[0.6rem] mb-2 block">Voornaam *</span>
            <input
              type="text"
              name="first_name"
              required
              autoComplete="given-name"
              className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[0.6rem] mb-2 block">Familienaam *</span>
            <input
              type="text"
              name="last_name"
              required
              autoComplete="family-name"
              className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
        </div>

        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-2 block">E-mailadres *</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
        </label>

        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-2 block">Functie / titel</span>
          <input
            type="text"
            name="title"
            placeholder="bv. Administratief medewerker"
            className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="eyebrow text-[0.6rem] mb-2 block">Telefoon</span>
            <input
              type="tel"
              name="phone"
              placeholder="055/59 50 10"
              className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[0.6rem] mb-2 block">BIV-nummer (optioneel)</span>
            <input
              type="text"
              name="biv_number"
              placeholder="504.553"
              className="w-full px-4 py-3 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>
        </div>

        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-2 block">Initieel wachtwoord (min 8 tekens) *</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 bg-transparent text-base focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]"
              aria-label={showPassword ? 'Verberg' : 'Toon'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--color-mute)]">
            Deel dit wachtwoord met de werknemer. Zij/hij kan het zelf wijzigen via "Wachtwoord vergeten".
          </p>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium disabled:opacity-60"
            style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
          >
            <UserPlus className="size-4" />
            {pending ? 'Aanmaken…' : 'Werknemer aanmaken'}
          </button>
        </div>
      </form>
    </div>
  )
}
