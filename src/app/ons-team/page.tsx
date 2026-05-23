import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, Mail } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Ons team',
  description: 'Maak kennis met het team van Vastgoed Browaeys — Stefanie Browaeys, BIV 504.553.',
}

const TEAM = [
  {
    name: 'Stefanie Browaeys',
    role: 'Zaakvoerder · Vastgoedmakelaar-bemiddelaar',
    biv: 'BIV 504.553',
    bio: 'Stefanie groeide op in de streek en startte Vastgoed Browaeys in 2008. Ze begeleidt elk dossier persoonlijk, van eerste schatting tot ondertekening — geen tussenpersonen, geen overhaaste deals.',
    photo: '/team/stefanie-browaeys.jpg',
    phone: '+32 (0)55 59 50 10',
    email: 'stefanie@vastgoedbrowaeys.be',
  },
]

export default function OnsTeamPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Ons team</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Mensen die hun{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              streek kennen.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            Bij Vastgoed Browaeys spreekt u nooit met een call-center. Ieder dossier valt
            onder persoonlijke begeleiding — door iemand die de Vlaamse Ardennen van
            binnen en buiten kent.
          </p>
        </section>

        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-16">
          <div className="space-y-24">
            {TEAM.map((member, i) => (
              <article
                key={member.name}
                className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-start ${
                  i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="lg:col-span-5">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-paper-2)]">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <p className="eyebrow mb-3" style={{ color: 'var(--color-clay-dark)' }}>
                    {member.biv}
                  </p>
                  <h2 className="text-3xl md:text-5xl">{member.name}</h2>
                  <p className="mt-3 text-lg" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    {member.role}
                  </p>
                  <p className="mt-8 text-lg leading-relaxed text-[var(--color-mute)]">
                    {member.bio}
                  </p>

                  <div className="mt-10 flex flex-wrap gap-6 text-sm">
                    <a href={`tel:${member.phone.replace(/\s|\(0\)|\+/g, '')}`} className="flex items-center gap-2 link-underline">
                      <Phone className="size-4" />
                      {member.phone}
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 link-underline">
                      <Mail className="size-4" />
                      {member.email}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="container-px mx-auto max-w-screen-2xl py-24 md:py-28"
          style={{ borderTop: '1px solid var(--color-line)' }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow mb-3">Persoonlijk contact</p>
            <h2 className="text-3xl md:text-4xl">
              Liever iemand spreken{' '}
              <span className="italic" style={{ color: 'var(--color-accent)' }}>vandaag nog</span>?
            </h2>
            <p className="mt-5 text-[var(--color-mute)] text-lg">
              Bel of mail rechtstreeks — vrijblijvend, zonder afspraken-tickets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-solid">
                Contacteer ons
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/gratis-schatting" className="btn btn-outline">
                Vraag een schatting
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
