'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { convertLeadToListingAction } from '../convert-actions'

export function ConvertToListingButton({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string; listingId?: string } | null>(null)

  function convert() {
    if (!confirm(
      'Pand-info en cover-foto naar jouw "Aanbod" overzetten?\n\n' +
      '⚠ Belangrijk:\n' +
      '• De foto staat onder auteursrecht van de vorige makelaar/fotograaf.\n' +
      '• Vervang ze door eigen foto\'s vóór publicatie.\n' +
      '• Het nieuwe pand staat als "concept" tot je het publiceert.'
    )) return

    setFeedback(null)
    startTransition(async () => {
      const res = await convertLeadToListingAction(leadId)
      if (res.ok) {
        setFeedback({
          ok: true,
          msg: `Pand aangemaakt · ${res.importedPhotos} foto('s) geïmporteerd${res.failedPhotos > 0 ? ` · ${res.failedPhotos} mislukt` : ''}`,
          listingId: res.listingId,
        })
        setTimeout(() => router.push(`/admin/aanbod/${res.listingId}/bewerken`), 1500)
      } else {
        setFeedback({ ok: false, msg: res.error })
      }
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={convert}
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs disabled:opacity-50"
        style={{ background: 'var(--color-accent)', color: '#fff' }}
      >
        <ArrowRightLeft className="size-3.5" />
        {pending ? 'Bezig…' : 'Converteer naar mijn aanbod'}
      </button>
      <p className="mt-1.5 text-[0.6rem] text-[var(--color-mute)]">
        Maakt een conceptpand aan in /admin/aanbod met de info + cover-foto.
        Status van deze lead wordt &ldquo;Klant geworden&rdquo;.
      </p>
      {feedback && (
        <p className="mt-2 text-[0.7rem] inline-flex items-center gap-1"
          style={{ color: feedback.ok ? '#166534' : '#b91c1c' }}>
          {feedback.ok ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
          {feedback.msg}
          {feedback.ok && feedback.listingId && ' — opent het pand…'}
        </p>
      )}
    </div>
  )
}
