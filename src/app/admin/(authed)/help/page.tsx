import Link from 'next/link'
import {
  HelpCircle, Users, FolderOpen, Home, Calendar, MessageSquare, Bell, Send,
  Calculator, Image as ImageIcon, Search, Settings, Lock,
  UserCog, Tag, Zap, Sparkles, LayoutDashboard, Stethoscope, AlertTriangle,
  Target, CalendarOff, Radar,
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
        <p>
          <strong>Wachtwoord vergeten?</strong> Klik &ldquo;Vergeten?&rdquo; — je krijgt een
          e-mail met een herstel-link. Werkt voor alle werknemers.
        </p>
        <p>
          Je blijft ingelogd op dit toestel zolang je niet expliciet uitlogt. Klik
          <strong> Afmelden</strong> linksonder als je op een gedeelde computer werkt.
        </p>
        <Tip>
          Bij eerste login: je krijgt een tijdelijk wachtwoord van Stefanie. Wijzig
          het via Bewerken op je eigen team-kaart in <Link href="/admin/team" className="link-underline">/admin/team</Link>.
        </Tip>
      </Step>

      <Step id="overzicht" icon={<LayoutDashboard className="size-4" />} title="2. Overzicht-dashboard">
        <p>De hoofdpagina (klik op het logo of <em>Overzicht</em>) toont in één blik de stand van zaken:</p>
        <ul>
          <li><strong>Statistiek-tegels</strong> bovenaan — klanten, dossiers, panden, afspraken deze week, onbeantwoorde berichten.</li>
          <li><strong>Snelle acties</strong> — vier knoppen om direct iets nieuws toe te voegen.</li>
          <li><strong>Trends-grafiek</strong> — leads + bezichtigingen per week, laatste 8 weken.</li>
          <li><strong>Dossiers per maand</strong> — geopende dossiers per type (verkoop/verhuur/zoeker).</li>
          <li><strong>Commissie-historiek</strong> — line-chart van gerealiseerde commissies per maand (12 maanden).</li>
          <li><strong>Team-belasting</strong> — bar chart per werknemer: lopende + afgesloten dossiers. Waarschuwing bij 15+ lopende dossiers per persoon.</li>
          <li><strong>Eerstvolgende afspraken</strong> — komende 7 dagen.</li>
          <li><strong>Opslag</strong> — onderaan: aantal documenten + foto&apos;s + totale grootte (Pro-plan: 100 GB beschikbaar).</li>
        </ul>
        <p>Links in de sidebar staan badges met onbehandelde dingen:</p>
        <ul>
          <li><strong>Berichten (rood):</strong> ongelezen leads/contactaanvragen.</li>
          <li><strong>Meldingen (rood):</strong> ongelezen interne meldingen (bv. zoekfiche-match).</li>
          <li><strong>Klanten / Dossiers / Aanbod / Afspraken</strong> — totale aantallen (informatief, niet urgent).</li>
        </ul>
        <Tip>
          Sidebar te breed? Klik onderaan de chevron om te collapsen tot icoontjes. Hover
          op een icoon = tooltip met de naam. Voorkeur wordt opgeslagen in deze browser.
        </Tip>
      </Step>

      <Step id="klanten" icon={<Users className="size-4" />} title="3. Klanten">
        <p>Hier beheer je alle contacten: kopers, verkopers, huurders, eigenaars, leads.</p>

        <h4>Toevoegen</h4>
        <p>Klik <em>+ Nieuwe klant</em> rechtsboven en vul de gegevens in. Belangrijke optie:</p>
        <ul>
          <li>
            <strong>Portaal-toegang</strong> aanvinken = klant kan inloggen op{' '}
            <code>vastgoedbrowaeys.be/portail</code> en daar zijn dossiers, documenten en
            afspraken zien. Hij krijgt automatisch een uitnodigings-e-mail.
          </li>
          <li>
            Niet aanvinken = enkel een contact-rij in jouw systeem (geen login). Handig voor
            leads of historische contacten.
          </li>
        </ul>

        <h4>Klant-detailpagina</h4>
        <p>Klik op een naam in de lijst:</p>
        <ul>
          <li><strong>Contactgegevens</strong> bovenaan — bewerken met knop &ldquo;Bewerken&rdquo;.</li>
          <li><strong>Nieuwsbrief-status</strong> — vink uit/in (klant kan dit ook zelf via een link onderaan e-mails).</li>
          <li><strong>Dossiers van deze klant</strong> — direct doorklikken.</li>
          <li><strong>Activity feed</strong> — chronologische lijst van álles wat met deze klant gebeurde: notities, e-mails, status-wijzigingen, documenten geüpload.</li>
          <li><strong>Uitnodig-knop</strong> — als de klant nog geen portaal-account heeft, klik om een uitnodigings-e-mail (magic-link) te sturen.</li>
        </ul>

        <h4>Filters &amp; export</h4>
        <ul>
          <li><strong>Filterpillen</strong> bovenaan: Status (Actief / Lead / Inactief) en Type klant.</li>
          <li><strong>Zoekveld</strong>: filtert direct op naam + e-mail.</li>
          <li><strong>Export CSV</strong>: download alle gefilterde klanten in Excel-compatibel formaat (handig voor boekhouding of jaarrapport).</li>
        </ul>

        <Tip>
          Klein 📬-icoon naast elke klant = nieuwsbrief-status. Klik om in/uit te schakelen
          zonder de detail-pagina te openen.
        </Tip>
      </Step>

      <Step id="dossiers" icon={<FolderOpen className="size-4" />} title="4. Dossiers">
        <p>Een dossier is alles rond één transactie: verkoop, verhuur, of een zoekende klant.</p>

        <h4>Aanmaken</h4>
        <p><em>+ Nieuw dossier</em>:</p>
        <ul>
          <li>Kies type: <strong>Verkoop / Verhuur / Koop-zoeker / Huur-zoeker</strong>.</li>
          <li>Koppel een klant (verplicht).</li>
          <li>Voor verkoop/verhuur: voeg het pand-adres en vraagprijs toe.</li>
          <li>Voor zoekers: laat adres leeg, vul wel budget in.</li>
        </ul>

        <h4>Detail-pagina: aside (rechts)</h4>
        <ul>
          <li><strong>Klant-kaart</strong> — link naar de klant.</li>
          <li><strong>Cijfers</strong> — vraagprijs/budget, geopend, afgesloten, aantal afspraken/documenten.</li>
          <li><strong>Toegewezen aan</strong> — dropdown om een werknemer als eigenaar te kiezen. Knop <em>Toewijzen aan mij</em> als nog niemand gekozen, of <em>Overname → jij</em> om van een collega over te pakken bij afwezigheid. Iedereen kan toewijzen (geen Zaakvoerder-recht nodig).</li>
          <li><strong>Commissie</strong> — kies type (% op vraagprijs / vast bedrag / geen), tarief, BTW-vlag, notities. Berekening verschijnt automatisch.</li>
          <li><strong>Tags / labels</strong> — vrije etiketten (urgent, vip, opvolgen, wacht-op-klant, …). Type + Enter om toe te voegen. Suggesties als je nog niets hebt. Maximaal 20 tags per dossier, kleine letters + kebab-case.</li>
        </ul>

        <h4>Detail-pagina: hoofdkolom</h4>
        <ul>
          <li><strong>Stappen</strong> — checklist per dossier-type (bv. voor verkoop: Plaatsbezoek → Verkoopopdracht ondertekend → Foto-presentatie → Online publicatie → Bod onderhandelen → Compromis → Aktedatum). Vink af terwijl je vordert; balk toont % klaar. Klant ziet dit ook in zijn portaal.</li>
          <li><strong>Afspraken</strong> — knop <em>+ Afspraak</em> bovenaan; klik op een afspraak voor detail/bewerken.</li>
          <li><strong>Documenten</strong> — drag-drop PDF/Word/foto&apos;s; kies categorie (compromis, EPC, schatting, asbest, ...). Klik 👁 om met klant te delen (verschijnt in zijn portaal).</li>
          <li><strong>Historiek</strong> — chronologische lijst: e-mails, notities, status-wijzigingen, documenten. Klik <em>Meer</em> om lange tekst open te klappen.</li>
          <li><strong>Notitie toevoegen</strong> — vrij tekstvak bovenaan de historiek. Klik <strong>Sjablonen</strong> om snel terugkerende teksten in te voegen.</li>
        </ul>

        <h4>E-mail vanuit dossier</h4>
        <p>Bovenaan de detail-pagina: <em>E-mail klant</em>-knop. Opent een geprefabriceerde mail in je standaard mail-client met onderwerp = dossier-referentie + adres.</p>

        <h4>Bulk-acties op lijst</h4>
        <p>Op <Link href="/admin/dossiers" className="link-underline">/admin/dossiers</Link>:</p>
        <ul>
          <li>Vink dossiers aan (checkbox links op elke kaart).</li>
          <li>Zwarte balk bovenaan biedt: <strong>Status massaal wijzigen</strong> (In behandeling / Onder optie / Verkocht / Verhuurd / Geannuleerd), <strong>Toewijzen aan…</strong> (kies werknemer of niemand), <strong>Verwijderen</strong> (permanent).</li>
        </ul>

        <h4>Filters</h4>
        <ul>
          <li><strong>Status:</strong> Lopend (default) / Alle / per status.</li>
          <li><strong>Type:</strong> Verkoop / Verhuur / Koper / Huurder.</li>
          <li><strong>Eigenaar:</strong> Mijn / Niet toegewezen / per werknemer.</li>
          <li><strong>Tag:</strong> filter op label (verschijnt automatisch als er tags bestaan).</li>
        </ul>

        <h4>Export</h4>
        <p>Knop &ldquo;Export CSV&rdquo; geeft een Excel-bestand met alle commissie-berekeningen voor je boekhouding, gefilterd op je huidige selectie.</p>
      </Step>

      <Step id="aanbod" icon={<Home className="size-4" />} title="5. Aanbod (panden)">
        <p>Hier beheer je alle panden die op de publieke site verschijnen.</p>

        <h4>Pand toevoegen</h4>
        <p><em>+ Pand toevoegen</em> → vul:</p>
        <ul>
          <li><strong>Adres, type, prijs, oppervlakte, kamers</strong> — basisgegevens.</li>
          <li><strong>Status:</strong> Concept (niet zichtbaar publiek) / Te koop / Te huur / Onder optie / Verkocht.</li>
          <li><strong>Beschrijving</strong> — lange tekst, ondersteunt regeleinden.</li>
          <li><strong>EPC, kadastraal inkomen, bouwjaar, EPC-waarde</strong> — technische gegevens.</li>
        </ul>

        <h4>Foto&apos;s</h4>
        <p>In het foto-blok:</p>
        <ul>
          <li>Sleep foto&apos;s rechtstreeks of klik om te selecteren.</li>
          <li>Max 10 MB per foto. JPG, PNG of WebP.</li>
          <li>Klik op het ⭐-icoon om een foto als cover (eerste/hero-foto) te kiezen.</li>
          <li>Sleep om de volgorde te wijzigen — dit is ook de volgorde in de galerij op de publieke site.</li>
        </ul>

        <h4>Zoekfiche-matches</h4>
        <p>
          Wanneer je een nieuw pand aanmaakt of de prijs wijzigt, zoekt het systeem
          automatisch klanten met passende zoekfiches (op stad, prijsklasse, type, kamers).
          Matches verschijnen in een blok op de pand-pagina met <em>Mail allen</em>-knop
          om hen meteen op de hoogte te brengen.
        </p>

        <Tip>
          De publieke site toont enkel panden met status <em>Te koop / Te huur / Onder
          optie / Verkocht</em>. Zet op <em>Concept</em> zolang je niet klaar bent.
        </Tip>
      </Step>

      <Step id="afspraken" icon={<Calendar className="size-4" />} title="6. Afspraken">
        <p>Alle afspraken gegroepeerd per dag. Statussen: Gepland / Bevestigd / Voltooid / Geannuleerd.</p>

        <h4>Toevoegen</h4>
        <p><em>+ Afspraak plannen</em> bovenaan of vanuit een dossier (knop <em>+ Afspraak</em>).</p>
        <ul>
          <li>Koppel altijd aan een dossier (verplicht).</li>
          <li>Vul titel, datum/tijd, duur, locatie.</li>
          <li>Optionele notities.</li>
        </ul>

        <h4>iCal feed</h4>
        <p>
          Ga naar <Link href="/admin/instellingen" className="link-underline">/admin/instellingen</Link>
          {' → '}<em>Genereer feed-URL</em>. Kopieer de URL en abonneer in Google Calendar of op je iPhone:
        </p>
        <ul>
          <li><strong>Google Calendar:</strong> Andere agenda&apos;s → + → Via URL → plak de URL.</li>
          <li><strong>iPhone:</strong> Instellingen → Agenda → Accounts → Nieuwe account → Anders → CalDav of Geabonneerde agenda → plak URL.</li>
        </ul>
        <p>De feed wordt automatisch elke ~15 min ververst. Token regenereren kan je via dezelfde Instellingen-pagina (oude URL wordt dan ongeldig).</p>
      </Step>

      <Step id="berichten" icon={<MessageSquare className="size-4" />} title="7. Berichten (inbox)">
        <p>Alles wat via de publieke formulieren binnenkomt:</p>
        <ul>
          <li><strong>Gratis schatting</strong> — type &ldquo;Schatting&rdquo;</li>
          <li><strong>Contactformulier</strong> — &ldquo;Vraag&rdquo; of &ldquo;Algemeen&rdquo;</li>
          <li><strong>&ldquo;Hou me op de hoogte&rdquo;</strong> — zoekfiche-inschrijving, type &ldquo;Lead&rdquo;</li>
          <li><strong>&ldquo;Vraag info aan&rdquo; vanuit een pand</strong> — type &ldquo;Bezichtiging&rdquo;, gekoppeld aan dat pand</li>
        </ul>
        <p>
          Onbehandelde berichten staan in een rode badge in de sidebar. Klik door → antwoord
          per e-mail (knop opent je mail-client) of bel direct. Markeer als gelezen om uit
          de rode badge te halen.
        </p>
      </Step>

      <Step id="meldingen" icon={<Bell className="size-4" />} title="8. Meldingen">
        <p>
          Interne meldingen, vooral van auto-matches: wanneer een nieuw pand binnenkomt dat
          past bij een open zoekfiche, krijgt zowel jij hier als de klant in zijn portaal
          een melding.
        </p>
        <p>Vink een melding aan als &ldquo;gelezen&rdquo; om uit de rode badge te verwijderen.</p>
      </Step>

      <Step id="nieuwsbrief" icon={<Send className="size-4" />} title="9. Nieuwsbrief">
        <p>Bulk-mail naar een geselecteerde doelgroep.</p>
        <ol>
          <li>Kies status (Actief / Lead / Inactief) en type klant.</li>
          <li>Optioneel: filter op stad.</li>
          <li>Schrijf onderwerp + inhoud (HTML of platte tekst).</li>
          <li>Klik <em>Open e-mailclient</em> — je standaard mail-app opent met alle adressen in BCC en de tekst voorgevuld.</li>
        </ol>
        <p>Boven de 50 adressen splitsen we automatisch in batches om te voorkomen dat je e-mailprovider de mail blokkeert.</p>

        <h4>Uitschrijvers (GDPR)</h4>
        <p>
          Klanten die zich uitschreven via de link onderaan een e-mail worden automatisch
          overgeslagen. Onderaan elke nieuwsbrief-mail staat automatisch een
          uitschrijf-link. Je kan een klant ook manueel uit/in zetten via het 📬-icoon op
          de Klanten-lijst.
        </p>
      </Step>

      <Step id="marktmonitor" icon={<Radar className="size-4" />} title="9b. Marktmonitor (acquisitie)">
        <p>
          Houd panden in je streek bij die je interessant vindt voor toekomstige acquisitie of
          marktinzicht. Open <Link href="/admin/marktmonitor" className="link-underline">/admin/marktmonitor</Link>.
        </p>

        <h4>Pand toevoegen</h4>
        <ol>
          <li>Open Immoweb / Zimmo / Realo / Hebbes / Logic-Immo / Immoscoop in een ander tabblad.</li>
          <li>Kopieer de URL van het zoekertje.</li>
          <li>Plak in het &ldquo;URL toevoegen&rdquo;-vak en klik <em>Toevoegen</em>.</li>
          <li>Het systeem leest publieke meta-data (titel, foto, prijs, adres) en voegt de lead toe.</li>
        </ol>

        <h4>Statussen</h4>
        <ul>
          <li><strong>Prospect</strong> — net toegevoegd, nog geen actie.</li>
          <li><strong>Benaderd</strong> — brief/mail/telefoon verstuurd. Datum wordt automatisch geregistreerd.</li>
          <li><strong>Afspraak gepland</strong> — eigenaar reageerde positief.</li>
          <li><strong>Klant geworden</strong> — gewonnen!</li>
          <li><strong>Niet geïnteresseerd</strong> — afgesloten zonder resultaat.</li>
          <li><strong>Reeds verkocht</strong> — pand intussen verkocht (vaak door anderen).</li>
        </ul>

        <h4>Brief-generator</h4>
        <p>Op de detail-pagina van een lead:</p>
        <ul>
          <li>Kies een template (kennismaking, schatting aanbieden, sneller verkopen, mandaat-overstap).</li>
          <li>Onderwerp + tekst worden automatisch gevuld met de pand-gegevens en jouw contactinfo.</li>
          <li>Drie acties: <em>Kopieer</em> naar klembord, <em>Open in mail-app</em> (mailto:), of <em>Print als brief</em> (A4 PDF via browser).</li>
        </ul>

        <h4>Filters</h4>
        <ul>
          <li>Status (open default = prospect / benaderd / afspraak).</li>
          <li>Type (verkoop / verhuur).</li>
          <li>Gemeente (top 8 op aantal leads).</li>
        </ul>

        <h4>Particulier vs makelaar</h4>
        <p>
          Het systeem detecteert automatisch of een pand door een particulier wordt aangeboden of
          door een makelaar (op basis van trefwoorden + JSON-LD). Particuliere leads krijgen een
          groene &ldquo;Particulier&rdquo;-badge.
        </p>

        <Tip>
          <strong>BIV-deontologie:</strong> Stefanie krijgt een waarschuwing op de detail-pagina
          als ze een brief wil opstellen voor een pand van een collega-makelaar. Art. 18 van de
          plichtenleer verbiedt het ronselen van klanten van andere BIV-makelaars. Gebruik de
          brief-templates dus vooral voor particuliere verkopers, of pas de tekst zelf aan tot
          een algemene marktbenadering. Beslissing en verantwoordelijkheid blijven bij jou.
        </Tip>

        <h4>Beperkingen (fase 1)</h4>
        <p>
          Op dit moment moet je URLs zelf plakken. In fase 2 kunnen we (tegen betaalde scraper-API)
          een nachtelijke automatische import opzetten voor een geselecteerde regio. Vraag dat
          gerust als de tool nuttig blijkt.
        </p>
      </Step>

      <Step id="zoeken" icon={<Search className="size-4" />} title="10. Zoeken">
        <p>Volledige full-text-zoekfunctie door <strong>alle</strong> vrije tekst in het systeem:</p>
        <ul>
          <li>Dossier-notities</li>
          <li>Klant-notities</li>
          <li>E-mails en notities uit de historiek</li>
          <li>Commissie-notities</li>
        </ul>
        <p>Typ minstens 2 letters. De gevonden tekst wordt geel gemarkeerd; klik door naar de bron.</p>
        <Tip>Hoofdletter-ongevoelig en partieel — &ldquo;notar&rdquo; vindt &ldquo;notaris&rdquo;.</Tip>
      </Step>

      <Step id="team" icon={<UserCog className="size-4" />} title="11. Team & werknemers">
        <p>
          Iedereen die hier staat kan inloggen op het beheerderspaneel. Beheer gebeurt
          centraal op <Link href="/admin/team" className="link-underline">/admin/team</Link>.
        </p>

        <h4>Vier rollen</h4>
        <ul>
          <li><strong>Zaakvoerder</strong> (teal + kroontje) — eigenaar van het bedrijf. Volledige rechten: team beheren, rollen wijzigen, werknemers toevoegen/verwijderen/deactiveren.</li>
          <li><strong>Webbeheerder</strong> (grijs + sleutel) — de developer/IT. Zelfde rechten als Zaakvoerder voor systeembeheer.</li>
          <li><strong>Makelaar</strong> (klei + BIV-icoon) — vastgoedmakelaar-bemiddelaar. Mag alle dagdagelijkse handelingen doen behalve team-beheer.</li>
          <li><strong>Assistent</strong> (groen + persoon) — administratief medewerker. Mag alles behalve werknemers beheren (mag dus wel commissies wijzigen, dossiers wissen, bulk-acties uitvoeren).</li>
        </ul>

        <h4>Rol wijzigen (alleen Zaakvoerder of Webbeheerder)</h4>
        <p>
          Op /admin/team: klik op de rol-badge bovenaan een werknemer-kaart. Een dropdown
          met de 4 opties verschijnt. Klik om direct te wijzigen. Je kan niet je eigen rol
          wijzigen (om lockout te voorkomen). De laatste Zaakvoerder kan ook niet
          gedowngrade worden tenzij iemand anders eerst Zaakvoerder is gemaakt.
        </p>

        <h4>Werknemer toevoegen</h4>
        <p>
          Onderaan /admin/team (alleen voor Zaakvoerder/Webbeheerder): formulier met
          voornaam, familienaam, e-mail, titel, telefoon, BIV-nummer (optioneel) en een
          initieel wachtwoord. Klik <em>Werknemer aanmaken</em>; de werknemer kan direct
          inloggen.
        </p>

        <h4>Werknemer bewerken / deactiveren / verwijderen</h4>
        <ul>
          <li><strong>Bewerken</strong> — eigen profiel altijd, anderen alleen door Zaakvoerder/Webbeheerder. Knop op de kaart, opent formulier.</li>
          <li><strong>Deactiveren</strong> (Zaakvoerder/Webbeheerder): account blijft bestaan maar kan niet meer inloggen. Handig bij ontslag of langdurige afwezigheid.</li>
          <li><strong>Verwijderen</strong>: permanent. Bevestigingsdialoog. Toegewezen dossiers worden automatisch op &ldquo;Niemand&rdquo; gezet.</li>
        </ul>

        <h4>Foto&apos;s</h4>
        <p>
          Hover over de portretfoto op een werknemer-kaart → <em>Upload</em> of <em>Vervang</em>-knop
          verschijnt. Kies een JPG/PNG/WebP (max 5 MB). De foto wordt direct opgeslagen en
          verschijnt overal in het systeem.
        </p>

        <h4>Werknemer-detailpagina</h4>
        <p>
          Klik op &ldquo;X lopend&rdquo; of &ldquo;Y afgesloten&rdquo; onderaan een werknemer-kaart om naar
          <Link href="/admin/team" className="link-underline"> hun detail-pagina </Link>
          te gaan. Daar zie je:
        </p>
        <ul>
          <li>Grote foto + rol-badge.</li>
          <li>Stats: lopende/afgesloten dossiers, komende afspraken, gerealiseerde commissie YTD.</li>
          <li>Lijst van hun actieve dossiers met status-badges en directe link.</li>
          <li>Komende afspraken op hun dossiers.</li>
        </ul>
      </Step>

      <Step id="targets" icon={<Target className="size-4" />} title="11b. Jaardoelen (targets)">
        <p>
          Stefanie (of de Webbeheerder) kan per werknemer een jaardoel zetten — bv. 24 dossiers per
          jaar. Op de werknemer-detailpagina (klik op &ldquo;X lopend&rdquo; vanaf /admin/team) staat
          bovenaan een &ldquo;Jaardoel&rdquo;-kaart:
        </p>
        <ul>
          <li>Klik <em>Stel in</em> of <em>Wijzig</em> om het doel te bepalen (0–1000).</li>
          <li>De kaart toont voortgang: <code>X / Y</code> + progressbar.</li>
          <li>Kleurcode: groen = op schema (gewogen voor maand), oranje = achter.</li>
          <li>Berekening gebaseerd op aantal &ldquo;verkocht&rdquo;/&ldquo;verhuurd&rdquo; dossiers in het lopende kalenderjaar.</li>
        </ul>
        <Tip>
          Leeg laten = doel uitschakelen. Alleen Zaakvoerder/Webbeheerder kan doelen
          instellen of wijzigen.
        </Tip>
      </Step>

      <Step id="afwezigheid" icon={<CalendarOff className="size-4" />} title="11c. Afwezigheidsplanning">
        <p>
          Werknemers kunnen een afwezigheidsperiode plannen (vakantie, ziekte, opleiding). Op de
          werknemer-detailpagina, onder &ldquo;Afwezigheid&rdquo;:
        </p>
        <ul>
          <li>Vul startdatum + einddatum + optionele reden in.</li>
          <li><strong>Iedereen mag zijn eigen afwezigheid instellen.</strong> Zaakvoerder/Webbeheerder kan dit ook voor anderen doen.</li>
          <li>Tijdens de periode verschijnt een oranje <strong>Afwezig</strong>-badge bovenaan de werknemer-kaart op /admin/team.</li>
          <li>De afwezige werknemer wordt in dropdowns (bv. dossier-toewijzing) gemarkeerd als &ldquo;(afwezig)&rdquo;.</li>
          <li>Bij toewijzing van een dossier aan een afwezig persoon: oranje waarschuwing met suggestie om aan iemand anders toe te wijzen.</li>
        </ul>
        <Tip>
          Klik <em>Wis</em> om een geplande afwezigheid weg te halen voor de einddatum. Handig
          bij vroegtijdige terugkeer.
        </Tip>
      </Step>

      <Step id="dossier-toewijzen" icon={<UserCog className="size-4" />} title="12. Dossiers toewijzen & overdragen">
        <p>Elk dossier kan worden toegewezen aan een werknemer (eigenaar). Iedereen kan toewijzen — geen Zaakvoerder-recht nodig.</p>

        <h4>Per dossier (vanuit dossier-detail)</h4>
        <ul>
          <li>In de rechter aside: <em>Toegewezen aan</em>-dropdown. Kies een werknemer of &ldquo;Niemand&rdquo;.</li>
          <li>Snelknop <em>Toewijzen aan mij</em> als nog niemand gekozen.</li>
          <li>Snelknop <em>Overname → jij</em> om van een collega over te pakken bij afwezigheid.</li>
        </ul>

        <h4>Bulk-toewijzen (vanuit /admin/dossiers)</h4>
        <ol>
          <li>Vink meerdere dossiers aan (checkbox).</li>
          <li>Zwarte balk bovenaan → <em>Toewijzen ⌄</em>-knop.</li>
          <li>Kies werknemer of &ldquo;Niemand&rdquo;.</li>
        </ol>

        <h4>Filteren op eigenaar</h4>
        <p>Op /admin/dossiers, in de filterrij &ldquo;Eigenaar&rdquo;:</p>
        <ul>
          <li><strong>Mijn</strong> — alleen dossiers waar jij eigenaar van bent.</li>
          <li><strong>Niet toegewezen</strong> — wezen, vraagt aandacht.</li>
          <li><strong>Per persoon</strong> — selecteer een collega om te zien wat ze doen.</li>
        </ul>

        <Tip>
          Op het Overzicht-dashboard staat de <em>Team-belasting</em>-widget die per
          werknemer toont hoeveel dossiers ze hebben. Stefanie ziet zo in één oogopslag of
          iemand overbelast is (waarschuwing bij 15+).
        </Tip>
      </Step>

      <Step id="sjablonen" icon={<Zap className="size-4" />} title="13. Notitie-sjablonen">
        <p>
          Snelkoppelingen voor terugkerende notities. Beheer ze op
          <Link href="/admin/instellingen" className="link-underline"> /admin/instellingen</Link>.
        </p>

        <h4>Categorieën</h4>
        <p>Elk sjabloon hoort tot één categorie:</p>
        <ul>
          <li><strong>Algemeen</strong> — verschijnt op alle dossiers (bv. &ldquo;Klant niet bereikt&rdquo;).</li>
          <li><strong>Verkoop</strong> — alleen op verkoop-dossiers.</li>
          <li><strong>Verhuur</strong> — alleen op verhuur-dossiers.</li>
          <li><strong>Koop-zoeker</strong> — alleen op koop-zoekers.</li>
          <li><strong>Huur-zoeker</strong> — alleen op huur-zoekers.</li>
        </ul>
        <p>Op een dossier-detail zie je in het &ldquo;Sjablonen&rdquo;-menu enkel de relevante: matchend op dossier-type + alle &ldquo;Algemeen&rdquo;-sjablonen.</p>

        <h4>Gebruiken</h4>
        <p>In de historiek-sectie van een dossier: knop <strong>Sjablonen</strong> boven het notitieveld → klik op een sjabloon → tekst wordt aan je notitie toegevoegd. Plaatshouders zoals <code>[datum]</code> of <code>[bedrag]</code> vervang je manueel.</p>

        <h4>Beheren</h4>
        <ul>
          <li><em>+ Sjabloon toevoegen</em>: kies naam (kort) + categorie + tekst.</li>
          <li>Bewerken / Verwijderen op hover van elke rij.</li>
        </ul>
      </Step>

      <Step id="tags" icon={<Tag className="size-4" />} title="14. Tags / labels op dossiers">
        <p>Vrije etiketten om dossiers te organiseren los van type/status.</p>

        <h4>Toevoegen</h4>
        <p>In de aside van een dossier-detail: tikvak &ldquo;Nieuwe tag…&rdquo; → Enter of komma. Of klik op een suggestie (urgent, vip, opvolgen, wacht-op-klant, wacht-op-notaris, prijsdaling, nieuwe-foto, koud, warm).</p>
        <p>Tags worden automatisch in kleine letters + kebab-case gezet, max 32 tekens. Maximaal 20 tags per dossier.</p>

        <h4>Filteren</h4>
        <p>Op /admin/dossiers verschijnt automatisch een filter-rij &ldquo;Tag&rdquo; met alle bestaande tags en hoe vaak ze voorkomen. Klik om te filteren.</p>

        <Tip>
          Tags zijn vrijer dan categorieën — gebruik ze om aandacht-states te markeren of
          om interne workflow-stappen bij te houden.
        </Tip>
      </Step>

      <Step id="instellingen" icon={<Settings className="size-4" />} title="15. Instellingen">
        <p>
          Op <Link href="/admin/instellingen" className="link-underline">/admin/instellingen</Link>:
        </p>
        <ul>
          <li><strong>iCal feed</strong> — genereer/regenereer je persoonlijke agenda-URL (zie sectie Afspraken).</li>
          <li><strong>Notitie-sjablonen</strong> — beheren per categorie (zie sectie Sjablonen).</li>
          <li><strong>Link naar Team</strong> — werknemers werden verhuisd naar /admin/team.</li>
        </ul>
      </Step>

      <Step id="opslag" icon={<ImageIcon className="size-4" />} title="16. Opslag & limieten">
        <p>Onderaan het Overzicht zie je:</p>
        <ul>
          <li>Aantal documenten + foto&apos;s + totale grootte.</li>
          <li>Donut: documenten per type (compromis, EPC, schatting, ...).</li>
          <li>Verdeling foto&apos;s per pand-status.</li>
        </ul>
        <p>Supabase Pro-plan geeft 100 GB opslag — ruim voldoende voorlopig.</p>
      </Step>

      <Step id="commissie-overzicht" icon={<Calculator className="size-4" />} title="17. Commissie-pijplijn">
        <p>Overzicht-pagina toont:</p>
        <ul>
          <li><strong>Pipeline:</strong> commissies op dossiers in behandeling.</li>
          <li><strong>Onder optie:</strong> bod aanvaard, wachten op compromis.</li>
          <li><strong>Gerealiseerd:</strong> verkocht/verhuurd, daadwerkelijk verdiend.</li>
          <li><strong>Historiek:</strong> line-chart per maand (laatste 12).</li>
        </ul>
        <p>Bedragen zijn altijd excl. BTW (21%). Per dossier kun je in de aside aanduiden of de commissie inclusief of exclusief BTW is.</p>

        <h4>Export</h4>
        <p>Knop &ldquo;Export CSV&rdquo; op /admin/dossiers geeft alle commissie-berekeningen voor je boekhouding, gefilterd op je huidige selectie (bv. enkel gerealiseerde).</p>
      </Step>

      <Step id="diagnose" icon={<Stethoscope className="size-4" />} title="18. Diagnose & probleemoplossing">
        <p>
          Soms haaperde de Supabase Auth API en faalde de werknemerslijst. Voor zulke
          gevallen bestaat <Link href="/admin/team/diagnose" className="link-underline">/admin/team/diagnose</Link>:
        </p>
        <ul>
          <li>Test paginated listUsers met 5 batch-groottes.</li>
          <li>Toont per record of de metadata correct is.</li>
          <li>Checkt of de RPC-fallback <code>list_admin_users</code> beschikbaar is.</li>
          <li>Heeft fix-knoppen: <em>Maak admin</em> als role ontbreekt, <em>Wis</em> voor corrupte records.</li>
        </ul>
        <p>Open dit alleen als je &ldquo;Database error finding users&rdquo;-meldingen krijgt op de Team-pagina.</p>
      </Step>

      <Step id="seed-team" icon={<Sparkles className="size-4" />} title="19. Initiële team-import">
        <p>
          Voor de eerste opzet staat onderaan /admin/team een sectie &ldquo;Support-team
          importeren&rdquo; (verdwijnt zodra er 4+ werknemers zijn). Eénmalige knop die:
        </p>
        <ul>
          <li>Kimberly, Flore en Thomas aanmaakt als admin met random wachtwoorden.</li>
          <li>Portretfoto&apos;s uploadt uit <code>public/team/</code> voor alle 4 (incl. Stefanie + Vincent).</li>
        </ul>
        <p>Idempotent — kan veilig herhaald worden, slaat bestaande accounts over.</p>
      </Step>

      <Step id="veiligheid" icon={<AlertTriangle className="size-4" />} title="20. Permissies & veiligheid">
        <p>Wat kan elke rol?</p>
        <table className="text-xs my-3" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <thead>
            <tr style={{ background: 'var(--color-paper-2)' }}>
              <th className="text-left p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>Actie</th>
              <th className="text-center p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>Zaakvoerder</th>
              <th className="text-center p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>Webbeheerder</th>
              <th className="text-center p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>Makelaar</th>
              <th className="text-center p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>Assistent</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Klanten / dossiers / afspraken beheren" allowed={[true, true, true, true]} />
            <Row label="Documenten uploaden / delen" allowed={[true, true, true, true]} />
            <Row label="Notities + sjablonen toevoegen" allowed={[true, true, true, true]} />
            <Row label="Dossiers toewijzen / overdragen" allowed={[true, true, true, true]} />
            <Row label="Commissies wijzigen" allowed={[true, true, true, true]} />
            <Row label="Dossiers verwijderen (bulk + per stuk)" allowed={[true, true, true, true]} />
            <Row label="Tags op dossiers beheren" allowed={[true, true, true, true]} />
            <Row label="Aanbod (panden) bewerken" allowed={[true, true, true, true]} />
            <Row label="Werknemer toevoegen" allowed={[true, true, false, false]} />
            <Row label="Rol wijzigen / Deactiveren / Verwijderen" allowed={[true, true, false, false]} />
            <Row label="Collega&apos;s profiel bewerken" allowed={[true, true, false, false]} />
          </tbody>
        </table>
        <p className="text-xs text-[var(--color-mute)]">
          Server-side gegarandeerd: ook al lukt het iemand de UI te omzeilen, de actions
          weigeren tenzij de juiste rol. Logs (dossier-historiek) tonen wie wat deed.
        </p>
      </Step>

      <Step id="contact" icon={<HelpCircle className="size-4" />} title="Hulp nodig?">
        <p>
          Mail <a href="mailto:vmontreuil@outlook.be" className="link-underline">Vincent</a> (studio-vm) als je iets niet vindt,
          een bug ziet, of een nieuwe feature wil.
        </p>
        <p>Voor noodgevallen: 0477 99 56 51.</p>
      </Step>
    </div>
  )
}

