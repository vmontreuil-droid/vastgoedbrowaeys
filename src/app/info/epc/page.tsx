import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InfoPageFooter } from '@/components/info-page-footer'

export const metadata = {
  title: 'EPC uitgelegd',
  description:
    'Energieprestatiecertificaat: wat is het, hoe wordt het berekend, geldigheid, renovatieverplichting bij EPC E/F, sancties bij ontbreken.',
}

const LABELS = [
  { label: 'A+', range: '≤ 0',           color: '#00a651', text: '#ffffff', note: 'Energieneutraal' },
  { label: 'A',  range: '0 – 100',       color: '#00a651', text: '#ffffff', note: 'Zeer energiezuinig' },
  { label: 'B',  range: '101 – 200',     color: '#7fb801', text: '#ffffff', note: 'Energiezuinig' },
  { label: 'C',  range: '201 – 300',     color: '#f1bd00', text: '#1a1a1a', note: 'Gemiddeld' },
  { label: 'D',  range: '301 – 400',     color: '#f08c00', text: '#ffffff', note: 'Eerder verbruikend' },
  { label: 'E',  range: '401 – 500',     color: '#e3450c', text: '#ffffff', note: 'Renovatieplicht (5 jaar)' },
  { label: 'F',  range: '> 500',         color: '#c8102e', text: '#ffffff', note: 'Renovatieplicht (5 jaar)' },
]

export default function EpcPage() {
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
          <p className="eyebrow mb-4">Info · EPC</p>
          <h1 className="text-4xl md:text-6xl">
            EPC{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              uitgelegd.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            Het Energieprestatiecertificaat is een verplicht document bij elke verkoop en
            verhuur in Vlaanderen. Hier leest u wat het betekent, hoe het wordt berekend, en
            wat de gevolgen zijn van een ongunstig label.
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16 space-y-14">

          {/* === Wat is EPC === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">Wat is een EPC?</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Het EPC (Energieprestatiecertificaat) drukt het energieverbruik van een woning uit
              in <strong className="text-[var(--color-ink)]">kilowattuur per vierkante meter per jaar</strong> (kWh/m²·jaar). Hoe lager,
              hoe energiezuiniger.
            </p>
            <p className="text-[var(--color-mute)] leading-relaxed">
              Op basis van die score krijgt de woning een label van A+ (zeer zuinig) tot F (zeer
              verbruikend). Het certificaat wordt opgemaakt door een door het Vlaams Energie- en
              Klimaatagentschap (VEKA) erkend energiedeskundige type A.
            </p>
          </div>

          {/* === Label-tabel === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">De labels in één oogopslag</h2>
            <div className="space-y-2">
              {LABELS.map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-4 p-3"
                  style={{ background: 'var(--color-paper-2)' }}
                >
                  <span
                    className="grid place-items-center size-12 shrink-0 font-bold"
                    style={{ background: l.color, color: l.text, fontFamily: 'var(--font-display)' }}
                  >
                    {l.label}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{l.range} <span className="text-[var(--color-mute)]">kWh/m²·jaar</span></p>
                    <p className="text-xs" style={{ color: 'var(--color-mute)' }}>{l.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === Verplichtingen === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">Wanneer is EPC verplicht?</h2>
            <ul className="space-y-3 text-[var(--color-mute)] leading-relaxed">
              <li>
                <strong className="text-[var(--color-ink)]">Bij verkoop:</strong> verplicht vanaf het moment dat het pand publiek
                te koop wordt aangeboden. Het label moet ook in de advertentie vermeld worden.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Bij verhuur:</strong> verplicht bij elke nieuwe huurovereenkomst.
                Het EPC moet aan de huurder bezorgd worden bij ondertekening.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Bij nieuwbouw of grondige renovatie:</strong> een nieuw EPC wordt afgeleverd
                na de werken op basis van de uitgevoerde isolatie en installaties.
              </li>
            </ul>
          </div>

          {/* === Geldigheid === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">Hoe lang geldig?</h2>
            <p className="text-[var(--color-mute)] leading-relaxed">
              Een EPC is <strong className="text-[var(--color-ink)]">10 jaar</strong> geldig. Indien u in tussentijd grondige
              renovatiewerken uitvoert (isolatie, ramen, warmtepomp, zonnepanelen), is een nieuw
              EPC sterk aanbevolen: het kan u een veel beter label opleveren en is een investering
              die zichzelf terugverdient bij verkoop of verhuur.
            </p>
          </div>

          {/* === Renovatieplicht === */}
          <div
            className="p-6 md:p-8"
            style={{ background: 'var(--color-sand)' }}
          >
            <p className="eyebrow mb-3" style={{ color: 'var(--color-clay-dark)' }}>Belangrijk om te weten</p>
            <h2 className="text-2xl md:text-3xl mb-5">Renovatieverplichting sinds 2023</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Sinds 1 januari 2023 geldt voor wie een woning koopt met EPC label
              <strong className="text-[var(--color-ink)]"> E of F</strong> een <strong className="text-[var(--color-ink)]">renovatieverplichting binnen 5 jaar</strong>:
              de woning moet binnen die periode minstens label D behalen.
            </p>
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Vanaf 2028 wordt deze verplichting strenger: het minimumlabel wordt C. Vanaf 2035
              wordt het label B verplicht. Wie de termijn niet haalt, riskeert een administratieve
              geldboete tussen 500 € en 200 000 €.
            </p>
            <p className="text-[var(--color-mute)] leading-relaxed">
              Houd hier rekening mee bij uw aankoop: een lage aankoopprijs voor een label-F woning
              kan snel gerelativeerd worden door de verplichte investeringen.
            </p>
          </div>

          {/* === Huurprijs-blokkering === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">Gevolgen voor verhuur bij slecht EPC</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-4">
              Sinds 2022 is de <strong className="text-[var(--color-ink)]">indexatie van de huurprijs beperkt of geblokkeerd</strong>{' '}
              voor woningen met een slecht EPC-label:
            </p>
            <ul className="space-y-2 text-[var(--color-mute)] leading-relaxed">
              <li>– Label F: indexatie volledig geblokkeerd.</li>
              <li>– Label E: indexatie beperkt tot 50% van de normale indexatie.</li>
              <li>– Label D: indexatie beperkt tot 75%.</li>
              <li>– Label C of beter: volledige indexatie mogelijk.</li>
            </ul>
            <p className="mt-4 text-[var(--color-mute)] leading-relaxed text-sm">
              Renoveren tot een beter label geeft u dus niet alleen een waardestijging, maar ook
              de mogelijkheid om uw huur correct mee te laten evolueren met de levensduurte.
            </p>
          </div>

          {/* === Sancties === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-5">Wat als er geen EPC is?</h2>
            <p className="text-[var(--color-mute)] leading-relaxed">
              Wie zonder geldig EPC verkoopt of verhuurt, riskeert een administratieve
              geldboete van <strong className="text-[var(--color-ink)]">500 € tot 5 000 €</strong> per ontbrekend certificaat.
              Bovendien kan de koper of huurder een schadevergoeding eisen.
            </p>
          </div>

          <InfoPageFooter pageKey="epc" />

          {/* === CTA === */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <p className="text-[var(--color-mute)]">
              Hulp nodig met uw EPC-aanvraag of renovatie-advies?{' '}
              <Link href="/contact" className="link-underline text-[var(--color-ink)]">Contacteer ons</Link>{' '}
              — wij verwijzen u graag door naar erkende deskundigen.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
