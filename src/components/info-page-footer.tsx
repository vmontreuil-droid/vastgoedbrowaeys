import { Calendar, BookOpen, AlertTriangle } from 'lucide-react'
import { INFO_PAGE_META, formatBeDate } from '@/data/info-meta'

/**
 * Disclaimer + bronnen + laatste update-datum onderaan elke info-pagina.
 * - Geeft bezoeker zicht op de bron en versie van de info
 * - Beschermt ons juridisch: expliciete "informatief, geen juridisch advies"
 * - Verwijst naar autoritatieve bronnen voor wie wil verifiëren
 */
export function InfoPageFooter({ pageKey }: { pageKey: keyof typeof INFO_PAGE_META }) {
  const meta = INFO_PAGE_META[pageKey]
  if (!meta) return null

  return (
    <div
      className="mt-16 p-6 md:p-8 text-sm space-y-6"
      style={{ background: 'var(--color-paper-2)' }}
    >
      <div className="flex flex-wrap items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <span
          className="inline-grid place-items-center size-10 shrink-0"
          style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
        >
          <Calendar className="size-5" />
        </span>
        <div>
          <p className="eyebrow mb-1.5" style={{ color: 'var(--color-clay-dark)' }}>
            Laatst nagekeken
          </p>
          <p className="text-[var(--color-ink)]">
            <strong>{formatBeDate(meta.lastUpdated)}.</strong>{' '}
            <span style={{ color: 'var(--color-mute)' }}>
              Informatie wordt actief opgevolgd. Wijzigingen in Vlaamse of Belgische wetgeving worden hier doorgevoerd.
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <span
          className="inline-grid place-items-center size-10 shrink-0"
          style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
        >
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <p className="eyebrow mb-1.5" style={{ color: 'var(--color-clay-dark)' }}>
            Disclaimer
          </p>
          <p style={{ color: 'var(--color-mute)' }} className="leading-relaxed">
            Deze informatie is opgesteld op basis van de Vlaamse en Belgische wetgeving zoals
            van kracht op de datum hierboven. Ze is <strong className="text-[var(--color-ink)]">informatief
            van aard</strong> en vervangt geen juridisch of fiscaal advies. Voor uw concrete situatie:
            contacteer ons of een notaris/jurist gespecialiseerd in vastgoed.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <span
          className="inline-grid place-items-center size-10 shrink-0"
          style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
        >
          <BookOpen className="size-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="eyebrow mb-2" style={{ color: 'var(--color-clay-dark)' }}>
            Officiële bronnen
          </p>
          <ul className="space-y-1.5">
            {meta.sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
