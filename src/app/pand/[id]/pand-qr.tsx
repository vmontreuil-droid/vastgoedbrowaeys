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

  return (
    <div
      className="p-5 md:p-6 flex flex-col items-center text-center"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
    >
      <p className="eyebrow text-[0.6rem] mb-3 inline-flex items-center gap-1.5">
        <QrCode className="size-3" />
        Scan & deel
      </p>
      <div
        className="w-full max-w-[200px] aspect-square"
        // Server-side SVG-output is veilig om in te voegen
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-3 text-xs text-[var(--color-mute)] max-w-[200px] leading-relaxed">
        {label ?? 'Scan om deze pagina te openen op je telefoon, of print voor in het raam.'}
      </p>
    </div>
  )
}
