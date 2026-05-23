// Metadata per info-pagina: wanneer voor het laatst inhoudelijk nagekeken,
// en welke autoritatieve bronnen geraadpleegd werden.
//
// CRUCIAAL: dit zijn de datums die de bezoeker ziet onderaan elke info-pagina.
// Werk ze actief bij wanneer je inhoudelijk iets wijzigt — dat houdt de
// disclaimer geloofwaardig en bewijsbaar.

export type InfoPageMeta = {
  lastUpdated: string  // YYYY-MM-DD
  sources: Array<{ label: string; href: string }>
}

const COMMON_SOURCES = [
  { label: 'Vlaanderen.be — Wonen & Energie',           href: 'https://www.vlaanderen.be/wonen-en-energie' },
  { label: 'Notaris.be — informatie & berekenkalkulator', href: 'https://www.notaris.be' },
  { label: 'BIV (Beroepsinstituut van Vastgoedmakelaars)', href: 'https://www.biv.be' },
]

export const INFO_PAGE_META: Record<string, InfoPageMeta> = {
  kopen: {
    lastUpdated: '2026-05-23',
    sources: [
      ...COMMON_SOURCES,
      { label: 'Vlaamse Belastingdienst — registratierechten', href: 'https://belastingen.vlaanderen.be/registratiebelasting' },
      { label: 'FOD Financiën',                                 href: 'https://financien.belgium.be' },
    ],
  },
  verkopen: {
    lastUpdated: '2026-05-23',
    sources: [
      ...COMMON_SOURCES,
      { label: 'OVAM — bodemattest',                            href: 'https://ovam.vlaanderen.be' },
      { label: 'Vlaams Energie- en Klimaatagentschap (VEKA)',   href: 'https://www.vlaanderen.be/veka' },
      { label: 'Asbestattest — Vlaanderen',                     href: 'https://www.vlaanderen.be/asbestattest' },
    ],
  },
  huren: {
    lastUpdated: '2026-05-23',
    sources: [
      ...COMMON_SOURCES,
      { label: 'Vlaams Woninghuurdecreet',                      href: 'https://www.vlaanderen.be/woninghuurdecreet' },
      { label: 'Wonen Vlaanderen',                              href: 'https://www.wonenvlaanderen.be' },
    ],
  },
  epc: {
    lastUpdated: '2026-05-23',
    sources: [
      ...COMMON_SOURCES,
      { label: 'Vlaams Energie- en Klimaatagentschap (VEKA)',   href: 'https://www.vlaanderen.be/veka' },
      { label: 'EnergiesparenVlaanderen — EPC',                 href: 'https://www.energiesparen.be/EPC' },
      { label: 'Mijn VerbouwLening / Mijn VerbouwPremie',       href: 'https://www.vlaanderen.be/mijnverbouwpremie' },
    ],
  },
  woordenlijst: {
    lastUpdated: '2026-05-23',
    sources: COMMON_SOURCES,
  },
  faq: {
    lastUpdated: '2026-05-23',
    sources: COMMON_SOURCES,
  },
}

export function formatBeDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}
