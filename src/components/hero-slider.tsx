'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, MessageCircle, MapPin } from 'lucide-react'

export type HeroSlide = {
  id: string
  href: string
  type: 'woning' | 'appartement' | 'bouwgrond' | 'handelspand'
  city: string
  zip: string
  title: string
  price: string
  image: string
}

const typeBadge: Record<HeroSlide['type'], { label: string; bg: string; text: string }> = {
  woning:      { label: 'Woning',      bg: 'var(--color-accent)',    text: 'var(--color-paper)' },
  appartement: { label: 'Appartement', bg: 'var(--color-clay)',      text: 'var(--color-ink)'   },
  bouwgrond:   { label: 'Bouwgrond',   bg: 'var(--color-moss)',      text: 'var(--color-paper)' },
  handelspand: { label: 'Handelspand', bg: 'var(--color-clay-dark)', text: 'var(--color-paper)' },
}

// 6 verschillende slagzinnen die door de statement-card rouleren — asynchroon van foto-slider.
const TAGLINES: Array<{ eyebrow: string; head: string; accent: string; sub: string }> = [
  {
    eyebrow: 'Vastgoed · Vlaamse Ardennen',
    head: 'Bemiddelen in vastgoed,',
    accent: 'vanuit het hart.',
    sub: 'Van eerste schatting tot ondertekening van de akte — Stefanie Browaeys begeleidt elk dossier persoonlijk.',
  },
  {
    eyebrow: 'Persoonlijk · BIV 504.553',
    head: 'Persoonlijk, vakkundig,',
    accent: 'vertrouwd.',
    sub: 'Geen tussenpersonen, geen call-centers — gewoon iemand die haar regio van binnen en buiten kent.',
  },
  {
    eyebrow: 'Sinds 2008',
    head: 'Uw woning,',
    accent: 'in goede handen.',
    sub: 'BIV-erkend vastgoedmakelaar. Bijna twee decennia ervaring met de lokale markt en haar fijne kneepjes.',
  },
  {
    eyebrow: 'Onze belofte',
    head: 'Doe altijd meer',
    accent: 'dan je belooft.',
    sub: 'Geen massa-aanpak, geen overhaaste deals — wel een doordachte begeleiding tot de laatste handdruk.',
  },
  {
    eyebrow: 'Lokaal verankerd',
    head: 'Onze streek,',
    accent: 'onze passie.',
    sub: 'Diepgewortelde kennis van de dorpen, de mensen en het landschap van de Vlaamse Ardennen.',
  },
  {
    eyebrow: 'Vrijblijvend & gratis',
    head: 'Een schatting,',
    accent: 'de eerste stap.',
    sub: 'Gratis en discreet, gebaseerd op actuele lokale marktcijfers. U bent tot niets verplicht.',
  },
]

