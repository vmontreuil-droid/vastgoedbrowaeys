'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getListings, type Listing } from '@/lib/listings'
import { slugify } from '@/lib/listings-db'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
}

export type ImportResult =
  | { ok: true; imported: number; skipped: number; total: number; message: string }
  | { ok: false; error: string }

/**
 * Importeert alle JSON-panden uit src/data/listings-data.json naar
 * public.listings. Idempotent: bestaande rijen worden overgeslagen
 * (op id-conflict). Foto-URLs blijven naar de oude /public/listings/{id}/
 * paden wijzen — Stefanie kan ze daarna één per één in de uploader vervangen.
 */
export async function importLegacyListingsAction(): Promise<ImportResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const all = getListings()
  if (all.length === 0) {
    return { ok: true, imported: 0, skipped: 0, total: 0, message: 'Geen JSON-panden gevonden.' }
  }

  const admin = createAdminClient()

  // Welke ID's bestaan al in DB?
  const { data: existing, error: existingErr } = await admin
    .from('listings')
    .select('id')
    .in('id', all.map((l) => l.id))

  if (existingErr) {
    return { ok: false, error: `Kon bestaande listings niet ophalen: ${existingErr.message}` }
  }
  const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id))

  const rows = all
    .filter((l) => !existingIds.has(l.id))
    .map((l) => mapJsonToDbRow(l))

  if (rows.length === 0) {
    return {
      ok: true,
      imported: 0,
      skipped: all.length,
      total: all.length,
      message: 'Alle JSON-panden zaten al in de DB. Niks geïmporteerd.',
    }
  }

  const { error: insertErr } = await admin.from('listings').insert(rows)
  if (insertErr) {
    return { ok: false, error: `Insert mislukt: ${insertErr.message}` }
  }

  revalidatePath('/admin/aanbod')
  return {
    ok: true,
    imported: rows.length,
    skipped: existingIds.size,
    total: all.length,
    message: `${rows.length} pand(en) geïmporteerd uit de Zabun-snapshot. Je kan ze nu bewerken via "Bewerken".`,
  }
}

function mapJsonToDbRow(l: Listing): Record<string, unknown> {
  return {
    id: l.id,
    ref: l.ref,
    title: l.title,
    slug: slugify(`${l.id}-${l.slug.replace(/^\d+-/, '')}`),
    type: l.type,
    status: l.status === 'verkocht' ? 'verkocht' : l.status,
    street: l.street || null,
    zip: l.zip || null,
    city: l.city,
    price: l.price,
    price_label: l.priceLabel ?? null,
    description: l.description || null,
    cover_photo: l.image || null,
    gallery: l.gallery ?? [],
    fields: l.fields ?? [],
    is_published: true,
    created_at: l.createdAt,
  }
}
