// === Mock-data voor admin-paneel ===
// Realistische dummy-data voor klanten, dossiers, afspraken en berichten.
// Wordt vervangen door Supabase-queries zodra de PostgREST cache is opgelost.

export type ClientStatus = 'actief' | 'inactief' | 'lead'
export type ClientKind = 'verkoper' | 'koper' | 'verhuurder' | 'huurder'

export type Client = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  kinds: ClientKind[]
  status: ClientStatus
  notes?: string
  createdAt: string // ISO
  lastContact: string // ISO
  budget?: number
  searchCity?: string[]
  searchType?: string[]
  agent: string // werknemer
}

export const CLIENTS: Client[] = [
  { id: 'c1',  firstName: 'Bart',     lastName: 'Verbruggen',   email: 'bart.verbruggen@telenet.be',     phone: '0479 12 34 56', city: 'Brakel',          kinds: ['koper'],            status: 'actief',   createdAt: '2026-03-12', lastContact: '2026-05-20', budget: 380000, searchCity: ['Brakel','Zwalm','Horebeke'], searchType: ['woning'], agent: 'Stefanie' },
  { id: 'c2',  firstName: 'Familie',  lastName: 'Decoster',     email: 'decoster.fam@gmail.com',         phone: '0496 78 90 12', city: 'Zottegem',        kinds: ['verkoper'],         status: 'actief',   createdAt: '2026-02-05', lastContact: '2026-05-22', agent: 'Stefanie' },
  { id: 'c3',  firstName: 'Mevr.',    lastName: 'Van Daele',    email: 'a.vandaele@proximus.be',         phone: '0473 22 18 04', city: 'Horebeke',        kinds: ['verkoper'],         status: 'actief',   createdAt: '2026-01-18', lastContact: '2026-05-21', agent: 'Stefanie' },
  { id: 'c4',  firstName: 'Wim',      lastName: 'Bracke',       email: 'wbracke@outlook.com',            phone: '0498 67 32 11', city: 'Oudenaarde',      kinds: ['koper'],            status: 'actief',   createdAt: '2026-04-02', lastContact: '2026-05-19', budget: 295000, searchCity: ['Oudenaarde','Kluisbergen'], searchType: ['appartement'], agent: 'Kimberly' },
  { id: 'c5',  firstName: 'Nele',     lastName: 'Coppens',      email: 'nele.coppens@hotmail.com',       phone: '0476 55 44 33', city: 'Ronse',           kinds: ['koper','huurder'],  status: 'lead',     createdAt: '2026-05-15', lastContact: '2026-05-22', agent: 'Flore' },
  { id: 'c6',  firstName: 'Jan',      lastName: 'Pieters',      email: 'jan.pieters@skynet.be',          phone: '0494 81 27 16', city: 'Brakel',          kinds: ['verkoper'],         status: 'actief',   createdAt: '2025-11-22', lastContact: '2026-05-14', agent: 'Stefanie' },
  { id: 'c7',  firstName: 'Marleen',  lastName: 'De Smedt',     email: 'm.desmedt@telenet.be',           phone: '0471 19 05 73', city: 'Zwalm',           kinds: ['huurder'],          status: 'actief',   createdAt: '2026-03-30', lastContact: '2026-05-10', budget: 950, searchCity: ['Zwalm','Brakel'], agent: 'Thomas' },
  { id: 'c8',  firstName: 'Familie',  lastName: 'Vermeulen',    email: 'vermeulen.t@gmail.com',          phone: '0485 36 47 28', city: 'Kluisbergen',     kinds: ['verkoper'],         status: 'inactief', createdAt: '2025-08-14', lastContact: '2026-02-04', agent: 'Stefanie' },
  { id: 'c9',  firstName: 'Lieve',    lastName: 'Heyman',       email: 'lieve.heyman@telenet.be',        phone: '0468 44 19 56', city: 'Maarkedal',       kinds: ['koper'],            status: 'lead',     createdAt: '2026-05-08', lastContact: '2026-05-22', budget: 220000, searchCity: ['Maarkedal','Horebeke'], searchType: ['bouwgrond'], agent: 'Flore' },
  { id: 'c10', firstName: 'Patrick',  lastName: 'Maes',         email: 'patrick.maes@skynet.be',         phone: '0497 11 67 23', city: 'Brakel',          kinds: ['verhuurder'],       status: 'actief',   createdAt: '2025-12-03', lastContact: '2026-05-18', agent: 'Kimberly' },
  { id: 'c11', firstName: 'Sofie',    lastName: 'Vanhecke',     email: 'sofie.vanhecke@gmail.com',       phone: '0492 28 84 19', city: 'Ronse',           kinds: ['koper'],            status: 'actief',   createdAt: '2026-02-19', lastContact: '2026-05-17', budget: 410000, searchCity: ['Ronse','Maarkedal'], searchType: ['woning'], agent: 'Stefanie' },
  { id: 'c12', firstName: 'Geert',    lastName: 'Dhondt',       email: 'g.dhondt@proximus.be',           phone: '0479 92 13 47', city: 'Zottegem',        kinds: ['verkoper','koper'], status: 'actief',   createdAt: '2025-10-25', lastContact: '2026-05-21', budget: 525000, agent: 'Stefanie' },
]

