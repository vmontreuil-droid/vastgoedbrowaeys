import { BellRing } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SubscribeForm } from './subscribe-form'

export const metadata = {
  title: 'Houd me op de hoogte',
  description:
    'Schrijf u in voor persoonlijke meldingen — krijg een seintje zodra er een pand op de markt komt dat aan uw criteria voldoet.',
}

export default function HouMeOpDeHoogtePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <div
            className="inline-grid place-items-center size-14 mb-8"
            style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
          >
            <BellRing className="size-6" />
          </div>
          <p className="eyebrow mb-4">Persoonlijke meldingen</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Houd me{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              op de hoogte.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            De goede panden zijn vaak snel weg. Laat uw criteria achter en u krijgt een
            persoonlijk seintje zodra er iets passend op de markt komt — geen ruis, geen
            generieke nieuwsbrief.
          </p>
        </section>

        <section className="container-px mx-auto max-w-3xl py-12 md:py-16">
          <SubscribeForm />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
