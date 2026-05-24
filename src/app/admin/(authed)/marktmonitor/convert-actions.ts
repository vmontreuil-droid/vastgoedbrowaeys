'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMarketLead } from '@/lib/admin-db'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

export type ConvertResult =
  | { ok: true; listingId: string; importedPhotos: number; failedPhotos: number }
  | { ok: false; error: string }

const BUCKET = 'listing-photos'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'pand'
}

async function uploadImageToBucket(
  imageUrl: string,
  folderKey: string,
  index: number,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VastgoedBrowaeysImporter/1.0)',
      },
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) return null

    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const buffer = await res.arrayBuffer()
    const path = `${folderKey}/${Date.now()}-${index}.${ext}`

    const admin = createAdminClient()
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    })
    if (upErr) return null

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
    return pub.publicUrl
  } catch {
    return null
  }
}

export async function convertLeadToListingAction(leadId: string): Promise<ConvertResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const lead = await getMarketLead(leadId)
  if (!lead) return { ok: false, error: 'Lead niet gevonden' }

  const admin = createAdminClient()

  // Slug + title
  const title = lead.title
    ?? [lead.propertyType, lead.city].filter(Boolean).join(' te ')
    ?? `Pand ${lead.id.slice(0, 8)}`
  const slug = slugify(`${Date.now().toString(36)}-${title}`)
  const folderKey = slug

  // Foto importeren — alleen de cover-foto (1 foto). Andere foto's zou Stefanie
  // zelf moeten toevoegen want auteursrecht.
  let importedPhotos = 0
  let failedPhotos = 0
  let coverUrl: string | null = null
  if (lead.imageUrl) {
    const uploaded = await uploadImageToBucket(lead.imageUrl, folderKey, 0)
    if (uploaded) {
      coverUrl = uploaded
      importedPhotos = 1
    } else {
      failedPhotos = 1
    }
  }

  // Map listing-status: marktlead-status -> listing-status
  const status = lead.listingType === 'verhuur' ? 'te-huur' : 'te-koop'

  const insert: Record<string, unknown> = {
    ref: null,
    title,
    slug,
    type: lead.propertyType?.toLowerCase().includes('appart') ? 'appartement' : 'huis',
    status: 'concept', // start als concept; Stefanie publiceert na review
    street: lead.street,
    zip: lead.postcode,
    city: lead.city ?? 'Onbekend',
    price: lead.price ?? 0,
    price_label: null,
    description: lead.notes,
    cover_photo: coverUrl,
    gallery: coverUrl ? [coverUrl] : [],
    is_published: false,
  }
  // Sla 'status' op als naam (verkoop/verhuur indicatie) — listings.status accepteert te-koop/te-huur
  insert.status = status === 'te-huur' ? 'te-huur' : 'te-koop'

  const { data, error } = await admin.from('listings').insert(insert).select('id').single()
  if (error || !data) {
    return { ok: false, error: `Aanmaken pand mislukt: ${error?.message ?? 'onbekend'}` }
  }
  const listingId = (data as { id: string }).id

  // Markeer de lead als 'klant geworden' + bewaar listing-koppeling in notes
  const newNote = `${lead.notes ? lead.notes + '\n\n' : ''}→ Geconverteerd naar pand-listing op ${new Date().toLocaleDateString('nl-BE')}: /admin/aanbod/${listingId}/bewerken`
  await admin
    .from('market_leads')
    .update({
      status: 'klant',
      notes: newNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  revalidatePath('/admin/marktmonitor')
  revalidatePath('/admin/aanbod')
  revalidatePath(`/admin/marktmonitor/${leadId}`)

  return { ok: true, listingId, importedPhotos, failedPhotos }
}
