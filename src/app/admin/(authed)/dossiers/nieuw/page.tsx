import Link from 'next/link'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import { NewDossierForm } from './form'

export const metadata = {
  title: 'Admin · Nieuw dossier',
}

export default function NewDossierPage() {
  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/dossiers"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar dossiers
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Dossiers</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3">
          <FolderOpen className="size-7" style={{ color: 'var(--color-accent)' }} />
          Nieuw dossier
        </h1>
      </section>

      <NewDossierForm />
    </div>
  )
}
