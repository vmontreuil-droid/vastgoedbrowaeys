import Link from 'next/link'
import { ArrowRight, FolderOpen, BellRing, Calendar, FileText, Home } from 'lucide-react'
import { getListings, formatPrice } from '@/lib/listings'

export const metadata = {
  title: 'Mijn portaal',
}

export default function PortalDashboardPage() {
  // Demo-data — komt later uit Supabase, gekoppeld aan de ingelogde klant.
  const myListings = getListings({ status: ['te-koop'], limit: 2 })
  const upcoming = [
    {
      id: 'apt-1',
      title: 'Bezichtiging — woning Horebeke',
      date: '2026-05-26',
      time: '14u00',
      address: 'Sint-Maria-Horebeke',
    },
  ]
  const recentDocs = [
    { id: 'd1', name: 'Schattingsverslag — Sint-Maria-Horebeke.pdf', date: '2026-05-18', size: '1.2 MB' },
    { id: 'd2', name: 'Voorbeeld compromis.pdf', date: '2026-05-12', size: '320 KB' },
  ]

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      {/* === Welkom === */}
      <section className="mb-12">
        <p className="eyebrow mb-3">Klantenportaal</p>
        <h1 className="text-3xl md:text-5xl">
          Welkom terug,{' '}
          <span className="italic" style={{ color: 'var(--color-accent)' }}>
            Pieter.
          </span>
        </h1>
        <p className="mt-4 text-[var(--color-mute)] max-w-2xl">
          Hier vindt u uw lopende dossiers, afspraken, zoekcriteria en gedeelde documenten op één plek.
        </p>
      </section>

      {/* === Snelle stats === */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <StatCard icon={<FolderOpen className="size-5" />} label="Lopende dossiers" value="1" hint="Verkoopdossier" />
        <StatCard icon={<BellRing className="size-5" />} label="Zoekcriteria actief" value="1" hint="3 matches deze maand" />
        <StatCard icon={<Calendar className="size-5" />} label="Geplande afspraken" value="1" hint="Volgende: 26 mei" />
        <StatCard icon={<FileText className="size-5" />} label="Documenten" value="2" hint="Voor u beschikbaar" />
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        {/* === Lopend dossier === */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl">Uw lopend dossier</h2>
            <Link href="/portaal/dossiers" className="link-underline text-sm">Alle dossiers →</Link>
          </div>
          <div className="bg-[var(--color-paper)] p-6 md:p-8" style={{ border: '1px solid var(--color-line)' }}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow text-[0.6rem] mb-1.5" style={{ color: 'var(--color-clay-dark)' }}>
                  Verkoopdossier · Geopend op 12 mei 2026
                </p>
                <h3 className="text-xl md:text-2xl">Karakterwoning Sint-Maria-Horebeke</h3>
              </div>
              <span
                className="text-[0.6rem] uppercase tracking-[0.16em] px-2.5 py-1"
                style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
              >
                In behandeling
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 text-sm py-5 border-y" style={{ borderColor: 'var(--color-line)' }}>
              <DossierStat label="Vraagprijs" value={formatPrice(395000)} />
              <DossierStat label="Bezichtigingen" value="4" />
              <DossierStat label="Concrete biedingen" value="1" />
              <DossierStat label="Online sinds" value="22 apr 2026" />
            </div>

            <div className="mt-6">
              <p className="text-sm mb-3" style={{ color: 'var(--color-mute)' }}>
                Stappen
              </p>
              <ol className="space-y-2 text-sm">
                <DossierStep done label="Plaatsbezoek + schatting" date="12 mei" />
                <DossierStep done label="Verkoopopdracht ondertekend" date="14 mei" />
                <DossierStep done label="Foto-presentatie afgewerkt" date="18 mei" />
                <DossierStep done label="Online publicatie (eigen site + Immoweb)" date="22 mei" />
                <DossierStep label="Bod onderhandelen + acceptatie" />
                <DossierStep label="Compromis bij notaris" />
                <DossierStep label="Aktedatum" />
              </ol>
            </div>

            <Link
              href="/portaal/dossiers"
              className="mt-6 inline-flex items-center gap-2 text-sm link-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Volledig dossier openen
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* === Rechter kolom: afspraken + documenten === */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl mb-5">Volgende afspraak</h2>
            {upcoming.length > 0 ? (
              <div className="bg-[var(--color-paper)] p-6" style={{ border: '1px solid var(--color-line)' }}>
                <p className="eyebrow text-[0.6rem]" style={{ color: 'var(--color-accent)' }}>
                  {new Date(upcoming[0].date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="mt-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  {upcoming[0].title}
                </p>
                <p className="mt-1 text-sm text-[var(--color-mute)]">
                  Om {upcoming[0].time} · {upcoming[0].address}
                </p>
                <Link
                  href="/portaal/afspraken"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm link-underline"
                >
                  Bekijk in agenda →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">Geen afspraken gepland.</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl mb-5">Recente documenten</h2>
            <ul className="space-y-3">
              {recentDocs.map((d) => (
                <li key={d.id} className="bg-[var(--color-paper)] p-4 flex items-center gap-3" style={{ border: '1px solid var(--color-line)' }}>
                  <FileText className="size-5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{d.name}</p>
                    <p className="text-xs text-[var(--color-mute)]">
                      {new Date(d.date).toLocaleDateString('nl-BE')} · {d.size}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/portaal/documenten" className="mt-4 inline-flex items-center gap-1.5 text-sm link-underline">
              Alle documenten →
            </Link>
          </div>
        </div>
      </section>

      {/* === Aanbevolen panden (voor koper-zoekers) === */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl">Recent voor u uitgekozen</h2>
          <Link href="/portaal/zoekcriteria" className="link-underline text-sm">Zoekcriteria aanpassen →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {myListings.map((l) => (
            <Link
              key={l.id}
              href={`/aanbod/${l.id}`}
              className="block bg-[var(--color-paper)] p-5 hover:shadow-md transition-shadow"
              style={{ border: '1px solid var(--color-line)' }}
            >
              <p className="eyebrow text-[0.6rem] flex items-center gap-1.5">
                <Home className="size-3" />
                {l.zip} {l.city}
              </p>
              <h3 className="mt-2 text-lg">{l.title}</h3>
              <p className="mt-2 italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
                {formatPrice(l.price)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="bg-[var(--color-paper)] p-5" style={{ border: '1px solid var(--color-line)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[0.6rem]">{label}</span>
        <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      </div>
      <p className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-mute)]">{hint}</p>}
    </div>
  )
}

function DossierStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-[0.55rem]">{label}</p>
      <p className="mt-1.5">{value}</p>
    </div>
  )
}

function DossierStep({ label, date, done }: { label: string; date?: string; done?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1 size-4 rounded-full shrink-0 border-2 grid place-items-center"
        style={{
          background: done ? 'var(--color-accent)' : 'transparent',
          borderColor: done ? 'var(--color-accent)' : 'var(--color-line)',
        }}
      >
        {done && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      <span className={done ? '' : 'text-[var(--color-mute)]'}>
        {label}
        {date && <span className="ml-2 text-xs text-[var(--color-mute)]">— {date}</span>}
      </span>
    </li>
  )
}
