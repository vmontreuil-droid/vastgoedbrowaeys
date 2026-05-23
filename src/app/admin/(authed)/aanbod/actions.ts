'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/listings-db'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang — alleen beheerders.')
  }
}

export type ListingActionResult =
  | { ok: true; id: string; message?: string }
  | { ok: false; error: string }

function parseInt0(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  const n = parseInt(s.replace(/[\s\.]/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function parseFloat0(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim().replace(',', '.')
  if (!s) return null
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : null
}

function parsePhotos(v: FormDataEntryValue | null): string[] {
  return String(v ?? '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

type PatchResult =
  | { error: string; patch?: undefined }
  | { error?: undefined; patch: Record<string, unknown> }

function listingPatchFromForm(formData: FormData): PatchResult {
  const title = String(formData.get('title') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim()
  const status = String(formData.get('status') ?? 'te-koop').trim()

  if (!title) return { error: 'Titel is verplicht.' }
  if (!city) return { error: 'Stad is verplicht.' }
  if (!['woning', 'appartement', 'bouwgrond', 'handelspand'].includes(type)) {
    return { error: 'Type is verplicht.' }
  }
  if (!['te-koop', 'te-huur', 'optie', 'verkocht', 'verhuurd', 'concept'].includes(status)) {
    return { error: 'Status is ongeldig.' }
  }

  const gallery = parsePhotos(formData.get('gallery'))
  const explicitCover = String(formData.get('cover_photo') ?? '').trim()
  const cover_photo = explicitCover || gallery[0] || null

  const patch = {
    ref:         String(formData.get('ref') ?? '').trim() || null,
    title,
    slug:        String(formData.get('slug') ?? '').trim() || slugify(title),
    type,
    status,
    street:      String(formData.get('street') ?? '').trim() || null,
    zip:         String(formData.get('zip') ?? '').trim() || null,
    city,
    price:       parseInt0(formData.get('price')) ?? 0,
    price_label: String(formData.get('price_label') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    cover_photo,
    gallery,
    bedrooms:    parseInt0(formData.get('bedrooms')),
    bathrooms:   parseInt0(formData.get('bathrooms')),
    living_area: parseInt0(formData.get('living_area')),
    plot_area:   parseInt0(formData.get('plot_area')),
    build_year:  parseInt0(formData.get('build_year')),
    epc_score:   String(formData.get('epc_score') ?? '').trim() || null,
    lat:         parseFloat0(formData.get('lat')),
    lng:         parseFloat0(formData.get('lng')),
    is_published: formData.get('is_published') === 'on',
  }

  return { patch }
}

export async function createListingAction(formData: FormData): Promise<ListingActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const parsed = listingPatchFromForm(formData)
  if (parsed.error || !parsed.patch) return { ok: false, error: parsed.error ?? 'Ongeldige input.' }
  const patch = parsed.patch

  const admin = createAdminClient()
  const { data, error } = await admin.from('listings').insert(patch).select('id').single()
  if (error || !data) {
    return { ok: false, error: `Aanmaken mislukt: ${error?.message ?? 'onbekende fout'}` }
  }

  revalidatePath('/admin/aanbod')
  return { ok: true, id: (data as { id: string }).id ?? '', message: 'Pand aangemaakt.' }
}

export async function updateListingAction(
  id: string,
  formData: FormData,
): Promise<ListingActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const parsed = listingPatchFromForm(formData)
  if (parsed.error || !parsed.patch) return { ok: false, error: parsed.error ?? 'Ongeldige input.' }
  const patch = parsed.patch

  const admin = createAdminClient()
  const { error } = await admin.from('listings').update(patch).eq('id', id)
  if (error) {
    return { ok: false, error: `Bijwerken mislukt: ${error.message}` }
  }

  revalidatePath('/admin/aanbod')
  revalidatePath(`/admin/aanbod/${id}`)
  return { ok: true, id, message: 'Pand bijgewerkt.' }
}

export async function deleteListingAction(id: string): Promise<ListingActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('listings').delete().eq('id', id)
  if (error) {
    return { ok: false, error: `Verwijderen mislukt: ${error.message}` }
  }

  revalidatePath('/admin/aanbod')
  redirect('/admin/aanbod')
}
