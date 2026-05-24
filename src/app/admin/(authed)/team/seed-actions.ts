'use server'

import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Geen toegang')
  }
  return user
}

const BUCKET = 'team-photos'

type SeedEntry = {
  email: string
  firstName: string
  lastName: string
  title: string
  phone: string
  bivNumber?: string
  photoFile: string
  photoMime: 'image/jpeg' | 'image/png' | 'image/webp'
  skipCreate?: boolean
}

const TEAM: SeedEntry[] = [
  {
    email: 'stephanie@vastgoedbrowaeys.be',
    firstName: 'Stephanie',
    lastName: 'Browaeys',
    title: 'Zaakvoerder · Vastgoedmakelaar-bemiddelaar',
    phone: '+32 (0)55 59 50 10',
    bivNumber: '504.553',
    photoFile: 'public/team/stefanie-browaeys.jpg',
    photoMime: 'image/jpeg',
    skipCreate: true,
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

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = randomBytes(14)
  let out = ''
  for (let i = 0; i < 14; i++) out += chars[bytes[i] % chars.length]
  return out
}

export type SeedResultRow = {
  email: string
  name: string
  status: 'created' | 'updated' | 'skipped' | 'failed'
  password?: string
  photoStatus?: 'uploaded' | 'skipped' | 'failed'
  error?: string
}

export type SeedResult =
  | { ok: true; rows: SeedResultRow[] }
  | { ok: false; error: string }

export async function runTeamSeedAction(): Promise<SeedResult> {
  try { await requireAdmin() } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Geen toegang' }
  }

  const admin = createAdminClient()

  // 1) Bestaande admins ophalen via RPC
  type RpcRow = { id: string; email: string | null; raw_user_meta_data: Record<string, unknown> | null }
  const { data: rpcData, error: rpcErr } = await admin.rpc('list_admin_users')
  if (rpcErr) {
    return { ok: false, error: `list_admin_users RPC niet beschikbaar: ${rpcErr.message}. Voer eerst de SQL-migratie uit.` }
  }

  const existing = new Map<string, { id: string; metadata: Record<string, unknown> }>()
  for (const r of (rpcData as RpcRow[]) ?? []) {
    if (r.email) {
      existing.set(r.email.toLowerCase(), {
        id: r.id,
        metadata: r.raw_user_meta_data || {},
      })
    }
  }

  const rows: SeedResultRow[] = []

  for (const u of TEAM) {
    const fullName = `${u.firstName} ${u.lastName}`
    const exists = existing.get(u.email.toLowerCase())

    let userId: string | null = null
    let metadata: Record<string, unknown> = {}
    let status: SeedResultRow['status'] = 'skipped'
    let password: string | undefined

    if (exists) {
      userId = exists.id
      metadata = exists.metadata
      status = 'skipped'
    } else if (u.skipCreate) {
      rows.push({
        email: u.email,
        name: fullName,
        status: 'skipped',
        error: 'gemarkeerd als skipCreate maar niet gevonden — manueel aanmaken',
      })
      continue
    } else {
      password = generatePassword()
      const meta: Record<string, unknown> = {
        role: 'admin',
        first_name: u.firstName,
        last_name: u.lastName,
        title: u.title,
        phone: u.phone,
      }
      if (u.bivNumber) meta.biv_number = u.bivNumber

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: u.email,
        password,
        email_confirm: true,
        user_metadata: meta,
      })
      if (createErr || !created?.user) {
        rows.push({
          email: u.email,
          name: fullName,
          status: 'failed',
          error: createErr?.message ?? 'createUser gaf geen user terug',
        })
        continue
      }
      userId = created.user.id
      metadata = meta
      status = 'created'
    }

    // Foto-upload als nog geen photo_url
    let photoStatus: SeedResultRow['photoStatus'] = 'skipped'
    let photoError: string | undefined
    if (!metadata?.photo_url && userId) {
      const photoRes = await uploadPhoto(userId, u.photoFile, u.photoMime, metadata)
      if (photoRes.ok) {
        photoStatus = 'uploaded'
        if (status === 'skipped') status = 'updated'
      } else {
        photoStatus = 'failed'
        photoError = photoRes.error
      }
    }

    rows.push({
      email: u.email,
      name: fullName,
      status,
      password,
      photoStatus,
      error: photoError,
    })
  }

  revalidatePath('/admin/team')
  return { ok: true, rows }
}

async function uploadPhoto(
  userId: string,
  photoFile: string,
  mime: 'image/jpeg' | 'image/png' | 'image/webp',
  existingMetadata: Record<string, unknown>,
): Promise<{ ok: true; photoUrl: string } | { ok: false; error: string }> {
  const admin = createAdminClient()

  let buffer: Buffer
  try {
    const fullPath = path.join(process.cwd(), photoFile)
    buffer = await readFile(fullPath)
  } catch (e) {
    return { ok: false, error: `Kon foto niet lezen (${photoFile}): ${e instanceof Error ? e.message : String(e)}` }
  }

  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `${userId}/${Date.now()}.${ext}`

  const { error: upErr } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  })
  if (upErr) {
    return { ok: false, error: `Storage upload: ${upErr.message}` }
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(storagePath)
  const photoUrl = pub.publicUrl

  // Oude foto verwijderen
  const oldPath = existingMetadata?.photo_path as string | undefined
  if (oldPath && oldPath !== storagePath) {
    await admin.storage.from(BUCKET).remove([oldPath]).catch(() => {})
  }

  const merged = {
    ...existingMetadata,
    photo_url: photoUrl,
    photo_path: storagePath,
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: merged,
  })
  if (updErr) {
    await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    return { ok: false, error: `Metadata update: ${updErr.message}` }
  }

  return { ok: true, photoUrl }
}
