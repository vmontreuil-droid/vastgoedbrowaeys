'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause, ArrowRight } from 'lucide-react'

export function StefanieReel({
  src = '/video/stefanie-intro.mp4',
  poster,
}: {
  src?: string
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  // Autoplay-muted-when-in-viewport (zoals reels)
  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            video.play().then(() => setPlaying(true)).catch(() => {})
          } else {
            video.pause()
            setPlaying(false)
          }
        }
      },
      { threshold: [0, 0.5, 1] },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <section
      className="container-px mx-auto max-w-screen-2xl py-16 md:py-24"
      style={{ borderTop: '1px solid var(--color-line)' }}
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Tekst */}
        <div className="order-2 lg:order-1">
          <p className="eyebrow mb-4">Persoonlijk</p>
          <h2 className="text-3xl md:text-5xl mb-5">
            Maak kennis met{' '}
            <span className="italic" style={{ color: 'var(--color-accent)' }}>
              Stefanie.
            </span>
          </h2>
          <p className="text-lg text-[var(--color-mute)] max-w-xl leading-relaxed">
            Geen call-center, geen massaproductie — wel iemand die elke straat in de Vlaamse
            Ardennen kent. Ontdek in 30 seconden hoe Vastgoed Browaeys werkt.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/ons-team"
              className="btn btn-solid"
            >
              Het volledige team
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline"
            >
              Contact opnemen
            </Link>
          </div>
        </div>

        {/* Video — vertical reel 9:16 */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div
            ref={containerRef}
            className="relative w-full sm:max-w-md lg:max-w-lg aspect-[9/16] lg:aspect-[4/5] overflow-hidden"
            style={{ background: 'var(--color-paper-2)' }}
          >
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              muted
              loop
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
            />

            {/* Mute toggle rechts-onder */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Geluid aan' : 'Geluid uit'}
              className="absolute bottom-3 right-3 size-10 grid place-items-center transition-colors"
              style={{
                background: 'color-mix(in srgb, #1a1a1a 70%, transparent)',
                backdropFilter: 'blur(8px)',
                color: 'var(--color-paper)',
              }}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>

            {/* Play-overlay als gepauzeerd */}
            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Speel video af"
                className="absolute inset-0 grid place-items-center transition-opacity"
                style={{
                  background: 'color-mix(in srgb, #1a1a1a 30%, transparent)',
                }}
              >
                <span
                  className="size-16 grid place-items-center rounded-full"
                  style={{
                    background: 'color-mix(in srgb, #faf8f4 90%, transparent)',
                    color: 'var(--color-ink)',
                  }}
                >
                  <Play className="size-7 fill-current" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
