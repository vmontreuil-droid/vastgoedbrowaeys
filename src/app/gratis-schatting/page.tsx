import { Check } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SchattingForm } from './schatting-form'

export const metadata = {
  title: 'Gratis schatting',
  description:
    'Een gratis en vrijblijvende schatting van uw woning, appartement of bouwgrond — door een BIV-erkend vastgoedmakelaar.',
}

export default function GratisSchattingPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Vrijblijvend</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-4xl">
            Wat is uw eigendom{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              vandaag waard?
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            Een gratis en geheel vrijblijvende schatting, gemaakt door een BIV-erkend
            makelaar met diepe kennis van de lokale markt. U bent tot niets verplicht.
          </p>
        </section>

        <section className="container-px mx-auto max-w-screen-2xl py-12 grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* USPs */}
          <aside className="lg:col-span-4">
            <div className="space-y-6">
              <USPItem
                title="Door een BIV-makelaar"
                body="Stefanie Browaeys is BIV-erkend (504.553). Geen automatische tools — een
                  echte plaatsbezoek met onderbouwde prijsadvies."
              />
              <USPItem
                title="100% gratis & vrijblijvend"
                body="Geen kosten, geen verkoopopdracht, geen druk. U beslist wat u met de
                  schatting doet."
              />
              <USPItem
                title="Discreet & vertrouwelijk"
                body="Uw gegevens worden enkel intern gebruikt voor deze schatting — nooit
                  doorgegeven aan derden."
              />
              <USPItem
                title="Binnen de 5 werkdagen"
                body="Na het plaatsbezoek ontvangt u uw schattingsverslag binnen vijf werkdagen,
                  zwart op wit."
              />
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-8">
            <SchattingForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function USPItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <span
        className="grid place-items-center size-8 shrink-0 rounded-full mt-0.5"
        style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
      >
        <Check className="size-4" />
      </span>
      <div>
        <h3 className="text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-mute)] leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
