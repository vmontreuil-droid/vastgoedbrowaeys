import { ServicePage } from '@/components/service-page'

export const metadata = {
  title: 'Verkoop',
  description:
    'Persoonlijke begeleiding bij de verkoop van uw woning in de Vlaamse Ardennen — schatting, marketing, bezoeken, onderhandeling.',
}

export default function VerkoopPage() {
  return (
    <ServicePage
      eyebrow="Diensten"
      title="Verkoop —"
      titleAccent="met zorg, niet met haast."
      intro="Van eerste prijsadvies tot ondertekening van de akte: één aanspreekpunt dat uw dossier kent en uw belangen verdedigt."
      bodyParagraphs={[
        'De verkoop van een woning is voor de meeste mensen één van de grootste financiële beslissingen in hun leven. Wij vinden dat dit verdient om met de juiste tijd, ervaring en aandacht behandeld te worden — geen lopende-band-aanpak.',
        'Bij Vastgoed Browaeys begint elk verkoopdossier met een persoonlijk plaatsbezoek en een onderbouwde schatting. We zetten in op kwaliteitsvolle foto-presentatie, gerichte verspreiding via de relevante kanalen, en een doortastende opvolging van elke interesse.',
        'Tijdens de bezichtigingen begeleiden we de kandidaat-kopers zelf en filteren we de serieuze interesses. Bij een bod onderhandelen we in uw belang — discreet, eerlijk en met respect voor beide partijen. Tot bij de notaris blijven we beschikbaar.',
      ]}
      steps={[
        { title: 'Onderbouwde schatting', body: 'Realistisch prijsadvies gebaseerd op actuele lokale verkoopcijfers, niet op online algoritmes.' },
        { title: 'Sterke presentatie', body: 'Professionele foto’s, duidelijke plannen en een verzorgd verkoopdossier.' },
        { title: 'Gerichte vermarkting', body: 'Verspreiding via Immoweb, Zimmo, Realo en onze eigen kanalen — afhankelijk van het type pand.' },
        { title: 'Persoonlijke opvolging', body: 'Elke interesse, elke bezichtiging en elke onderhandeling loopt via Stefanie zelf.' },
        { title: 'Tot bij de notaris', body: 'Begeleiding tot en met de ondertekening van de notariële akte.' },
      ]}
      ctaTitle="Wat is uw woning vandaag waard?"
      ctaBody="Een gratis en vrijblijvende schatting is altijd de eerste stap. U bent tot niets verplicht."
      ctaPrimary={{ href: '/gratis-schatting', label: 'Vraag een schatting' }}
      ctaSecondary={{ href: '/contact', label: 'Liever even bellen' }}
    />
  )
}
