import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InfoPageFooter } from '@/components/info-page-footer'

export const metadata = {
  title: 'Een woning kopen',
  description:
    'Stap-voor-stap gids: van financiering tot ondertekening. Registratierechten, notariskosten, verplichte attesten — alles wat u als koper moet weten in Vlaanderen.',
}

export default function KopenPage() {
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
          <p className="eyebrow mb-4">Info · Kopen</p>
          <h1 className="text-4xl md:text-6xl">
            Een woning{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              kopen.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-mute)]">
            Het kopen van een woning is voor de meeste mensen één van de grootste financiële
            beslissingen in hun leven. Hieronder zetten we het hele proces helder uiteen —
            van eerste bezoek tot ondertekening van de notariële akte.
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl pb-16 space-y-14">

          {/* === De 5 stappen === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">De vijf stappen, in een notendop</h2>
            <ol className="space-y-5">
              <Step
                n="01"
                title="Voorbereiding & financiering"
                body="Bepaal uw budget en vraag een principekrediet bij uw bank. Reken op een eigen inbreng van minstens 10–20% (notariskosten + reserve). Een principeakkoord is geen verplichting maar versterkt uw positie bij een bod."
              />
              <Step
                n="02"
                title="Zoeken & bezichtigen"
                body="Schrijf u in voor pand-meldingen via onze website, of bel ons met uw criteria. Een eerste bezichtiging geeft een gevoel — een tweede bezoek (vaak op een ander moment van de dag) onthult details."
              />
              <Step
                n="03"
                title="Een bod uitbrengen"
                body="Een bod kan onder opschortende voorwaarden gebeuren (bv. financiering, bodemattest). Eenmaal het bod en de tegenpartij overeenkomen, is er een mondeling akkoord — daarna volgt het schriftelijk compromis."
              />
              <Step
                n="04"
                title="Compromis (verkoopovereenkomst)"
                body="Bij ondertekening wordt 5 à 10% van de prijs op de derdenrekening van de notaris of de makelaar gestort. Vanaf nu zijn beide partijen gebonden. Tussen compromis en akte zit normaal 3 tot 4 maanden."
              />
              <Step
                n="05"
                title="Akte bij de notaris"
                body="De notariële akte wordt verleden binnen 4 maanden na het compromis. U betaalt het saldo van de prijs, de registratierechten en de notariskosten. Vanaf de aktedatum bent u juridisch eigenaar."
              />
            </ol>
          </div>

          {/* === Documenten die u ontvangt === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Documenten die de verkoper u moet bezorgen</h2>
            <ul className="space-y-3 text-[var(--color-mute)] leading-relaxed">
              {[
                ['EPC-certificaat', 'Het energieprestatiecertificaat — verplicht bij elke verkoop. Geldig 10 jaar.'],
                ['Asbestattest', 'Verplicht voor woningen vóór 2001 sinds 23 november 2022. Geeft aan waar asbest aanwezig is.'],
                ['Postinterventiedossier', 'Verplicht sinds 2001 voor werken vanaf die datum. Bevat info over de uitgevoerde werken.'],
                ['Stedenbouwkundige inlichtingen', 'Vergunningenhistoriek, bestemming, opname in inventaris bouwkundig erfgoed, voorkooprecht.'],
                ['Bodemattest', 'Verplicht bij elke overdracht in Vlaanderen — verklaart of er bodemverontreiniging gekend is.'],
                ['Elektrische keuring', 'Verplicht bij verkoop van elke wooneenheid met een elektrische installatie van vóór 1981.'],
                ['Mazouttank-attest', 'Indien aanwezig — bewijs van conformiteit van de stookolietank.'],
                ['G-score & P-score (overstromingsgevoeligheid)', 'Verplicht te vermelden in de verkoopdocumenten sinds 2023.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <Check className="size-4 mt-1 shrink-0" style={{ color: 'var(--color-accent)' }} />
                  <div>
                    <strong className="text-[var(--color-ink)]">{title}.</strong> {body}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* === Registratierechten === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Registratierechten — de belasting op de aankoop</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-5">
              In Vlaanderen betaalt u registratierechten op de aankoopprijs. Het tarief hangt af
              van het type woning en de bestemming. Sinds 1 januari 2025 gelden onderstaande tarieven:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                    <th className="text-left py-3 px-2 eyebrow text-[0.6rem]">Situatie</th>
                    <th className="text-right py-3 px-2 eyebrow text-[0.6rem]">Tarief</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-ink)]">
                  <Row label="Enige eigen woning (gezinswoning)" value="2%" />
                  <Row label="Enige gezinswoning met grondige energierenovatie binnen 5 jaar" value="1%" />
                  <Row label="Andere woning (tweede verblijf, opbrengsteigendom)" value="12%" />
                  <Row label="Bouwgrond (zonder gezinswoning erop)" value="12%" />
                  <Row label="Nieuwbouw met btw (geen registratie op woning)" value="21% btw + 12% op grond" />
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-[var(--color-mute)]">
              Bij grondige energierenovatie binnen vijf jaar kan het tarief op de enige gezinswoning
              dalen tot 1%. Voor erfpacht, ruil of schenking gelden afwijkende regels.
            </p>
          </div>

          {/* === Notariskosten === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Notariskosten</h2>
            <p className="text-[var(--color-mute)] leading-relaxed mb-5">
              De notariskosten omvatten het ereloon van de notaris (wettelijk vastgelegd, dalend met
              prijsschijven), de aktekosten, het hypothecair onderzoek, en kleinere taksen. Reken
              gemiddeld:
            </p>
            <ul className="space-y-2 text-[var(--color-mute)]">
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Voor een aankoop tot € 250.000</span>
                <span className="text-[var(--color-ink)]">± 2 200 – 3 000 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Voor een aankoop tussen € 250.000 en € 500.000</span>
                <span className="text-[var(--color-ink)]">± 3 200 – 4 800 €</span>
              </li>
              <li className="flex justify-between border-b py-2" style={{ borderColor: 'var(--color-line)' }}>
                <span>Voor een aankoop boven € 500.000</span>
                <span className="text-[var(--color-ink)]">± 5 000 € en meer</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Hypothecaire akte (indien lening)</span>
                <span className="text-[var(--color-ink)]">± 2 000 – 3 500 €</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--color-mute)]">
              Indicatieve bedragen — gebruik de online notariële berekenkalkulator voor uw exacte
              dossier (notaris.be).
            </p>
          </div>

          {/* === Tips === */}
          <div>
            <h2 className="text-2xl md:text-3xl mb-6">Onze belangrijkste tips</h2>
            <ul className="space-y-4 text-[var(--color-mute)] leading-relaxed">
              <Tip text="Reken naast de aankoopprijs op +13 à 15% kosten (registratie + notaris + hypotheekakte)." />
              <Tip text="Bezoek elk pand minstens twee keer — eens overdag, eens 's avonds of bij regen." />
              <Tip text="Een opschortende voorwaarde voor financiering beschermt u: krijgt u uw lening niet, dan vervalt het compromis zonder schadevergoeding." />
              <Tip text="Vraag altijd het volledige EPC-verslag op — niet enkel het label. De aanbevelingen geven u zicht op renovatiekosten." />
              <Tip text="Reken bij een woning met EPC E of F op een renovatieverplichting binnen 5 jaar (zie ook onze EPC-pagina)." />
            </ul>
          </div>

          <InfoPageFooter pageKey="kopen" />

          {/* === CTA === */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <h2 className="text-2xl md:text-3xl mb-4">Klaar om te zoeken?</h2>
            <p className="text-[var(--color-mute)] mb-6">
              Schrijf u in voor onze pand-meldingen of bel ons om uw zoekprofiel persoonlijk te bespreken.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/te-koop" className="btn btn-solid">Bekijk het aanbod<ArrowRight className="size-4" /></Link>
              <Link href="/hou-me-op-de-hoogte" className="btn btn-outline">Schrijf u in</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
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
          fontSize: '2.5rem',
          color: 'var(--color-clay)',
        }}
      >
        {n}
      </span>
      <div>
        <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
        <p className="text-[var(--color-mute)] leading-relaxed">{body}</p>
      </div>
    </li>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
      <td className="py-3 px-2 text-[var(--color-mute)]">{label}</td>
      <td className="py-3 px-2 text-right font-medium">{value}</td>
    </tr>
  )
}

function Tip({ text }: { text: string }) {
  return (
    <li className="flex gap-3">
      <Check className="size-4 mt-1 shrink-0" style={{ color: 'var(--color-accent)' }} />
      <span>{text}</span>
    </li>
  )
}