export type DossierType = 'verkoop' | 'verhuur' | 'koop_zoeker' | 'huur_zoeker'
export type DossierStatus = 'open' | 'in_behandeling' | 'onder_optie' | 'verkocht' | 'verhuurd' | 'geannuleerd'

export type DossierStep = {
  label: string
  doneAt?: string // ISO date
}

export type Dossier = {
  id: string
  ref: string
  clientId: string
  clientName: string
  type: DossierType
  status: DossierStatus
  property?: string
  propertyCity?: string
  askingPrice?: number
  openedAt: string
  closedAt?: string
  agent: string
  steps: DossierStep[]
  appointmentsCount: number
  documentsCount: number
  offersCount: number
}

const today = '2026-05-23'

export const DOSSIERS: Dossier[] = [
  {
    id: 'd1', ref: 'VK-2026-018', clientId: 'c3', clientName: 'Mevr. Van Daele',
    type: 'verkoop', status: 'in_behandeling',
    property: 'Karakterwoning Bovenstraat 12', propertyCity: 'Sint-Maria-Horebeke',
    askingPrice: 395000, openedAt: '2026-05-12', agent: 'Stefanie',
    steps: [
      { label: 'Plaatsbezoek + schatting',         doneAt: '2026-05-12' },
      { label: 'Verkoopopdracht ondertekend',      doneAt: '2026-05-14' },
      { label: 'Foto-presentatie afgewerkt',       doneAt: '2026-05-18' },
      { label: 'Online publicatie',                doneAt: '2026-05-22' },
      { label: 'Bod onderhandelen + acceptatie' },
      { label: 'Compromis bij notaris' },
      { label: 'Aktedatum' },
    ],
    appointmentsCount: 4, documentsCount: 3, offersCount: 1,
  },
  {
    id: 'd2', ref: 'VK-2026-016', clientId: 'c2', clientName: 'Familie Decoster',
    type: 'verkoop', status: 'onder_optie',
    property: 'Nieuwbouw villa', propertyCity: 'Zottegem',
    askingPrice: 540000, openedAt: '2026-02-08', agent: 'Stefanie',
    steps: [
      { label: 'Plaatsbezoek + schatting',         doneAt: '2026-02-08' },
      { label: 'Verkoopopdracht ondertekend',      doneAt: '2026-02-12' },
      { label: 'Foto-presentatie afgewerkt',       doneAt: '2026-02-22' },
      { label: 'Online publicatie',                doneAt: '2026-02-26' },
      { label: 'Bod onderhandelen + acceptatie',   doneAt: '2026-05-19' },
      { label: 'Compromis bij notaris' },
      { label: 'Aktedatum' },
    ],
    appointmentsCount: 11, documentsCount: 7, offersCount: 3,
  },
  {
    id: 'd3', ref: 'KZ-2026-009', clientId: 'c1', clientName: 'Bart Verbruggen',
    type: 'koop_zoeker', status: 'open',
    property: undefined, propertyCity: undefined,
    askingPrice: 380000, openedAt: '2026-03-12', agent: 'Stefanie',
    steps: [
      { label: 'Intake-gesprek',           doneAt: '2026-03-12' },
      { label: 'Zoekcriteria vastgelegd',  doneAt: '2026-03-14' },
      { label: 'Auto-meldingen geactiveerd', doneAt: '2026-03-14' },
      { label: 'Eerste bezichtigingen' },
      { label: 'Bod uitbrengen' },
    ],
    appointmentsCount: 2, documentsCount: 1, offersCount: 0,
  },
  {
    id: 'd4', ref: 'KZ-2026-011', clientId: 'c4', clientName: 'Wim Bracke',
    type: 'koop_zoeker', status: 'open',
    askingPrice: 295000, openedAt: '2026-04-02', agent: 'Kimberly',
    steps: [
      { label: 'Intake-gesprek',           doneAt: '2026-04-02' },
      { label: 'Zoekcriteria vastgelegd',  doneAt: '2026-04-04' },
      { label: 'Auto-meldingen geactiveerd', doneAt: '2026-04-04' },
      { label: 'Eerste bezichtigingen',    doneAt: '2026-05-08' },
      { label: 'Bod uitbrengen' },
    ],
    appointmentsCount: 3, documentsCount: 0, offersCount: 0,
  },
  {
    id: 'd5', ref: 'VK-2025-074', clientId: 'c6', clientName: 'Jan Pieters',
    type: 'verkoop', status: 'verkocht',
    property: 'Rijwoning Stationsstraat 4', propertyCity: 'Brakel',
    askingPrice: 248000, openedAt: '2025-11-22', closedAt: '2026-03-04', agent: 'Stefanie',
    steps: [
      { label: 'Plaatsbezoek + schatting',         doneAt: '2025-11-22' },
      { label: 'Verkoopopdracht ondertekend',      doneAt: '2025-11-27' },
      { label: 'Foto-presentatie afgewerkt',       doneAt: '2025-12-04' },
      { label: 'Online publicatie',                doneAt: '2025-12-10' },
      { label: 'Bod onderhandelen + acceptatie',   doneAt: '2026-01-15' },
      { label: 'Compromis bij notaris',            doneAt: '2026-02-02' },
      { label: 'Aktedatum',                        doneAt: '2026-03-04' },
    ],
    appointmentsCount: 9, documentsCount: 12, offersCount: 2,
  },
  {
    id: 'd6', ref: 'VH-2026-004', clientId: 'c10', clientName: 'Patrick Maes',
    type: 'verhuur', status: 'in_behandeling',
    property: 'Duplex Marktplein 8', propertyCity: 'Brakel',
    askingPrice: 875, openedAt: '2025-12-03', agent: 'Kimberly',
    steps: [
      { label: 'Plaatsbezoek',                doneAt: '2025-12-03' },
      { label: 'Verhuuropdracht ondertekend', doneAt: '2025-12-08' },
      { label: 'EPC + plaatsbeschrijving',    doneAt: '2025-12-20' },
      { label: 'Online publicatie',           doneAt: '2026-01-04' },
      { label: 'Bezichtigingen',              doneAt: '2026-05-10' },
      { label: 'Kandidaat-huurder geselecteerd' },
      { label: 'Huurcontract' },
    ],
    appointmentsCount: 6, documentsCount: 4, offersCount: 2,
  },
  {
    id: 'd7', ref: 'HZ-2026-002', clientId: 'c7', clientName: 'Marleen De Smedt',
    type: 'huur_zoeker', status: 'open',
    askingPrice: 950, openedAt: '2026-03-30', agent: 'Thomas',
    steps: [
      { label: 'Intake-gesprek',           doneAt: '2026-03-30' },
      { label: 'Zoekcriteria vastgelegd',  doneAt: '2026-04-02' },
      { label: 'Bezichtigingen' },
    ],
    appointmentsCount: 1, documentsCount: 0, offersCount: 0,
  },
  {
    id: 'd8', ref: 'KZ-2026-012', clientId: 'c11', clientName: 'Sofie Vanhecke',
    type: 'koop_zoeker', status: 'in_behandeling',
    askingPrice: 410000, openedAt: '2026-02-19', agent: 'Stefanie',
    steps: [
      { label: 'Intake-gesprek',           doneAt: '2026-02-19' },
      { label: 'Zoekcriteria vastgelegd',  doneAt: '2026-02-22' },
      { label: 'Auto-meldingen geactiveerd', doneAt: '2026-02-22' },
      { label: 'Eerste bezichtigingen',    doneAt: '2026-04-10' },
      { label: 'Bod uitbrengen',           doneAt: '2026-05-09' },
    ],
    appointmentsCount: 5, documentsCount: 2, offersCount: 1,
  },
]

