import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactForm } from './contact-form'
import { ContactMapWrapper } from '@/components/contact-map-wrapper'

export const metadata = {
  title: 'Contact',
  description: 'Contacteer Vastgoed Browaeys — kantoor Horebeke, Vlaamse Ardennen.',
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="container-px mx-auto max-w-screen-2xl pt-16 md:pt-20 pb-10 md:pb-14">
          <p className="eyebrow mb-4">Welkom</p>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Een{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              persoonlijk gesprek
            </span>
            <br />zegt meer dan een formulier.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-mute)]">
            Bel gerust, mail of kom langs in het kantoor in Horebeke. Geen
            wachttijden, geen ticketsystemen — Stefanie neemt zelf op.
          </p>
        </section>

        <section className="container-px mx-auto max-w-screen-2xl py-12 grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact info */}
          <div className="lg:col-span-5 space-y-8">
            <ContactBlock
              icon={<Phone className="size-5" />}
              label="Telefoon"
              primary={<a href="tel:+3255595010" className="link-underline">+32 (0)55 59 50 10</a>}
              hint="Ma–Vr van 9 tot 18u — vrijblijvend"
            />
            <ContactBlock
              icon={<Mail className="size-5" />}
              label="E-mail"
              primary={<a href="mailto:info@vastgoedbrowaeys.be" className="link-underline">info@vastgoedbrowaeys.be</a>}
              hint="Antwoord binnen de werkdag"
            />
            <ContactBlock
              icon={<MapPin className="size-5" />}
              label="Kantoor"
              primary={<>Dorpsstraat 93/00.1<br />9667 Horebeke</>}
              hint="Best na afspraak — sommige dagen op de baan"
            />
            <ContactBlock
              icon={<Clock className="size-5" />}
              label="Openingsuren"
              primary={
                <>
                  Ma–Vr · 9u00–18u00
                  <br />
                  Zaterdag · op afspraak
                  <br />
                  Zon- & feestdagen · gesloten
                </>
              }
            />

            <div
              className="p-6 mt-8"
              style={{ background: 'var(--color-paper-2)' }}
            >
              <p className="eyebrow mb-2" style={{ color: 'var(--color-clay-dark)' }}>BTW & BIV</p>
              <p className="text-sm text-[var(--color-mute)]">
                BTW BE 0809.068.684
                <br />
                BIV erkend vastgoedmakelaar-bemiddelaar nr. 504.553
              </p>
            </div>
          </div>

          {/* Formulier */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl md:text-3xl mb-6">
              Of laat hier een bericht na
            </h2>
            <ContactForm />
          </div>
        </section>

        {/* === Interactieve kaart op kantoor-locatie === */}
        <section className="w-full mt-12">
          <ContactMapWrapper />
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function ContactBlock({ icon, label, primary, hint }: { icon: React.ReactNode; label: string; primary: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="grid place-items-center size-10 shrink-0 mt-0.5"
        style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
      >
        {icon}
      </span>
      <div>
        <p className="eyebrow text-[0.6rem]">{label}</p>
        <div className="mt-1 text-base leading-relaxed">{primary}</div>
        {hint && <p className="mt-1 text-xs text-[var(--color-mute)]">{hint}</p>}
      </div>
    </div>
  )
}
