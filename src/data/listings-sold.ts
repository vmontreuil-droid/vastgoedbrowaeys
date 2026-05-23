// Verkochte / gerealiseerde panden uit het Zabun-archief (mei 2026).
// Niet klikbaar — alleen als referentie / portfolio.

import rawData from './listings-sold-raw.json'

export type SoldListing = {
  index: number
  image: string        // lokaal pad in /public/sold/
  type: string         // 'Woning' | 'Villa' | 'Appartement' | ...
  epcLabel: string
  description: string
  city: string
}

type RawSold = {
  index: number
  imageUrl: string
  type: string
  epcLabel: string
  description: string
  city: string
}

export const SOLD_LISTINGS: SoldListing[] = (rawData as RawSold[]).map((item) => ({
  index: item.index,
  image: `/sold/${item.index}.jpg`,
  type: item.type || 'Eigendom',
  epcLabel: item.epcLabel || '',
  description: item.description || '',
  city: item.city || '',
}))

export function uniqueSoldCities(): string[] {
  return Array.from(new Set(SOLD_LISTINGS.map((l) => l.city).filter(Boolean))).sort()
}

export function uniqueSoldTypes(): string[] {
  return Array.from(new Set(SOLD_LISTINGS.map((l) => l.type).filter(Boolean))).sort()
}
