import { createAdminClient } from '@/lib/supabase/admin'

export type ListingDb = {
  id: string
  ref: string | null
  title: string
  slug: string
  type: 'woning' | 'appartement' | 'bouwgrond' | 'handelspand'
  status: 'te-koop' | 'te-huur' | 'optie' | 'verkocht' | 'verhuurd' | 'concept'
  street: string | null
  zip: string | null
  city: string
  price: number
  price_label: string | null
  description: string | null
  cover_photo: string | null
  gallery: string[]
  bedrooms: number | null
  bathrooms: number | null
  living_area: number | null
  plot_area: number | null
  build_year: number | null
  epc_score: string | null
  lat: number | null
  lng: number | null
  fields: unknown
  is_published: boolean
  created_at: string
  updated_at: string
}

export async function getDbListings(): Promise<ListingDb[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[listings-db] fetch error:', error.message)
      return []
    }
    return (data as ListingDb[]) ?? []
  } catch (e) {
    console.warn('[listings-db] exception:', e)
    return []
  }
}

export async function getDbListing(id: string): Promise<ListingDb | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.warn('[listings-db] get error:', error.message)
      return null
    }
    return data as ListingDb
  } catch (e) {
    console.warn('[listings-db] exception:', e)
    return null
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
