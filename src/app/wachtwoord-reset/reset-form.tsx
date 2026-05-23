'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'checking' | 'idle' | 'updating' | 'success'>('checking')
  const [error, setError] = useState<string | null>(null)

  // Wacht tot Supabase de hash heeft verwerkt en een sessie heeft
  useEffect(() => {
    const supabase = createClient()
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setStatus('idle')
      } else {
        // Geef het 800ms om de hash te verwerken, daarna geven we het op
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession()
          if (retry.session) {
            setStatus('idle')
          } else {
            setStatus('idle')
            setError(
              'Geen geldige recovery-sessie gevonden. De link is mogelijk verlopen — vraag opnieuw een wachtwoord-herstel via je login-pagina.',
            )
          }
        }, 800)
      }
    }
    check()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('updating')
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = String(formData.get('password') ?? '')

    if (password.length < 8) {
      setStatus('idle')
      setError('Wachtwoord moet minstens 8 tekens bevatten.')
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setStatus('idle')
      setError(updateError.message)
      return
    }

    setStatus('success')

    // Detecteer rol via JWT user_metadata → redirect naar juiste login
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      const target =
        userData.user.user_metadata?.role === 'admin' ? '/admin/login' : '/portaal/login'
      setTimeout(() => router.push(target), 1500)
    } else {
      setTimeout(() => router.push('/'), 1500)
    }
  }

  if (status === 'success') {
    return (
      <div className="p-8 text-center" style={{ background: 'var(--color-paper-2)' }}>
        <div
          className="inline-grid place-items-center size-14 mb-5 rounded-full"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
        >
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Wachtwoord bijgewerkt
        </h2>
        <p className="text-sm text-[var(--color-mute)]">
          U wordt zo doorgestuurd naar de login-pagina…
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
        <span className="eyebrow text-[0.6rem] mb-2 block">Nieuw wachtwoord</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={status === 'checking'}
            className="w-full px-4 py-3 pr-12 bg-transparent text-base transition-colors focus:outline-none focus:border-[var(--color-accent)]"
            style={{ border: '1px solid var(--color-line)' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            aria-label={showPassword ? 'Verberg' : 'Toon'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={status === 'checking' || status === 'updating'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors disabled:opacity-60"
        style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
      >
        {status === 'checking' && 'Sessie controleren…'}
        {status === 'updating' && 'Bijwerken…'}
        {status === 'idle' && (
          <>
            Wachtwoord opslaan
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  )
}
