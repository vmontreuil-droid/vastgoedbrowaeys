import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InfoPageFooter } from '@/components/info-page-footer'

export const metadata = {
  title: 'Vastgoed-woordenlijst',
  description:
    'A–Z van vastgoedtermen — KI, compromis, EPC, V-G-Vv-Gmo-Gvkr, opschortende voorwaarde, voorkooprecht en alle andere afkortingen helder uitgelegd.',
}

const TERMS: Array<{ term: string; body: string }> = [
  { term: 'Akte (notariële akte)', body: 'Het juridisch document dat de eigendomsoverdracht definitief maakt. Wordt verleden bij de notaris binnen 4 maanden na het compromis.' },
  { term: 'Asbest-attest', body: 'Verplicht document voor woningen vóór 2001 sinds november 2022. Beschrijft waar asbest aanwezig is in een gebouw.' },
  { term: 'Bezetting (te goeder trouw)', body: 'Toestand waarin iemand een onroerend goed gebruikt zonder eigenaar te zijn maar in eerlijk vertrouwen dat hij wel mag. Belangrijk in erfeniskwesties.' },
  { term: 'BIV', body: 'Beroepsinstituut van Vastgoedmakelaars — de officiële instantie die vastgoedmakelaars erkent en hun beroep regelt in België.' },
  { term: 'Bod', body: 'Een schriftelijke of mondelinge intentie om een pand te kopen aan een bepaalde prijs en eventuele voorwaarden. Een aanvaard bod bindt beide partijen.' },
  { term: 'Bodemattest', body: 'Verplicht document bij elke vastgoedoverdracht in Vlaanderen. Verklaart of er gekende bodemverontreiniging is. Aan te vragen bij OVAM.' },
  { term: 'Compromis (verkoopovereenkomst)', body: 'Schriftelijk verkoopcontract dat vooraf gaat aan de notariële akte. Bindt beide partijen. Vaak ondertekend bij de makelaar.' },
  { term: 'Concessie', body: 'Tijdelijk gebruiksrecht op een onroerend goed (vaak openbaar domein) tegen een vergoeding. Niet hetzelfde als eigendom of huur.' },
  { term: 'EPC', body: 'Energieprestatiecertificaat — verplicht document dat het energieverbruik van een woning aangeeft (kWh/m²·jaar) met een label van A+ tot F.' },
  { term: 'Erfdienstbaarheid', body: 'Een recht of last waarmee een perceel belast is ten voordele van een ander perceel — bv. een recht van doorgang.' },
  { term: 'G-score / P-score', body: 'Overstromingsgevoeligheid: G = gebouw, P = perceel. Schaal A (geen risico) tot D (groot risico). Verplicht in advertenties sinds 2023.' },
  { term: 'GVKR', body: 'Gewestelijke Verordening Kadastrale Registratie — opname in het kadastraal stedenbouwkundig register. Eén van de "5 letters" in stedenbouwkundige inlichtingen.' },
  { term: 'Gmo', body: 'Geen gerechtelijke maatregelen tot onteigening — verklaring dat er geen onteigeningsprocedure loopt voor het pand.' },
  { term: 'Handgeld (voorschot)', body: 'Een eerste betaling die de koper doet bij het tekenen van het compromis (meestal 5–10%). Wordt door de notaris bewaard tot de akte.' },
  { term: 'Hypotheek', body: 'Zakelijk zekerheidsrecht dat een bank krijgt op een onroerend goed om een lening te waarborgen. Wordt geregistreerd op de hypotheekbewaring.' },
  { term: 'Indicator (energie-indicator)', body: 'Numerieke EPC-waarde in kWh/m²·jaar — bepaalt het EPC-label van de woning.' },
  { term: 'KI (Kadastraal Inkomen)', body: 'Fictief jaarlijks netto-huurinkomen toegekend door het kadaster. Vormt de basis voor onroerende voorheffing en personenbelasting.' },
  { term: 'Mede-eigendom', body: 'Situatie waarbij meerdere personen samen eigenaar zijn van een goed. Geregeld door wet van 2010 (gemeenschappelijke delen, syndicus, algemene vergadering).' },
  { term: 'Mobiscore', body: 'Score van 0 tot 10 die de bereikbaarheid van voorzieningen (school, halte, winkel, dokter) meet via mobiscore.be. Verplicht in advertenties.' },
  { term: 'Notariskosten', body: 'Som van ereloon, registratierechten, btw en kleine kosten die de notaris int bij een aankoop. Reken op ± 13–15% extra bovenop de aankoopprijs.' },
  { term: 'Onroerende voorheffing', body: 'Jaarlijkse gewestelijke belasting op het Kadastraal Inkomen. Voor de eigenaar van het pand op 1 januari van het belastingjaar.' },
  { term: 'Opschortende voorwaarde', body: 'Een voorwaarde in het compromis waarvan het tot stand komen of niet de verkoop laat afhangen. Bv. "onder voorbehoud van het krijgen van financiering".' },
  { term: 'OVAM', body: 'Openbare Vlaamse Afvalstoffenmaatschappij — verstrekt het bodemattest en houdt toezicht op bodemverontreiniging.' },
  { term: 'Plaatsbeschrijving', body: 'Gedetailleerd verslag van de staat van het verhuurde pand bij intrede en uittrede. Wettelijk verplicht in Vlaanderen.' },
  { term: 'Postinterventiedossier', body: 'Verplicht dossier met info over uitgevoerde werken sinds 2001. Bevat plannen, foto\'s en documentatie. Wordt overgedragen aan koper.' },
  { term: 'Registratierechten', body: 'Belasting op aankoop van onroerend goed. In Vlaanderen 2% voor enige gezinswoning, 12% voor andere. Sinds 2025 ook 1%-tarief bij grondige energierenovatie.' },
  { term: 'RUP', body: 'Ruimtelijk Uitvoeringsplan — gedetailleerd plan dat bepaalt welke functie een gebied mag hebben (wonen, landbouw, industrie).' },
  { term: 'Stedenbouwkundige inlichtingen', body: 'Officieel document van de gemeente met de stedenbouwkundige status van een pand: bestemming, vergunningen, opname in inventaris, voorkooprecht.' },
  { term: 'Syndicus', body: 'Persoon of bedrijf dat de mede-eigendom beheert (administratie, financieel, technisch). Verplicht aan te stellen bij appartementsgebouwen.' },
  { term: 'Vg (Vergunning)', body: 'Geeft aan dat er een stedenbouwkundige vergunning is voor het bestaande gebouw. Eén van de "5 letters" in stedenbouwkundige inlichtingen.' },
  { term: 'Voorkooprecht', body: 'Recht waarbij bepaalde instanties (Vlaamse overheid, gemeente, sociale huisvestingsmaatschappij) als eerste mogen kopen aan de overeengekomen prijs.' },
  { term: 'Vv (Verkavelingsvergunning)', body: 'Geeft aan dat er een verkavelingsvergunning bestaat voor het perceel. Eén van de "5 letters" in stedenbouwkundige inlichtingen.' },
  { term: 'Wg (Woongebied)', body: 'Aanduiding dat het perceel in woongebied ligt volgens het gewestplan. Eén van de "5 letters" in stedenbouwkundige inlichtingen.' },
]

