import { useEffect, useState, type MouseEvent } from 'react'
import { ChevronLeft, ChevronRight, Trash2, X, ZoomIn } from 'lucide-react'
import { useBlobUrls } from '../../hooks/use-blob-urls'

type PhotoGalleryModalProps = {
  title: string
  images: Blob[]
  initialIndex?: number
  editable?: boolean
  allowZoom?: boolean
  onChange?: (images: Blob[]) => void
  onClose: () => void
}

export function PhotoGalleryModal({
  title,
  images,
  initialIndex = 0,
  editable = false,
  allowZoom = true,
  onChange,
  onClose,
}: PhotoGalleryModalProps) {
  const [index, setIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  )
  const [isZoomed, setIsZoomed] = useState(false)
  const urls = useBlobUrls(images)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false)
          return
        }
        onClose()
        return
      }
      if (isZoomed) {
        return
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(0, current - 1))
      }
      if (event.key === 'ArrowRight') {
        setIndex((current) => Math.min(images.length - 1, current + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, isZoomed, onClose])

  useEffect(() => {
    if (index >= images.length) {
      setIndex(Math.max(0, images.length - 1))
    }
    setIsZoomed(false)
  }, [images.length, index])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleDelete = () => {
    if (!editable || !onChange || images.length === 0) {
      return
    }

    if (!window.confirm('Удалить это фото?')) {
      return
    }

    const next = images.filter((_, itemIndex) => itemIndex !== index)
    onChange(next)

    if (next.length === 0) {
      onClose()
      return
    }

    setIndex((current) => Math.min(current, next.length - 1))
  }

  if (images.length === 0) {
    return null
  }

  const currentUrl = urls[index]

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-border bg-surface-elevated shadow-card"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-xs text-muted">
                {index + 1} из {images.length}
                {allowZoom ? ' · клик — увеличить / уменьшить' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="rounded-md p-1.5 text-muted hover:bg-surface"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex min-h-[240px] flex-1 items-center justify-center bg-black/90 p-2 sm:min-h-[360px]">
            {currentUrl ? (
              <button
                type="button"
                disabled={!allowZoom}
                onClick={() => allowZoom && setIsZoomed(true)}
                className={`group relative max-h-[60vh] max-w-full ${
                  allowZoom ? 'cursor-zoom-in' : 'cursor-default'
                }`}
                aria-label={allowZoom ? 'Увеличить фото' : undefined}
              >
                <img
                  src={currentUrl}
                  alt={`Фото ${index + 1}`}
                  className="max-h-[60vh] max-w-full object-contain"
                />
                {allowZoom ? (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn size={16} />
                  </span>
                ) : null}
              </button>
            ) : null}

            {images.length > 1 && !isZoomed ? (
              <>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((current) => Math.max(0, current - 1))}
                  aria-label="Предыдущее"
                  className="absolute left-2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  disabled={index >= images.length - 1}
                  onClick={() =>
                    setIndex((current) => Math.min(images.length - 1, current + 1))
                  }
                  aria-label="Следующее"
                  className="absolute right-2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            ) : null}
          </div>

          {editable ? (
            <div className="flex justify-end border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <Trash2 size={14} />
                Удалить фото
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isZoomed && currentUrl ? (
        <button
          type="button"
          className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-black/95 p-4"
          onClick={() => setIsZoomed(false)}
          aria-label="Уменьшить фото"
        >
          <img
            src={currentUrl}
            alt={`Фото ${index + 1} — полный размер`}
            className="max-h-[100vh] max-w-[100vw] object-contain pointer-events-none"
            style={{ width: 'auto', height: 'auto' }}
          />
        </button>
      ) : null}
    </>
  )
}
