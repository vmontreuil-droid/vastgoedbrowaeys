import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-paper)]">
      <div className="container-px mx-auto max-w-6xl py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          <div className="col-span-2 md:col-span-2">
            <span className="font-[var(--font-display)] text-xl md:text-2xl">Vastgoed Browaeys</span>
            <p className="eyebrow mt-2 text-[0.6rem]">Vlaamse Ardennen</p>
            <p className="mt-6 text-sm text-[var(--color-mute)] max-w-sm leading-relaxed">
              Bemiddelen in vastgoed, vanuit het hart.
              <br />
              Doe altijd meer dan je belooft.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4">Aanbod</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/te-koop" className="link-underline">Te koop</Link></li>
              <li><Link href="/te-huur" className="link-underline">Te huur</Link></li>
              <li><Link href="/gratis-schatting" className="link-underline">Gratis schatting</Link></li>
              <li><Link href="/hou-me-op-de-hoogte" className="link-underline">Houd me op de hoogte</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Contact</p>
            <address className="not-italic text-sm text-[var(--color-mute)] space-y-1 leading-relaxed">
              <div>Dorpsstraat 93/00.1</div>
              <div>9667 Horebeke</div>
              <div className="pt-2"><a href="tel:+3255595010" className="link-underline text-[var(--color-ink)]">+32 (0)55 59 50 10</a></div>
              <div><a href="mailto:info@vastgoedbrowaeys.be" className="link-underline text-[var(--color-ink)]">info@vastgoedbrowaeys.be</a></div>
            </address>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-line)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--color-mute)]">
          <div>
            BIV 504.553 · BTW BE 0809.068.684 · Stefanie Browaeys, vastgoedmakelaar-bemiddelaar
          </div>
          <div className="flex gap-6">
            <Link href="/gebruiksvoorwaarden" className="link-underline">Gebruiksvoorwaarden</Link>
            <Link href="/privacy-verklaring" className="link-underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
