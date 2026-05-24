import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'

export const metadata = {
  title: 'Admin · Marktmonitor · ScrapingBee',
}

export default function ScrapingbeePage() {
  const enabled = !!process.env.SCRAPINGBEE_API_KEY

  return (
    <div className="container-px mx-auto max-w-2xl py-8 md:py-12">
      <Link
        href="/admin/marktmonitor/bookmarklet"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug
      </Link>

      <section className="mb-6">
        <p className="eyebrow mb-2">Geavanceerd</p>
        <h1 className="text-2xl sm:text-3xl flex items-center gap-3"
          style={{ fontFamily: 'var(--font-display)' }}>
          <Zap className="size-6 shrink-0" style={{ color: 'var(--color-accent)' }} />
          Volautomatische scan
        </h1>
        <p className="mt-3 text-sm text-[var(--color-mute)]">
          Voor wie helemaal niet manueel wil klikken: ScrapingBee activeren zodat de
          dagelijkse cron-scan vanaf de server werkt.
        </p>
      </section>

      <div className="mb-6 p-3 text-sm"
        style={{
          background: enabled ? 'rgba(34,197,94,0.10)' : 'var(--color-paper-2)',
          color: enabled ? '#166534' : 'var(--color-mute)',
        }}>
        <strong>Status: </strong>
        {enabled ? '✓ Actief — server-scan loopt automatisch om 06:00' : 'Niet geactiveerd'}
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Wat is het?
          </h2>
          <p className="text-sm">
            ScrapingBee is een betaalde dienst die surft naar immo-sites met echte huishoudelijke
            IP-adressen, niet vanaf datacenters. Daardoor laat Cloudflare onze server-scan door.
            ~<strong>€49/maand</strong> voor 250.000 calls — ruim voldoende voor 10+ zones dagelijks.
          </p>
        </div>

        <div>
          <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Activeren in 4 stappen
          </h2>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3 p-3"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
              <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>1</span>
              <div>
                Maak een account aan op{' '}
                <a href="https://www.scrapingbee.com/pricing/" target="_blank" rel="noopener" className="link-underline">
                  scrapingbee.com
                </a>. Gratis trial: 1.000 calls om te testen.
              </div>
            </li>
            <li className="flex gap-3 p-3"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
              <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>2</span>
              <div>
                Kopieer in je ScrapingBee-dashboard de <strong>API Key</strong> (~40 tekens).
              </div>
            </li>
            <li className="flex gap-3 p-3"
              style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
              <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>3</span>
              <div>
                Ga naar{' '}
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener" className="link-underline">
                  vercel.com/dashboard
                </a>{' '}
                → project <em>vastgoedbrowaeys</em> → <strong>Settings → Environment Variables</strong>.
                Voeg een nieuwe variabele toe:
                <div className="mt-2 p-2 text-xs font-mono"
                  style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>
                  Name: <strong>SCRAPINGBEE_API_KEY</strong>
                  <br />
                  Value: jouw API-key
                </div>
              </div>
            </li>
            <li className="flex gap-3 p-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="inline-flex size-7 items-center justify-center text-sm font-medium shrink-0"
                style={{ background: '#16a34a', color: '#fff' }}>4</span>
              <div>
                Wacht ~1 min op de auto-deploy van Vercel. Daarna is bovenstaande status groen
                en zal de scan automatisch werken.
              </div>
            </li>
          </ol>
        </div>

        <div className="p-3 text-xs"
          style={{ background: 'rgba(11,79,88,0.06)', borderLeft: '3px solid var(--color-accent)' }}>
          <p className="font-medium mb-1">💡 Bookmarklet of ScrapingBee?</p>
          <p className="text-[var(--color-mute)]">
            De bookmarklet is gratis en werkt voor losse vondsten. ScrapingBee loont als je
            elke ochtend automatisch een overzicht wil zonder zelf te moeten klikken. Beide
            combineren mag — de cron doet de dagelijkse sweep, jij gebruikt de bookmark voor
            tussendoor.
          </p>
        </div>
      </section>
    </div>
  )
}
