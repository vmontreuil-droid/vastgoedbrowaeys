import Link from 'next/link'
import { VBMonogram } from '@/components/vb-monogram'
import { BrandLogo } from '@/components/brand-logo'

// === 20 logo-richtingen voor Vastgoed Browaeys ===
// Kleuren: petrol #0b4f58, clay #c4a380, ink #1a1a1a
// SVG-monograms zijn 100x100 viewBox — geüpscaled via height/width

const PETROL = '#0b4f58'
const CLAY = '#c4a380'
const INK = '#1a1a1a'

/* ---------- Mark-elementen (SVG monogrammen) ---------- */

function MarkCircleVB() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <circle cx="50" cy="50" r="46" fill="none" stroke={PETROL} strokeWidth="1.5" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="38" fontWeight="400" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkOverlap() {
  // De herwerkte versie van het bestaande logo — VB-overlap in twee teals
  return <VBMonogram size="3.4rem" />
}

function MarkDot() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="50" y="68" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="46" fontWeight="700" fill={PETROL} letterSpacing="-2">vb</text>
      <circle cx="84" cy="68" r="4" fill={CLAY} />
    </svg>
  )
}

function MarkBar() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="22" y="64" fontFamily="Fraunces, serif" fontSize="44" fontWeight="400" fill={PETROL}>V</text>
      <line x1="50" y1="22" x2="50" y2="78" stroke={CLAY} strokeWidth="1.2" />
      <text x="58" y="64" fontFamily="Fraunces, serif" fontSize="44" fontWeight="400" fill={PETROL}>B</text>
    </svg>
  )
}

function MarkUnderline() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="50" y="58" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="44" fontWeight="400" fill={PETROL}>VB</text>
      <line x1="32" y1="70" x2="68" y2="70" stroke={CLAY} strokeWidth="1.5" />
    </svg>
  )
}

function MarkSquare() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <rect x="6" y="6" width="88" height="88" fill={PETROL} />
      <text x="50" y="68" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="44" fontWeight="400" fill={CLAY}>VB</text>
    </svg>
  )
}

function MarkSquareOutline() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <rect x="6" y="6" width="88" height="88" fill="none" stroke={PETROL} strokeWidth="1.5" />
      <text x="50" y="64" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="40" fontWeight="400" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkSeal() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <circle cx="50" cy="50" r="46" fill={CLAY} />
      <circle cx="50" cy="50" r="40" fill="none" stroke={PETROL} strokeWidth="0.8" />
      <text x="50" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="32" fontWeight="500" fill={PETROL}>VB</text>
      <text x="50" y="78" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="6" fontWeight="600" fill={PETROL} letterSpacing="2">EST 2008</text>
    </svg>
  )
}

function MarkCrest() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M50,6 L90,20 L90,55 Q90,80 50,94 Q10,80 10,55 L10,20 Z" fill="none" stroke={PETROL} strokeWidth="1.5" />
      <text x="50" y="58" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="32" fontWeight="400" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkRoof() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M10,55 L50,15 L90,55" fill="none" stroke={PETROL} strokeWidth="1.8" strokeLinecap="round" />
      <text x="50" y="84" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="32" fontWeight="500" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkHouse() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M14,46 L50,16 L86,46 L86,86 L14,86 Z" fill="none" stroke={PETROL} strokeWidth="1.6" />
      <text x="50" y="76" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="28" fontWeight="500" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkKey() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <circle cx="28" cy="50" r="14" fill="none" stroke={PETROL} strokeWidth="2" />
      <line x1="42" y1="50" x2="86" y2="50" stroke={PETROL} strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="50" x2="72" y2="62" stroke={PETROL} strokeWidth="2" strokeLinecap="round" />
      <line x1="82" y1="50" x2="82" y2="60" stroke={PETROL} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MarkHeart() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="50" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="40" fontWeight="400" fill={PETROL}>VB</text>
      <path d="M50,80 C50,80 38,72 38,64 C38,59 41.5,57 44,57 C46.5,57 49,59 50,62 C51,59 53.5,57 56,57 C58.5,57 62,59 62,64 C62,72 50,80 50,80 Z" fill={CLAY} />
    </svg>
  )
}

