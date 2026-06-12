/** Извлекает файлы изображений из ClipboardEvent или Clipboard API */
export function filesFromClipboardEvent(event: ClipboardEvent): File[] {
  const files: File[] = []
  const items = event.clipboardData?.items

  if (!items) {
    return files
  }

  for (const item of items) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) {
      continue
    }
    const file = item.getAsFile()
    if (file) {
      files.push(file)
    }
  }

  return files
}

export async function filesFromSystemClipboard(): Promise<File[]> {
  if (!navigator.clipboard?.read) {
    throw new Error('Вставка из буфера недоступна в этом браузере')
  }

  const files: File[] = []
  const items = await navigator.clipboard.read()

  for (const item of items) {
    for (const type of item.types) {
      if (!type.startsWith('image/')) {
        continue
      }
      const blob = await item.getType(type)
      const extension = type.split('/')[1] ?? 'png'
      files.push(new File([blob], `clipboard.${extension}`, { type }))
    }
  }

  return files
}
