import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-paper)]/85 backdrop-blur-md border-b border-[var(--color-line)]">
      <div className="container-px mx-auto max-w-6xl flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-[var(--font-display)] text-xl md:text-2xl tracking-tight">
            Vastgoed Browaeys
          </span>
          <span className="eyebrow mt-1 text-[0.6rem]">Vlaamse Ardennen</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/te-koop" className="link-underline">Te koop</Link>
          <Link href="/te-huur" className="link-underline">Te huur</Link>
          <Link href="/ons-team" className="link-underline">Ons team</Link>
          <Link href="/contact" className="link-underline">Contact</Link>
          <Link href="/gratis-schatting" className="btn btn-outline !py-2 !px-4 text-xs">
            Gratis schatting
          </Link>
        </nav>

        {/* Mobile: korte tekst-CTA, geen burger-menu in deze fase */}
        <Link href="/contact" className="md:hidden text-sm link-underline">
          Contact
        </Link>
      </div>
    </header>
  )
}
