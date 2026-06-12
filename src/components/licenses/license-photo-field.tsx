import { useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent } from 'react'
import { ClipboardPaste, ImagePlus, Loader2, X } from 'lucide-react'
import { useBlobUrls } from '../../hooks/use-blob-urls'
import { filesFromClipboardEvent, filesFromSystemClipboard } from '../../utils/clipboard-image'
import { MAX_IMAGE_DIMENSION, processImageFiles } from '../../utils/image'
import { PhotoGalleryModal } from './photo-gallery-modal'

type LicensePhotoFieldProps = {
  images: Blob[]
  onChange: (images: Blob[]) => void
}

export function LicensePhotoField({ images, onChange }: LicensePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const previewUrls = useBlobUrls(images)

  const addFiles = async (files: FileList | File[]) => {
    if (files.length === 0) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const processed = await processImageFiles(files)
      if (processed.length === 0) {
        setError('Выберите файлы изображений (JPEG, PNG, WebP…)')
        return
      }
      onChange([...images, ...processed])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ошибка обработки фото')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      await addFiles(files)
    }
    event.target.value = ''
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    await addFiles(event.dataTransfer.files)
  }

  const handlePaste = async (event: ClipboardEvent<HTMLDivElement>) => {
    const files = filesFromClipboardEvent(event.nativeEvent)
    if (files.length === 0) {
      return
    }
    event.preventDefault()
    await addFiles(files)
  }

  const handlePasteButton = async () => {
    setError(null)
    try {
      const files = await filesFromSystemClipboard()
      if (files.length === 0) {
        setError('В буфере нет изображения. Скопируйте картинку и повторите.')
        return
      }
      await addFiles(files)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Не удалось вставить из буфера. Попробуйте Ctrl+V в этой области.',
      )
    }
  }

  const removeAt = (index: number) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Фото</span>
        {images.length > 0 ? (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="text-xs text-accent hover:underline"
          >
            Галерея ({images.length})
          </button>
        ) : null}
      </div>

      <div
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => void handleDrop(event)}
        onPaste={(event) => void handlePaste(event)}
        className={`rounded-xl border-2 border-dashed px-4 py-5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/30 ${
          isDragOver
            ? 'border-accent bg-accent/5'
            : 'border-border bg-surface hover:border-accent/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleInputChange(event)}
        />

        {isProcessing ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 size={18} className="animate-spin" />
            Конвертация в WebP…
          </div>
        ) : (
          <>
            <ImagePlus size={24} className="mx-auto text-muted" />
            <p className="mt-2 text-sm text-muted">
              Перетащите сюда,{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-accent hover:underline"
              >
                выберите файлы
              </button>
              {' '}или вставьте из буфера
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => void handlePasteButton()}
                title="Вставить из буфера"
                aria-label="Вставить из буфера"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <ClipboardPaste size={14} />
                Буфер
              </button>
              <span className="text-xs text-muted">или Ctrl+V</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              WebP до {MAX_IMAGE_DIMENSION}px · качество 92%
            </p>
          </>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {previewUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface"
            >
              <img
                src={url}
                alt={`Фото ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Удалить фото"
                className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {galleryOpen ? (
        <PhotoGalleryModal
          title="Фото лицензии"
          images={images}
          editable
          onChange={onChange}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}
    </div>
  )
}
