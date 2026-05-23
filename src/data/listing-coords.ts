// Geocoded lat/lng per pand-ID via Nominatim (OpenStreetMap).
// Bron-data: src/data/listing-coords.json — gegenereerd door scripts/geocode-listings.ps1
//
// Twee panden delen exact dezelfde coordinaten (4078690 en 4288662 staan
// allebei op "Oude Steenweg 11, Geraardsbergen") — komt uit de Zabun-data zelf.

import coordsJson from './listing-coords.json'

export type Coords = { lat: number; lng: number; resolved?: string }

export const LISTING_COORDS: Record<string, Coords> = coordsJson as Record<string, Coords>
