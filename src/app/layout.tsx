import type { Metadata } from 'next'
import { Fraunces, Montserrat } from 'next/font/google'
import { CookieConsent } from '@/components/cookie-consent'
import { TopoBackground } from '@/components/topo-background'
import { ThemeApplier } from '@/components/theme-applier'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  axes: ['SOFT', 'WONK'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Vastgoed Browaeys — Bemiddelen vanuit het hart, in de Vlaamse Ardennen',
    template: '%s — Vastgoed Browaeys',
  },
  description:
    'Persoonlijke vastgoedbemiddeling in de Vlaamse Ardennen — verkoop, verhuur en projectontwikkeling. Stefanie Browaeys, BIV 504.553.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://vastgoedbrowaeys.vercel.app',
  ),
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    siteName: 'Vastgoed Browaeys',
    title: 'Vastgoed Browaeys — Bemiddelen in vastgoed, vanuit het hart',
    description:
      'Persoonlijke vastgoedbemiddeling in de Vlaamse Ardennen — verkoop, verhuur en projectontwikkeling.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vastgoed Browaeys — Bemiddelen vanuit het hart',
    description:
      'Persoonlijke vastgoedbemiddeling in de Vlaamse Ardennen. Stefanie Browaeys, BIV 504.553.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${fraunces.variable} ${montserrat.variable}`}>
      <body>
        <ThemeApplier />
        <TopoBackground />
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