function Toc() {
  const entries: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'login',               label: '1. Inloggen',         icon: <Lock className="size-3.5" /> },
    { id: 'overzicht',           label: '2. Dashboard',        icon: <LayoutDashboard className="size-3.5" /> },
    { id: 'klanten',             label: '3. Klanten',          icon: <Users className="size-3.5" /> },
    { id: 'dossiers',            label: '4. Dossiers',         icon: <FolderOpen className="size-3.5" /> },
    { id: 'aanbod',              label: '5. Aanbod',           icon: <Home className="size-3.5" /> },
    { id: 'afspraken',           label: '6. Afspraken',        icon: <Calendar className="size-3.5" /> },
    { id: 'berichten',           label: '7. Berichten',        icon: <MessageSquare className="size-3.5" /> },
    { id: 'meldingen',           label: '8. Meldingen',        icon: <Bell className="size-3.5" /> },
    { id: 'nieuwsbrief',         label: '9. Nieuwsbrief',      icon: <Send className="size-3.5" /> },
    { id: 'marktmonitor',        label: '9b. Marktmonitor',    icon: <Radar className="size-3.5" /> },
    { id: 'zoeken',              label: '10. Zoeken',          icon: <Search className="size-3.5" /> },
    { id: 'team',                label: '11. Team',            icon: <UserCog className="size-3.5" /> },
    { id: 'targets',             label: '11b. Targets',        icon: <Target className="size-3.5" /> },
    { id: 'afwezigheid',         label: '11c. Afwezigheid',    icon: <CalendarOff className="size-3.5" /> },
    { id: 'dossier-toewijzen',   label: '12. Toewijzen',       icon: <UserCog className="size-3.5" /> },
    { id: 'sjablonen',           label: '13. Sjablonen',       icon: <Zap className="size-3.5" /> },
    { id: 'tags',                label: '14. Tags',            icon: <Tag className="size-3.5" /> },
    { id: 'instellingen',        label: '15. Instellingen',    icon: <Settings className="size-3.5" /> },
    { id: 'opslag',              label: '16. Opslag',          icon: <ImageIcon className="size-3.5" /> },
    { id: 'commissie-overzicht', label: '17. Commissie',       icon: <Calculator className="size-3.5" /> },
    { id: 'diagnose',            label: '18. Diagnose',        icon: <Stethoscope className="size-3.5" /> },
    { id: 'seed-team',           label: '19. Team-import',     icon: <Sparkles className="size-3.5" /> },
    { id: 'veiligheid',          label: '20. Permissies',      icon: <AlertTriangle className="size-3.5" /> },
    { id: 'contact',             label: 'Hulp',                icon: <HelpCircle className="size-3.5" /> },
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
    <section id={id} className="mb-10 scroll-mt-8">
      <h2 className="text-xl md:text-2xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
        {title}
      </h2>
      <div className="space-y-2 text-sm text-[var(--color-ink)]">{children}</div>
    </section>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 my-3 text-xs"
      style={{ background: 'rgba(11,79,88,0.06)', borderLeft: '3px solid var(--color-accent)' }}>
      💡 {children}
    </div>
  )
}

function Row({ label, allowed }: { label: string; allowed: [boolean, boolean, boolean, boolean] }) {
  return (
    <tr>
      <td className="p-2 border-b" style={{ borderColor: 'var(--color-line)' }}>{label}</td>
      {allowed.map((ok, i) => (
        <td key={i} className="text-center p-2 border-b"
          style={{
            borderColor: 'var(--color-line)',
            color: ok ? '#166534' : '#b91c1c',
          }}>
          {ok ? '✓' : '–'}
        </td>
      ))}
    </tr>
  )
}
