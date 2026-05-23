import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { NewAppointmentForm } from './form'

export const metadata = {
  title: 'Admin · Nieuwe afspraak',
}

export default function NewAppointmentPage() {
  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/afspraken"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar agenda
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Afspraken</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3">
          <Calendar className="size-7" style={{ color: 'var(--color-accent)' }} />
          Nieuwe afspraak
        </h1>
      </section>

      <NewAppointmentForm />
    </div>
  )
}
