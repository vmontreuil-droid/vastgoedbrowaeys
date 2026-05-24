import Link from 'next/link'
import { FolderOpen, ArrowRight, Hash, MapPin, FileText, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMyDossiers } from '@/lib/portal-db'
import { formatPrice } from '@/lib/listings'

export const metadata = {
  title: 'Mijn dossiers',
}

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

export default async function MyDossiersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { items: dossiers, error } = user
    ? await getMyDossiers(user.id)
    : { items: [], error: 'Niet ingelogd' }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <section className="mb-10">
        <p className="eyebrow mb-3">Klantenportaal</p>
        <h1 className="text-3xl md:text-5xl flex items-center gap-4">
          <FolderOpen className="size-8" style={{ color: 'var(--color-accent)' }} />
          Mijn dossiers <span className="text-[var(--color-mute)] text-3xl">({dossiers.length})</span>
        </h1>
        <p className="mt-4 text-[var(--color-mute)] max-w-2xl">
          Overzicht van uw lopende en afgesloten dossiers bij Vastgoed Browaeys.
        </p>
      </section>

      {error && (
        <p className="text-sm p-3" style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {dossiers.length === 0 ? (
        <div className="p-10 text-center text-sm text-[var(--color-mute)] italic"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          U heeft nog geen dossiers. Contacteer ons gerust voor een eerste gesprek.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {dossiers.map((d) => (
            <Link
              key={d.id}
              href={`/portaal/dossiers/${d.id}`}
              className="block p-5 transition-all hover:shadow-sm"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
                    <Hash className="size-3" />
                    {d.ref ?? d.id.slice(0, 8)}
                    <span>·</span>
                    <span>{TYPE_LABEL[d.type] ?? d.type}</span>
                  </div>
                  <p className="mt-1.5 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {d.propertyAddress || 'Zoekopdracht'}
                  </p>
                  {d.propertyCity && (
                    <p className="text-xs text-[var(--color-mute)] mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3" />
                      {d.propertyCity}
                    </p>
                  )}
                </div>
                <span
                  className="inline-block px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium shrink-0"
                  style={{
                    background: d.status === 'onder_optie' ? 'rgba(201,140,79,0.18)' :
                               d.status === 'verkocht' || d.status === 'verhuurd' ? 'rgba(34,197,94,0.18)' :
                               'rgba(11,79,88,0.12)',
                    color: d.status === 'onder_optie' ? '#92400e' :
                           d.status === 'verkocht' || d.status === 'verhuurd' ? '#14532d' :
                           '#0b4f58',
                  }}
                >
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-3 border-t" style={{ borderColor: 'var(--color-line)' }}>
                <Stat label={d.type === 'verkoop' || d.type === 'verhuur' ? 'Vraagprijs' : 'Budget'}
                  value={d.askingPrice ? formatPrice(d.askingPrice) : '—'} />
                <Stat label="Geopend"
                  value={new Date(d.openedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })} />
                <Stat label="Status"
                  value={d.closedAt ? 'Afgesloten' : 'Lopend'} />
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-[var(--color-mute)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {d.appointmentsCount} afspraken
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" /> {d.sharedDocumentsCount} documenten
                  </span>
                </div>
                <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">{label}</p>
      <p className="mt-0.5 truncate">{value}</p>
    </div>
  )
}
