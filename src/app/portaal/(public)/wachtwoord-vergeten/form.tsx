'use client'

import { useState } from 'react'
import { ArrowRight, AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '').trim()

    const supabase = createClient()
    const siteUrl =
      typeof window !== 'undefined' ? window.location.origin : ''
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/wachtwoord-reset`,
    })

    if (resetError) {
      setStatus('idle')
      setError(resetError.message)
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="p-8 text-center" style={{ background: 'var(--color-paper-2)' }}>
        <div
          className="inline-grid place-items-center size-14 mb-5 rounded-full"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Bericht verzonden
        </h2>
        <p className="text-sm text-[var(--color-mute)]">
          Controleer uw mailbox (ook spam). De link is 1 uur geldig.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="flex items-start gap-3 p-3 text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c' }}
          role="alert"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-2 block">E-mailadres</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        />
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors disabled:opacity-60"
        style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
      >
        <Mail className="size-4" />
        {status === 'sending' ? 'Verzenden…' : 'Stuur herstel-link'}
        <ArrowRight className="size-4" />
      </button>
    </form>
  )
}