export type AppointmentType = 'bezichtiging' | 'schatting' | 'intake' | 'compromis' | 'akte' | 'overig'
export type AppointmentStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled'

export type Appointment = {
  id: string
  title: string
  type: AppointmentType
  status: AppointmentStatus
  start: string // ISO datetime
  durationMin: number
  location: string
  dossierId?: string
  clientName: string
  agent: string
  notes?: string
}

export const APPOINTMENTS: Appointment[] = [
  { id: 'a1', title: 'Bezichtiging — woning Horebeke',     type: 'bezichtiging', status: 'confirmed', start: '2026-05-24T14:00:00+02:00', durationMin: 60, location: 'Sint-Maria-Horebeke', dossierId: 'd1', clientName: 'Familie Demeyer',   agent: 'Stefanie' },
  { id: 'a2', title: 'Schatting — appartement Brakel',     type: 'schatting',    status: 'planned',   start: '2026-05-24T10:00:00+02:00', durationMin: 45, location: 'Brakel',              dossierId: undefined, clientName: 'Marc Devriendt',  agent: 'Stefanie' },
  { id: 'a3', title: 'Intake nieuwe koop-zoeker',          type: 'intake',       status: 'confirmed', start: '2026-05-23T16:00:00+02:00', durationMin: 60, location: 'Kantoor Brakel',      dossierId: undefined, clientName: 'Nele Coppens',    agent: 'Flore' },
  { id: 'a4', title: 'Bezichtiging — duplex Brakel',       type: 'bezichtiging', status: 'planned',   start: '2026-05-25T11:30:00+02:00', durationMin: 45, location: 'Brakel',              dossierId: 'd6', clientName: 'Tom Vereecken',   agent: 'Kimberly' },
  { id: 'a5', title: 'Compromis-overleg — Decoster',       type: 'compromis',    status: 'confirmed', start: '2026-05-26T09:00:00+02:00', durationMin: 90, location: 'Notaris Mortier',     dossierId: 'd2', clientName: 'Familie Decoster',agent: 'Stefanie' },
  { id: 'a6', title: 'Bezichtiging — woning Brakel',       type: 'bezichtiging', status: 'completed', start: '2026-05-21T14:00:00+02:00', durationMin: 45, location: 'Brakel',              dossierId: 'd1', clientName: 'Bart Verbruggen', agent: 'Stefanie' },
  { id: 'a7', title: 'Bezichtiging — appartement Ronse',   type: 'bezichtiging', status: 'completed', start: '2026-05-20T15:30:00+02:00', durationMin: 45, location: 'Ronse',               dossierId: undefined, clientName: 'Wim Bracke',     agent: 'Kimberly' },
  { id: 'a8', title: 'Akte-ondertekening — Pieters',       type: 'akte',         status: 'completed', start: '2026-03-04T10:00:00+01:00', durationMin: 120, location: 'Notaris De Maeseneer', dossierId: 'd5', clientName: 'Jan Pieters',   agent: 'Stefanie' },
  { id: 'a9', title: 'Bezichtiging — villa Zottegem',      type: 'bezichtiging', status: 'confirmed', start: '2026-05-27T17:00:00+02:00', durationMin: 60, location: 'Zottegem',            dossierId: 'd2', clientName: 'Geert Dhondt',    agent: 'Stefanie' },
  { id: 'a10', title: 'Schatting na overlijden',           type: 'schatting',    status: 'planned',   start: '2026-05-28T11:00:00+02:00', durationMin: 60, location: 'Maarkedal',           dossierId: undefined, clientName: 'Erfgenamen Van Hoorde', agent: 'Stefanie' },
]

