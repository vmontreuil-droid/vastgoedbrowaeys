import { Send } from 'lucide-react'
import { getAdminClients } from '@/lib/admin-db'
import { NewsletterComposer } from './composer'

export const metadata = {
  title: 'Admin · Nieuwsbrief',
}

export default async function NewsletterPage() {
  const { items: clients } = await getAdminClients()

  const audiences = clients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim() || c.email,
    email: c.email,
    kinds: c.kinds,
    status: c.status,
    city: c.city,
  }))

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Nieuwsbrief</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3">
          <Send className="size-7" style={{ color: 'var(--color-accent)' }} />
          Nieuwsbrief versturen
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
          Selecteer een doelgroep, schrijf je bericht, en open je e-mailclient met alle
          adressen in BCC — óf download de adressenlijst als CSV om in een ander
          mailing-tool te plakken.
        </p>
      </section>

      <NewsletterComposer audiences={audiences} />
    </div>
  )
}
