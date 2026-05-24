'use client'

import { useMemo, useState } from 'react'
import { Printer, Copy, Check, Mail, FileText } from 'lucide-react'

export type LeadForBrief = {
  street: string | null
  postcode: string | null
  city: string | null
  price: number | null
  propertyType: string | null
  listingType: 'verkoop' | 'verhuur' | 'onbekend'
  isParticulier: boolean
  sourceSite: string | null
}

export type SenderInfo = {
  name: string
  email: string
  phone: string | null
  title: string | null
  bivNumber: string | null
}

type TemplateKey = 'verkoop_particulier' | 'verkoop_aflopend' | 'schatting' | 'sneller_verkopen'

const TEMPLATES: Record<TemplateKey, { label: string; description: string }> = {
  verkoop_particulier: {
    label: 'Particuliere verkoper — kennismaking',
    description: 'Voor eigenaars die zelf hun pand verkopen — bied professionele begeleiding aan.',
  },
  schatting: {
    label: 'Gratis schatting aanbieden',
    description: 'Neutrale eerste benadering met aanbod voor een vrijblijvende schatting.',
  },
  sneller_verkopen: {
    label: 'Sneller verkopen — netwerk',
    description: 'Voor panden die al een tijdje online staan — biedt netwerk en zichtbaarheid.',
  },
  verkoop_aflopend: {
    label: 'Mandaat loopt af — heroriëntatie',
    description: 'Voor eigenaars wiens makelaar-mandaat binnenkort eindigt (manueel inschatten).',
  },
}

function formatAddress(lead: LeadForBrief): string {
  return [lead.street, [lead.postcode, lead.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '[adres]'
}

function priceText(lead: LeadForBrief): string {
  if (!lead.price) return ''
  const fmt = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(lead.price)
  return lead.listingType === 'verhuur' ? `${fmt}/maand` : fmt
}

function buildBrief(template: TemplateKey, lead: LeadForBrief, sender: SenderInfo): { subject: string; body: string } {
  const address = formatAddress(lead)
  const price = priceText(lead)
  const propType = (lead.propertyType ?? 'pand').toLowerCase()
  const today = new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })

  const closing = `\n\nMet vriendelijke groet,\n\n${sender.name}\n${sender.title ?? 'Vastgoedmakelaar'}\nVastgoed Browaeys\n${sender.phone ?? '055 59 50 10'}\n${sender.email}${sender.bivNumber ? `\nBIV ${sender.bivNumber}` : ''}`

  switch (template) {
    case 'verkoop_particulier':
      return {
        subject: `${propType.charAt(0).toUpperCase() + propType.slice(1)} ${address} — wij zien een mooi pand`,
        body:
`Geachte heer/mevrouw,

Ik zag online dat u uw ${propType} aan ${address} zelf te koop aanbiedt${price ? ` voor ${price}` : ''}. Een mooie keuze om de zaken in eigen hand te nemen — maar misschien interessant om eens te horen wat wij voor u zouden kunnen betekenen.

Bij Vastgoed Browaeys ben ik gespecialiseerd in panden in de Vlaamse Ardennen en omstreken. Concreet bied ik aan:

  • Een professionele schatting en marktpositionering
  • Hoogkwalitatieve foto-presentatie + plaatselijk netwerk van kopers
  • Volledige administratieve begeleiding tot aan de notaris
  • Vaste commissie, geen verrassingen

Geen druk — gewoon een vrijblijvend gesprek als u dat interessant lijkt. Ik kan langskomen op een moment dat het u past.

Mag ik u eens bellen voor een kort kennismakingsgesprek?
${closing}`,
      }

    case 'schatting':
      return {
        subject: `Gratis en vrijblijvende schatting voor ${address}`,
        body:
`Geachte heer/mevrouw,

Ik volg de vastgoedmarkt in onze streek nauw op en zag uw ${propType} aan ${address}. Of u nu effectief op zoek bent naar een koper of gewoon nieuwsgierig bent naar de actuele marktwaarde: ik bied u graag een gratis en volledig vrijblijvende schatting aan.

Een schatting bij Vastgoed Browaeys omvat:

  • Plaatsbezoek (~45 min)
  • Vergelijkbare recent verkochte panden in de streek
  • Schriftelijk schattingsverslag
  • Praktische tips om de waarde te optimaliseren

Geen verplichting, geen sales-praat. U beslist daarna gewoon zelf.

Mag ik u eens contacteren om een datum af te spreken die u past?
${closing}`,
      }

    case 'sneller_verkopen':
      return {
        subject: `${propType.charAt(0).toUpperCase() + propType.slice(1)} ${address} — mogelijk een nieuwe aanpak?`,
        body:
`Geachte heer/mevrouw,

Ik volg het aanbod in de regio op de voet en zie dat uw ${propType} aan ${address} al een tijdje online staat. Soms helpt het om met een frisse blik naar de zichtbaarheid en prijspositionering te kijken.

Bij Vastgoed Browaeys werken we met:

  • Een actueel kopersbestand van particulieren die specifiek in uw streek zoeken
  • Sterke fotografie en gerichte online aanwezigheid
  • Persoonlijke begeleiding — geen call-center

Mocht u openstaan voor een vrijblijvend gesprek over de marktsituatie, hoor ik het graag.
${closing}`,
      }

    case 'verkoop_aflopend':
      return {
        subject: `${address} — herorienteren?`,
        body:
`Geachte heer/mevrouw,

Mocht u uw mandaat met de huidige makelaar binnenkort heroverwegen, dan kom ik graag eens vrijblijvend langs om mijn aanpak voor te stellen. Ik werk persoonlijk en exclusief op pandende in de Vlaamse Ardennen — geen call-center, geen onderaannemers.

Een kort gesprek hoeft u tot niets te verbinden. Ik luister naar wat goed liep en wat anders kan, en u beslist daarna in alle rust.

Kan ik u eens bellen om een datum vast te leggen?
${closing}`,
      }
  }
}

