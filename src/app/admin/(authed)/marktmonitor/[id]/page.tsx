import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, MapPin, Tag, Building2, User as UserIcon, Calendar,
} from 'lucide-react'
import { getMarketLead, getTeamMembers } from '@/lib/admin-db'
import { formatPrice } from '@/lib/listings'
import { StatusControl, NotesEditor, DeleteLeadButton } from './lead-controls'
import { BriefGenerator } from './brief-generator'
import { ConvertToListingButton } from './convert-button'

export const metadata = {
  title: 'Admin · Marktlead',
}

export default async function MarktLeadDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await getMarketLead(id)
  if (!lead) notFound()

  // Zaakvoerder als afzender — geen current user. Brieven naar leads
  // moeten altijd uitgaan vanuit Stefanie, niet vanuit wie er ingelogd is.
  const { items: team } = await getTeamMembers()
  const zaakvoerder = team.find((m) => m.teamRole === 'zaakvoerder' && m.active)
  const sender = zaakvoerder ? {
    name: `${zaakvoerder.firstName} ${zaakvoerder.lastName}`.trim() || zaakvoerder.email,
    email: zaakvoerder.email,
    phone: zaakvoerder.phone ?? null,
    title: zaakvoerder.title ?? null,
    bivNumber: zaakvoerder.bivNumber ?? null,
  } : {
    name: 'Stephanie Browaeys',
    email: 'stephanie@vastgoedbrowaeys.be',
    phone: '055 59 50 10',
    title: 'Zaakvoerder · Vastgoedmakelaar-bemiddelaar',
    bivNumber: '504.553',
  }

  return (
    <div className="container-px mx-auto max-w-screen-2xl py-8 md:py-10">
      <Link
        href="/admin/marktmonitor"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] mb-4 md:mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Terug naar marktmonitor
      </Link>

      <section className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-mute)] mb-2">
          <span>{lead.sourceSite ?? 'Bron onbekend'}</span>
          <span>·</span>
          <span>{lead.listingType === 'verkoop' ? 'Te koop' : lead.listingType === 'verhuur' ? 'Te huur' : 'Onbekend'}</span>
          {lead.isParticulier && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1" style={{ color: '#16a34a' }}>
                <UserIcon className="size-2.5" />
                Particulier
              </span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          {lead.title || lead.street || 'Pand zonder titel'}
        </h1>
        {lead.price && (
          <p className="mt-2 text-xl md:text-2xl italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
            {formatPrice(lead.price)}
            {lead.listingType === 'verhuur' && <span className="text-sm text-[var(--color-mute)]"> / maand</span>}
          </p>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-4">
          {/* Foto */}
          <div className="relative aspect-[4/3]" style={{ background: 'var(--color-paper-2)' }}>
            {lead.imageUrl ? (
              <Image
                src={lead.imageUrl}
                alt={lead.title ?? 'Pand'}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <Building2 className="size-12 text-[var(--color-mute)]" />
              </div>
            )}
          </div>

          {/* Pand-info */}
          <Card title="Pand">
            <ul className="space-y-2 text-sm">
              {(lead.street || lead.city || lead.postcode) && (
                <li className="flex items-start gap-2">
                  <MapPin className="size-3.5 mt-0.5 shrink-0 text-[var(--color-mute)]" />
                  <span>
                    {[lead.street, [lead.postcode, lead.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                  </span>
                </li>
              )}
              {lead.propertyType && (
                <li className="flex items-center gap-2">
                  <Tag className="size-3.5 shrink-0 text-[var(--color-mute)]" />
                  <span>{lead.propertyType}</span>
                </li>
              )}
              {lead.agentName && (
                <li className="flex items-start gap-2 text-xs text-[var(--color-mute)]">
                  <Building2 className="size-3.5 mt-0.5 shrink-0" />
                  <span>Aangeboden door: {lead.agentName}</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                <Calendar className="size-3 shrink-0" />
                Toegevoegd op {new Date(lead.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </li>
            </ul>
            <a
              href={lead.sourceUrl}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-1.5 text-xs link-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              <ExternalLink className="size-3.5" />
              Bekijk origineel zoekertje
            </a>
          </Card>

          {/* Status */}
          <Card title="Status">
            <StatusControl leadId={lead.id} initial={lead.status} />
            {lead.contactedAt && (
              <p className="mt-2 text-xs text-[var(--color-mute)]">
                Voor het eerst benaderd op {new Date(lead.contactedAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </Card>

          {/* Converteer naar aanbod */}
          {(lead.status === 'afspraak' || lead.status === 'klant') && (
            <Card title="Converteer naar mijn aanbod">
              <ConvertToListingButton leadId={lead.id} />
            </Card>
          )}

          {/* Extra bron-URLs (dedup) */}
          {lead.extraSourceUrls.length > 0 && (
            <Card title={`Ook gevonden op ${lead.extraSourceUrls.length} andere site${lead.extraSourceUrls.length === 1 ? '' : 's'}`}>
              <ul className="space-y-1.5 text-xs">
                {lead.extraSourceUrls.map((u, i) => (
                  <li key={i}>
                    <a href={u} target="_blank" rel="noopener" className="link-underline text-[var(--color-mute)] hover:text-[var(--color-ink)] inline-flex items-center gap-1 truncate">
                      <ExternalLink className="size-3 shrink-0" />
                      <span className="truncate">{new URL(u).hostname}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Notities */}
          <Card title="Notities">
            <NotesEditor leadId={lead.id} initial={lead.notes} />
          </Card>

          <DeleteLeadButton leadId={lead.id} />
        </aside>

        <div className="lg:col-span-2">
          <BriefGenerator
            lead={{
              street: lead.street,
              postcode: lead.postcode,
              city: lead.city,
              price: lead.price,
              propertyType: lead.propertyType,
              listingType: lead.listingType,
              isParticulier: lead.isParticulier,
              sourceSite: lead.sourceSite,
            }}
            sender={sender}
          />
        </div>
      </div>

      {!lead.isParticulier && lead.agentName && (
        <p className="mt-8 p-3 text-xs"
          style={{ background: 'rgba(201,140,79,0.10)', color: '#92400e', borderLeft: '3px solid #c98c4f' }}>
          ⚠ Dit pand staat bij een andere makelaar ({lead.agentName}). De BIV-deontologie
          (art. 18) verbiedt het actief ronselen van klanten van een collega-makelaar. Gebruik
          de brief-templates enkel voor particuliere verkopers of na zorgvuldige afweging.
        </p>
      )}
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
