import { useState } from 'react'
import type { License } from '../../types/license'
import { useBlobUrls } from '../../hooks/use-blob-urls'
import { PhotoGalleryModal } from './photo-gallery-modal'

type LicenseTablePhotoProps = {
  license: License
}

export function LicenseTablePhoto({ license }: LicenseTablePhotoProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const urls = useBlobUrls(license.images)
  const previewUrl = urls[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        aria-label={`Фото: ${license.images.length}`}
        title={`Фото (${license.images.length})`}
        className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-border transition-shadow hover:ring-accent/40"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-9 w-9 object-cover"
          />
        ) : (
          <div className="h-9 w-9 bg-surface-elevated" aria-hidden />
        )}
        {license.images.length > 1 ? (
          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/55 px-1 text-[9px] font-medium text-white">
            {license.images.length}
          </span>
        ) : null}
      </button>
      {galleryOpen ? (
        <PhotoGalleryModal
          title={license.name}
          images={license.images}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}
    </>
  )
}
