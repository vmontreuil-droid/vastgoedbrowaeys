import { ServicePage } from '@/components/service-page'

export const metadata = {
  title: 'Projectontwikkeling',
  description:
    'Begeleiding van nieuwbouw- en herontwikkelingsprojecten in de Vlaamse Ardennen — van conceptfase tot vermarkting van de units.',
}

export default function ProjectontwikkelingPage() {
  return (
    <ServicePage
      eyebrow="Diensten"
      title="Projectontwikkeling —"
      titleAccent="van eerste idee tot oplevering."
      intro="Voor bouwheren, particuliere ontwikkelaars en grondeigenaars die hun project commercieel willen begeleiden."
      bodyParagraphs={[
        'Een goed project staat of valt met de juiste begeleiding in elke fase. Vanaf de eerste haalbaarheidsstudie tot bij de vermarkting van de individuele units, helpen we u om uw project economisch én commercieel succesvol af te ronden.',
        'We werken samen met architecten, notarissen, syndicus-kantoren en aannemers die we al jaren kennen — geen tussenpersonen die u niet kent, wel een vast netwerk dat zijn afspraken nakomt.',
        'Of het nu gaat om een kleinschalige verkaveling, een meergezinswoning of een renovatie van een handelspand met bovenwoningen — we bekijken telkens welke aanpak het beste rendement én de beste eindgebruikers oplevert.',
      ]}
      steps={[
        { title: 'Haalbaarheidsstudie', body: 'Markt-analyse en commerciële inschatting van het potentieel.' },
        { title: 'Conceptbegeleiding', body: 'Advies bij plannen, types woningen, prijszetting en doelpubliek.' },
        { title: 'Voorverkoop op plan', body: 'Marketing en verkoop reeds tijdens de bouwfase — risico-spreiding.' },
        { title: 'Vermarkting individuele units', body: 'Foto-shoots, 3D-visualisaties indien nodig, advertenties op maat.' },
        { title: 'Aktedienst & oplevering', body: 'Coördinatie tot en met de aktes en oplevering van de individuele units.' },
      ]}
      ctaTitle="Een nieuw project op tafel?"
      ctaBody="Geef ons gerust een seintje voor een eerste vrijblijvend gesprek — discreet en zonder verbintenis."
      ctaPrimary={{ href: '/contact', label: 'Bespreek uw project' }}
    />
  )
}