export type MessageType = 'lead' | 'schatting' | 'vraag' | 'visit_request' | 'algemeen'

export type Message = {
  id: string
  fromName: string
  fromEmail: string
  fromPhone?: string
  subject: string
  preview: string
  body: string
  type: MessageType
  receivedAt: string // ISO datetime
  readAt?: string
  assignedTo?: string
  relatedListing?: string
}

export const MESSAGES: Message[] = [
  { id: 'm1',  fromName: 'Familie Demeyer',    fromEmail: 'demeyer.fam@gmail.com',     fromPhone: '0476 22 13 84', subject: 'Bezichtiging woning Horebeke?',      preview: 'Goedemiddag, we hebben uw pand in Sint-Maria-Horebeke online gezien…', body: 'Goedemiddag,\n\nWe hebben uw pand in Sint-Maria-Horebeke online gezien en zouden graag een bezichtiging inplannen. Komt zaterdag uit?\n\nVriendelijke groeten,\nFamilie Demeyer',           type: 'visit_request', receivedAt: '2026-05-23T11:42:00+02:00',                              relatedListing: 'Karakterwoning Horebeke' },
  { id: 'm2',  fromName: 'Marc Devriendt',     fromEmail: 'm.devriendt@proximus.be',   fromPhone: '0498 67 11 23', subject: 'Schatting appartement Brakel',       preview: 'Beste, ik zou graag een schatting laten maken van mijn appartement…',         body: 'Beste,\n\nIk zou graag een schatting laten maken van mijn appartement in het centrum van Brakel. Het betreft een 2-slk op de eerste verdieping.\n\nGroet,\nMarc',           type: 'schatting',     receivedAt: '2026-05-23T09:18:00+02:00', readAt: '2026-05-23T10:02:00+02:00', assignedTo: 'Stefanie' },
  { id: 'm3',  fromName: 'Nele Coppens',       fromEmail: 'nele.coppens@hotmail.com',  fromPhone: '0476 55 44 33', subject: 'Op zoek naar woning in Ronse',       preview: 'Hallo, mijn partner en ik zoeken een woning rond €350.000…',                 body: 'Hallo,\n\nMijn partner en ik zoeken een woning rond €350.000 in Ronse of omgeving. We zijn flexibel qua opleverdatum.\n\nMag ik me inschrijven op de mailinglist?\n\nNele',           type: 'lead',          receivedAt: '2026-05-22T19:33:00+02:00', readAt: '2026-05-22T21:14:00+02:00', assignedTo: 'Flore' },
  { id: 'm4',  fromName: 'Tom Vereecken',      fromEmail: 'tom.vereecken@telenet.be',  fromPhone: '0479 88 92 56', subject: 'Vraag duplex Brakel — huurkost?',    preview: 'Geachte, kan u me de exacte huurkosten doorgeven voor de duplex…',           body: 'Geachte,\n\nKan u me de exacte huurkosten doorgeven voor de duplex op het Marktplein? En zijn huisdieren toegelaten?\n\nMet vriendelijke groet,\nTom',           type: 'vraag',         receivedAt: '2026-05-22T16:08:00+02:00', readAt: '2026-05-22T17:00:00+02:00', assignedTo: 'Kimberly', relatedListing: 'Duplex Marktplein Brakel' },
  { id: 'm5',  fromName: 'Erfgenamen Van Hoorde', fromEmail: 'notaris@vh-maarkedal.be', fromPhone: '055 30 17 22', subject: 'Schatting bij overlijden',          preview: 'Geachte, in naam van de erfgenamen verzoeken wij om een onafhankelijke…',     body: 'Geachte,\n\nIn naam van de erfgenamen verzoeken wij om een onafhankelijke schatting van de woning in Maarkedal-Etikhove. Graag op korte termijn ivm aangifte.\n\nNotaris Vandenhole',           type: 'schatting',     receivedAt: '2026-05-22T13:55:00+02:00', readAt: '2026-05-22T14:30:00+02:00', assignedTo: 'Stefanie' },
  { id: 'm6',  fromName: 'Liesbeth Roelens',   fromEmail: 'l.roelens@gmail.com',       fromPhone: '0496 11 84 73', subject: 'Vraag over bouwgrond Horebeke',      preview: 'Goeiedag, is er nog stedenbouwkundig onderzoek mogelijk op het perceel…',     body: 'Goeiedag,\n\nIs er nog stedenbouwkundig onderzoek mogelijk op het perceel dat u online heeft staan? Wij zijn geïnteresseerd voor een halfopen bebouwing.\n\nLiesbeth',           type: 'vraag',         receivedAt: '2026-05-21T20:14:00+02:00',                                                          relatedListing: 'Bouwgrond Sint-Maria-Horebeke' },
  { id: 'm7',  fromName: 'Pieter Goethals',    fromEmail: 'pgoethals@outlook.com',     fromPhone: '0479 33 67 12', subject: 'Algemene vraag — werkwijze',         preview: 'Beste, kan u uitleggen hoe uw werkwijze precies werkt? Wij hebben momenteel…',body: 'Beste,\n\nKan u uitleggen hoe uw werkwijze precies werkt? Wij hebben momenteel twee andere kantoren bij ons huis gehad maar zijn niet overtuigd.\n\nDank,\nPieter',           type: 'algemeen',      receivedAt: '2026-05-21T11:02:00+02:00', readAt: '2026-05-21T11:30:00+02:00', assignedTo: 'Stefanie' },
  { id: 'm8',  fromName: 'Inge Vandenberghe',  fromEmail: 'inge.vdb@telenet.be',       fromPhone: '0471 19 28 47', subject: 'Bezichtiging villa Zottegem',        preview: 'Geachte, mijn man en ik zouden de villa in Zottegem graag bezichtigen…',      body: 'Geachte,\n\nMijn man en ik zouden de villa in Zottegem graag bezichtigen. Komt volgende week mogelijk?\n\nVriendelijke groet,\nInge',           type: 'visit_request', receivedAt: '2026-05-20T14:48:00+02:00', readAt: '2026-05-20T15:20:00+02:00', assignedTo: 'Stefanie', relatedListing: 'Nieuwbouw villa Zottegem' },
]

// Helpers
export function getDossiersByClient(clientId: string) {
  return DOSSIERS.filter((d) => d.clientId === clientId)
}

export function getDossierById(id: string) {
  return DOSSIERS.find((d) => d.id === id)
}

export function getClientById(id: string) {
  return CLIENTS.find((c) => c.id === id)
}

export function getAppointmentsByDossier(dossierId: string) {
  return APPOINTMENTS.filter((a) => a.dossierId === dossierId)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatRelative(iso: string, now = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes} min geleden`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} u geleden`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d geleden`
  return formatDate(iso)
}
