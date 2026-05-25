import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

/**
 * Server-side gegenereerde QR-code als inline SVG. Geen client-side JS,
 * geen externe afhankelijkheden, perfect printbaar voor flyers en
 * ramen-affiches.
 */
export async function PandQR({ url, label }: { url: string; label?: string }) {
  let svg: string
  try {
    svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      width: 280,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1a1a1a',
        light: '#ffffff',
      },
    })
  } catch {
    return null
  }

  // Zorg dat de SVG-afmetingen worden vervangen door responsive width/height
  // (qrcode geeft default 'width=280 height=280' attributen, wat overflow geeft)
  const responsiveSvg = svg.replace(
    /<svg([^>]+)>/,
    '<svg$1 style="width:100%;height:auto;display:block;">',
  )

  return (
    <div
      className="p-5 md:p-6 flex flex-col items-center text-center w-full max-w-[260px]"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <p className="eyebrow text-[0.6rem] mb-4 inline-flex items-center gap-1.5"
        style={{ color: 'var(--color-accent)' }}>
        <QrCode className="size-3" />
        Scan & deel
      </p>
      <div
        className="w-full"
        // Server-side SVG-output is veilig om in te voegen
        dangerouslySetInnerHTML={{ __html: responsiveSvg }}
      />
      <p className="mt-4 text-[0.65rem] text-[var(--color-mute)] leading-relaxed">
        {label ?? 'Scan om deze pagina te openen op je telefoon, of print voor in het raam.'}
      </p>
    </div>
  )
}
