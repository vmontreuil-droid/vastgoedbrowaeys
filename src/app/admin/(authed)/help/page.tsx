import Link from 'next/link'
import {
  HelpCircle, Users, FolderOpen, Home, Calendar, MessageSquare, Bell, Send,
  FileText, Calculator, Image as ImageIcon, Search, Settings, Mail, Eye,
  CheckSquare, Download, Lock,
} from 'lucide-react'

export const metadata = {
  title: 'Admin · Handleiding',
}

export default function HelpPage() {
  return (
    <div className="container-px mx-auto max-w-3xl py-8 md:py-12 prose-vb">
      <section className="mb-10">
        <p className="eyebrow mb-3">Admin · Handleiding</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <HelpCircle className="size-7" style={{ color: 'var(--color-accent)' }} />
          Welkom in je beheer
        </h1>
        <p className="mt-3 text-[var(--color-mute)]">
          Stap-voor-stap-uitleg per onderdeel. Lees enkel wat je nodig hebt — alles is
          al opgezet en kant-en-klaar.
        </p>
      </section>

      <Toc />

      <Step id="login" icon={<Lock className="size-4" />} title="1. Inloggen">
        <p>Ga naar <code>vastgoedbrowaeys.be/admin/login</code> en vul je e-mail + wachtwoord in.</p>
        <p>Wachtwoord vergeten? Klik &ldquo;Vergeten?&rdquo; — je krijgt een e-mail met een herstel-link.</p>
        <p>Je blijft ingelogd op dit toestel. Klik <strong>Afmelden</strong> linksonder als je op een gedeelde computer werkt.</p>
      </Step>

      <Step id="overzicht" icon={<Settings className="size-4" />} title="2. Het beheerderspaneel">
        <p>Eens ingelogd zie je links de menu-balk. Klik <strong>chevron-icoon onderaan</strong> om hem in te klappen tot icoontjes.</p>
        <p>Bovenaan de hoofdpagina (Overzicht) zie je de cijfers van vandaag — dossiers, klanten, panden, afspraken, berichten, opslag, commissies.</p>
      </Step>

      <Step id="klanten" icon={<Users className="size-4" />} title="3. Klanten">
        <p><strong>Toevoegen:</strong> Klik <em>+ Nieuwe klant</em> rechts boven de lijst.</p>
        <ul>
          <li>Vink <strong>&ldquo;Portaal-toegang&rdquo;</strong> aan als de klant moet kunnen inloggen op het klantenportaal (dossiers + documenten zien)</li>
          <li>Anders blijft het gewoon een contact-rij in jouw systeem (geen login)</li>
        </ul>
        <p><strong>Bewerken &amp; details:</strong> Klik op een naam → details, dossiers, afspraken, notities.</p>
        <p><strong>Uitschrijven uit nieuwsbrief:</strong> Klein 📬-icoon per rij — klik om uit/in te schrijven (klant kan dit ook zelf).</p>
        <p><strong>Export voor boekhouding:</strong> Knop &ldquo;Export CSV&rdquo; bovenaan geeft een Excel-bestand met alle GDPR-data, gefilterd op je huidige selectie.</p>
      </Step>

      <Step id="dossiers" icon={<FolderOpen className="size-4" />} title="4. Dossiers">
        <p>Een dossier is alles rond één transactie: verkoop, verhuur, of een zoekende klant.</p>
        <p><strong>Aanmaken:</strong> <em>+ Nieuw dossier</em>, kies type + status + koppel een klant.</p>
        <p><strong>Detail-pagina bevat:</strong></p>
        <ul>
          <li><strong>Stappen</strong> — vink af terwijl je vordert; balk toont % klaar. Klant ziet dit ook in zijn portaal.</li>
          <li><strong>Afspraken</strong> — knop <em>+ Afspraak</em> rechtsboven</li>
          <li><strong>Commissie</strong> (rechts) — kies type (% of vast), tarief, BTW-vlag</li>
          <li><strong>Documenten</strong> — drag-drop PDF/Word/foto's; klik 👁 om met klant te delen</li>
          <li><strong>Historiek</strong> — alle e-mails, notities, status-wijzigingen automatisch gelogd</li>
          <li><strong>Notities</strong> — vrije tekst onderaan, ook doorzoekbaar via Zoeken</li>
        </ul>
        <p><strong>Bulk-acties op lijst:</strong> Vink dossiers aan (checkbox links) → zwarte balk bovenaan biedt status massaal wijzigen of verwijderen.</p>
        <p><strong>Export commissies:</strong> Knop &ldquo;Export CSV&rdquo; geeft een Excel-bestand met alle commissie-berekeningen voor je boekhouding.</p>
      </Step>

      <Step id="aanbod" icon={<Home className="size-4" />} title="5. Aanbod (panden)">
        <p><strong>Pand toevoegen:</strong> <em>+ Pand toevoegen</em> → vul alle velden.</p>
        <p><strong>Foto's:</strong> sleep ze rechtstreeks in het foto-blok of klik om te selecteren. Maximaal 10 MB per foto. Klik op het ⭐-icoon om de cover-foto te kiezen, sleep om de volgorde te wijzigen.</p>
        <p><strong>Bewerken:</strong> klik op een pand-tegel of <em>Bewerken</em> → wijzigingen worden meteen opgeslagen.</p>
        <p><strong>Status:</strong> &ldquo;Concept&rdquo; = niet zichtbaar op publieke site, &ldquo;Te koop / Te huur&rdquo; = live, &ldquo;Onder optie&rdquo; / &ldquo;Verkocht&rdquo; = label op de site.</p>
        <p><strong>Auto-match:</strong> Wanneer je een nieuw pand aanmaakt zoekt het systeem automatisch klanten met passende zoekfiches. Je ziet ze in een <strong>Zoekfiche-matches</strong> blok op de pand-pagina, met &ldquo;Mail allen&rdquo;-knop.</p>
      </Step>

      <Step id="afspraken" icon={<Calendar className="size-4" />} title="6. Afspraken">
        <p>Gegroepeerd per dag. <em>+ Afspraak plannen</em> om er een toe te voegen.</p>
        <p><strong>iCal sync:</strong> Ga naar <Link href="/admin/instellingen" className="link-underline">Instellingen</Link> → klik &ldquo;Genereer feed-URL&rdquo; → abonneer in Google Calendar of op je iPhone. Al je afspraken verschijnen daar automatisch.</p>
      </Step>

      <Step id="berichten" icon={<MessageSquare className="size-4" />} title="7. Berichten (inbox)">
        <p>Alles wat klanten via de publieke formulieren versturen komt hier binnen:</p>
        <ul>
          <li><strong>Gratis schatting</strong> — type &ldquo;Schatting&rdquo;</li>
          <li><strong>Contactformulier</strong> — &ldquo;Vraag&rdquo; of &ldquo;Algemeen&rdquo;</li>
          <li><strong>&ldquo;Hou me op de hoogte&rdquo;</strong> — zoekfiche-inschrijving, &ldquo;Lead&rdquo;</li>
          <li><strong>&ldquo;Vraag info aan&rdquo; vanuit een pand</strong> — &ldquo;Bezichtiging&rdquo; gekoppeld aan dat pand</li>
        </ul>
        <p>Onbehandelde berichten staan in een rode badge in de sidebar. Klik door → antwoord per e-mail of bel direct.</p>
      </Step>

      <Step id="meldingen" icon={<Bell className="size-4" />} title="8. Meldingen">
        <p>Interne meldingen, vooral van auto-matches: wanneer een nieuw pand binnenkomt dat past bij een open zoekfiche, krijgt zowel jij hier als de klant in zijn portaal een melding.</p>
      </Step>

      <Step id="nieuwsbrief" icon={<Send className="size-4" />} title="9. Nieuwsbrief">
        <p>Bulk-mail naar een geselecteerde doelgroep.</p>
        <ol>
          <li>Kies status (Actief / Lead / Inactief) en type klant</li>
          <li>Optioneel: filter op stad</li>
          <li>Schrijf onderwerp + inhoud</li>
          <li>Klik &ldquo;Open e-mailclient&rdquo; — je standaard mail-app opent met alle adressen in BCC</li>
        </ol>
        <p>Boven de 50 adressen splitsen we automatisch in batches.</p>
        <p><strong>Uitschrijvers (GDPR):</strong> klanten die zich uitschreven worden automatisch overgeslagen. Je kan ze handmatig weer in/uit zetten via het 📬-icoon op de Klanten-lijst.</p>
      </Step>

      <Step id="zoeken" icon={<Search className="size-4" />} title="10. Zoeken">
        <p>Zoekt door <strong>alle</strong> vrije tekst in het systeem: dossier-notities, klant-notities, e-mails uit de historiek, commissie-notities.</p>
        <p>De gevonden tekst wordt geel gemarkeerd; klik door naar de bron.</p>
      </Step>

      <Step id="instellingen" icon={<Settings className="size-4" />} title="11. Instellingen — Team & iCal">
        <p><strong>Werknemer toevoegen:</strong> &ldquo;+ Werknemer toevoegen&rdquo;. Iedereen die hier staat kan inloggen op het beheerderspaneel.</p>
        <p><strong>Werknemer bewerken/deactiveren:</strong> oog-icoon op een kaart om te deactiveren (account blijft bestaan maar kan niet meer inloggen).</p>
        <p><strong>iCal feed:</strong> &ldquo;Genereer feed-URL&rdquo; geeft een persoonlijke URL die je in Google Calendar of iPhone-agenda kan abonneren. Alle afspraken verschijnen daar automatisch.</p>
      </Step>

      <Step id="opslag" icon={<ImageIcon className="size-4" />} title="12. Opslag & limieten">
        <p>Onderaan het Overzicht zie je:</p>
        <ul>
          <li>Aantal documenten + foto's + totale grootte</li>
          <li>Donut: documenten per type (compromis, EPC, ...)</li>
        </ul>
        <p>Supabase Pro-plan geeft 100 GB opslag — geen zorgen voorlopig.</p>
      </Step>

      <Step id="commissie-overzicht" icon={<Calculator className="size-4" />} title="13. Commissie-pijplijn">
        <p>Overzicht-pagina toont:</p>
        <ul>
          <li><strong>Lopend:</strong> commissies op dossiers in behandeling</li>
          <li><strong>Onder optie:</strong> bod aanvaard, wachten op compromis</li>
          <li><strong>Gerealiseerd:</strong> verkocht/verhuurd</li>
          <li><strong>Historiek</strong>: line-chart per maand (laatste 12)</li>
        </ul>
        <p>Bedragen zijn altijd excl. BTW (21%).</p>
      </Step>

      <Step id="contact" icon={<HelpCircle className="size-4" />} title="Hulp nodig?">
        <p>
          Mail <a href="mailto:vmontreuil@outlook.be" className="link-underline">Vincent</a> (studio-vm) als je iets niet vindt
          of als je een nieuwe feature wil.
        </p>
      </Step>
    </div>
  )
}

