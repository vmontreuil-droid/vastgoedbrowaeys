import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InfoPageFooter } from '@/components/info-page-footer'

export const metadata = {
  title: 'Uw woning verkopen',
  description:
    'Welke documenten en attesten moet u verzamelen vóór de verkoop? EPC, asbest, postinterventiedossier, bodemattest — alles op een rij.',
}

export default function VerkopenPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-3xl pt-12 md:pt-16 pb-8">
          <Link
            href="/info"
            className="inline-flex items-center gap-2 text-sm link-underline text-[var(--color-mute)] mb-8"
          >
            <ArrowLeft className="size-4" />
            Terug naar info-overzicht
          </Link>
          <p className="eyebrow mb-4">Info · Verkopen</p>
          <h1 className="text-4xl md:text-6xl">
            Uw woning{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              verkopen.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            Een verkoop staat of valt met een goede voorbereiding. Welke documenten moet u
            verzamelen, welke attesten zijn verplicht, en hoe verloopt het proces praktisch?
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16 space-y-14">

          {/* === Verplichte attesten === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Verplichte attesten — wat heeft u nodig?</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-5">
              Bij een verkoop in Vlaanderen moeten een aantal attesten op tafel liggen, soms
              al vanaf het moment dat u uw pand publiek te koop stelt:
            </p>
            <ul className="space-y-4 text-[var(--color-mute)]">
              <Doc
                title="EPC-certificaat"
                required="Bij publicatie van de advertentie"
                body="Het energieprestatiecertificaat is verplicht aanwezig vóór u uw pand online plaatst. Sinds 2023 moet ook het EPC-label in de advertentie staan. Geldigheid: 10 jaar. Zie onze uitgebreide EPC-pagina."
              />
              <Doc
                title="Asbestattest"
                required="Vanaf 23 november 2022 (woningen vóór 2001)"
                body="Verplicht voor elke overdracht van een woning gebouwd vóór 2001. Het attest beschrijft waar asbest zit, in welke vorm en hoe risicovol. Geldigheid: 10 jaar (5 jaar bij vastgestelde aanwezigheid)."
              />
              <Doc
                title="Bodemattest (OVAM)"
                required="Verplicht bij elke overdracht"
                body="Verklaart of er gekende bodemverontreiniging is op het perceel. Aan te vragen bij OVAM (Openbare Vlaamse Afvalstoffenmaatschappij). Kost ± 50 €."
              />
              <Doc
                title="Stedenbouwkundige inlichtingen"
                required="Op te vragen bij de gemeente"
                body="Bevat: bestemming volgens gewestplan/RUP, vergunningenhistoriek, opname in inventaris bouwkundig erfgoed, beschermingsstatus, voorkooprecht, eventuele bouwovertredingen. Verplicht te vermelden in compromis."
              />
              <Doc
                title="Postinterventiedossier"
                required="Verplicht voor werken sinds 2001"
                body="Bevat plannen, foto's en documentatie van uitgevoerde werken sinds 1 mei 2001. Wordt overgedragen aan de koper bij de akte."
              />
              <Doc
                title="Elektrische keuring"
                required="Bij installaties van vóór 1981"
                body="Verplicht bij verkoop. Een geldig conformiteitsattest of een keuring met opmerkingen. Bij niet-conformiteit krijgt de koper 18 maanden om in orde te brengen."
              />
              <Doc
                title="Mazouttank-attest"
                required="Indien een stookolietank aanwezig is"
                body="Periodieke keuring is verplicht (om 3 à 5 jaar afhankelijk van bovengronds/ondergronds en grootte)."
              />
              <Doc
                title="G-score & P-score (overstromingsgevoeligheid)"
                required="Sinds 2023 in advertenties"
                body="Geeft de overstromingsgevoeligheid weer van het perceel (P) en het gebouw (G), op een schaal van A (geen risico) tot D (groot risico). Op te vragen via waterinfo.be."
              />
              <Doc
                title="Mobiscore"
                required="Te vermelden in advertenties"
                body="Score van 0 tot 10 die de bereikbaarheid van voorzieningen (school, bushalte, winkel, dokter) meet via mobiscore.be."
              />
            </ul>
          </div>

          {/* === Kosten voor de verkoper === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Welke kosten zijn voor uw rekening?</h2>
            <ul className="space-y-2 text-[var(--color-mute)]">
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Makelaarsereloon (excl. btw)</span>
                <span className="text-[var(--color-ink)]">2 – 4% van de verkoopprijs</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Btw op makelaarsereloon</span>
                <span className="text-[var(--color-ink)]">21%</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>EPC-keuring</span>
                <span className="text-[var(--color-ink)]">± 200 – 350 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Asbestattest</span>
                <span className="text-[var(--color-ink)]">± 400 – 700 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Bodemattest (OVAM)</span>
                <span className="text-[var(--color-ink)]">± 50 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Stedenbouwkundige inlichtingen</span>
                <span className="text-[var(--color-ink)]">± 50 – 150 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Elektrische keuring</span>
                <span className="text-[var(--color-ink)]">± 150 – 250 €</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Eventueel: meerwaardebelasting bij verkoop binnen 5 jaar</span>
                <span className="text-[var(--color-ink)]">16,5%</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--color-mute)]">
              Bij verkoop van uw enige gezinswoning is er géén meerwaardebelasting. Voor tweede
              verblijven en investeringsvastgoed geldt wel een belasting van 16,5% op de
              meerwaarde, indien de verkoop binnen 5 jaar na aankoop plaatsvindt.
            </p>
          </div>

          {/* === Verkoopproces === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Hoe verloopt het verkoopproces?</h2>
            <ol className="space-y-5">
              <Step n="01" title="Schatting & prijsadvies" body="Een onderbouwde schatting op basis van actuele lokale verkoopcijfers." />
              <Step n="02" title="Verkoopopdracht & strategie" body="Mandaat, exclusiviteit of niet, en de marketingstrategie." />
              <Step n="03" title="Foto's & vermarkting" body="Sterke foto-presentatie, online publicatie via eigen kanalen + portaalsites." />
              <Step n="04" title="Bezichtigingen" body="Wij begeleiden zelf elk bezoek en filteren de serieuze interesses." />
              <Step n="05" title="Bod & onderhandeling" body="Discreet onderhandelen in uw belang, met respect voor beide partijen." />
              <Step n="06" title="Compromis" body="Schriftelijke vastlegging van het akkoord — vanaf nu zijn beide partijen gebonden." />
              <Step n="07" title="Akte bij notaris" body="Binnen 4 maanden — saldo wordt overgemaakt, eigendom wisselt." />
            </ol>
          </div>

          <InfoPageFooter pageKey="verkopen" />

          {/* === CTA === */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <h2 className="text-2xl md:text-3xl mb-4">Wilt u weten wat uw woning waard is?</h2>
            <p className="text-[var(--color-mute)] mb-6">
              Een schatting is gratis en vrijblijvend — u bent tot niets verplicht.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/gratis-schatting" className="btn btn-solid">Vraag een schatting<ArrowRight className="size-4" /></Link>
              <Link href="/contact" className="btn btn-outline">Persoonlijk gesprek</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function Doc({ title, required, body }: { title: string; required: string; body: string }) {
  return (
    <li>
      <div className="flex items-baseline gap-3 mb-1">
        <Check className="size-4 shrink-0" style={{ color: 'var(--color-accent)' }} />
        <strong className="text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</strong>
        <span className="text-[0.6rem] uppercase tracking-widest ml-auto" style={{ color: 'var(--color-clay-dark)' }}>{required}</span>
      </div>
      <p className="ml-7 leading-relaxed">{body}</p>
    </li>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-5">
      <span
        className="shrink-0 leading-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '2rem',
          color: 'var(--color-clay)',
        }}
      >
        {n}
      </span>
      <div>
        <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
        <p className="text-[var(--color-mute)] leading-relaxed text-sm">{body}</p>
      </div>
    </li>
  )
}
