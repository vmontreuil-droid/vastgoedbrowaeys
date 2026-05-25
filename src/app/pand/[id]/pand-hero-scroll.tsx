'use client'

/**
 * Scroll-cue onderaan de pand-hero (muiswieltje, zelfde patroon als
 * homepage hero-slider). Smooth-scroll naar de Kerngegevens-strip
 * onder de hero bij klik.
 */
export function PandHeroScroll() {
  return (
    <button
      type="button"
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
      aria-label="Scroll naar volgende sectie"
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 grid place-items-center pointer-events-auto cursor-pointer p-2"
      style={{ color: 'var(--color-paper)' }}
    >
      <div className="vb-pand-mouse">
        <span className="vb-pand-wheel" />
      </div>

      <style>{`
        .vb-pand-mouse {
          width: 22px;
          height: 34px;
          border: 1.5px solid color-mix(in srgb, #faf8f4 75%, transparent);
          border-radius: 12px;
          position: relative;
          transition: border-color 0.2s ease;
        }
        .vb-pand-mouse:hover {
          border-color: var(--color-paper);
        }
        .vb-pand-wheel {
          position: absolute;
          top: 6px;
          left: 50%;
          width: 2px;
          height: 6px;
          border-radius: 2px;
          background: color-mix(in srgb, #faf8f4 85%, transparent);
          transform: translateX(-50%);
          animation: vb-pand-scroll-wheel 1.8s ease-in-out infinite;
        }
        @keyframes vb-pand-scroll-wheel {
          0%   { transform: translate(-50%, 0);    opacity: 1;   }
          50%  { transform: translate(-50%, 10px); opacity: 0.2; }
          100% { transform: translate(-50%, 0);    opacity: 1;   }
        }
        @media (min-width: 768px) {
          .vb-pand-mouse { width: 26px; height: 42px; border-width: 2px; }
          .vb-pand-wheel { height: 8px; top: 8px; }
          @keyframes vb-pand-scroll-wheel {
            0%   { transform: translate(-50%, 0);    opacity: 1;   }
            50%  { transform: translate(-50%, 14px); opacity: 0.2; }
            100% { transform: translate(-50%, 0);    opacity: 1;   }
          }
        }
      `}</style>
    </button>
  )
}
