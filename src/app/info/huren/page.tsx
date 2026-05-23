import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InfoPageFooter } from '@/components/info-page-footer'

export const metadata = {
  title: 'Huren & verhuren',
  description:
    'Vlaams Woninghuurdecreet, huurwaarborg, opzegtermijnen, plaatsbeschrijving. Voor huurder en verhuurder helder uitgelegd.',
}

export default function HurenPage() {
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
          <p className="eyebrow mb-4">Info · Huren</p>
          <h1 className="text-4xl md:text-6xl">
            Huren &{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              verhuren.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            Sinds 1 januari 2019 geldt in Vlaanderen het Vlaams Woninghuurdecreet, dat de
            rechten en plichten van huurder en verhuurder regelt. Hier zetten we de
            belangrijkste regels op een rij.
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16 space-y-14">

          {/* Soorten contracten */}
          <Block title="Soorten huurcontracten">
            <ul className="space-y-3">
              <Item label="9-jarig hoofdverblijfplaats" body="De standaardduur. Stilzwijgend verlengd met 3 jaar wanneer geen opzeg gebeurt." />
              <Item label="Korte duur (max 3 jaar)" body="Eindigt automatisch op de afgesproken datum. Maximaal twee keer hernieuwbaar binnen 3 jaar totaal." />
              <Item label="Levenslange huur" body="Tot het overlijden van de huurder — zeldzaam maar wettelijk mogelijk." />
              <Item label="Studentenhuur" body="Specifiek statuut sinds 2019. Eénmalig hernieuwbaar. Korte opzegtermijnen mogelijk." />
              <Item label="Gemeubelde verhuur" body="Volgt dezelfde regels als ongemeubeld, met inventaris-bijlage als verplichte aanhechting." />
            </ul>
          </Block>

          {/* Huurwaarborg */}
          <Block title="Huurwaarborg">
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Sinds 1 januari 2019 mag de huurwaarborg maximaal <strong className="text-[var(--color-ink)]">3 maanden huur</strong> bedragen
              (was 2 maanden onder federale regelgeving). Mogelijke vormen:
            </p>
            <ul className="space-y-3 text-[var(--color-mute)] leading-relaxed">
              <li>1. <strong className="text-[var(--color-ink)]">Geblokkeerde bankrekening</strong> op naam van de huurder — de meest gangbare vorm.</li>
              <li>2. <strong className="text-[var(--color-ink)]">Bankwaarborg</strong> via een lening van de bank (terugbetaald in 3 jaar).</li>
              <li>3. <strong className="text-[var(--color-ink)]">Renteloze lening</strong> via het Vlaams Woningfonds voor wie financieel kwetsbaar is.</li>
            </ul>
            <p className="mt-4 text-[var(--color-mute)] text-sm">
              Bij de oplevering wordt de waarborg vrijgegeven na ondertekening van het uittredend
              plaatsbeschrijving door beide partijen.
            </p>
          </Block>

          {/* Plaatsbeschrijving */}
          <Block title="Plaatsbeschrijving">
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Een gedetailleerde plaatsbeschrijving bij intrede is <strong className="text-[var(--color-ink)]">verplicht</strong> in Vlaanderen.
              Wordt opgemaakt door beide partijen samen of door een onafhankelijke deskundige
              (kostprijs gedeeld). Zonder geldige plaatsbeschrijving wordt het pand geacht
              afgeleverd te zijn in dezelfde staat als bij teruggave — wat huurders bevoordeelt.
            </p>
            <p className="text-[var(--color-mute)] leading-relaxed">
              Bij uittrede wordt opnieuw een plaatsbeschrijving opgesteld om eventuele schade
              vast te leggen. Normale slijtage is voor de verhuurder, opzettelijke of zware
              schade voor de huurder.
            </p>
          </Block>

          {/* Opzegtermijnen */}
          <Block title="Opzegtermijnen — wat kan, wanneer?">
            <h3 className="text-lg mt-2 mb-3" style={{ fontFamily: 'var(--font-display)' }}>Door de huurder</h3>
            <p className="text-[var(--color-mute)] leading-relaxed mb-2">
              <strong className="text-[var(--color-ink)]">Altijd</strong> met opzegtermijn van 3 maanden, op gelijk welk moment in het contract.
              Indien opgezegd in het eerste, tweede of derde jaar: opzegvergoeding van resp. 3, 2 of 1 maand huur.
            </p>

            <h3 className="text-lg mt-6 mb-3" style={{ fontFamily: 'var(--font-display)' }}>Door de verhuurder</h3>
            <ul className="space-y-2 text-[var(--color-mute)] leading-relaxed">
              <li>– <strong className="text-[var(--color-ink)]">Persoonlijke betrekking:</strong> opzegtermijn 6 maanden, op elk moment, voor eigen gebruik of familie.</li>
              <li>– <strong className="text-[var(--color-ink)]">Grondige werken:</strong> opzegtermijn 6 maanden, enkel na de eerste of tweede driejarige periode.</li>
              <li>– <strong className="text-[var(--color-ink)]">Zonder motief:</strong> enkel op het einde van een driejarige periode, met opzegtermijn 6 maanden en vergoeding van 9 of 6 maanden huur.</li>
            </ul>
          </Block>

          {/* Huurprijsherziening */}
          <Block title="Huurprijs aanpassen tijdens het contract">
            <p className="text-[var(--color-mute)] leading-relaxed">
              De huurprijs mag jaarlijks geïndexeerd worden volgens de <strong className="text-[var(--color-ink)]">gezondheidsindex</strong> —
              maar enkel als het contract geregistreerd is. Sinds 2022 is voor woningen met EPC E
              of F de indexatie beperkt of geblokkeerd (zie EPC-pagina). Een echte huurprijs-
              herziening (boven indexatie) is enkel mogelijk om de 3 jaar, met instemming of via
              de vrederechter.
            </p>
          </Block>

          {/* Conformiteitsattest */}
          <Block title="Conformiteitsattest & woonkwaliteit">
            <p className="text-[var(--color-mute)] leading-relaxed">
              Een woning die verhuurd wordt, moet voldoen aan de Vlaamse woningkwaliteitsnormen
              (Vlaamse Wooncode). Sommige steden vereisen een conformiteitsattest vóór verhuur
              (bv. Gent, Antwerpen). Dit attest is 10 jaar geldig en wordt afgeleverd na een
              technisch onderzoek door de gemeente of een erkende keurder.
            </p>
          </Block>

          {/* Registratie */}
          <Block title="Registratie van het huurcontract">
            <p className="text-[var(--color-mute)] leading-relaxed">
              De <strong className="text-[var(--color-ink)]">verhuurder</strong> moet het huurcontract gratis laten registreren bij de FOD Financiën
              binnen <strong className="text-[var(--color-ink)]">2 maanden na ondertekening</strong>. Bij niet-registratie kan de huurder
              opzeggen zonder opzegtermijn en zonder vergoeding. Registratie kan online via
              MyMinFin of myrent.be.
            </p>
          </Block>

          <InfoPageFooter pageKey="huren" />

          {/* CTA */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <p className="text-[var(--color-mute)]">
              Voor een huurkwestie op maat:{' '}
              <Link href="/contact" className="link-underline text-[var(--color-ink)]">contacteer ons</Link>{' '}
              of bel direct op{' '}
              <a href="tel:+3255595010" className="link-underline text-[var(--color-ink)]">+32 (0)55 59 50 10</a>.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Item({ label, body }: { label: string; body: string }) {
  return (
    <li className="text-[var(--color-mute)] leading-relaxed">
      <strong className="text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{label}.</strong>{' '}
      {body}
    </li>
  )
}