function MarkHills() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M5,68 Q22,52 38,60 Q56,42 72,55 Q88,46 95,58 L95,80 L5,80 Z" fill={CLAY} opacity="0.7" />
      <path d="M5,68 Q22,52 38,60 Q56,42 72,55 Q88,46 95,58" fill="none" stroke={PETROL} strokeWidth="1.3" />
      <text x="50" y="38" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="28" fontWeight="500" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkDoor() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M28,90 L28,32 Q28,16 50,16 Q72,16 72,32 L72,90" fill="none" stroke={PETROL} strokeWidth="2" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="22" fontWeight="500" fill={PETROL}>VB</text>
      <circle cx="62" cy="56" r="1.5" fill={CLAY} />
    </svg>
  )
}

function MarkScript() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="50" y="68" textAnchor="middle" fontFamily="'Brush Script MT', cursive" fontStyle="italic" fontSize="56" fontWeight="400" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkAmpersand() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="22" y="66" fontFamily="Fraunces, serif" fontSize="42" fill={PETROL}>V</text>
      <text x="42" y="58" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="22" fill={CLAY}>&amp;</text>
      <text x="56" y="66" fontFamily="Fraunces, serif" fontSize="42" fill={PETROL}>B</text>
    </svg>
  )
}

function MarkLineLogo() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <line x1="14" y1="50" x2="38" y2="50" stroke={CLAY} strokeWidth="1" />
      <text x="50" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="32" fontWeight="400" fill={PETROL}>VB</text>
      <line x1="62" y1="50" x2="86" y2="50" stroke={CLAY} strokeWidth="1" />
    </svg>
  )
}

function MarkArch() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <path d="M20,86 L20,40 Q20,14 50,14 Q80,14 80,40 L80,86" fill="none" stroke={PETROL} strokeWidth="1.6" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="32" fontWeight="500" fill={PETROL}>VB</text>
    </svg>
  )
}

function MarkBigV() {
  return (
    <svg viewBox="0 0 100 100" className="size-14">
      <text x="50" y="74" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="92" fontWeight="300" fill={PETROL}>B</text>
    </svg>
  )
}

/* ---------- Variant-wrappers (mark + tekst) ---------- */

type VariantProps = {
  n: number
  title: string
  bg?: string
  text?: string
  subColor?: string
  mark: React.ReactNode
  inline?: boolean // mark + tekst horizontaal
  stacked?: boolean // mark boven tekst
  showSub?: boolean
}

function Variant({ n, title, bg = 'var(--color-paper)', text = INK, subColor = CLAY, mark, inline = true, stacked = false, showSub = true }: VariantProps) {
  return (
    <div className="group flex flex-col">
      <div
        className="flex items-center justify-center p-10 min-h-[200px] transition-shadow group-hover:shadow-lg"
        style={{ background: bg }}
      >
        <div className={stacked ? 'flex flex-col items-center gap-3' : inline ? 'flex items-center gap-4' : 'flex flex-col items-start gap-1'}>
          {mark}
          <div className={stacked ? 'text-center' : 'flex flex-col leading-tight'}>
            {showSub && (
              <span
                className="text-[0.55rem] uppercase tracking-[0.22em] font-medium"
                style={{ color: subColor }}
              >
                Sinds 2008 · Vlaamse Ardennen
              </span>
            )}
            <span
              className={`${stacked ? 'mt-1 text-2xl' : 'mt-1 text-xl md:text-2xl'} tracking-tight`}
              style={{ fontFamily: 'var(--font-display)', color: text }}
            >
              Vastgoed Browaeys
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="eyebrow">{String(n).padStart(2, '0')}</span>
        <span className="text-sm" style={{ color: 'var(--color-mute)' }}>{title}</span>
      </div>
    </div>
  )
}

/* ---------- Pagina ---------- */

