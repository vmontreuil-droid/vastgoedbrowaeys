'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import {
  Mail,
  Phone,
  BadgeCheck,
  Pencil,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Power,
  Camera,
  X as XIcon,
} from 'lucide-react'
import {
  updateTeamMemberAction,
  deleteTeamMemberAction,
  setActiveAction,
} from './actions'
import { uploadTeamPhotoAction, removeTeamPhotoAction } from './photo-actions'

export type TeamMember = {
  id: string
  email: string
  firstName: string
  lastName: string
  title?: string
  phone?: string
  bivNumber?: string
  photoUrl?: string
  active: boolean
}

function getInitials(firstName: string, lastName: string, email: string): string {
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  const fromName = (first + last).toUpperCase()
  if (fromName) return fromName
  return (email[0] || '?').toUpperCase()
}

export function TeamMemberCard({
  member,
  isSelf,
  viewerIsZaakvoerder = false,
}: {
  member: TeamMember
  isSelf: boolean
  viewerIsZaakvoerder?: boolean
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [photoBusy, setPhotoBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setPhotoBusy(true)
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const res = await uploadTeamPhotoAction(member.id, fd)
      setPhotoBusy(false)
      if (!res.ok) setError(res.error)
      if (photoInputRef.current) photoInputRef.current.value = ''
    })
  }

  function handlePhotoRemove() {
    if (!confirm('Foto verwijderen?')) return
    setError(null)
    setPhotoBusy(true)
    startTransition(async () => {
      const res = await removeTeamPhotoAction(member.id)
      setPhotoBusy(false)
      if (!res.ok) setError(res.error ?? 'Verwijderen mislukt')
    })
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateTeamMemberAction(member.id, formData)
      if (res.ok) {
        setMode('view')
      } else {
        setError(res.error)
      }
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const res = await deleteTeamMemberAction(member.id)
      if (!res.ok) {
        setError(res.error)
      }
    })
  }

  function handleToggleActive() {
    setError(null)
    startTransition(async () => {
      const res = await setActiveAction(member.id, !member.active)
      if (!res.ok) {
        setError(res.error)
      }
    })
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-paper)',
    border: '1px solid var(--color-line)',
    opacity: member.active ? 1 : 0.65,
  }

  if (mode === 'edit') {
    return (
      <article className="p-5" style={cardStyle}>
        {error && (
          <div
            className="flex items-start gap-2 p-2 mb-3 text-xs"
            style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c' }}
          >
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form ref={formRef} onSubmit={handleUpdate} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">Voornaam</span>
              <input
                type="text"
                name="first_name"
                defaultValue={member.firstName}
                required
                className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">Familienaam</span>
              <input
                type="text"
                name="last_name"
                defaultValue={member.lastName}
                required
                className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
          </div>

          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1 block">Functie / titel</span>
            <input
              type="text"
              name="title"
              defaultValue={member.title ?? ''}
              className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
              style={{ border: '1px solid var(--color-line)' }}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">Telefoon</span>
              <input
                type="tel"
                name="phone"
                defaultValue={member.phone ?? ''}
                className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[0.55rem] mb-1 block">BIV-nummer</span>
              <input
                type="text"
                name="biv_number"
                defaultValue={member.bivNumber ?? ''}
                className="w-full px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
            </label>
          </div>

          <label className="block">
            <span className="eyebrow text-[0.55rem] mb-1 block">
              Nieuw wachtwoord (leeg laten = onveranderd)
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 tekens"
                className="w-full px-2 py-1.5 pr-8 text-sm bg-transparent focus:outline-none focus:border-[var(--color-accent)]"
                style={{ border: '1px solid var(--color-line)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-mute)]"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('view')
                setError(null)
              }}
              className="text-xs link-underline text-[var(--color-mute)]"
              disabled={pending}
            >
              Annuleer
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
              style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
            >
              <Check className="size-3.5" />
              {pending ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article className="overflow-hidden h-full flex flex-col" style={cardStyle}>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Foto-banner */}
      <div
        className="relative aspect-[3/4] group"
        style={{ background: 'var(--color-paper-2)' }}
      >
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: 'center 20%' }}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mute)' }}
            >
              {getInitials(member.firstName, member.lastName, member.email)}
            </span>
          </div>
        )}

        {/* Hover-overlay met upload/wis-knoppen */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 group-hover:opacity-100"
          style={{ background: 'color-mix(in srgb, #1a1a1a 60%, transparent)' }}
        >
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={pending || photoBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
            style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
            title={member.photoUrl ? 'Foto vervangen' : 'Foto uploaden'}
          >
            <Camera className="size-3.5" />
            {member.photoUrl ? 'Vervang' : 'Upload'}
          </button>
          {member.photoUrl && (
            <button
              type="button"
              onClick={handlePhotoRemove}
              disabled={pending || photoBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
              title="Foto verwijderen"
            >
              <XIcon className="size-3.5" />
              Wis
            </button>
          )}
        </div>

        {photoBusy && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, #1a1a1a 50%, transparent)' }}
          >
            <span className="text-white text-xs">Bezig…</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">

      {error && (
        <div
          className="flex items-start gap-2 p-2 mb-3 text-xs"
          style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c' }}
        >
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {member.firstName} {member.lastName}
            </p>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] font-medium"
              style={{
                background: member.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(115, 115, 115, 0.15)',
                color: member.active ? '#166534' : '#525252',
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: member.active ? '#16a34a' : '#737373' }}
              />
              {member.active ? 'Actief' : 'Inactief'}
            </span>
          </div>
          {member.title && (
            <p className="text-xs text-[var(--color-mute)] mt-0.5">{member.title}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-sm mb-4">
        <a
          href={`mailto:${member.email}`}
          className="flex items-center gap-2 text-[var(--color-ink)] link-underline truncate"
        >
          <Mail className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
          <span className="truncate">{member.email}</span>
        </a>
        {member.phone && (
          <a
            href={`tel:${member.phone.replace(/\s|\//g, '')}`}
            className="flex items-center gap-2 text-[var(--color-ink)] link-underline"
          >
            <Phone className="size-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
            {member.phone}
          </a>
        )}
        {member.bivNumber && (
          <p className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
            <BadgeCheck className="size-3.5 shrink-0" />
            BIV {member.bivNumber}
          </p>
        )}
      </div>

      {mode === 'confirm-delete' ? (
        <div
          className="flex items-center justify-between gap-2 p-2 text-xs"
          style={{ background: 'rgba(239, 68, 68, 0.08)' }}
        >
          <span style={{ color: '#b91c1c' }}>Permanent verwijderen?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="px-2 py-1 text-white"
              style={{ background: '#b91c1c' }}
            >
              {pending ? '…' : 'Ja'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('view')
                setError(null)
              }}
              className="link-underline"
            >
              Nee
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-2 pt-3 mt-auto border-t"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {(isSelf || viewerIsZaakvoerder) ? (
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
            >
              <Pencil className="size-3.5" />
              Bewerken
            </button>
          ) : (
            <span />
          )}

          {isSelf ? (
            <span className="text-xs text-[var(--color-mute)] italic">jij</span>
          ) : viewerIsZaakvoerder ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={pending}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                title={member.active ? 'Account deactiveren' : 'Account activeren'}
              >
                <Power className="size-3.5" />
                {member.active ? 'Deactiveren' : 'Activeren'}
              </button>
              <button
                type="button"
                onClick={() => setMode('confirm-delete')}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-red-700 transition-colors"
              >
                <Trash2 className="size-3.5" />
                Verwijderen
              </button>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </article>
  )
}
