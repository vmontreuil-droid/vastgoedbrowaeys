type Props = {
  /** font-size van de B (bepaalt schaal van het hele monogram). Default 2.2rem */
  size?: string | number
  /** Kleur van de B (donker). Default petrol. */
  primary?: string
  /** Kleur van de V (lichter). Default lighter teal. */
  secondary?: string
  className?: string
  /** Voor a11y — als het monogram dienst doet als titel, expliciet label. */
  label?: string
}

/**
 * Herwerkt VB-monogram in Fraunces-italic.
 * — V in lichter teal (dunner, secondary)
 * — B in petrol (zwaarder, primary)
 * — Letters overlappen mooi (B-stam kruist achter de V's diagonaal)
 *
 * HTML/CSS based zodat het meedraait met de Fraunces next/font-loading
 * en perfect schaalt via font-size.
 */
export function VBMonogram({
  size = '2.4rem',
  primary,
  secondary,
  className,
  label = 'Vastgoed Browaeys',
}: Props) {
  const p = primary ?? 'var(--color-accent)'
  const s = secondary ?? 'var(--color-accent-light)'

  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        lineHeight: 0.85,
        fontSize: typeof size === 'number' ? `${size}px` : size,
        userSelect: 'none',
      }}
    >
      {/* V — lichter teal, lichter gewicht, iets kleiner */}
      <span
        aria-hidden
        style={{
          color: s,
          fontWeight: 300,
          fontSize: '0.92em',
          marginRight: '-0.40em',
          position: 'relative',
          zIndex: 1,
          transform: 'translateY(-0.02em)',
        }}
      >
        V
      </span>
      {/* B — petrol, zwaarder gewicht, dominant */}
      <span
        aria-hidden
        style={{
          color: p,
          fontWeight: 600,
          fontSize: '1.05em',
          position: 'relative',
          zIndex: 2,
        }}
      >
        B
      </span>
    </span>
  )
}
