'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scanRegion } from '@/lib/scrapers/scan-engine'
import type { SearchRegion } from '@/lib/scrapers/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type RegionInput = {
  label: string
  postcodes: string[]
  cities: string[]
  listingType: 'verkoop' | 'verhuur' | 'beide'
  minPrice: number | null
  maxPrice: number | null
  propertyTypes: string[]
  enabled: boolean
}

export type RegionResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

function normalize(input: RegionInput): RegionInput {
  return {
    label: input.label.trim().slice(0, 80),
    postcodes: input.postcodes.map((p) => p.trim()).filter((p) => /^[1-9]\d{3}$/.test(p)),
    cities: input.cities.map((c) => c.trim()).filter((c) => c.length > 0 && c.length < 60),
    listingType: input.listingType,
    minPrice: input.minPrice != null && input.minPrice >= 0 ? input.minPrice : null,
    maxPrice: input.maxPrice != null && input.maxPrice > 0 ? input.maxPrice : null,
    propertyTypes: input.propertyTypes,
    enabled: input.enabled,
  }
}

function validate(input: RegionInput): string | null {
  if (!input.label) return 'Naam is verplicht.'
  if (input.postcodes.length === 0 && input.cities.length === 0) {
    return 'Voeg minstens één postcode of gemeente toe.'
  }
  if (input.minPrice && input.maxPrice && input.minPrice > input.maxPrice) {
    return 'Min-prijs is groter dan max-prijs.'
  }
  return null
}

export async function createRegionAction(input: RegionInput): Promise<RegionResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const clean = normalize(input)
  const err = validate(clean)
  if (err) return { ok: false, error: err }

  const admin = createAdminClient()
  const { data, error } = await admin.from('market_search_regions').insert({
    label: clean.label,
    postcodes: clean.postcodes,
    cities: clean.cities,
    listing_type: clean.listingType,
    min_price: clean.minPrice,
    max_price: clean.maxPrice,
    property_types: clean.propertyTypes,
    enabled: clean.enabled,
    created_by: user.id,
  }).select('id').single()
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/marktmonitor/regions')
  return { ok: true, id: (data as { id: string }).id }
}

export async function updateRegionAction(id: string, input: RegionInput): Promise<RegionResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const clean = normalize(input)
  const err = validate(clean)
  if (err) return { ok: false, error: err }

  const admin = createAdminClient()
  const { error } = await admin.from('market_search_regions').update({
    label: clean.label,
    postcodes: clean.postcodes,
    cities: clean.cities,
    listing_type: clean.listingType,
    min_price: clean.minPrice,
    max_price: clean.maxPrice,
    property_types: clean.propertyTypes,
    enabled: clean.enabled,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/marktmonitor/regions')
  return { ok: true, id }
}

export async function deleteRegionAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('market_search_regions').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/marktmonitor/regions')
  return { ok: true }
}

export async function toggleRegionEnabledAction(id: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('market_search_regions')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/marktmonitor/regions')
  return { ok: true }
}

export type ScanNowResult =
  | { ok: true; newLeads: number; mergedLeads: number; perSite: Record<string, { ok: boolean; count: number; error?: string }> }
  | { ok: false; error: string }

export async function scanRegionNowAction(id: string): Promise<ScanNowResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('market_search_regions')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Regio niet gevonden' }

  type Row = {
    id: string; label: string; postcodes: string[] | null; cities: string[] | null;
    listing_type: SearchRegion['listingType']; min_price: number | null; max_price: number | null;
    property_types: string[] | null;
  }
  const r = data as Row
  const region: SearchRegion = {
    id: r.id,
    label: r.label,
    postcodes: r.postcodes ?? [],
    cities: r.cities ?? [],
    listingType: r.listing_type,
    minPrice: r.min_price,
    maxPrice: r.max_price,
    propertyTypes: r.property_types ?? [],
  }

  const report = await scanRegion(region)

  revalidatePath('/admin/marktmonitor')
  revalidatePath('/admin/marktmonitor/regions')

  return {
    ok: true,
    newLeads: report.newLeads,
    mergedLeads: report.mergedLeads,
    perSite: report.perSite,
  }
}
