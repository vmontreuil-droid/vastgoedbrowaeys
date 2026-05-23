'use client'

import { useState } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('info@studio-vm.be')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('running')
    setResult('')
    try {
      const res = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      setStatus(res.ok ? 'done' : 'error')
      setResult(JSON.stringify(data, null, 2))
    } catch (e) {
      setStatus('error')
      setResult(String(e))
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf8f4',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, fontFamily: 'Georgia, serif' }}>
          Admin setup (eenmalig)
        </h1>
        <p style={{ color: '#6b6b6b', marginBottom: 24, fontSize: 14 }}>
          Reset een wachtwoord en zet de gebruiker als agent — gebruikt de officiële
          Supabase Admin API in plaats van directe SQL (omzeilt bcrypt-format issues).
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: 24,
            border: '1px solid #e6e1d7',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8c6b2e' }}>
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: 12,
                border: '1px solid #e6e1d7',
                fontSize: 16,
                background: 'transparent',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8c6b2e' }}>
              Nieuw wachtwoord (min 6 chars)
            </span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                padding: 12,
                border: '1px solid #e6e1d7',
                fontSize: 16,
                background: 'transparent',
                fontFamily: 'monospace',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === 'running'}
            style={{
              padding: '14px 24px',
              background: '#0b4f58',
              color: '#faf8f4',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: status === 'running' ? 'wait' : 'pointer',
              opacity: status === 'running' ? 0.6 : 1,
            }}
          >
            {status === 'running' ? 'Bezig…' : 'Reset wachtwoord + zet als agent'}
          </button>
        </form>

        {result && (
          <pre
            style={{
              marginTop: 16,
              padding: 16,
              background: status === 'done' ? '#dcfce7' : '#fee2e2',
              color: status === 'done' ? '#166534' : '#991b1b',
              border: '1px solid ' + (status === 'done' ? '#86efac' : '#fca5a5'),
              fontSize: 13,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
            }}
          >
            {result}
          </pre>
        )}

        {status === 'done' && (
          <p style={{ marginTop: 16, fontSize: 14 }}>
            ✅ Klaar — log nu in op{' '}
            <Link href="/admin/login" style={{ color: '#0b4f58', textDecoration: 'underline' }}>
              /admin/login
            </Link>{' '}
            met de email + wachtwoord hierboven.
          </p>
        )}

        <p style={{ marginTop: 32, fontSize: 12, color: '#6b6b6b' }}>
          ⚠️ Whitelist: alleen <code>info@studio-vm.be</code> en{' '}
          <code>info@vastgoedbrowaeys.be</code> kunnen geüpdate worden via deze route.
        </p>
      </div>
    </div>
  )
}
