import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Hash, MapPin, Calendar, FileText, User,
  FolderOpen, ExternalLink,
} from 'lucide-react'
import {
  getAdminDossier, getAdminAppointments, getAdminClient, getAdminDocumentsForDossier,
  getDossierEvents, getDossierSteps, getNoteTemplates, getTeamMembers,
} from '@/lib/admin-db'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/listings'
import { DocumentsPanel, type DocumentRow } from './documents-panel'
import { EmailComposer } from './email-composer'
import { DossierTimeline } from './dossier-timeline'
import { StepsPanel, type StepRow } from './steps-panel'
import { CommissionPanel } from './commission-panel'
import { TagsPanel } from './tags-panel'
import { AssigneePanel } from './assignee-panel'

export const metadata = {
  title: 'Admin · Dossier',
}

const TYPE_LABEL: Record<string, string> = {
  verkoop: 'Verkoop',
  verhuur: 'Verhuur',
  koop_zoeker: 'Koop-zoeker',
  huur_zoeker: 'Huur-zoeker',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_behandeling: 'In behandeling',
  onder_optie: 'Onder optie',
  verkocht: 'Verkocht',
  verhuurd: 'Verhuurd',
  geannuleerd: 'Geannuleerd',
}

const STATUS_BADGE: Record<string, { bg: string; fg: string }> = {
  open:           { bg: 'rgba(34,197,94,0.15)',  fg: '#166534' },
  in_behandeling: { bg: 'rgba(11,79,88,0.15)',   fg: '#0b4f58' },
  onder_optie:    { bg: 'rgba(201,140,79,0.20)', fg: '#92400e' },
  verkocht:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  verhuurd:       { bg: 'rgba(34,197,94,0.18)',  fg: '#14532d' },
  geannuleerd:    { bg: 'rgba(115,115,115,0.18)',fg: '#525252' },
}

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dossier = await getAdminDossier(id)
  if (!dossier) notFound()

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const [client, { items: allAppointments }, { items: documents }, { items: events }, { items: steps }, { items: templates }, { items: team }] = await Promise.all([
    getAdminClient(dossier.clientId),
    getAdminAppointments(),
    getAdminDocumentsForDossier(dossier.id),
    getDossierEvents(dossier.id),
    getDossierSteps(dossier.id, dossier.type),
    getNoteTemplates(),
    getTeamMembers(currentUser?.id),
  ])
  const appointments = allAppointments
    .filter((a) => a.dossierId === dossier.id)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())

  const documentRows: DocumentRow[] = documents.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    storagePath: d.storagePath,
    sizeBytes: d.sizeBytes,
    mimeType: d.mimeType,
    uploadedAt: d.createdAt,
    sharedWithClient: d.sharedWithClient,
  }))

  const statusBadge = STATUS_BADGE[dossier.status] ?? { bg: 'rgba(115,115,115,0.18)', fg: '#525252' }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/dossiers"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar dossiers
      </Link>

      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Admin · Dossier</p>
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-mute)] mb-2">
            <Hash className="size-3" />
            {dossier.ref ?? dossier.id.slice(0, 8)}
            <span>·</span>
            <span>{TYPE_LABEL[dossier.type] ?? dossier.type}</span>
          </div>
          <h1 className="text-3xl md:text-4xl flex items-center gap-3 flex-wrap" style={{ fontFamily: 'var(--font-display)' }}>
            <FolderOpen className="size-7" style={{ color: 'var(--color-accent)' }} />
            {dossier.propertyAddress || `Zoekopdracht ${dossier.clientName}`}
            <span
              className="inline-block px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] font-medium"
              style={{ background: statusBadge.bg, color: statusBadge.fg }}
            >
              {STATUS_LABEL[dossier.status] ?? dossier.status}
            </span>
          </h1>
          {dossier.propertyCity && (
            <p className="text-sm text-[var(--color-mute)] mt-2 flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {dossier.propertyCity}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {client?.email && (
            <EmailComposer
              dossierId={dossier.id}
              clientEmail={client.email}
              clientName={(client.firstName + ' ' + client.lastName).trim() || client.email}
              defaultSubject={`${dossier.ref ?? 'Dossier'} — ${dossier.propertyAddress ?? 'update'}`}
            />
          )}
          <Link
            href={`/admin/afspraken/nieuw?dossier_id=${dossier.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs"
            style={{ border: '1px solid var(--color-line)' }}
          >
            <Calendar className="size-3.5" />
            + Afspraak
          </Link>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4">
          <Card title="Klant">
            {client ? (
              <Link href={`/admin/klanten/${client.id}`} className="block link-underline">
                <p className="text-sm flex items-center gap-2">
                  <User className="size-3.5" style={{ color: 'var(--color-accent)' }} />
                  {(client.firstName + ' ' + client.lastName).trim() || client.email}
                </p>
                <p className="text-xs text-[var(--color-mute)] mt-1 truncate">{client.email}</p>
                {client.phone && <p className="text-xs text-[var(--color-mute)]">{client.phone}</p>}
              </Link>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">{dossier.clientName}</p>
            )}
          </Card>

          <Card title="Cijfers">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)] text-xs">
                  {dossier.type === 'verkoop' || dossier.type === 'verhuur' ? 'Vraagprijs' : 'Budget'}
                </span>
                <span style={{ color: 'var(--color-accent)' }}>
                  {dossier.askingPrice ? formatPrice(dossier.askingPrice) : '—'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)] text-xs">Geopend</span>
                <span>{new Date(dossier.openedAt).toLocaleDateString('nl-BE')}</span>
              </li>
              {dossier.closedAt && (
                <li className="flex items-center justify-between">
                  <span className="text-[var(--color-mute)] text-xs">Afgesloten</span>
                  <span>{new Date(dossier.closedAt).toLocaleDateString('nl-BE')}</span>
                </li>
              )}
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)] text-xs">Afspraken</span>
                <span>{dossier.appointmentsCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--color-mute)] text-xs">Documenten</span>
                <span>{documents.length}</span>
              </li>
            </ul>
          </Card>

          {dossier.propertyAddress && (
            <Card title="Pand">
              <p className="text-sm">{dossier.propertyAddress}</p>
              {dossier.propertyCity && (
                <p className="text-xs text-[var(--color-mute)] mt-1">{dossier.propertyCity}</p>
              )}
              {dossier.propertyType && (
                <p className="text-xs text-[var(--color-mute)] mt-2">Type: {dossier.propertyType}</p>
              )}
            </Card>
          )}

          {currentUser && (
            <AssigneePanel
              dossierId={dossier.id}
              initialAssigneeId={dossier.assignedTo}
              currentUserId={currentUser.id}
              options={team.map((m) => ({
                id: m.id,
                name: `${m.firstName} ${m.lastName}`.trim() || m.email,
                email: m.email,
                active: m.active,
                outOfOfficeUntil: m.outOfOfficeUntil,
                outOfOfficeReason: m.outOfOfficeReason,
              }))}
            />
          )}

          <CommissionPanel
            initial={{
              dossierId: dossier.id,
              type: dossier.commissionType,
              rate: dossier.commissionRate,
              fixed: dossier.commissionFixed,
              vatIncluded: dossier.commissionVatIncluded,
              notes: dossier.commissionNotes,
              askingPrice: dossier.askingPrice,
            }}
          />

          <TagsPanel dossierId={dossier.id} initialTags={dossier.tags} />
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <StepsPanel
            dossierId={dossier.id}
            initialSteps={steps.map<StepRow>((s) => ({
              id: s.id,
              label: s.label,
              status: s.status,
              doneAt: s.doneAt,
              orderIndex: s.orderIndex,
            }))}
          />

          <section>
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Calendar className="size-5" style={{ color: 'var(--color-accent)' }} />
                Afspraken ({appointments.length})
              </h2>
              <Link href={`/admin/afspraken/nieuw?dossier_id=${dossier.id}`} className="text-xs link-underline">
                + Nieuwe
              </Link>
            </div>
            {appointments.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-mute)] italic"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                Nog geen afspraken.
              </p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((a) => (
                  <li key={a.id} className="flex items-center gap-4 p-3 text-sm"
                    style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                    <div className="text-center shrink-0">
                      <p className="text-[0.55rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
                        {new Date(a.start).toLocaleDateString('nl-BE', { month: 'short' })}
                      </p>
                      <p className="text-lg leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {new Date(a.start).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{a.title}</p>
                      <p className="text-xs text-[var(--color-mute)]">
                        {new Date(a.start).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                        {a.location && <> · {a.location}</>}
                      </p>
                    </div>
                    <Link href={`/admin/afspraken/${a.id}`} className="text-xs link-underline shrink-0 text-[var(--color-mute)]">
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <DocumentsPanel dossierId={dossier.id} initialDocuments={documentRows} />

          <DossierTimeline
            dossierId={dossier.id}
            events={events}
            templates={templates
              .filter((t) => t.category === 'algemeen' || t.category === dossier.type)
              .map((t) => ({ id: t.id, label: t.label, text: t.text }))}
          />

          {dossier.notes && (
            <section>
              <h2 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <FileText className="size-5" style={{ color: 'var(--color-accent)' }} />
                Notities
              </h2>
              <div className="p-4 text-sm whitespace-pre-line"
                style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
                {dossier.notes}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4"
      style={{ background: 'var(--color-paper)', border: '1px solid var(--color-line)' }}>
      <h3 className="eyebrow text-[0.55rem] mb-3">{title}</h3>
      {children}
    </section>
  )
}
