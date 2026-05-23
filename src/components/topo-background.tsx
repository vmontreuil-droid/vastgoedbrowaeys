/**
 * Subtiele topografische hoogtelijnen op de achtergrond — knipoog naar het
 * heuvellandschap van de Vlaamse Ardennen. Fixed-position achter alle content.
 *
 * Bewust laag in opacity (~6%) zodat het niet competeert met de pand-foto's.
 */
export function TopoBackground() {
  const lines = 18
  const width = 1600
  const height = 1000
  const step = height / (lines + 1)

  const paths: string[] = []
  for (let i = 0; i < lines; i++) {
    const baseY = step * (i + 1)
    const phase = i * 0.55
    const ampA = 18 + (i % 4) * 6
    const ampB = 6 + (i % 3) * 3
    const pts: string[] = []
    for (let x = 0; x <= width; x += 32) {
      const y =
        baseY +
        Math.sin(x / 220 + phase) * ampA +
        Math.sin(x / 90 + phase * 1.7) * ampB
      pts.push(`${x.toFixed(0)},${y.toFixed(1)}`)
    }
    paths.push(`M ${pts.join(' L ')}`)
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--color-paper)' }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            opacity={0.05 + (i % 5) * 0.008}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  )
}
