import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Tijdelijke setup-endpoint om een agent-wachtwoord te resetten via de
// officiële Supabase Admin API. Omzeilt bcrypt-mismatch issues bij directe
// SQL update van auth.users.
//
// ⚠️ Whitelist van toegelaten e-mails zodat dit niet misbruikt kan worden
// om willekeurige accounts over te nemen.

const ALLOWED_EMAILS = [
  'info@studio-vm.be',
  'info@vastgoedbrowaeys.be',
]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { email, password, first_name, last_name } = body as {
      email?: string
      password?: string
      first_name?: string
      last_name?: string
    }

    if (!email || !ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Email not in allowlist. Allowed: ' + ALLOWED_EMAILS.join(', ') },
        { status: 403 },
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    // Zoek de user
    const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers()
    if (listErr) {
      return NextResponse.json({ error: 'listUsers: ' + listErr.message }, { status: 500 })
    }
    let user = usersData.users.find((u) => u.email === email)
    let action: 'created' | 'updated' = 'updated'

    // user_metadata bouwen — rol + naam komen IN het JWT, dus geen DB-query
    // nodig voor auth-checks. Bypassed PostgREST schema-cache issues volledig.
    const userMetadata: Record<string, unknown> = { role: 'admin' }
    if (first_name?.trim()) userMetadata.first_name = first_name.trim()
    if (last_name?.trim()) userMetadata.last_name = last_name.trim()

    if (!user) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      })
      if (createErr || !created.user) {
        return NextResponse.json(
          { error: 'createUser: ' + (createErr?.message || 'unknown error') },
          { status: 500 },
        )
      }
      user = created.user
      action = 'created'
    } else {
      // Bestaande user → password resetten + email bevestigen + metadata mergen
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password,
          email_confirm: true,
          user_metadata: { ...(user.user_metadata || {}), ...userMetadata },
        },
      )
      if (updateErr) {
        return NextResponse.json({ error: 'updateUser: ' + updateErr.message }, { status: 500 })
      }
      if (updated.user) user = updated.user
    }

    // Profiel-upsert is optioneel: handig voor klantenlijst/dossier-flows,
    // maar de auth-flow zelf hangt er niet meer van af. Faalt ie (bv. door
    // PostgREST schema cache), no-op'en we ipv 500'en.
    const profilePatch: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      role: 'admin',
    }
    if (first_name?.trim()) profilePatch.first_name = first_name.trim()
    if (last_name?.trim()) profilePatch.last_name = last_name.trim()

    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(profilePatch, { onConflict: 'id' })

    return NextResponse.json({
      ok: true,
      message: `User ${action} + email confirmed + role=admin in user_metadata`,
      action,
      user_id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      profile_upsert_warning: upsertErr?.message || null,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
