import Link from 'next/link'
import { ArrowLeft, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { DiagnoseActions } from './diagnose-actions'

export const metadata = {
  title: 'Admin · Team · Diagnose',
}

type PaginatedResult = {
  page: number
  perPage: number
  ok: boolean
  count: number
  error: string | null
  users: Array<{
    id: string
    email: string | null
    role: string | null
    active: boolean
    metadataKeys: string[]
    metadataIssue: string | null
  }>
}

const KNOWN_ACCOUNTS = [
  { email: 'stephanie@vastgoedbrowaeys.be', purpose: 'Zaakvoerder — moet role=admin hebben' },
  { email: 'info@studio-vm.be', purpose: 'Vincent — moet role=admin hebben' },
]

function inspectMetadata(md: unknown): { keys: string[]; issue: string | null } {
  if (md === null || md === undefined) return { keys: [], issue: 'metadata is null/undefined' }
  if (typeof md !== 'object') return { keys: [], issue: `metadata is ${typeof md}, geen object` }
  try {
    JSON.stringify(md)
  } catch (e) {
    return { keys: [], issue: `metadata is niet serializable: ${e instanceof Error ? e.message : String(e)}` }
  }
  const keys = Object.keys(md as Record<string, unknown>)
  return { keys, issue: null }
}

async function tryPaginated(perPage: number, page: number): Promise<PaginatedResult> {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.auth.admin.listUsers({ perPage, page })
    if (error) {
      return { page, perPage, ok: false, count: 0, error: error.message, users: [] }
    }
    const users = (data?.users ?? []).map((u) => {
      const ins = inspectMetadata(u.user_metadata)
      return {
        id: u.id,
        email: u.email ?? null,
        role: ((u.user_metadata as Record<string, unknown> | null | undefined)?.role as string) ?? null,
        active: ((u.user_metadata as Record<string, unknown> | null | undefined)?.active) !== false,
        metadataKeys: ins.keys,
        metadataIssue: ins.issue,
      }
    })
    return { page, perPage, ok: true, count: users.length, error: null, users }
  } catch (e) {
    return {
      page, perPage, ok: false, count: 0,
      error: e instanceof Error ? e.message : String(e),
      users: [],
    }
  }
}

async function tryGetByEmail(email: string) {
  const admin = createAdminClient()
  // Eerst via listUsers met filter — als dat faalt, fallback op niets
  try {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1, page: 1 })
    if (!error && data) {
      // Niet useful — listUsers ondersteunt geen email filter via SDK in deze versie.
    }
  } catch {
    // ignore
  }
  // We hebben geen ID, dus we kunnen niet getUserById doen. Markeer als onbekend.
  return { email, found: false, error: 'kan alleen via listUsers gevonden worden' as const }
}

type RpcCheckResult =
  | { ok: true; count: number; users: Array<{ id: string; email: string | null; role: string | null; metadataKeys: string[] }> }
  | { ok: false; error: string }

