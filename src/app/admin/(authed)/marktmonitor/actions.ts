'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseListingUrl } from '@/lib/market-lead-parser'
import type { MarketLeadStatus } from '@/lib/admin-db'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type MarketLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function addMarketLeadByUrlAction(rawUrl: string): Promise<MarketLeadResult> {
  let user
  try { user = await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const url = rawUrl.trim()
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, error: 'Plak een volledige URL (begint met http:// of https://).' }
  }

  // Check op duplicaten
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('market_leads')
    .select('id')
    .eq('source_url', url)
    .limit(1)
  if (existing && existing.length > 0) {
    return { ok: false, error: 'Deze URL staat al in de marktmonitor.' }
  }

  const parsed = await parseListingUrl(url)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }

  const { data, error } = await admin
    .from('market_leads')
    .insert({
      source_url: url,
      source_site: parsed.data.sourceSite,
      title: parsed.data.title,
      street: parsed.data.street,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      price: parsed.data.price,
      property_type: parsed.data.propertyType,
      listing_type: parsed.data.listingType,
      image_url: parsed.data.imageUrl,
      is_particulier: parsed.data.isParticulier,
      agent_name: parsed.data.agentName,
      status: 'prospect',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/marktmonitor')
  return { ok: true, id: (data as { id: string }).id }
}

export type SimpleResult = { ok: boolean; error?: string }

export async function updateMarketLeadStatusAction(
  id: string,
  status: MarketLeadStatus,
): Promise<SimpleResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const update: { status: MarketLeadStatus; contacted_at?: string | null; updated_at: string } = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'benaderd') {
    update.contacted_at = new Date().toISOString()
  }
  const { error } = await admin.from('market_leads').update(update).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/marktmonitor')
  revalidatePath(`/admin/marktmonitor/${id}`)
  return { ok: true }
}

export async function updateMarketLeadNotesAction(id: string, notes: string): Promise<SimpleResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('market_leads')
    .update({ notes: notes.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/marktmonitor/${id}`)
  return { ok: true }
}

export async function deleteMarketLeadAction(id: string): Promise<SimpleResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  const admin = createAdminClient()
  const { error } = await admin.from('market_leads').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/marktmonitor')
  return { ok: true }
}

export type BulkLeadResult = { ok: boolean; updated: number; error?: string }

export async function bulkUpdateMarketLeadStatusAction(
  ids: string[],
  status: MarketLeadStatus,
): Promise<BulkLeadResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, updated: 0, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  if (ids.length === 0) return { ok: false, updated: 0, error: 'Geen leads geselecteerd.' }

  const admin = createAdminClient()
  const update: { status: MarketLeadStatus; contacted_at?: string; updated_at: string } = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'benaderd') {
    update.contacted_at = new Date().toISOString()
  }
  const { error, count } = await admin
    .from('market_leads')
    .update(update, { count: 'exact' })
    .in('id', ids)
  if (error) return { ok: false, updated: 0, error: error.message }

  revalidatePath('/admin/marktmonitor')
  return { ok: true, updated: count ?? ids.length }
}

export async function bulkDeleteMarketLeadsAction(ids: string[]): Promise<BulkLeadResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, updated: 0, error: e instanceof Error ? e.message : 'Geen toegang' }
  }
  if (ids.length === 0) return { ok: false, updated: 0, error: 'Geen leads geselecteerd.' }

  const admin = createAdminClient()
  const { error, count } = await admin
    .from('market_leads')
    .delete({ count: 'exact' })
    .in('id', ids)
  if (error) return { ok: false, updated: 0, error: error.message }

  revalidatePath('/admin/marktmonitor')
  return { ok: true, updated: count ?? ids.length }
}