export function BriefGenerator({
  lead,
  sender,
}: {
  lead: LeadForBrief
  sender: SenderInfo
}) {
  const [template, setTemplate] = useState<TemplateKey>(lead.isParticulier ? 'verkoop_particulier' : 'schatting')
  const [copied, setCopied] = useState(false)

  const { subject, body } = useMemo(() => buildBrief(template, lead, sender), [template, lead, sender])

  function copyAll() {
    navigator.clipboard.writeText(`Onderwerp: ${subject}\n\n${body}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function printBrief() {
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return
    const today = new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>${subject}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.55; color: #1a1a1a; max-width: 17cm; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24pt; padding-bottom: 8pt; border-bottom: 1px solid #999; }
  .brand { font-family: Georgia, serif; font-size: 16pt; font-style: italic; color: #0b4f58; }
  .meta { font-size: 9pt; color: #555; text-align: right; }
  .subject { margin: 18pt 0; font-weight: bold; font-size: 12pt; }
  pre { font-family: inherit; white-space: pre-wrap; }
</style>
</head><body>
<div class="header">
  <div>
    <div class="brand">Vastgoed Browaeys</div>
    <div style="font-size: 9pt; color: #555;">Vastgoedmakelaar-bemiddelaar — BIV 504.553</div>
  </div>
  <div class="meta">
    Horebeke<br>
    ${today}
  </div>
</div>
<div class="subject">${subject.replace(/</g, '&lt;')}</div>
<pre>${body.replace(/</g, '&lt;')}</pre>
</body></html>`
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 200)
  }

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <section className="p-4 md:p-5"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h2 className="text-lg md:text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <FileText className="size-4 md:size-5" style={{ color: 'var(--color-accent)' }} />
        Brief-generator
      </h2>

      <label className="block mb-4">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Template</span>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as TemplateKey)}
          className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
          style={{ border: '1px solid var(--color-line)' }}
        >
          {Object.entries(TEMPLATES).map(([k, t]) => (
            <option key={k} value={k}>{t.label}</option>
          ))}
        </select>
        <p className="mt-1.5 text-[0.65rem] text-[var(--color-mute)]">
          {TEMPLATES[template].description}
        </p>
      </label>

      <div className="mb-3">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Onderwerp</span>
        <p className="px-3 py-2 text-sm" style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
          {subject}
        </p>
      </div>

      <div className="mb-4">
        <span className="eyebrow text-[0.6rem] mb-1.5 block">Tekst</span>
        <pre className="px-3 py-2 text-xs whitespace-pre-wrap font-sans"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)', maxHeight: '420px', overflowY: 'auto' }}>
          {body}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
        >
          {copied ? <Check className="size-3.5" style={{ color: '#16a34a' }} /> : <Copy className="size-3.5" />}
          {copied ? 'Gekopieerd!' : 'Kopieer onderwerp + tekst'}
        </button>
        <a
          href={mailto}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
        >
          <Mail className="size-3.5" />
          Open in mail-app
        </a>
        <button
          type="button"
          onClick={printBrief}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs"
          style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}
        >
          <Printer className="size-3.5" />
          Print als brief (PDF)
        </button>
      </div>

      <p className="mt-3 text-[0.65rem] text-[var(--color-mute)] italic">
        💡 Pas de tekst manueel aan voor een persoonlijke toets. De brief-printview gebruikt
        je standaard browser PDF-export (Bestand → Opslaan als PDF).
      </p>
    </section>
  )
}
