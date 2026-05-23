import Link from 'next/link'
import { Lock } from 'lucide-react'
import { BrandLogo } from './brand-logo'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.063 4.388 23.027 10.125 23.927V15.563H7.078V12.073H10.125V9.413C10.125 6.406 11.917 4.744 14.658 4.744C15.97 4.744 17.344 4.979 17.344 4.979V7.932H15.83C14.339 7.932 13.874 8.857 13.874 9.806V12.073H17.203L16.671 15.563H13.874V23.927C19.612 23.027 24 18.063 24 12.073Z"/>
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-paper)]">
      <div className="container-px mx-auto max-w-screen-2xl py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="col-span-2 lg:col-span-2">
            <BrandLogo height={40} />
            <p className="mt-6 text-sm text-[var(--color-mute)] max-w-sm leading-relaxed">
              Bemiddelen in vastgoed, vanuit het hart.
              <br />
              Doe altijd meer dan je belooft.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com/vastgoedbrowaeys"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vastgoed Browaeys op Facebook"
                className="grid place-items-center size-10 transition-colors"
                style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/vastgoed_browaeys/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vastgoed Browaeys op Instagram"
                className="grid place-items-center size-10 transition-colors"
                style={{ background: 'var(--color-paper-2)', color: 'var(--color-accent)' }}
              >
                <InstagramIcon className="size-4" />
              </a>
            </div>

            {/* Wettelijke vermeldingen — onder de social icons */}
            <div className="mt-8 pt-6 border-t text-xs space-y-1 max-w-sm" style={{ borderColor: 'var(--color-line)', color: 'var(--color-mute)' }}>
              <div className="text-[var(--color-ink)]">Stefanie Browaeys</div>
              <div>Vastgoedmakelaar-bemiddelaar</div>
              <div>BIV 504.553</div>
              <div>BTW BE 0809.068.684</div>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Aanbod</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/te-koop" className="link-underline">Te koop</Link></li>
              <li><Link href="/te-huur" className="link-underline">Te huur</Link></li>
              <li><Link href="/referenties" className="link-underline">Realisaties</Link></li>
              <li><Link href="/gratis-schatting" className="link-underline">Gratis schatting</Link></li>
              <li><Link href="/hou-me-op-de-hoogte" className="link-underline">Houd me op de hoogte</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Info & wetgeving</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/info/kopen" className="link-underline">Kopen</Link></li>
              <li><Link href="/info/verkopen" className="link-underline">Verkopen</Link></li>
              <li><Link href="/info/huren" className="link-underline">Huren & verhuren</Link></li>
              <li><Link href="/info/epc" className="link-underline">EPC uitgelegd</Link></li>
              <li><Link href="/info/woordenlijst" className="link-underline">Woordenlijst</Link></li>
              <li><Link href="/info/faq" className="link-underline">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Contact</p>
            <address className="not-italic text-sm text-[var(--color-mute)] space-y-1 leading-relaxed">
              <div>Dorpsstraat 93/00.1</div>
              <div>9667 Horebeke</div>
              <div className="pt-2">
                <a href="tel:+3255595010" className="link-underline text-[var(--color-ink)]">
                  +32 (0)55 59 50 10
                </a>
              </div>
              <div>
                <a href="mailto:info@vastgoedbrowaeys.be" className="link-underline text-[var(--color-ink)]">
                  info@vastgoedbrowaeys.be
                </a>
              </div>
            </address>
          </div>
        </div>

      </div>

      {/* === Subfooter — copyright, legal links & credits === */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper-2)' }}
      >
        <div className="container-px mx-auto max-w-screen-2xl py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[0.7rem]" style={{ color: 'var(--color-mute)' }}>
          <span>© {new Date().getFullYear()} Vastgoed Browaeys — alle rechten voorbehouden.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/gebruiksvoorwaarden" className="link-underline">Gebruiksvoorwaarden</Link>
            <Link href="/privacy-verklaring" className="link-underline">Privacy</Link>
            <Link href="/portaal/login" className="link-underline">Klantenportaal</Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Beheer"
              title="Beheer"
            >
              <Lock className="size-3" />
            </Link>
            <span>
              Webcreatie door{' '}
              <a
                href="https://studio-vm.be"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
                style={{ color: 'var(--color-ink)' }}
              >
                studio-vm.be
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