async function tryRpc(): Promise<RpcCheckResult> {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.rpc('list_admin_users')
    if (error) return { ok: false, error: error.message }
    if (!Array.isArray(data)) return { ok: false, error: 'RPC gaf geen array terug' }
    type Row = { id: string; email: string | null; raw_user_meta_data: Record<string, unknown> | null }
    return {
      ok: true,
      count: data.length,
      users: (data as Row[]).map((r) => ({
        id: r.id,
        email: r.email,
        role: (r.raw_user_meta_data?.role as string) ?? null,
        metadataKeys: r.raw_user_meta_data ? Object.keys(r.raw_user_meta_data) : [],
      })),
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default async function DiagnosePage() {
  // Probeer drie verschillende perPage-waardes om te zien waar het breekt
  const [big, medium, small1, small2, small3, rpc] = await Promise.all([
    tryPaginated(100, 1),
    tryPaginated(10, 1),
    tryPaginated(5, 1),
    tryPaginated(5, 2),
    tryPaginated(5, 3),
    tryRpc(),
  ])

  // Probeer specifieke bekende accounts te resolven (alleen mogelijk als we ze in listUsers vinden)
  const knownChecks = await Promise.all(KNOWN_ACCOUNTS.map((acc) => tryGetByEmail(acc.email)))

  // Als één van de paginated calls users teruggaf, gebruik die om bekende accounts te resolven
  const allFoundUsers = [
    ...big.users, ...medium.users, ...small1.users, ...small2.users, ...small3.users,
  ]
  const byEmail = new Map<string, (typeof big.users)[number]>()
  for (const u of allFoundUsers) {
    if (u.email) byEmail.set(u.email.toLowerCase(), u)
  }
  // Vul aan met RPC-resultaten (kan andere users tonen dan listUsers)
  if (rpc.ok) {
    for (const u of rpc.users) {
      if (!u.email) continue
      const key = u.email.toLowerCase()
      if (!byEmail.has(key)) {
        byEmail.set(key, {
          id: u.id,
          email: u.email,
          role: u.role,
          active: true,
          metadataKeys: u.metadataKeys,
          metadataIssue: null,
        })
      }
    }
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-10 md:py-14">
      <Link
        href="/admin/team"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar Team
      </Link>

      <section className="mb-8">
        <p className="eyebrow mb-3">Admin · Team · Diagnose</p>
        <h1 className="text-3xl md:text-4xl flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
          <Stethoscope className="size-7" style={{ color: 'var(--color-accent)' }} />
          listUsers-diagnose
        </h1>
        <p className="mt-3 text-[var(--color-mute)] max-w-2xl">
          Test paginated <code>admin.auth.admin.listUsers</code> met verschillende
          batch-groottes om te isoleren welk record of welke pagina de
          &ldquo;Database error finding users&rdquo; veroorzaakt.
        </p>
      </section>

      {/* RPC-fallback */}
      <section className="mb-10">
        <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          RPC-fallback: <code>public.list_admin_users()</code>
        </h2>
        {rpc.ok ? (
          <div className="p-4"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: '#166534' }}>
              <CheckCircle2 className="size-4" />
              RPC werkt — {rpc.count} admin-user{rpc.count === 1 ? '' : 's'} gevonden via directe SQL.
            </p>
            <ul className="text-xs space-y-1">
              {rpc.users.map((u) => (
                <li key={u.id}>
                  <code className="text-[0.65rem]">{u.id.slice(0, 8)}…</code>{' '}
                  <span className="font-medium">{u.email || '(geen email)'}</span>{' '}
                  <span className="text-[var(--color-mute)]">role={u.role ?? '—'}, keys=[{u.metadataKeys.join(', ')}]</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: '#b91c1c' }}>
              <AlertCircle className="size-4" />
              RPC niet beschikbaar
            </p>
            <p className="text-xs text-[var(--color-mute)] mb-2">{rpc.error}</p>
            <details className="text-xs">
              <summary className="cursor-pointer text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                SQL om uit te voeren in Supabase SQL Editor
              </summary>
              <pre className="mt-2 p-3 overflow-x-auto text-[0.65rem]"
                style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-line)' }}>{`create or replace function public.list_admin_users()
returns table (id uuid, email text, raw_user_meta_data jsonb, created_at timestamptz)
language sql security definer
set search_path = auth, public
as $$
  select id, email, raw_user_meta_data, created_at
  from auth.users
  where raw_user_meta_data->>'role' = 'admin';
$$;

revoke all on function public.list_admin_users() from public;
grant execute on function public.list_admin_users() to service_role;
notify pgrst, 'reload schema';`}</pre>
            </details>
          </div>
        )}
      </section>

      {/* Pagination-tests */}
      <section className="mb-10">
        <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Paginated tests
        </h2>
        <ul className="space-y-2">
          <ResultRow label="perPage: 100 (volledig)" r={big} />
          <ResultRow label="perPage: 10, page 1"     r={medium} />
          <ResultRow label="perPage: 5, page 1"      r={small1} />
          <ResultRow label="perPage: 5, page 2"      r={small2} />
          <ResultRow label="perPage: 5, page 3"      r={small3} />
        </ul>
      </section>

      {/* Bekende accounts */}
      <section className="mb-10">
        <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Bekende accounts
        </h2>
        <ul className="space-y-2">
          {KNOWN_ACCOUNTS.map((acc, i) => {
            const u = byEmail.get(acc.email.toLowerCase())
            return (
              <li key={acc.email} className="p-4"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium">{acc.email}</p>
                    <p className="text-xs text-[var(--color-mute)] mt-0.5">{acc.purpose}</p>
                  </div>
                  {u ? (
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#166534' }}>
                      <CheckCircle2 className="size-3.5" />
                      Gevonden
                    </span>
                  ) : knownChecks[i].error ? (
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#b91c1c' }}>
                      <AlertCircle className="size-3.5" />
                      Niet gevonden
                    </span>
                  ) : null}
                </div>
                {u && (
                  <div className="text-xs space-y-1">
                    <p>
                      <span className="text-[var(--color-mute)]">UID:</span>{' '}
                      <code className="text-[0.65rem]">{u.id}</code>
                    </p>
                    <p>
                      <span className="text-[var(--color-mute)]">role in metadata:</span>{' '}
                      <code className={u.role === 'admin' ? 'text-green-700' : 'text-red-700'}>
                        {u.role ?? '(ontbreekt)'}
                      </code>
                    </p>
                    <p>
                      <span className="text-[var(--color-mute)]">active:</span>{' '}
                      <code>{String(u.active)}</code>
                    </p>
                    <p>
                      <span className="text-[var(--color-mute)]">metadata keys:</span>{' '}
                      <code className="text-[0.65rem]">{u.metadataKeys.join(', ') || '(geen)'}</code>
                    </p>
                    {u.role !== 'admin' && (
                      <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
                        <DiagnoseActions userId={u.id} email={u.email ?? ''} canPromote canDelete={false} />
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Per-record inspectie */}
      <section className="mb-10">
        <h2 className="text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Per-record inspectie ({allFoundUsers.length} gevonden over alle tests)
        </h2>
        {allFoundUsers.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-mute)] italic"
            style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            Geen enkele paginated call slaagde. listUsers is volledig kapot.
          </p>
        ) : (
          <ul className="space-y-2">
            {dedupeById(allFoundUsers).map((u) => (
              <li key={u.id} className="p-3 flex items-start justify-between gap-3"
                style={{
                  background: u.metadataIssue ? 'rgba(239,68,68,0.05)' : 'var(--color-paper)',
                  border: `1px solid ${u.metadataIssue ? '#b91c1c' : 'var(--color-line)'}`,
                }}>
                <div className="min-w-0 flex-1 text-xs">
                  <p>
                    <code className="text-[0.6rem]">{u.id.slice(0, 8)}…</code>
                    {' '}
                    <span className="font-medium">{u.email || '(geen email)'}</span>
                  </p>
                  <p className="text-[var(--color-mute)] mt-0.5">
                    role={u.role ?? '—'} · active={String(u.active)} · keys=[{u.metadataKeys.join(', ')}]
                  </p>
                  {u.metadataIssue && (
                    <p className="mt-1" style={{ color: '#b91c1c' }}>
                      ⚠ {u.metadataIssue}
                    </p>
                  )}
                </div>
                {(u.email?.endsWith('@vb.local') || u.metadataIssue) && (
                  <DiagnoseActions
                    userId={u.id}
                    email={u.email ?? ''}
                    canPromote={false}
                    canDelete
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const x of arr) {
    if (seen.has(x.id)) continue
    seen.add(x.id)
    out.push(x)
  }
  return out
}

function ResultRow({ label, r }: { label: string; r: PaginatedResult }) {
  return (
    <li className="flex items-start justify-between gap-3 p-3"
      style={{
        background: r.ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${r.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium flex items-center gap-2">
          {r.ok ? (
            <CheckCircle2 className="size-4" style={{ color: '#166534' }} />
          ) : (
            <AlertCircle className="size-4" style={{ color: '#b91c1c' }} />
          )}
          {label}
        </p>
        {r.ok ? (
          <p className="text-xs text-[var(--color-mute)] mt-1">
            {r.count} users opgehaald
          </p>
        ) : (
          <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>
            {r.error}
          </p>
        )}
      </div>
    </li>
  )
}
