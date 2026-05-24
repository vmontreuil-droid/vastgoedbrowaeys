/**
 * Seed-script: voegt Kimberly, Flore en Thomas toe als admin-users + upload
 * hun portretfoto's uit public/team/. Stefanie wordt ook bediend voor de
 * foto als ze nog geen photo_url heeft.
 *
 * Gebruik (in projectroot):
 *   node scripts/seed-team.mjs
 *
 * Vereist NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Vereist ook de 'team-photos' Storage-bucket (zie SQL in eerdere stap).
 *
 * Idempotent:
 *  - werknemers die al admin zijn worden niet opnieuw aangemaakt
 *  - foto's worden alleen geüpload als photo_url nog ontbreekt
 *
 * Genereert random initiële wachtwoorden voor NIEUWE accounts en print ze
 * op stdout. Werknemers kunnen ze daarna zelf wijzigen.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

// .env.local manueel inlezen
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
  // .env.local mag ontbreken
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten in .env.local staan.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKET = 'team-photos'

const TEAM = [
  {
    email: 'stephanie@vastgoedbrowaeys.be',
    firstName: 'Stephanie',
    lastName: 'Browaeys',
    title: 'Zaakvoerder — Vastgoedmakelaar-bemiddelaar',
    phone: '+32 (0)55 59 50 10',
    bivNumber: '504.553',
    photoFile: 'public/team/stefanie-browaeys.jpg',
    photoMime: 'image/jpeg',
    skipCreate: true, // bestaat al, alleen foto + metadata syncen
  },
  {
    email: 'kimberly@vastgoedbrowaeys.be',
    firstName: 'Kimberly',
    lastName: 'Van Gansbeke',
    title: 'Administratief medewerker',
    phone: '055/59 50 10',
    photoFile: 'public/team/kimberly-van-gansbeke.png',
    photoMime: 'image/png',
  },
  {
    email: 'flore@vastgoedbrowaeys.be',
    firstName: 'Flore',
    lastName: 'Vanlierde',
    title: 'Stagiair vastgoedmakelaar',
    phone: '055/59 50 10',
    bivNumber: '519.829',
    photoFile: 'public/team/flore-vanlierde.png',
    photoMime: 'image/png',
  },
  {
    email: 'thomas@vastgoedbrowaeys.be',
    firstName: 'Thomas',
    lastName: 'Lemmens',
    title: 'Administratief medewerker',
    phone: '055/59 50 10',
    photoFile: 'public/team/thomas-lemmens.png',
    photoMime: 'image/png',
  },
]

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = randomBytes(14)
  let out = ''
  for (let i = 0; i < 14; i++) out += chars[bytes[i] % chars.length]
  return out
}

async function getExistingAdmins() {
  const { data, error } = await admin.rpc('list_admin_users')
  if (error) {
    console.warn(`Kon list_admin_users RPC niet aanroepen (${error.message}). Idempotency-check overgeslagen.`)
    return new Map()
  }
  const map = new Map()
  for (const r of (data ?? [])) {
    if (r.email) {
      map.set(r.email.toLowerCase(), {
        id: r.id,
        metadata: r.raw_user_meta_data || {},
      })
    }
  }
  return map
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

  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, userId: data.user.id, metadata }
}

async function uploadPhoto(userId, photoFile, mime, existingMetadata) {
  let buffer
  try {
    buffer = readFileSync(new URL(`../${photoFile}`, import.meta.url))
  } catch (e) {
    return { ok: false, error: `Kon foto niet lezen: ${e.message}` }
  }

  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  })
  if (upErr) return { ok: false, error: `Upload mislukt: ${upErr.message}` }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  const photoUrl = pub.publicUrl

  // Oude foto opruimen
  const oldPath = existingMetadata?.photo_path
  if (oldPath && oldPath !== path) {
    await admin.storage.from(BUCKET).remove([oldPath]).catch(() => {})
  }

  // Metadata updaten
  const merged = {
    ...(existingMetadata || {}),
    photo_url: photoUrl,
    photo_path: path,
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (updErr) {
    await admin.storage.from(BUCKET).remove([path]).catch(() => {})
    return { ok: false, error: `Metadata-update mislukt: ${updErr.message}` }
  }

  return { ok: true, photoUrl }
}

async function main() {
  console.log('Bestaande admin-users ophalen via RPC…')
  const existing = await getExistingAdmins()
  console.log(`  ${existing.size} bestaande admin(s) gevonden.\n`)

  const newPasswords = []

  for (const u of TEAM) {
    const key = u.email.toLowerCase()
    const exists = existing.get(key)

    let userId
    let metadata

    if (exists) {
      userId = exists.id
      metadata = exists.metadata
      console.log(`SKIP-CREATE  ${u.firstName} ${u.lastName} (${u.email}) — bestaat al`)
    } else if (u.skipCreate) {
      console.log(`SKIP         ${u.firstName} ${u.lastName} (${u.email}) — gemarkeerd als skipCreate maar niet gevonden, foto niet geüpload`)
      continue
    } else {
      const password = generatePassword()
      const res = await createAdmin(u, password)
      if (!res.ok) {
        console.log(`FAIL-CREATE  ${u.firstName} ${u.lastName} (${u.email}) — ${res.error}`)
        continue
      }
      console.log(`CREATED      ${u.firstName} ${u.lastName} (${u.email})`)
      userId = res.userId
      metadata = res.metadata
      newPasswords.push({ email: u.email, password })
    }

    // Foto-upload als nog niet aanwezig
    if (metadata?.photo_url) {
      console.log(`SKIP-PHOTO   ${u.firstName} ${u.lastName} — al photo_url`)
    } else if (u.photoFile) {
      const photoRes = await uploadPhoto(userId, u.photoFile, u.photoMime, metadata)
      if (photoRes.ok) {
        console.log(`PHOTO-UP     ${u.firstName} ${u.lastName} — ${photoRes.photoUrl}`)
      } else {
        console.log(`FAIL-PHOTO   ${u.firstName} ${u.lastName} — ${photoRes.error}`)
      }
    }
  }

  if (newPasswords.length > 0) {
    console.log('\n─────────────────────────────────────────')
    console.log('  Initiële wachtwoorden (bewaar veilig!)')
    console.log('─────────────────────────────────────────')
    for (const r of newPasswords) {
      console.log(`  ${r.email.padEnd(40)} ${r.password}`)
    }
    console.log('\n  Communiceer via een veilig kanaal — werknemers kunnen wijzigen in /admin/team.')
  } else {
    console.log('\nGeen nieuwe accounts aangemaakt.')
  }
}

main().catch((e) => {
  console.error('Fataal:', e)
  process.exit(1)
})
