import Link from 'next/link'
import { Phone, Mail, Clock, Settings } from 'lucide-react'

export function SiteTopbar() {
  return (
    <div
      className="hidden md:block text-[0.72rem] tracking-wide"
      style={{
        background: 'var(--color-accent)',
        color: 'color-mix(in srgb, #faf8f4 78%, transparent)',
      }}
    >
      <div className="container-px mx-auto max-w-screen-2xl flex items-center justify-between h-9">
        <div className="flex items-center gap-6">
          <a
            href="tel:+3255595010"
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--color-paper)]"
          >
            <Phone className="size-3" />
            +32 (0)55 59 50 10
          </a>
          <a
            href="mailto:info@vastgoedbrowaeys.be"
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--color-paper)]"
          >
            <Mail className="size-3" />
            info@vastgoedbrowaeys.be
          </a>
          <span className="flex items-center gap-1.5 opacity-80">
            <Clock className="size-3" />
            Ma–Vr 9–18u · Za op afspraak
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-60">BIV 504.553</span>
          <span className="opacity-30">·</span>
          <span style={{ color: 'var(--color-clay)' }}>Dorpsstraat 93, 9667 Horebeke</span>
          <span className="opacity-30">·</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--color-paper)]"
            style={{ color: 'var(--color-clay)' }}
          >
            <Settings className="size-3" />
            Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
