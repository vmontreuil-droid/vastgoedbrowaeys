/**
 * Seed-script: voegt Kimberly, Flore en Thomas toe als admin-users.
 *
 * Gebruik (in projectroot):
 *   node scripts/seed-team.mjs
 *
 * Vereist NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Idempotent: skipt werknemers die al admin zijn (via list_admin_users RPC).
 * Genereert random initiële wachtwoorden — print ze ALLEEN op stdout zodat
 * je ze veilig kan communiceren. Elke werknemer kan ze daarna zelf wijzigen
 * via /admin/team → Bewerken.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

// .env.local manueel inlezen (geen dotenv-dep nodig)
try {
  const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local mag ontbreken — vars kunnen ook al in environment staan
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan (of als env-vars).')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEAM = [
  {
    email: 'kimberly@vastgoedbrowaeys.be',
    firstName: 'Kimberly',
    lastName: 'Van Gansbeke',
    title: 'Administratief medewerker',
    phone: '055/59 50 10',
  },
  {
    email: 'flore@vastgoedbrowaeys.be',
    firstName: 'Flore',
    lastName: 'Vanlierde',
    title: 'Stagiair vastgoedmakelaar',
    phone: '055/59 50 10',
    bivNumber: '519.829',
  },
  {
    email: 'thomas@vastgoedbrowaeys.be',
    firstName: 'Thomas',
    lastName: 'Lemmens',
    title: 'Administratief medewerker',
    phone: '055/59 50 10',
  },
]

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = randomBytes(14)
  let out = ''
  for (let i = 0; i < 14; i++) out += chars[bytes[i] % chars.length]
  return out
}

async function getExistingAdminEmails() {
  const { data, error } = await admin.rpc('list_admin_users')
  if (error) {
    console.warn(`Kon list_admin_users RPC niet aanroepen (${error.message}). Idempotency-check overgeslagen.`)
    return new Set()
  }
  return new Set(
    (data ?? [])
      .map((r) => r.email?.toLowerCase())
      .filter(Boolean),
  )
}

async function createAdmin(u, password) {
  const metadata = {
    role: 'admin',
    first_name: u.firstName,
    last_name: u.lastName,
    title: u.title,
    phone: u.phone,
  }
  if (u.bivNumber) metadata.biv_number = u.bivNumber

  const { error } = await admin.auth.admin.createUser({
    email: u.email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

async function main() {
  console.log('Bestaande admin-users ophalen via RPC…')
  const existing = await getExistingAdminEmails()
  console.log(`  ${existing.size} bestaande admin(s) gevonden.\n`)

  const results = []

  for (const u of TEAM) {
    const key = u.email.toLowerCase()
    if (existing.has(key)) {
      console.log(`SKIP  ${u.firstName} ${u.lastName} (${u.email}) — al admin`)
      results.push({ email: u.email, status: 'skipped' })
      continue
    }

    const password = generatePassword()
    const res = await createAdmin(u, password)
    if (res.ok) {
      console.log(`OK    ${u.firstName} ${u.lastName} (${u.email}) — aangemaakt`)
      results.push({ email: u.email, status: 'created', password })
    } else {
      console.log(`FAIL  ${u.firstName} ${u.lastName} (${u.email}) — ${res.error}`)
      results.push({ email: u.email, status: 'failed', error: res.error })
    }
  }

  const created = results.filter((r) => r.status === 'created')
  if (created.length > 0) {
    console.log('\n─────────────────────────────────────────')
    console.log('  Initiële wachtwoorden (bewaar veilig!)')
    console.log('─────────────────────────────────────────')
    for (const r of created) {
      console.log(`  ${r.email.padEnd(40)} ${r.password}`)
    }
    console.log('\n  Communiceer deze via een veilig kanaal.')
    console.log('  Elke werknemer kan ze wijzigen via /admin/team → Bewerken.')
  }

  const failed = results.filter((r) => r.status === 'failed')
  if (failed.length > 0) {
    console.log('\nMislukt:')
    for (const r of failed) console.log(`  ${r.email}: ${r.error}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Fataal:', e)
  process.exit(1)
})
