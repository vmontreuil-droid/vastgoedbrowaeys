import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone, User, Tag, MessageSquare } from 'lucide-react'
import { getAdminLead } from '@/lib/admin-db'
import { LeadActions } from './lead-actions'

export const metadata = {
  title: 'Admin · Bericht',
}

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

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await getAdminLead(id)
  if (!lead) notFound()

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/berichten"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar inbox
      </Link>

      <section className="mb-6">
        <p className="eyebrow mb-3">Admin · Bericht</p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="inline-block px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
            style={{ background: TYPE_COLOR[lead.type] ?? '#737373', color: '#fff' }}
          >
            {TYPE_LABEL[lead.type] ?? lead.type}
          </span>
          {lead.readAt && (
            <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-mute)]">
              gelezen op {new Date(lead.readAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          {lead.subject}
        </h1>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4">
          <div className="p-4" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h3 className="eyebrow text-[0.55rem] mb-3">Afzender</h3>
            <p className="text-sm flex items-center gap-2 mb-2">
              <User className="size-3.5" style={{ color: 'var(--color-accent)' }} />
              {lead.fromName}
            </p>
            <a href={`mailto:${lead.fromEmail}`} className="text-sm flex items-center gap-2 link-underline mb-2 break-all">
              <Mail className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
              {lead.fromEmail}
            </a>
            {lead.fromPhone && (
              <a href={`tel:${lead.fromPhone.replace(/\s|\//g, '')}`} className="text-sm flex items-center gap-2 link-underline">
                <Phone className="size-3.5" style={{ color: 'var(--color-accent)' }} />
                {lead.fromPhone}
              </a>
            )}
          </div>

          <div className="p-4" style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
            <h3 className="eyebrow text-[0.55rem] mb-3">Details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start justify-between gap-2">
                <span className="text-[var(--color-mute)] text-xs">Ontvangen</span>
                <span className="text-right">{new Date(lead.receivedAt).toLocaleString('nl-BE')}</span>
              </li>
              {lead.relatedListing && (
                <li>
                  <p className="text-[var(--color-mute)] text-xs mb-1">Pand</p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="size-3 shrink-0" />
                    {lead.relatedListing}
                  </p>
                </li>
              )}
              {lead.source && (
                <li className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-mute)] text-xs">Bron</span>
                  <span>{lead.source}</span>
                </li>
              )}
            </ul>
          </div>

          <LeadActions id={lead.id} isRead={!!lead.readAt} />
        </aside>

        <article className="lg:col-span-2 p-6"
          style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
          <header className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-line)' }}>
            <MessageSquare className="size-4" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>Bericht</h2>
          </header>
          <div className="text-sm whitespace-pre-line leading-relaxed">{lead.body}</div>

          <div className="mt-8 pt-6 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--color-line)' }}>
            <a
              href={`mailto:${lead.fromEmail}?subject=Re: ${encodeURIComponent(lead.subject)}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Mail className="size-3.5" />
              Antwoord per e-mail
            </a>
            {lead.fromPhone && (
              <a
                href={`tel:${lead.fromPhone.replace(/\s|\//g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm"
                style={{ border: '1px solid var(--color-line)' }}
              >
                <Phone className="size-3.5" />
                Bel
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