function Toc() {
  const entries: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'login',         label: 'Inloggen',          icon: <Lock className="size-3.5" /> },
    { id: 'overzicht',     label: 'Beheerderspaneel',  icon: <Settings className="size-3.5" /> },
    { id: 'klanten',       label: 'Klanten',           icon: <Users className="size-3.5" /> },
    { id: 'dossiers',      label: 'Dossiers',          icon: <FolderOpen className="size-3.5" /> },
    { id: 'aanbod',        label: 'Aanbod (panden)',   icon: <Home className="size-3.5" /> },
    { id: 'afspraken',     label: 'Afspraken',         icon: <Calendar className="size-3.5" /> },
    { id: 'berichten',     label: 'Berichten',         icon: <MessageSquare className="size-3.5" /> },
    { id: 'meldingen',     label: 'Meldingen',         icon: <Bell className="size-3.5" /> },
    { id: 'nieuwsbrief',   label: 'Nieuwsbrief',       icon: <Send className="size-3.5" /> },
    { id: 'zoeken',        label: 'Zoeken',            icon: <Search className="size-3.5" /> },
    { id: 'instellingen',  label: 'Team & iCal',       icon: <Settings className="size-3.5" /> },
    { id: 'opslag',        label: 'Opslag',            icon: <ImageIcon className="size-3.5" /> },
    { id: 'commissie-overzicht', label: 'Commissie',   icon: <Calculator className="size-3.5" /> },
    { id: 'contact',       label: 'Hulp',              icon: <HelpCircle className="size-3.5" /> },
  ]
  return (
    <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-10 p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      {entries.map((e) => (
        <a key={e.id} href={`#${e.id}`}
          className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] link-underline">
          <span style={{ color: 'var(--color-accent)' }}>{e.icon}</span>
          {e.label}
        </a>
      ))}
    </nav>
  )
}

function Step({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center justify-center size-8 shrink-0"
          style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}>
          {icon}
        </span>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
      </div>
      <div className="ml-11 text-sm space-y-3 text-[var(--color-ink)] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_p]:leading-relaxed [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-[var(--color-paper-2)] [&_code]:text-xs">
        {children}
      </div>
    </section>
  )
}
