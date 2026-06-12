export const MAX_IMAGE_DIMENSION = 1600
export const WEBP_QUALITY = 0.92

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Не удалось загрузить «${file.name}»`))
    }

    image.src = objectUrl
  })
}

function scaleToMaxDimension(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

export async function processImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`Файл «${file.name}» не является изображением`)
  }

  const image = await loadImageElement(file)
  const { width, height } = scaleToMaxDimension(
    image.naturalWidth,
    image.naturalHeight,
    MAX_IMAGE_DIMENSION,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas недоступен в этом браузере')
  }

  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  })

  if (!blob) {
    throw new Error(`Не удалось сконвертировать «${file.name}» в WebP`)
  }

  return blob
}

export async function processImageFiles(files: Iterable<File>): Promise<Blob[]> {
  const processed: Blob[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      continue
    }
    processed.push(await processImageFile(file))
  }

  return processed
}
