'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending'>('idle')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Placeholder — Supabase auth komt later
    setTimeout(() => {
      window.location.href = '/portaal'
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          <Link href="/portaal/wachtwoord-vergeten" className="link-underline normal-case tracking-normal text-[0.7rem] text-[var(--color-mute)]">
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

      <label className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
        <input type="checkbox" name="remember" className="accent-[var(--color-accent)]" />
        Mij onthouden op dit toestel
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors"
        style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
      >
        {status === 'sending' ? 'Inloggen…' : 'Inloggen'}
        <ArrowRight className="size-4" />
      </button>
    </form>
  )
}
