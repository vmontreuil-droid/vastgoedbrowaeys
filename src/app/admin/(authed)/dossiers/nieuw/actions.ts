'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang — alleen beheerders.')
  }
}

export type DossierActionResult =
  | { ok: true; id: string; message?: string }
  | { ok: false; error: string }

export async function createDossierAction(formData: FormData): Promise<DossierActionResult> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const clientId = String(formData.get('client_id') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim()
  const status = String(formData.get('status') ?? 'open').trim()
  const propertyAddress = String(formData.get('property_address') ?? '').trim()
  const propertyZip = String(formData.get('property_zip') ?? '').trim()
  const propertyCity = String(formData.get('property_city') ?? '').trim()
  const propertyType = String(formData.get('property_type') ?? '').trim()
  const askingPriceRaw = String(formData.get('asking_price') ?? '').trim()
  const reference = String(formData.get('reference') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  if (!clientId) return { ok: false, error: 'Klant is verplicht.' }
  if (!['verkoop', 'verhuur', 'koop_zoeker', 'huur_zoeker'].includes(type)) {
    return { ok: false, error: 'Type is verplicht.' }
  }
  const allowedStatuses = ['open', 'in_behandeling', 'onder_optie', 'verkocht', 'verhuurd', 'geannuleerd']
  if (!allowedStatuses.includes(status)) {
    return { ok: false, error: 'Status is ongeldig.' }
  }

  const askingPrice = askingPriceRaw
    ? parseFloat(askingPriceRaw.replace(/[\s\.]/g, '').replace(',', '.'))
    : null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dossiers')
    .insert({
      client_id: clientId,
      type,
      status,
      property_address: propertyAddress || null,
      property_zip: propertyZip || null,
      property_city: propertyCity || null,
      property_type: propertyType || null,
      asking_price: askingPrice,
      reference: reference || null,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: `Aanmaken mislukt: ${error?.message ?? 'onbekende fout'}` }
  }

  revalidatePath('/admin/dossiers')
  redirect('/admin/dossiers?created=1')
}