/**
 * Hero met DRIE lagen — alles los van elkaar:
 *  1. Full-bleed foto-slider (12 fotos rouleren autonomously)
 *  2. Grote statische statement-card LINKSONDER (Celine-stijl):
 *     eyebrow + grote Fraunces-titel + tekst + 2 buttons
 *  3. Strip van 6 mini "Bekijk pand"-cards (Celine-thumbnail-stijl) onder de hero,
 *     glass-overlay rechtsonder per foto. Statisch, niet synced met de cyclus.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [idx, setIdx] = useState(0)
  const total = slides.length

  // Rouleerende slagzin in de statement-card — asynchroon van foto-slider
  const [tagIdx, setTagIdx] = useState(0)

  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total])
  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total])

  // Foto-slider: 9 sec — blijft draaien ook tijdens hover
  useEffect(() => {
    if (total < 2) return
    const t = setInterval(next, 9000)
    return () => clearInterval(t)
  }, [next, total])

  // Slagzin-cyclus: elke 7 sec (niet gesynchroniseerd met de foto's op 9 sec)
  useEffect(() => {
    const t = setInterval(() => {
      setTagIdx((i) => (i + 1) % TAGLINES.length)
    }, 7000)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      className="relative w-full overflow-hidden bg-[var(--color-ink)]"
    >
      {/* === LAAG 1: FOTO-SLIDER === */}
      <div className="relative h-[88vh] min-h-[680px] w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDuration: '2500ms' }}
            aria-hidden={i !== idx}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i < 2}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Algemene verduistering + gradient onderaan/links voor leesbaarheid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(26, 24, 21, 0.28)' }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(26,24,21,0.20) 0%, rgba(26,24,21,0) 40%, rgba(26,24,21,0) 60%, rgba(26,24,21,0.28) 100%)',
          }}
        />

        {/* === LAAG 2a: KLEINE PAND-INFO-CARD RECHTSONDER (synced met huidige foto-slide) === */}
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 lg:px-16 pb-8 md:pb-12 pointer-events-none hidden lg:block">
          <div className="flex justify-end">
            <div className="relative w-full max-w-xs">
              {slides.map((s, i) => {
                const sBadge = typeBadge[s.type]
                const visible = i === idx
                return (
                  <Link
                    key={s.id}
                    href={s.href}
                    aria-hidden={!visible}
                    tabIndex={visible ? 0 : -1}
                    className={`group block p-4 md:p-5 transition-all ease-out ${
                      visible
                        ? 'opacity-100 translate-y-0 pointer-events-auto relative'
                        : 'opacity-0 translate-y-3 pointer-events-none absolute inset-0'
                    }`}
                    style={{
                      transitionDuration: '1500ms',
                      transitionDelay: visible ? '400ms' : '0ms',
                      background: 'color-mix(in srgb, #faf8f4 65%, transparent)',
                      backdropFilter: 'blur(8px) saturate(130%)',
                      WebkitBackdropFilter: 'blur(8px) saturate(130%)',
                      border: '1px solid color-mix(in srgb, #ffffff 35%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="inline-block px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.16em] font-medium"
                        style={{ background: sBadge.bg, color: sBadge.text }}
                      >
                        {sBadge.label}
                      </span>
                      <span
                        className="text-[0.55rem] uppercase tracking-[0.16em] font-medium flex items-center gap-1"
                        style={{ color: 'var(--color-clay-dark)' }}
                      >
                        <MapPin className="size-2.5" />
                        {s.zip} {s.city}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-tight line-clamp-2"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
                    >
                      {s.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p
                        className="text-base italic"
                        style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
                      >
                        {s.price}
                      </p>
                      <ArrowRight
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ color: 'var(--color-accent)' }}
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* === LAAG 2: GROTE STATEMENT-CARD LINKSONDER (slagzin rouleert asynchroon) === */}
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 lg:px-16 pb-10 md:pb-14 pointer-events-none">
          <div className="flex justify-start">
            <div
              className="relative w-[85%] max-w-2xl p-5 md:p-12 pointer-events-auto overflow-hidden min-h-[180px] md:min-h-[320px]"
              style={{
                background: 'color-mix(in srgb, #faf8f4 62%, transparent)',
                backdropFilter: 'blur(8px) saturate(130%)',
                WebkitBackdropFilter: 'blur(8px) saturate(130%)',
                border: '1px solid color-mix(in srgb, #ffffff 35%, transparent)',
                boxShadow: '0 24px 48px -20px rgba(0,0,0,0.25)',
              }}
            >
              <div key={tagIdx} style={{ animation: 'vb-tag-fade 900ms ease-out' }}>
                <p
                  className="text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.22em] md:tracking-[0.28em] font-medium mb-3 md:mb-5"
                  style={{ color: 'var(--color-clay-dark)' }}
                >
                  {TAGLINES[tagIdx].eyebrow}
                </p>
                <h1
                  className="text-xl md:text-5xl lg:text-6xl leading-[1.1] md:leading-[1.05] tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {TAGLINES[tagIdx].head}
                  <br />
                  <span className="italic" style={{ color: 'var(--color-accent)' }}>
                    {TAGLINES[tagIdx].accent}
                  </span>
                </h1>
                <p
                  className="mt-3 md:mt-6 text-xs md:text-lg leading-relaxed max-w-lg"
                  style={{ color: 'var(--color-mute)' }}
                >
                  {TAGLINES[tagIdx].sub}
                </p>
              </div>

              <div className="mt-4 md:mt-8 flex flex-wrap gap-2 md:gap-3 relative">
                <Link
                  href="/te-koop"
                  className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors"
                  style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
                >
                  <LayoutGrid className="size-3.5 md:size-4" />
                  Bekijk aanbod
                </Link>
                <Link
                  href="/gratis-schatting"
                  className="hidden md:inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--color-ink)', color: 'var(--color-ink)' }}
                >
                  <MessageCircle className="size-3.5 md:size-4" />
                  Plan een gesprek
                </Link>
              </div>

              {/* Slagzin-indicator: 6 dunne streepjes */}
              <div className="mt-3 md:mt-6 flex gap-1 md:gap-1.5 pointer-events-none relative">
                {TAGLINES.map((_, i) => (
                  <span
                    key={i}
                    className="h-[2px] rounded-full transition-all duration-500"
                    style={{
                      width: i === tagIdx ? '20px' : '8px',
                      background:
                        i === tagIdx
                          ? 'var(--color-accent)'
                          : 'color-mix(in srgb, var(--color-clay-dark) 35%, transparent)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === Scroll-indicator (muiswieltje) onderaan midden === */}
        <button
          type="button"
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
          aria-label="Scroll naar volgende sectie"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 grid place-items-center pointer-events-auto cursor-pointer p-2"
          style={{ color: 'var(--color-paper)' }}
        >
          <div className="vb-mouse">
            <span className="vb-wheel" />
          </div>
        </button>

        <style>{`
          @keyframes vb-tag-fade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .vb-mouse {
            width: 22px;
            height: 34px;
            border: 1.5px solid color-mix(in srgb, #faf8f4 75%, transparent);
            border-radius: 12px;
            position: relative;
            transition: border-color 0.2s ease;
          }
          .vb-mouse:hover {
            border-color: var(--color-paper);
          }
          .vb-wheel {
            position: absolute;
            top: 6px;
            left: 50%;
            width: 2px;
            height: 6px;
            border-radius: 2px;
            background: color-mix(in srgb, #faf8f4 85%, transparent);
            transform: translateX(-50%);
            animation: vb-scroll-wheel 1.8s ease-in-out infinite;
          }
          @keyframes vb-scroll-wheel {
            0%   { transform: translate(-50%, 0);    opacity: 1;   }
            50%  { transform: translate(-50%, 10px); opacity: 0.2; }
            100% { transform: translate(-50%, 0);    opacity: 1;   }
          }
          @media (min-width: 768px) {
            .vb-mouse { width: 26px; height: 42px; border-width: 2px; }
            .vb-wheel { height: 8px; top: 8px; }
            @keyframes vb-scroll-wheel {
              0%   { transform: translate(-50%, 0);    opacity: 1;   }
              50%  { transform: translate(-50%, 14px); opacity: 0.2; }
              100% { transform: translate(-50%, 0);    opacity: 1;   }
            }
          }
        `}</style>

        {/* === Foto-navigatie (pijltjes + dots) — discreet rechtsboven === */}
        {total > 1 && (
          <div className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-3">
            <div className="flex gap-2 mr-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Toon pand ${i + 1}`}
                  className="h-[3px] rounded-full transition-all duration-500"
                  style={{
                    width: i === idx ? '28px' : '14px',
                    background:
                      i === idx
                        ? 'var(--color-paper)'
                        : 'color-mix(in srgb, #faf8f4 45%, transparent)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={prev}
              aria-label="Vorig pand"
              className="hidden md:grid size-10 place-items-center rounded-full"
              style={{
                background: 'color-mix(in srgb, #faf8f4 70%, transparent)',
                backdropFilter: 'blur(10px)',
                border: '1px solid color-mix(in srgb, #ffffff 30%, transparent)',
                color: 'var(--color-ink)',
              }}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={next}
              aria-label="Volgend pand"
              className="hidden md:grid size-10 place-items-center rounded-full"
              style={{
                background: 'color-mix(in srgb, #faf8f4 70%, transparent)',
                backdropFilter: 'blur(10px)',
                border: '1px solid color-mix(in srgb, #ffffff 30%, transparent)',
                color: 'var(--color-ink)',
              }}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

    </section>
  )
}
