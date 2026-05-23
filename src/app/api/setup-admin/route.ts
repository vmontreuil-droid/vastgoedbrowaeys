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

    const { email, password } = body as { email?: string; password?: string }

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

    if (!user) {
      // User bestaat niet → aanmaken via officiële Admin API
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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
      // User bestaat → password resetten + email bevestigen
      const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
      })
      if (updateErr) {
        return NextResponse.json({ error: 'updateUser: ' + updateErr.message }, { status: 500 })
      }
    }

    // Promoot naar agent in profiles (trigger maakt rij aan bij create, maar voor de zekerheid upsert)
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role: 'agent' })
      .eq('id', user.id)
    if (profileErr) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        role: 'agent',
      })
    }

    return NextResponse.json({
      ok: true,
      message: `User ${action} + email confirmed + role=agent set`,
      action,
      user_id: user.id,
      email: user.email,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
