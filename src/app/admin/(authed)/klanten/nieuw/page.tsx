import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { NewClientForm } from './form'

export const metadata = {
  title: 'Admin · Nieuwe klant',
}

export default function NewClientPage() {
  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/klanten"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar klanten
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Klanten</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3">
          <Users className="size-7" style={{ color: 'var(--color-accent)' }} />
          Nieuwe klant
        </h1>
        <p className="text-sm text-[var(--color-mute)] mt-2 max-w-2xl">
          Maak een klant-profiel aan. Vink &quot;Portaal-toegang&quot; aan als de klant ook moet kunnen inloggen — dan stuurt het systeem een uitnodigings-link.
        </p>
      </section>

      <NewClientForm />
    </div>
  )
}
