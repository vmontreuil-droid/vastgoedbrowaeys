'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * Masonry-layout: alle foto's tegelijk zichtbaar in een CSS-column-grid
 * (Pinterest-stijl). Klik op een foto opent een lightbox met keyboard-
 * navigatie. Eerste foto krijgt een extra 'span' om wat hiërarchie te
 * geven.
 */
export function PandGallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const next = () => setIdx((i) => (i + 1) % images.length)
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox])

  return (
    <>
      <div className="container-px mx-auto max-w-screen-2xl">
        {/* CSS Masonry: variabele rij-hoogtes door columns + break-inside */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => { setIdx(i); setLightbox(true) }}
              className="relative w-full mb-3 md:mb-4 overflow-hidden block cursor-zoom-in group break-inside-avoid"
              style={{ background: 'var(--color-paper-2)' }}
              aria-label={`Open foto ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} — foto ${i + 1}`}
                width={800}
                height={i % 3 === 0 ? 1000 : i % 3 === 1 ? 600 : 800}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {/* Subtle gradient om de cursor-zoom in te geven */}
              <span
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to bottom, transparent 70%, rgba(26,26,26,0.25))',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox met blur-backdrop */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(26, 26, 26, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
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
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-6 size-12 grid place-items-center transition-colors"
                style={{ color: 'var(--color-paper)' }}
                aria-label="Vorige"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-6 size-12 grid place-items-center transition-colors"
                style={{ color: 'var(--color-paper)' }}
                aria-label="Volgende"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}
          <div
            className="relative w-full max-w-6xl aspect-[16/10] mx-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[idx]}
              alt={alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
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
