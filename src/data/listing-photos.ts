// Foto-mapping per pand-ID.
// Foto's zijn lokaal in /public/listings/{id}/{0..n}.jpg — onafhankelijk
// van Zabun's CDN. Bron-URLs staan in /snapshot-zabun/photo-urls.json
// voor latere referentie.

function photos(id: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/listings/${id}/${i}.jpg`)
}

export const LISTING_PHOTOS: Record<string, string[]> = {
  '4078690': photos('4078690', 4),
  '4210796': photos('4210796', 20),
  '4211572': photos('4211572', 3),
  '4280579': photos('4280579', 3),
  '4288662': photos('4288662', 4),
  '4293093': photos('4293093', 16),
  '4305961': photos('4305961', 15),
  '4332707': photos('4332707', 14),
  '4334037': photos('4334037', 9),
  '4335011': photos('4335011', 16),
  '4340985': photos('4340985', 16),
  '4365674': photos('4365674', 20),
  '4368771': photos('4368771', 1),
}
