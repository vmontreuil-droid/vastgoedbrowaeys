import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * iCalendar feed met alle Vastgoed Browaeys afspraken.
 * URL: /api/ical/<token>.ics waar <token> de ical_token uit user_metadata is.
 *
 * Voor abonnement in Google Calendar / iPhone:
 *  - Apple: Settings → Calendar → Accounts → Add → Other → Add Subscribed Calendar
 *  - Google: calendar.google.com → Other calendars → Add → From URL
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token: rawToken } = await ctx.params
  const token = rawToken.replace(/\.ics$/i, '')
  if (!token || token.length < 16) {
    return new Response('Invalid token', { status: 401 })
  }

  const admin = createAdminClient()

  // Verifieer dat de token bij een admin-gebruiker hoort
  const { data: usersData, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) {
    return new Response('Server error', { status: 500 })
  }
  const admins = (usersData?.users ?? []).filter((u) => u.user_metadata?.role === 'admin')
  const matched = admins.find((u) => (u.user_metadata?.ical_token as string | undefined) === token)
  if (!matched) {
    return new Response('Invalid token', { status: 401 })
  }

  // Haal alle niet-geannuleerde afspraken op
  const { data: appts, error } = await admin
    .from('appointments')
    .select('*')
    .neq('status', 'cancelled')
    .order('appointment_at', { ascending: true })

  if (error) {
    return new Response('Server error: ' + error.message, { status: 500 })
  }

  const rows = (appts ?? []) as Array<{
    id: string; dossier_id: string; title: string; appointment_at: string;
    duration_min: number; location: string | null; notes: string | null;
    status: string;
  }>

  // Resolve dossier-refs en client-namen voor in de event-summary
  const dossierIds = Array.from(new Set(rows.map((r) => r.dossier_id)))
  const dossierMeta = new Map<string, { ref: string | null; clientId: string }>()
  if (dossierIds.length > 0) {
    const { data: dossiers } = await admin
      .from('dossiers')
      .select('id, reference, client_id')
      .in('id', dossierIds)
    for (const d of (dossiers ?? []) as Array<{ id: string; reference: string | null; client_id: string }>) {
      dossierMeta.set(d.id, { ref: d.reference, clientId: d.client_id })
    }
  }
  const clientIds = Array.from(new Set(Array.from(dossierMeta.values()).map((m) => m.clientId)))
  const nameById = new Map<string, string>()
  if (clientIds.length > 0) {
    const { data: profs } = await admin
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', clientIds)
    for (const p of (profs ?? []) as Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>) {
      nameById.set(p.id, [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email)
    }
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vastgoed Browaeys//Admin Feed//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Vastgoed Browaeys — Afspraken',
    'X-WR-TIMEZONE:Europe/Brussels',
    'X-WR-CALDESC:Alle afspraken uit het beheerderspaneel',
  ]

  for (const a of rows) {
    const start = new Date(a.appointment_at)
    const end = new Date(start.getTime() + (a.duration_min || 30) * 60_000)
    const meta = dossierMeta.get(a.dossier_id)
    const clientName = meta ? nameById.get(meta.clientId) ?? '' : ''
    const refLabel = meta?.ref ? `[${meta.ref}] ` : ''
    const summary = `${refLabel}${a.title}${clientName ? ` — ${clientName}` : ''}`
    const description = [
      a.notes,
      clientName ? `Klant: ${clientName}` : null,
      meta?.ref ? `Dossier: ${meta.ref}` : null,
      `Status: ${a.status}`,
    ].filter(Boolean).join('\\n')

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${a.id}@vastgoedbrowaeys`)
    lines.push(`DTSTAMP:${formatIcalDate(new Date())}`)
    lines.push(`DTSTART:${formatIcalDate(start)}`)
    lines.push(`DTEND:${formatIcalDate(end)}`)
    lines.push(`SUMMARY:${escapeIcal(summary)}`)
    if (a.location) lines.push(`LOCATION:${escapeIcal(a.location)}`)
    if (description) lines.push(`DESCRIPTION:${escapeIcal(description)}`)
    if (a.status === 'confirmed') lines.push('STATUS:CONFIRMED')
    else if (a.status === 'completed') lines.push('STATUS:CONFIRMED')
    else lines.push('STATUS:TENTATIVE')
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return new Response(lines.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

function formatIcalDate(d: Date): string {
  // UTC format YYYYMMDDTHHmmssZ
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
