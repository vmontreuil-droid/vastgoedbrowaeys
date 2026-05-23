import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

export type ServicePageProps = {
  /** Eyebrow boven de h1 */
  eyebrow: string
  /** Titel — laatste woord komt in petrol-italic */
  title: string
  titleAccent: string
  /** Korte intro onder de hero */
  intro: string
  /** Lopende tekst (twee tot drie paragrafen) */
  bodyParagraphs: string[]
  /** Lijst van USP's of stappen — wordt in een grid getoond */
  steps: { title: string; body: string }[]
  /** Call-to-action onderaan */
  ctaTitle: string
  ctaBody: string
  ctaPrimary: { href: string; label: string }
  ctaSecondary?: { href: string; label: string }
}

export function ServicePage(props: ServicePageProps) {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">{props.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            {props.title}{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              {props.titleAccent}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">{props.intro}</p>
        </section>

        {/* Body content + USPs */}
        <section className="container-px mx-auto max-w-screen-2xl py-12 md:py-20 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 space-y-6">
            {props.bodyParagraphs.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed text-[var(--color-mute)]">
                {p}
              </p>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-6">
              {props.steps.map((s) => (
                <div key={s.title} className="flex gap-4">
                  <span
                    className="grid place-items-center size-8 shrink-0 rounded-full mt-0.5"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
                  >
                    <Check className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-mute)] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA blok */}
        <section style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}>
          <div className="container-px mx-auto max-w-screen-2xl py-20 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl max-w-3xl mx-auto" style={{ color: 'var(--color-paper)' }}>
              {props.ctaTitle}
            </h2>
            <p
              className="mt-6 text-lg max-w-xl mx-auto"
              style={{ color: 'rgba(250, 248, 244, 0.85)' }}
            >
              {props.ctaBody}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href={props.ctaPrimary.href}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm transition-colors"
                style={{ background: 'var(--color-paper)', color: 'var(--color-accent)' }}
              >
                {props.ctaPrimary.label}
                <ArrowRight className="size-4" />
              </Link>
              {props.ctaSecondary && (
                <Link
                  href={props.ctaSecondary.href}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm border transition-colors"
                  style={{ borderColor: 'var(--color-clay)', color: 'var(--color-clay)' }}
                >
                  {props.ctaSecondary.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
