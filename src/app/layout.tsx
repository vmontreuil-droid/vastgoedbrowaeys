import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  axes: ['SOFT', 'WONK'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Vastgoed Browaeys — Bemiddelen vanuit het hart, in de Vlaamse Ardennen',
    template: '%s — Vastgoed Browaeys',
  },
  description:
    'Persoonlijke vastgoedbemiddeling in de Vlaamse Ardennen — verkoop, verhuur en projectontwikkeling. Stefanie Browaeys, BIV 504.553.',
  metadataBase: new URL('https://vastgoedbrowaeys.be'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
