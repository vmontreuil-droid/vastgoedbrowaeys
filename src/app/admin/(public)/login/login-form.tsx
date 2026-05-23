'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const initialError = params.get('error') === 'no-access' ? 'Geen admin-toegang voor dit account.' : null

  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending'>('idle')
  const [error, setError] = useState<string | null>(initialError)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    const supabase = createClient()
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !authData.user) {
      setStatus('idle')
      setError(
        signInError?.message === 'Invalid login credentials'
          ? 'E-mail of wachtwoord onjuist.'
          : signInError?.message || 'Inloggen mislukt.',
      )
      return
    }

    // Rol-check: alleen agents mogen door
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      await supabase.auth.signOut()
      setStatus('idle')
      setError(`Profile-query mislukt: ${profileError.message} (code: ${profileError.code || 'n/a'})`)
      return
    }

    if (!profile) {
      await supabase.auth.signOut()
      setStatus('idle')
      setError(`Geen profile-rij gevonden voor user ${authData.user.id}.`)
      return
    }

    if (profile.role !== 'admin') {
      await supabase.auth.signOut()
      setStatus('idle')
      setError(`Profile-rol = "${profile.role}" — moet "agent" zijn voor admin-toegang.`)
      return
    }

    router.push('/admin')
    router.refresh()
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

      <label className="block">
        <span className="eyebrow text-[0.6rem] mb-2 block flex items-center justify-between">
          Wachtwoord
          <Link
            href="/admin/wachtwoord-vergeten"
            className="link-underline normal-case tracking-normal text-[0.7rem] text-[var(--color-mute)]"
          >
            Vergeten?
          </Link>
        </span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-12 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors disabled:opacity-60"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
      >
        <ShieldCheck className="size-4" />
        {status === 'sending' ? 'Bezig met inloggen…' : 'Inloggen als beheerder'}
        <ArrowRight className="size-4" />
      </button>
    </form>
  )
}
