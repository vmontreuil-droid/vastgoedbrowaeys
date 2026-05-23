import { ServicePage } from '@/components/service-page'

export const metadata = {
  title: 'Verhuur',
  description:
    'Verhuurbemiddeling in de Vlaamse Ardennen — kandidaten zorgvuldig gescreend, contracten waterdicht.',
}

export default function VerhuurPage() {
  return (
    <ServicePage
      eyebrow="Diensten"
      title="Verhuur —"
      titleAccent="evenwicht tussen eigenaar en huurder."
      intro="Geen jachtige verhuringen, geen losse formulieren. We kiezen voor stabiele huurders en duidelijke afspraken."
      bodyParagraphs={[
        'Goede huurders vinden vraagt méér dan een advertentie online plaatsen. Het vraagt een grondige screening, een goed beoordelingsvermogen, en een eerlijke voorstelling van het pand aan beide kanten.',
        'Bij Vastgoed Browaeys begeleiden we elke fase van de verhuring: van marktconform huurprijs-advies, over de bezichtigingen en kandidaten-screening, tot het opstellen van een waterdichte huurovereenkomst en de plaatsbeschrijving.',
        'We werken met geregistreerde contracten, correcte huurwaarborgen en duidelijke afspraken rond onderhoud. Voor verhuurders die het volledige beheer wensen uit handen te geven, voorzien we ook een volledige beheersformule op maat.',
      ]}
      steps={[
        { title: 'Marktconforme huurprijs', body: 'Realistisch advies op basis van vergelijkbare panden in de regio.' },
        { title: 'Bezichtigingen door ons', body: 'We doen zelf de rondleidingen — u hoeft niet aanwezig te zijn.' },
        { title: 'Grondige screening', body: 'Solvabiliteit, achtergrond en motivatie van kandidaten worden zorgvuldig nagekeken.' },
        { title: 'Waterdicht contract', body: 'Geregistreerde huurovereenkomst, plaatsbeschrijving en correcte huurwaarborg.' },
        { title: 'Optioneel volledig beheer', body: 'Wij nemen de relatie met de huurder voor u op — facturatie, herstellingen, opvolging.' },
      ]}
      ctaTitle="Pand te verhuren?"
      ctaBody="Vraag een vrijblijvend gesprek aan — we bekijken samen het juiste plan voor uw eigendom."
      ctaPrimary={{ href: '/contact', label: 'Maak een afspraak' }}
      ctaSecondary={{ href: '/gratis-schatting', label: 'Vraag huurprijs-advies' }}
    />
  )
}
