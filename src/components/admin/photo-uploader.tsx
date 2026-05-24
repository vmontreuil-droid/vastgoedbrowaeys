'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, X, AlertCircle, Star, Loader2, ImageOff } from 'lucide-react'
import {
  uploadListingPhotoAction,
  deleteListingPhotoAction,
  extractPathFromUrl,
} from '@/app/admin/(authed)/aanbod/photo-actions'

type Photo = {
  url: string
  path: string | null
  uploading?: boolean
  error?: string
}

export function PhotoUploader({
  folderKey,
  initialPhotos,
  initialCover,
  galleryFieldName = 'gallery',
  coverFieldName = 'cover_photo',
}: {
  folderKey: string
  initialPhotos: string[]
  initialCover?: string | null
  galleryFieldName?: string
  coverFieldName?: string
}) {
  const [photos, setPhotos] = useState<Photo[]>(
    initialPhotos.map((url) => ({ url, path: extractPathFromUrl(url) })),
  )
  const [coverUrl, setCoverUrl] = useState<string>(initialCover ?? initialPhotos[0] ?? '')
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  // Als er nog geen cover gekozen is, neem de eerste foto auto
  useEffect(() => {
    if (!coverUrl && photos.length > 0) setCoverUrl(photos[0].url)
    if (coverUrl && !photos.some((p) => p.url === coverUrl)) {
      setCoverUrl(photos[0]?.url ?? '')
    }
  }, [photos, coverUrl])

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setGlobalError(null)

    const files = Array.from(fileList)
    files.forEach((file) => uploadOne(file))
  }

  function uploadOne(file: File) {
    // Tijdelijke placeholder met blob-preview tijdens upload
    const previewUrl = URL.createObjectURL(file)
    const placeholder: Photo = { url: previewUrl, path: null, uploading: true }

    setPhotos((prev) => [...prev, placeholder])

    startTransition(async () => {
      const fd = new FormData()
      fd.set('file', file)
      const res = await uploadListingPhotoAction(folderKey, fd)

      if (res.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p === placeholder ? { url: res.url, path: res.path } : p)),
        )
        URL.revokeObjectURL(previewUrl)
      } else {
        setPhotos((prev) =>
          prev.map((p) =>
            p === placeholder ? { ...p, uploading: false, error: res.error } : p,
          ),
        )
        setGlobalError(res.error)
      }
    })
  }

  function removePhoto(photo: Photo) {
    startTransition(async () => {
      if (photo.path) {
        await deleteListingPhotoAction(photo.path)
      }
      setPhotos((prev) => prev.filter((p) => p !== photo))
      if (coverUrl === photo.url) setCoverUrl('')
    })
  }

  function reorder(from: number, to: number) {
    setPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      setIsDragging(false)
      dragCounter.current = 0
    }
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    dragCounter.current = 0
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      {/* Hidden inputs voor de form submit */}
      <input
        type="hidden"
        name={galleryFieldName}
        value={photos
          .filter((p) => !p.uploading && !p.error)
          .map((p) => p.url)
          .join('\n')}
      />
      <input type="hidden" name={coverFieldName} value={coverUrl} />

      {/* Drop-zone + file picker */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed transition-colors"
        style={{
          borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-line)',
          background: isDragging ? 'var(--color-paper-2)' : 'transparent',
        }}
      >
        <div className="px-6 py-10 text-center">
          <Upload className="size-6 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
          <p className="text-sm">
            <span className="font-medium">Klik om te uploaden</span> of sleep foto's hierheen
          </p>
          <p className="text-xs text-[var(--color-mute)] mt-1">
            JPG, PNG of WebP — max 10 MB per foto, meerdere tegelijk mag
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          className="hidden"
        />
      </div>

      {globalError && (
        <div
          className="flex items-start gap-2 p-2 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}
        >
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Thumbnail-grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="eyebrow text-[0.55rem]">
              Foto's ({photos.length}) {pending && <Loader2 className="size-3 inline-block ml-1 animate-spin" />}
            </p>
            <p className="text-[0.6rem] text-[var(--color-mute)]">
              <Star className="size-2.5 inline" style={{ color: 'var(--color-accent)' }} /> = cover
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, idx) => {
              const isCover = photo.url === coverUrl
              const hasError = !!photo.error
              return (
                <div
                  key={photo.url + idx}
                  className="relative group aspect-[4/3] overflow-hidden"
                  style={{
                    background: 'var(--color-paper-2)',
                    border: isCover
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-line)',
                    opacity: hasError ? 0.5 : 1,
                  }}
                  draggable={!photo.uploading && !hasError}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
                    if (!isNaN(from) && from !== idx) reorder(from, idx)
                  }}
                >
                  {hasError ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <ImageOff className="size-6 text-[var(--color-mute)]" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {photo.uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-black/40">
                      <Loader2 className="size-5 text-white animate-spin" />
                    </div>
                  )}

                  {/* Cover-badge */}
                  {isCover && !hasError && (
                    <span
                      className="absolute top-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] font-medium"
                      style={{ background: 'var(--color-accent)', color: '#fff' }}
                    >
                      <Star className="size-2.5" />
                      Cover
                    </span>
                  )}

                  {/* Actie-overlay */}
                  {!photo.uploading && !hasError && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 grid place-items-center">
                      <div className="flex gap-2">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverUrl(photo.url)}
                            title="Maak cover"
                            className="p-1.5 bg-white text-black"
                          >
                            <Star className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(photo)}
                          title="Verwijder"
                          className="p-1.5 bg-white text-red-700"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {hasError && (
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      title={photo.error}
                      className="absolute top-1 right-1 p-1 bg-white text-red-700"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-[var(--color-mute)] mt-2">
            Sleep foto's om de volgorde te wijzigen · klik <Star className="size-2.5 inline" /> om de cover-foto te kiezen.
          </p>
        </div>
      )}
    </div>
  )
}
