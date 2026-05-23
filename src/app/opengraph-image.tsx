import { ImageResponse } from 'next/og'

// Open Graph image — getoond wanneer iemand een link deelt op
// Facebook, WhatsApp, LinkedIn, Slack, etc.
// 1200×630 is de Facebook/X standaard.

export const alt = 'Vastgoed Browaeys — Bemiddelen in vastgoed, vanuit het hart'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #faf8f4 0%, #f3efe7 50%, #ecdfcc 100%)',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Header: VB monogram + naam */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          {/* VB monogram — pure JSX (satori ondersteunt geen <text> in SVG) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 0.85 }}>
            <span
              style={{
                fontSize: 110,
                fontStyle: 'italic',
                color: '#20a09f',
                fontWeight: 300,
              }}
            >
              V
            </span>
            <span
              style={{
                fontSize: 125,
                fontStyle: 'italic',
                color: '#0b4f58',
                fontWeight: 700,
                marginLeft: -44,
              }}
            >
              B
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 16, paddingBottom: 10 }}>
            <span
              style={{
                fontSize: 18,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: '#8c6b2e',
                fontWeight: 600,
                fontFamily: 'sans-serif',
              }}
            >
              Sinds 2008 · Vlaamse Ardennen
            </span>
            <span
              style={{
                fontSize: 52,
                color: '#1a1a1a',
                marginTop: 6,
              }}
            >
              Vastgoed Browaeys
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Main tagline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 86,
              color: '#1a1a1a',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
            }}
          >
            Bemiddelen in vastgoed,
          </span>
          <span
            style={{
              fontSize: 92,
              color: '#0b4f58',
              fontStyle: 'italic',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              marginTop: 4,
            }}
          >
            vanuit het hart.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(140, 107, 46, 0.25)',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: 26, color: '#6b6b6b' }}>
            vastgoedbrowaeys.be
          </span>
          <span
            style={{
              fontSize: 20,
              color: '#8c6b2e',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            BIV 504.553 · Horebeke
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
