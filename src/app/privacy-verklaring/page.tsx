import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Privacy-verklaring',
  description: 'Hoe Vastgoed Browaeys uw persoonsgegevens verwerkt en beschermt.',
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-3xl pt-16 md:pt-20 pb-16">
          <p className="eyebrow mb-4">Juridisch</p>
          <h1 className="text-4xl md:text-5xl mb-12">Privacy-verklaring</h1>

          <div className="space-y-10 text-[var(--color-mute)] leading-relaxed">
            <PrivacySection title="1. Wie verwerkt uw gegevens?">
              <p>
                Verantwoordelijke voor de verwerking is Vastgoed Browaeys, Dorpsstraat
                93/00.1, 9667 Horebeke (BTW BE 0809.068.684). Voor alle vragen rond uw
                gegevens kan u terecht bij <a href="mailto:info@vastgoedbrowaeys.be" className="link-underline text-[var(--color-ink)]">info@vastgoedbrowaeys.be</a>.
              </p>
            </PrivacySection>

            <PrivacySection title="2. Welke gegevens verzamelen wij?">
              <p>Wij verzamelen enkel de gegevens die u zelf bezorgt via een formulier of telefoongesprek:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Voor- en familienaam</li>
                <li>Contactgegevens (e-mail, telefoon)</li>
                <li>Adres en eigendomsgegevens (in geval van een schatting of verkoopopdracht)</li>
                <li>Uw zoekcriteria (in geval van een inschrijving op &laquo;Houd me op de hoogte&raquo;)</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="3. Waarvoor gebruiken wij ze?">
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Beantwoorden van uw vragen of informatie-aanvragen</li>
                <li>Uitvoering van een vastgoedopdracht (verkoop, verhuur, schatting)</li>
                <li>Het bezorgen van pand-meldingen die aan uw criteria voldoen</li>
                <li>Wettelijke verplichtingen (BIV, anti-witwaswetgeving, fiscale plichten)</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="4. Hoelang bewaren wij ze?">
              <p>
                Persoonsgegevens worden bewaard zolang dit nodig is voor de uitvoering van
                de overeenkomst of zolang de wet ons verplicht (10 jaar voor
                vastgoeddossiers). U kan op elk moment vragen om uw gegevens te wissen,
                tenzij wettelijke bewaartermijnen dit beletten.
              </p>
            </PrivacySection>

            <PrivacySection title="5. Aan wie geven wij ze door?">
              <p>
                Uw gegevens worden nooit verkocht. Voor de uitvoering van uw dossier
                kunnen zij wel gedeeld worden met partners die noodzakelijk zijn:
                notarissen, vastgoeddeskundigen, eigenaars-verkopers, of overheidsdiensten
                indien wettelijk verplicht.
              </p>
            </PrivacySection>

            <PrivacySection title="6. Uw rechten">
              <p>U heeft te allen tijde recht op:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Inzage in de gegevens die wij over u bewaren</li>
                <li>Correctie van foutieve gegevens</li>
                <li>Wissing van uw gegevens (mits geen wettelijke bewaarverplichting)</li>
                <li>Beperking van de verwerking</li>
                <li>Bezwaar tegen de verwerking</li>
                <li>Klacht indienen bij de Gegevensbeschermingsautoriteit (gegevensbeschermingsautoriteit.be)</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="7. Cookies">
              <p>
                Deze website gebruikt enkel functionele cookies die noodzakelijk zijn voor
                de werking van de site. Wij plaatsen geen tracking- of advertentiecookies.
              </p>
            </PrivacySection>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-xl mb-4 text-[var(--color-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
