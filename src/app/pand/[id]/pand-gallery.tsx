'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'

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
      {/* Grid van eerste 6 foto's; klik opent lightbox */}
      <div className="container-px mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {images.slice(0, 6).map((src, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setLightbox(true) }}
              className={`relative overflow-hidden cursor-zoom-in transition-opacity hover:opacity-95 ${
                i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
              }`}
              style={{ background: 'var(--color-paper-2)' }}
            >
              <Image
                src={src}
                alt={`${alt} — foto ${i + 1}`}
                fill
                sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              {i === 5 && images.length > 6 && (
                <div className="absolute inset-0 grid place-items-center"
                  style={{ background: 'rgba(26,26,26,0.55)', backdropFilter: 'blur(2px)' }}>
                  <span className="text-white text-lg md:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    + {images.length - 6} foto&apos;s
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
        {images.length > 6 && (
          <button
            onClick={() => { setIdx(0); setLightbox(true) }}
            className="mt-4 inline-flex items-center gap-2 text-sm link-underline"
          >
            <Expand className="size-4" />
            Toon alle {images.length} foto&apos;s
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(26, 26, 26, 0.94)' }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
            className="absolute top-6 right-6 size-12 grid place-items-center"
            style={{ color: 'var(--color-paper)' }}
            aria-label="Sluit"
          >
            <X className="size-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-6 size-12 grid place-items-center"
                style={{ color: 'var(--color-paper)' }}
                aria-label="Vorige"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-6 size-12 grid place-items-center"
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
