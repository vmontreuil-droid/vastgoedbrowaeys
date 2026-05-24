'use client'

import { useState, useTransition } from 'react'
import { Check, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react'
import {
  updatePortalProfileAction,
  updatePortalPasswordAction,
  togglePortalNewsletterAction,
} from './actions'

export function ProfileForm({
  initial,
}: {
  initial: { firstName: string; lastName: string; phone: string; email: string }
}) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updatePortalProfileAction(fd)
      setFeedback({ ok: res.ok, msg: res.ok ? (res.message ?? 'Bewaard') : (res.error ?? 'Mislukt') })
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-1.5 block">Voornaam</span>
          <input type="text" name="first_name" defaultValue={initial.firstName} required
            className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }} />
        </label>
        <label className="block">
          <span className="eyebrow text-[0.6rem] mb-1.5 block">Familienaam</span>
          <input type="text" name="last_name" defaultValue={initial.lastName} required
            className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }} />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Telefoon</span>
        <input type="tel" name="phone" defaultValue={initial.phone}
          placeholder="bv. 0473 12 34 56"
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }} />
      </label>
      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">E-mailadres</span>
        <input type="email" value={initial.email} disabled
          className="w-full px-3 py-2 text-sm bg-transparent text-[var(--color-mute)]"
          style={{ border: '1px solid var(--color-line)' }} />
        <p className="mt-1 text-[0.65rem] text-[var(--color-mute)]">
          E-mailadres kan u niet zelf wijzigen — neem contact op met uw makelaar.
        </p>
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          <Check className="size-4" /> {pending ? 'Bezig…' : 'Bewaar wijzigingen'}
        </button>
        {feedback && (
          <span className="text-xs inline-flex items-center gap-1"
            style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
            {feedback.ok ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
            {feedback.msg}
          </span>
        )}
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [show, setShow] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updatePortalPasswordAction(fd)
      if (res.ok) {
        ;(e.target as HTMLFormElement).reset()
      }
      setFeedback({ ok: res.ok, msg: res.ok ? (res.message ?? 'Gewijzigd') : (res.error ?? 'Mislukt') })
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Huidig wachtwoord</span>
        <input type={show ? 'text' : 'password'} name="current_password" required autoComplete="current-password"
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }} />
      </label>
      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Nieuw wachtwoord (min 8 tekens)</span>
        <div className="relative">
          <input type={show ? 'text' : 'password'} name="new_password" required minLength={8} autoComplete="new-password"
            className="w-full px-3 py-2 pr-10 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }} />
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-mute)]">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Bevestig nieuw wachtwoord</span>
        <input type={show ? 'text' : 'password'} name="confirm_password" required minLength={8} autoComplete="new-password"
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }} />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
          <Check className="size-4" /> {pending ? 'Bezig…' : 'Wijzig wachtwoord'}
        </button>
        {feedback && (
          <span className="text-xs inline-flex items-center gap-1"
            style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
            {feedback.ok ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
            {feedback.msg}
          </span>
        )}
      </div>
    </form>
  )
}

export function NewsletterToggle({ initialOptOut }: { initialOptOut: boolean }) {
  const [optOut, setOptOut] = useState(initialOptOut)
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function toggle() {
    const next = !optOut
    setFeedback(null)
    setOptOut(next)
    startTransition(async () => {
      const res = await togglePortalNewsletterAction(next)
      if (!res.ok) {
        setOptOut(!next)
        setFeedback({ ok: false, msg: res.error ?? 'Mislukt' })
      } else {
        setFeedback({ ok: true, msg: next ? 'Uitgeschreven van nieuwsbrief.' : 'Ingeschreven op nieuwsbrief.' })
      }
    })
  }

  return (
    <div>
      <button type="button" onClick={toggle} disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        style={{
          background: optOut ? 'var(--color-paper-2)' : 'var(--color-ink)',
          color: optOut ? 'var(--color-ink)' : 'var(--color-paper)',
          border: '1px solid var(--color-line)',
        }}>
        <Mail className="size-4" />
        {optOut ? 'Schrijf mij weer in' : 'Schrijf mij uit'}
      </button>
      <p className="mt-2 text-xs text-[var(--color-mute)]">
        Status: {optOut ? 'Uitgeschreven — u ontvangt geen nieuwsbrieven meer.' : 'Ingeschreven — u ontvangt onze nieuwsbrief.'}
      </p>
      {feedback && (
        <p className="mt-2 text-xs inline-flex items-center gap-1"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
          {feedback.msg}
        </p>
      )}
    </div>
  )
}
