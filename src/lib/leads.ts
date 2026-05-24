'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type CreateLeadInput = {
  fromName: string
  fromEmail: string
  fromPhone?: string | null
  subject: string
  body: string
  type: 'lead' | 'schatting' | 'vraag' | 'visit_request' | 'algemeen'
  relatedListing?: string | null
  source?: string | null
}

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

/**
 * Centrale "schrijf een lead naar de DB" — gebruikt door alle publieke
 * formulieren (gratis-schatting, contact, hou-me-op-de-hoogte, vraag-info).
 *
 * Gebruikt admin client (service-role) zodat het werkt zonder dat de bezoeker
 * een authenticatie-laag nodig heeft. De RLS-policy op leads laat anon/auth
 * sowieso enkel INSERT toe — perfect voor publieke forms.
 */
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const name = (input.fromName || '').trim()
  const email = (input.fromEmail || '').trim().toLowerCase()
  const subject = (input.subject || '').trim() || '(geen onderwerp)'
  const body = (input.body || '').trim()

  if (!name) return { ok: false, error: 'Naam is verplicht.' }
  if (!email || !email.includes('@')) return { ok: false, error: 'Geldig e-mailadres is verplicht.' }
  if (!body) return { ok: false, error: 'Bericht mag niet leeg zijn.' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('leads')
    .insert({
      from_name: name,
      from_email: email,
      from_phone: input.fromPhone?.trim() || null,
      subject,
      body,
      type: input.type,
      related_listing: input.relatedListing?.trim() || null,
      source: input.source?.trim() || null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Onbekende fout bij opslaan.' }
  }

  return { ok: true, id: (data as { id: string }).id }
}