export default function WoordenlijstPage() {
  // Groepeer op eerste letter
  const grouped = TERMS.reduce<Record<string, typeof TERMS>>((acc, t) => {
    const letter = t.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(t)
    return acc
  }, {})
  const letters = Object.keys(grouped).sort()

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
          <p className="eyebrow mb-4">Info · Woordenlijst</p>
          <h1 className="text-4xl md:text-6xl">
            Vastgoed in{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              klare taal.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            Een A–Z van vastgoed-termen die u tegenkomt in advertenties, compromissen of bij
            de notaris. Helder uitgelegd, zonder vakjargon.
          </p>

          {/* Letter-index */}
          <div className="mt-10 flex flex-wrap gap-2">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="inline-grid place-items-center size-9 text-sm transition-colors"
                style={{
                  background: 'var(--color-paper-2)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-8 space-y-12">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <h2
                className="text-5xl mb-4 leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', fontStyle: 'italic' }}
              >
                {letter}
              </h2>
              <div className="space-y-5">
                {grouped[letter].map((t) => (
                  <div key={t.term}>
                    <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                      {t.term}
                    </h3>
                    <p className="mt-1 text-[var(--color-mute)] leading-relaxed">{t.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16">
          <InfoPageFooter pageKey="woordenlijst" />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
