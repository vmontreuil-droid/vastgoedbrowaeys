import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Gebruiksvoorwaarden',
  description: 'De gebruiksvoorwaarden van de website van Vastgoed Browaeys.',
}

export default function GebruiksvoorwaardenPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-3xl pt-16 md:pt-20 pb-16">
          <p className="eyebrow mb-4">Juridisch</p>
          <h1 className="text-4xl md:text-5xl mb-12">Gebruiksvoorwaarden</h1>

          <div className="space-y-10 text-[var(--color-mute)] leading-relaxed">
            <LegalSection title="1. Identiteit van de uitbater">
              <p>
                Deze website wordt uitgebaten door Vastgoed Browaeys, met maatschappelijke
                zetel te Dorpsstraat 93/00.1, 9667 Horebeke, ingeschreven onder BTW BE
                0809.068.684. Stefanie Browaeys is BIV-erkend
                vastgoedmakelaar-bemiddelaar onder erkenningsnummer 504.553.
              </p>
            </LegalSection>

            <LegalSection title="2. Toegang en gebruik">
              <p>
                De toegang tot en het gebruik van deze website is gratis en vrij. Door
                gebruik te maken van de website verklaart u zich akkoord met deze
                gebruiksvoorwaarden. Wij behouden ons het recht voor om deze voorwaarden
                te allen tijde te wijzigen.
              </p>
            </LegalSection>

            <LegalSection title="3. Intellectuele eigendom">
              <p>
                Alle inhoud van deze website — teksten, afbeeldingen, logo&apos;s,
                vormgeving — valt onder het intellectueel eigendomsrecht en is eigendom
                van Vastgoed Browaeys of haar partners. Reproductie of verspreiding,
                onder welke vorm ook, is enkel mogelijk na uitdrukkelijke en
                schriftelijke toestemming.
              </p>
            </LegalSection>

            <LegalSection title="4. Aansprakelijkheid">
              <p>
                De informatie op deze website (waaronder pandbeschrijvingen, plannen,
                EPC-waardes en prijzen) wordt met de grootste zorg samengesteld, maar is
                louter informatief van aard. Voor juridisch bindende informatie kan u
                steeds bij het kantoor terecht.
              </p>
              <p>
                Vastgoed Browaeys kan niet aansprakelijk worden gesteld voor schade die
                voortvloeit uit het gebruik van deze website, of uit beslissingen die
                worden genomen op basis van de informatie die hier wordt aangeboden.
              </p>
            </LegalSection>

            <LegalSection title="5. Externe links">
              <p>
                Deze website kan links bevatten naar websites van derden. Wij hebben geen
                controle over de inhoud van deze externe sites en kunnen daarvoor niet
                aansprakelijk worden gesteld.
              </p>
            </LegalSection>

            <LegalSection title="6. Toepasselijk recht">
              <p>
                Op deze gebruiksvoorwaarden is uitsluitend het Belgisch recht van
                toepassing. Eventuele geschillen worden voorgelegd aan de bevoegde
                rechtbank van het arrondissement Oudenaarde.
              </p>
            </LegalSection>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
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
