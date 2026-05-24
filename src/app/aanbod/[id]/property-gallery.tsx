'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'

export function PropertyGallery({
  images,
  alt,
  overlayCard,
}: {
  images: string[]
  alt: string
  overlayCard?: React.ReactNode
}) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const next = () => setIdx((i) => (i + 1) % images.length)
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)

  // Keyboard shortcuts wanneer lightbox open is: Esc sluit, ← / → navigeren
  // + scroll-lock op body
  useEffect(() => {
    if (!lightbox) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

  return (
    <>
      {/* === Hoofdfoto met overlay-card linksonder — hero-formaat === */}
      <div
        className="relative w-full h-[80vh] min-h-[560px] overflow-hidden"
        style={{ background: 'var(--color-paper-2)' }}
      >
        <button
          onClick={() => setLightbox(true)}
          className="absolute inset-0 group cursor-zoom-in"
          aria-label="Open volledig scherm"
        >
          <Image
            src={images[idx]}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </button>

        {/* Volledig-scherm-knop rechtsboven */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors"
          style={{
            background: 'color-mix(in srgb, #faf8f4 80%, transparent)',
            backdropFilter: 'blur(8px)',
            color: 'var(--color-ink)',
          }}
          aria-label="Volledig scherm"
        >
          <Expand className="size-3" />
          Volledig scherm
        </button>

        {/* Pijltjes links/rechts (alleen als meer dan 1 foto) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Vorige foto"
              className="absolute left-4 top-1/2 -translate-y-1/2 size-11 grid place-items-center rounded-full transition-all hover:scale-105"
              style={{
                background: 'color-mix(in srgb, #faf8f4 80%, transparent)',
                backdropFilter: 'blur(8px)',
                color: 'var(--color-ink)',
              }}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Volgende foto"
              className="absolute right-4 top-1/2 -translate-y-1/2 size-11 grid place-items-center rounded-full transition-all hover:scale-105"
              style={{
                background: 'color-mix(in srgb, #faf8f4 80%, transparent)',
                backdropFilter: 'blur(8px)',
                color: 'var(--color-ink)',
              }}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Foto-teller rechtsonder */}
        {images.length > 1 && (
          <span
            className="absolute bottom-4 right-4 inline-block px-3 py-1.5 text-xs"
            style={{
              background: 'color-mix(in srgb, #1a1a1a 70%, transparent)',
              backdropFilter: 'blur(8px)',
              color: 'var(--color-paper)',
            }}
          >
            {idx + 1} / {images.length}
          </span>
        )}

        {/* Optionele glass-card overlay linksonder (Celine-stijl) — volgt container-padding */}
        {overlayCard && (
          <div className="absolute inset-x-0 bottom-4 md:bottom-6 pointer-events-none">
            <div className="container-px mx-auto max-w-screen-2xl">
              <div className="md:max-w-md pointer-events-auto">{overlayCard}</div>
            </div>
          </div>
        )}
      </div>

      {/* === Horizontale thumbnail-strip — in container, mooie marge === */}
      {images.length > 1 && (
        <div className="container-px mx-auto max-w-screen-2xl mt-3 relative">
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mb-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="relative shrink-0 w-24 md:w-32 aspect-[4/3] overflow-hidden transition-all"
                style={{
                  background: 'var(--color-paper-2)',
                  outline: i === idx ? '2px solid var(--color-accent)' : 'none',
                  outlineOffset: '-2px',
                  opacity: i === idx ? 1 : 0.55,
                }}
                aria-label={`Toon foto ${i + 1}`}
                aria-pressed={i === idx}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover hover:opacity-100"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === Lightbox === */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(26, 26, 26, 0.92)' }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
            className="absolute top-6 right-6 size-12 grid place-items-center transition-colors"
            style={{ color: 'var(--color-paper)' }}
            aria-label="Sluit"
          >
            <X className="size-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-6 size-12 grid place-items-center transition-colors"
            style={{ color: 'var(--color-paper)' }}
            aria-label="Vorige"
          >
            <ChevronLeft className="size-8" />
          </button>

          <div
            className="relative w-full max-w-6xl aspect-[16/10] mx-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[idx]}
              alt={alt}
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-6 size-12 grid place-items-center transition-colors"
            style={{ color: 'var(--color-paper)' }}
            aria-label="Volgende"
          >
            <ChevronRight className="size-8" />
          </button>

          <p
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm"
            style={{ color: 'rgba(250, 248, 244, 0.75)' }}
          >
            {idx + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
