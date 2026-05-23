import Image from 'next/image'

type Props = {
  /** Hoogte van het VB-monogram in pixels (default 44). */
  height?: number
  /** Hoogte van het tekst-blok. Default = `height` (zelfde formaat). Zet 0 om tekst te verbergen. */
  textHeight?: number
  /** Gap tussen monogram en tekst (default 14). */
  gap?: number
  className?: string
  priority?: boolean
}

// Native dimensies van de geknipte PNG-onderdelen
const VB_W = 180
const VB_H = 175
const TXT_W = 400
const TXT_H = 107

/**
 * Officieel Vastgoed Browaeys-logo, horizontaal opgesteld:
 *   [VB-monogram]   [VastgoedBrowaeys + tagline]
 *
 * Geknipt uit het originele Zabun-PNG. Beide delen blijven losse PNG's
 * met transparante achtergrond, zodat ze flexibel inzetbaar zijn —
 * monogram solo (logo-vb.png) of het volledig vertikale logo
 * (logo-origineel.png).
 */
export function BrandLogo({
  height = 44,
  textHeight,
  gap = 14,
  className,
  priority = false,
}: Props) {
  const vbWidth = Math.round((height / VB_H) * VB_W)
  const tH = textHeight ?? height
  const tWidth = Math.round((tH / TXT_H) * TXT_W)
  const showText = tH > 0

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, lineHeight: 0 }}
    >
      <Image
        src="/brand/logo-vb.png"
        alt="Vastgoed Browaeys"
        width={vbWidth}
        height={height}
        priority={priority}
      />
      {showText && (
        <Image
          src="/brand/logo-tekst.png"
          alt=""
          aria-hidden
          width={tWidth}
          height={tH}
          priority={priority}
        />
      )}
    </span>
  )
}
