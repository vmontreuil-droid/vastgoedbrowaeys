/**
 * Pure helpers rond listing-foto's — geen server actions, dus mag ook in
 * client components geïmporteerd worden.
 */

export function extractPathFromUrl(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/listing-photos\/(.+)$/)
  return match?.[1] ?? null
}
