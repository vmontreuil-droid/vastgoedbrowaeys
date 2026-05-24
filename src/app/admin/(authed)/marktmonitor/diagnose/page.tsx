import Link from 'next/link'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import { DiagnoseRunner } from './diagnose-runner'

export const metadata = {
  title: 'Admin · Marktmonitor · Diagnose',
}

export default function DiagnosePage() {
  return (
    <div className="container-px mx-auto max-w-3xl py-8 md:py-10">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-4 md:mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-6 md:mb-8">
        <p className="eyebrow mb-2 md:mb-3">Admin · Marktmonitor</p>
        <h1 className="text-2xl sm:text-3xl flex items-center gap-3">
          <Stethoscope className="size-6 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Scraper-diagnose
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          Test elke immo-site afzonderlijk om te zien of de scraping vanaf Vercel werkt of
          door Cloudflare/anti-bot wordt geblokkeerd. Open eerst de test-URL in een
          browser-tab om te vergelijken — daar zou je gewoon resultaten moeten zien.
        </p>
      </section>

      <DiagnoseRunner />
    </div>
  )
}
