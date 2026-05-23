import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Veelgestelde vragen',
  description:
    'De vragen die we het vaakst krijgen over kopen, verkopen en huren in Vlaanderen — kort en helder beantwoord.',
}

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Hoeveel bedragen de registratierechten in Vlaanderen?',
    a: 'Sinds 2025: 2% voor de aankoop van uw enige gezinswoning, 1% bij grondige energierenovatie binnen 5 jaar, en 12% voor andere aankopen (tweede verblijf, opbrengsteigendom, bouwgrond).',
  },
  {
    q: 'Wat is het verschil tussen een compromis en de notariële akte?',
    a: 'Het compromis is de schriftelijke verkoopovereenkomst tussen verkoper en koper — beide partijen zijn bindbaar. De notariële akte wordt 3 tot 4 maanden later verleden bij de notaris en maakt de eigendomsoverdracht definitief en tegenstelbaar aan derden.',
  },
  {
    q: 'Moet ik een nieuw EPC laten maken als ik renoveer?',
    a: 'Het is niet wettelijk verplicht, maar wel sterk aanbevolen na grondige renovatie (isolatie, ramen, verwarming, zonnepanelen). Een beter label verhoogt de waarde en de verhuurbaarheid van uw woning, en kan u helpen om aan de renovatieverplichting te voldoen.',
  },
  {
    q: 'Wat is de renovatieverplichting?',
    a: 'Sinds 2023 moet u, indien u een woning koopt met EPC E of F, binnen 5 jaar minstens label D behalen. Vanaf 2028 wordt dit label C, vanaf 2035 label B. Niet naleven kan een geldboete tussen 500 en 200 000 euro opleveren.',
  },
  {
    q: 'Hoe lang is een EPC geldig?',
    a: 'Een EPC is 10 jaar geldig vanaf de datum van opmaak.',
  },
  {
    q: 'Wat is een asbestattest en wanneer is het verplicht?',
    a: 'Sinds 23 november 2022 is een asbestattest verplicht bij verkoop van elke woning gebouwd vóór 2001. Het attest geeft aan waar asbest aanwezig is in het pand, in welke vorm, en hoe risicovol. Het is 10 jaar geldig (of 5 jaar bij vastgestelde aanwezigheid).',
  },
  {
    q: 'Wat zijn typische notariskosten bij aankoop?',
    a: 'Reken bovenop de aankoopprijs op ± 13 à 15% extra: registratierechten (2–12%) + notarieel ereloon (volgens schaal) + aktekosten + eventuele hypotheekakte. Voor een aankoop van € 350.000 als enige gezinswoning komt dit op ± € 12.000 aan registratierechten + ± € 3.500 notariskosten.',
  },
  {
    q: 'Moet ik aanwezig zijn bij elk bezoek aan mijn te koop staande woning?',
    a: 'Nee. Wij begeleiden zelf alle bezichtigingen. U hoeft niet aanwezig te zijn — we filteren de serieuze interesses en koppelen u alleen terug bij concrete vragen of een bod.',
  },
  {
    q: 'Hoe lang duurt een verkoop gemiddeld?',
    a: 'Dat hangt af van het pand, de prijszetting en de markt. In de Vlaamse Ardennen ligt de gemiddelde verkoopduur op 60 à 100 dagen voor een correct geprijsd pand. Voor sommige eigendommen (uniek karakter of grote prijscategorie) kan dit oplopen.',
  },
  {
    q: 'Wat is een opschortende voorwaarde?',
    a: 'Een voorwaarde in het compromis die bepaalt dat de verkoop pas definitief is als die voorwaarde vervuld is. De meest voorkomende: financieringsvoorbehoud (krijgt de koper zijn lening niet, dan vervalt het compromis). Andere zijn bodemattest of vergunningen.',
  },
  {
    q: 'Mag ik mijn woning aan meerdere makelaars tegelijk geven?',
    a: 'Juridisch wel (bij niet-exclusieve opdracht), maar in de praktijk werkt dit zelden in uw voordeel: makelaars investeren minder in marketing wanneer ze geen exclusiviteit hebben, en kopers worden afgeschrikt door verschillende prijzen of presentaties van hetzelfde pand. Wij werken met exclusiviteit voor maximale resultaat.',
  },
  {
    q: 'Wat is een schatting waard?',
    a: 'Onze schatting is een onderbouwd prijsadvies, gebaseerd op recente lokale verkoopcijfers, het pand zelf (staat, kenmerken, EPC), en de marktomstandigheden. Het is geen officiële expertise (zoals een notaris zou opmaken voor erfeniskwesties), maar wel een realistisch beeld van wat u vandaag op de markt kunt verwachten.',
  },
  {
    q: 'Hoeveel huurwaarborg mag een verhuurder vragen?',
    a: 'In Vlaanderen sinds 1 januari 2019: maximaal 3 maanden huur. Vroeger was dit 2 maanden onder de federale regelgeving.',
  },
  {
    q: 'Kan ik een huurcontract vroegtijdig opzeggen?',
    a: 'Ja, als huurder kunt u altijd opzeggen met een opzegtermijn van 3 maanden. Indien u opzegt tijdens het eerste, tweede of derde jaar, betaalt u een opzegvergoeding van respectievelijk 3, 2 of 1 maand huur.',
  },
  {
    q: 'Wat is het voorkooprecht?',
    a: 'Een wettelijk recht waarbij bepaalde instanties (Vlaamse overheid, gemeente, sociale huisvestingsmaatschappij, Vlaamse Landmaatschappij) als eerste mogen kopen aan de overeengekomen prijs. De verkoper moet hen actief aanbieden vóór hij de verkoop met een derde finaliseert. Komt frequent voor in bepaalde zones.',
  },
  {
    q: 'Wat als de koper na het compromis afhaakt?',
    a: 'Het compromis is bindend. Indien een partij zonder geldige reden afhaakt (en geen opschortende voorwaarde aanroepbaar is), kan de andere partij de gedwongen uitvoering vorderen, ofwel ontbinding met schadevergoeding (vaak 10% van de prijs).',
  },
  {
    q: 'Moet ik btw betalen op de aankoop?',
    a: 'Op een bestaande woning niet (alleen registratierechten). Bij nieuwbouw onder bepaalde voorwaarden wel: 21% btw op het gebouw + 12% registratie op het grondaandeel. Recente regelingen bieden soms 6% btw voor afbraak en wederopbouw.',
  },
  {
    q: 'Wat houdt de meerwaardebelasting in?',
    a: 'Bij verkoop van uw enige gezinswoning is er geen meerwaardebelasting. Voor andere eigendommen (tweede verblijf, investeringsvastgoed) wordt de meerwaarde belast aan 16,5% indien de verkoop plaatsvindt binnen 5 jaar na aankoop.',
  },
  {
    q: 'Wat doet een vastgoedmakelaar concreet voor mij?',
    a: 'Schatting + onderbouwd prijsadvies, marketing en foto-presentatie, beheer van bezichtigingen, screening van kandidaat-kopers, onderhandeling, opmaak van het compromis, en begeleiding tot bij de notaris. Bij verhuur ook: opmaak huurcontract, plaatsbeschrijving, screening kandidaat-huurder, registratie van het contract.',
  },
  {
    q: 'Hoe wordt het ereloon van een makelaar berekend?',
    a: 'Meestal als een percentage van de uiteindelijke verkoopprijs — gangbare tarieven liggen tussen 2 en 4% (excl. btw). Bij Vastgoed Browaeys werken we met een transparant tarief dat we vooraf afspreken in een schriftelijke verkoopopdracht.',
  },
]

export default function FaqPage() {
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
          <p className="eyebrow mb-4">Info · FAQ</p>
          <h1 className="text-4xl md:text-6xl">
            Veelgestelde{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              vragen.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            De vragen die we het vaakst krijgen — kort, helder en zonder omhaal beantwoord.
            Staat uw vraag er niet bij? Bel of mail ons gerust.
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16">
          <div className="space-y-8">
            {FAQ.map((item, i) => (
              <article key={i} className="pb-8 border-b" style={{ borderColor: 'var(--color-line)' }}>
                <div className="flex gap-4">
                  <span
                    className="shrink-0 text-2xl leading-none italic"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-clay)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-xl md:text-2xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      {item.q}
                    </h2>
                    <p className="text-[var(--color-mute)] leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <h2 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Staat uw vraag er niet bij?
            </h2>
            <p className="text-[var(--color-mute)] mb-5">
              Bel ons gerust — meestal hebben we de zaak in vijf minuten besproken.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+3255595010" className="btn btn-solid">+32 (0)55 59 50 10</a>
              <Link href="/contact" className="btn btn-outline">Stuur een bericht</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
