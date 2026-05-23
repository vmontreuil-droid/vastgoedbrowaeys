import Link from 'next/link'
import { MailOpen, Mail, Search, ArrowRight, Tag, Inbox, AlertCircle } from 'lucide-react'
import { getAdminLeads } from '@/lib/admin-db'
import { DonutChart, SimpleLine } from '@/components/admin/charts'

export const metadata = {
  title: 'Admin · Berichten',
}

type SearchParams = { [k: string]: string | string[] | undefined }

const TYPE_LABEL: Record<string, string> = {
  lead:          'Lead',
  schatting:     'Schatting',
  vraag:         'Vraag',
  visit_request: 'Bezichtiging',
  algemeen:      'Algemeen',
}

const TYPE_COLOR: Record<string, string> = {
  lead:          '#16a34a',
  schatting:     '#c98c4f',
  vraag:         '#0b4f58',
  visit_request: '#a25b3a',
  algemeen:      '#737373',
}

function formatRelative(iso: string, now = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'zonet'
  if (minutes < 60) return `${minutes} min geleden`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} u geleden`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d geleden`
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
}

export default async function BerichtenPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const filter = (params.filter as string | undefined) ?? 'alle'
  const typeFilter = (params.type as string | undefined) ?? 'alle'
  const q = (params.q as string | undefined)?.toLowerCase() ?? ''

  const { items: all, error } = await getAdminLeads()

  let messages = [...all]
  if (filter === 'onbehandeld') messages = messages.filter((m) => !m.readAt)
  else if (filter === 'behandeld') messages = messages.filter((m) => m.readAt)
  if (typeFilter !== 'alle') messages = messages.filter((m) => m.type === typeFilter)
  if (q) {
    messages = messages.filter((m) =>
      (m.fromName + ' ' + m.subject + ' ' + m.body + ' ' + m.fromEmail).toLowerCase().includes(q),
    )
  }

  const total = all.length
  const unread = all.filter((m) => !m.readAt).length
  const byType = (Object.keys(TYPE_LABEL))
    .map((t) => ({ name: TYPE_LABEL[t], value: all.filter((m) => m.type === t).length, color: TYPE_COLOR[t] }))
    .filter((d) => d.value > 0)

  // Volume per week — uit echte data
  const weekTrend = (() => {
    const now = new Date()
    const result: Array<{ x: string; Inkomend: number }> = []
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now)
      start.setDate(now.getDate() - i * 7 - 7)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)
      const count = all.filter((m) => {
        const t = new Date(m.receivedAt).getTime()
        return t >= start.getTime() && t < end.getTime()
      }).length
      result.push({ x: `W-${i}`, Inkomend: count })
    }
    return result
  })()

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Berichten</p>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3">
            <Inbox className="size-7" style={{ color: 'var(--color-accent)' }} />
            Inbox{' '}
            <span className="text-[var(--color-mute)] text-2xl">
              ({unread > 0 ? `${unread} onbehandeld · ` : ''}{total} totaal)
            </span>
          </h1>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 p-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>Kon berichten niet laden: {error}</span>
        </div>
      )}

      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>Status</h3>
            <Mail className="size-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: unread > 0 ? '#b91c1c' : 'var(--color-mute)' }}>
                {unread}
              </p>
              <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] mt-1">Onbehandeld</p>
            </div>
            <div>
              <p className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{total - unread}</p>
              <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)] mt-1">Behandeld</p>
            </div>
          </div>
        </div>

        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Per type</h3>
          {byType.length > 0 ? (
            <DonutChart data={byType} total={total} centerLabel="berichten" />
          ) : (
            <p className="text-sm text-[var(--color-mute)] py-12 text-center">Nog geen berichten.</p>
          )}
        </div>

        <div className="p-5" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <h3 className="text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Volume (5 weken)</h3>
          <SimpleLine data={weekTrend} dataKeys={[{ key: 'Inkomend', label: 'Inkomend', color: '#0b4f58' }]} height={200} />
        </div>
      </section>

      <section
        className="p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        <form className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="size-4 text-[var(--color-mute)]" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Zoek op naam, onderwerp, inhoud…"
            className="flex-1 px-2 py-1.5 text-sm bg-transparent focus:outline-none"
          />
          {filter !== 'alle' && <input type="hidden" name="filter" value={filter} />}
          {typeFilter !== 'alle' && <input type="hidden" name="type" value={typeFilter} />}
        </form>
        <FilterPills
          label="Status"
          options={[
            { value: 'alle', label: 'Alle' },
            { value: 'onbehandeld', label: 'Onbehandeld' },
            { value: 'behandeld', label: 'Behandeld' },
          ]}
          current={filter}
          queryKey="filter"
          otherKeyValues={{ q, type: typeFilter }}
        />
        <FilterPills
          label="Type"
          options={[
            { value: 'alle', label: 'Alle' },
            ...Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v })),
          ]}
          current={typeFilter}
          queryKey="type"
          otherKeyValues={{ q, filter }}
        />
      </section>

      <section
        className="divide-y"
        style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}
      >
        {messages.map((m) => (
          <Link
            key={m.id}
            href={`/admin/berichten/${m.id}`}
            className="block px-4 py-4 hover:bg-[var(--color-paper-2)] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 pt-1">
                {m.readAt ? (
                  <MailOpen className="size-4 text-[var(--color-mute)]" />
                ) : (
                  <Mail className="size-4" style={{ color: 'var(--color-accent)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className={`text-sm truncate ${!m.readAt ? 'font-semibold' : ''}`}>{m.fromName}</p>
                    <span
                      className="inline-block px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium shrink-0"
                      style={{ background: TYPE_COLOR[m.type] ?? '#737373', color: '#fff' }}
                    >
                      {TYPE_LABEL[m.type] ?? m.type}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-mute)] shrink-0">{formatRelative(m.receivedAt)}</span>
                </div>
                <p className={`text-sm mt-1 ${!m.readAt ? 'font-medium' : 'text-[var(--color-ink)]'}`}>{m.subject}</p>
                <p className="text-xs text-[var(--color-mute)] mt-1 line-clamp-1">{m.body}</p>
                {m.relatedListing && (
                  <p className="text-[0.65rem] text-[var(--color-mute)] mt-1 flex items-center gap-1">
                    <Tag className="size-2.5" />
                    {m.relatedListing}
                  </p>
                )}
              </div>
              <ArrowRight className="size-4 text-[var(--color-mute)] self-center shrink-0" />
            </div>
          </Link>
        ))}
        {messages.length === 0 && (
          <div className="p-10 text-center text-sm text-[var(--color-mute)]">
            {all.length === 0
              ? 'Nog geen berichten. Wanneer iemand een contactformulier invult verschijnen ze hier.'
              : 'Geen berichten voor deze filters.'}
          </div>
        )}
      </section>
    </div>
  )
}

function FilterPills({
  label, options, current, queryKey, otherKeyValues,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  current: string
  queryKey: string
  otherKeyValues: Record<string, string>
}) {
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[var(--color-mute)] mr-1">{label}:</span>
      {options.map((o) => {
        const params = new URLSearchParams()
        Object.entries(otherKeyValues).forEach(([k, v]) => {
          if (v && v !== 'alle') params.set(k, v)
        })
        if (o.value !== 'alle') params.set(queryKey, o.value)
        const href = `?${params.toString()}`
        const active = o.value === current
        return (
          <Link
            key={o.value}
            href={href}
            className="px-2 py-1 text-[0.65rem] transition-colors"
            style={{
              background: active ? 'var(--color-ink)' : 'transparent',
              color: active ? 'var(--color-paper)' : 'var(--color-mute)',
              border: active ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
            }}
          >
            {o.label}
          </Link>
        )
      })}
    </div>
  )
}