export default function LogoOptiesPage() {
  return (
    <main style={{ background: 'var(--color-paper-2)' }} className="min-h-screen">
      <div className="container-px mx-auto max-w-7xl py-16 md:py-20">
        <div className="mb-12">
          <Link href="/" className="link-underline text-sm" style={{ color: 'var(--color-mute)' }}>
            ← Terug naar home
          </Link>
          <h1 className="mt-4 text-4xl md:text-5xl">Logo-opties</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-mute)]">
            Twintig herwerkingen van het Vastgoed Browaeys-logo. VB-monogram telkens vóór de
            naam, met variërend karakter — van klassiek serif tot speels en symbolisch.
          </p>
        </div>

        {/* === OFFICIEEL LOGO — horizontaal (in gebruik) === */}
        <div
          className="mb-8 p-10 md:p-14"
          style={{
            background: 'var(--color-paper)',
            border: '2px solid var(--color-accent)',
          }}
        >
          <p className="eyebrow mb-4" style={{ color: 'var(--color-accent)' }}>Officieel logo · horizontaal · in gebruik</p>
          <h2 className="text-2xl md:text-3xl mb-8">Vastgoed Browaeys — VB-mark links, naam rechts</h2>

          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="flex flex-col items-center text-center">
              <BrandLogo height={72} />
              <p className="mt-6 text-xs uppercase tracking-widest" style={{ color: 'var(--color-mute)' }}>
                Groot · op paper
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BrandLogo height={44} />
              <p className="mt-6 text-xs uppercase tracking-widest" style={{ color: 'var(--color-mute)' }}>
                Header-formaat (44 px)
              </p>
            </div>
            <div
              className="flex flex-col items-center justify-center p-8 text-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <BrandLogo height={52} />
              <p className="mt-6 text-xs uppercase tracking-widest" style={{ color: 'var(--color-clay)' }}>
                Op petrol-achtergrond
              </p>
            </div>
          </div>

          <p className="mt-10 text-sm text-[var(--color-mute)] max-w-2xl leading-relaxed">
            Geknipt uit het originele Zabun-PNG in twee delen: monogram (180×175) en tekst-blok (400×107),
            transparante achtergrond. Voor scherpere weergave op zeer grote schermen is nog steeds een
            <span className="font-medium text-[var(--color-ink)]"> SVG of vector-bestand </span>
            van Stefanie de beste optie.
          </p>
        </div>

        {/* === OOK: het volledige vertikale logo === */}
        <div
          className="mb-12 p-10"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
        >
          <p className="eyebrow mb-3" style={{ color: 'var(--color-clay-dark)' }}>Alternatief — origineel vertikaal</p>
          <h2 className="text-xl md:text-2xl mb-6">Volledige originele PNG (zoals het was bij Zabun)</h2>
          <div className="flex flex-wrap items-end gap-12">
            <img src="/brand/logo-origineel.png" alt="Vastgoed Browaeys volledig" style={{ height: '120px', width: 'auto' }} />
            <img src="/brand/logo-origineel.png" alt="" style={{ height: '72px', width: 'auto' }} />
          </div>
        </div>

        {/* === Alternatief: Fraunces-typografische reconstructie === */}
        <div
          className="mb-16 p-10 md:p-14"
          style={{
            background: 'var(--color-paper)',
            border: '1px solid var(--color-line)',
          }}
        >
          <p className="eyebrow mb-4" style={{ color: 'var(--color-clay-dark)' }}>Alternatief — typografische reconstructie</p>
          <h2 className="text-2xl md:text-3xl mb-8">VB-overlap in Fraunces-italic</h2>

          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="flex flex-col items-center text-center">
              <VBMonogram size="6rem" />
              <p className="mt-6 text-xs uppercase tracking-widest" style={{ color: 'var(--color-mute)' }}>
                Solo · vector (CSS)
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <VBMonogram size="3.2rem" />
              <span className="flex flex-col leading-none">
                <span className="text-[0.6rem] uppercase tracking-[0.22em] font-medium" style={{ color: 'var(--color-clay-dark)' }}>
                  Sinds 2008
                </span>
                <span className="mt-1.5 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Vastgoed Browaeys
                </span>
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center p-8 text-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <VBMonogram size="4rem" primary="var(--color-paper)" secondary="var(--color-clay)" />
              <p className="mt-4 text-xs uppercase tracking-widest" style={{ color: 'var(--color-clay)' }}>
                Inverse op petrol
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl mb-2">Andere richtingen ter referentie</h2>
        <p className="text-sm mb-10" style={{ color: 'var(--color-mute)' }}>
          Voor het geval je later toch een andere kant op wilt.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Variant n={1}  title="Cirkel-monogram, dunne lijn"        mark={<MarkCircleVB />} />
          <Variant n={2}  title="VB-overlap (clay V + petrol B)"    mark={<MarkOverlap />} />
          <Variant n={3}  title="Lowercase 'vb' met punt"            mark={<MarkDot />} />
          <Variant n={4}  title="V | B met scheidingslijn"            mark={<MarkBar />} />
          <Variant n={5}  title="VB met onderlijn-streep"             mark={<MarkUnderline />} />
          <Variant n={6}  title="Massief petrol-vierkant"             mark={<MarkSquare />} />
          <Variant n={7}  title="Vierkant outline, klassiek"         mark={<MarkSquareOutline />} />
          <Variant n={8}  title="Wax-zegel — 'Est 2008'"             bg="var(--color-paper)" mark={<MarkSeal />} />
          <Variant n={9}  title="Crest/schild-vorm"                  mark={<MarkCrest />} />
          <Variant n={10} title="Dak-silhouet boven VB"              mark={<MarkRoof />} />
          <Variant n={11} title="Huissilhouet rond VB"               mark={<MarkHouse />} />
          <Variant n={12} title="Sleutel-icoon"                       mark={<MarkKey />} />
          <Variant n={13} title="VB + klein clay-hartje"             mark={<MarkHeart />} />
          <Variant n={14} title="Heuvels — Vlaamse Ardennen"         mark={<MarkHills />} />
          <Variant n={15} title="Boogvormige deur-omtrek"            mark={<MarkDoor />} />
          <Variant n={16} title="Handgeschreven script"              mark={<MarkScript />} />
          <Variant n={17} title="V & B met ampersand"                mark={<MarkAmpersand />} />
          <Variant n={18} title="VB tussen clay-lijntjes"            mark={<MarkLineLogo />} />
          <Variant n={19} title="Arch — gewelfde poort"              mark={<MarkArch />} />
          <Variant n={20} title="Solo 'B' in groot serif"             mark={<MarkBigV />} />
        </div>

        {/* === Voorbeeld op donker petrol === */}
        <div className="mt-20">
          <h2 className="text-2xl mb-6">Voorbeeld op petrol-achtergrond</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-mute)' }}>
            Zo zou het logo eruitzien op de filosofie-sectie of footer (donkere variant).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Variant n={1}  title="Cirkel op petrol"   bg={PETROL} text="var(--color-paper)" subColor={CLAY} mark={<svg viewBox="0 0 100 100" className="size-14"><circle cx="50" cy="50" r="46" fill="none" stroke={CLAY} strokeWidth="1.5" /><text x="50" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="38" fill={CLAY}>VB</text></svg>} />
            <Variant n={6}  title="Vierkant op petrol" bg={PETROL} text="var(--color-paper)" subColor={CLAY} mark={<svg viewBox="0 0 100 100" className="size-14"><rect x="6" y="6" width="88" height="88" fill={CLAY} /><text x="50" y="68" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="44" fill={PETROL}>VB</text></svg>} />
            <Variant n={8}  title="Zegel op petrol"    bg={PETROL} text="var(--color-paper)" subColor={CLAY} mark={<svg viewBox="0 0 100 100" className="size-14"><circle cx="50" cy="50" r="46" fill={CLAY} /><text x="50" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="32" fill={PETROL}>VB</text><text x="50" y="78" textAnchor="middle" fontFamily="Montserrat" fontSize="6" fontWeight="600" fill={PETROL} letterSpacing="2">EST 2008</text></svg>} />
          </div>
        </div>
      </div>
    </main>
  )
}
