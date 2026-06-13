export function downloadBytes(
  filename: string,
  bytes: Uint8Array,
  mimeType = 'application/octet-stream',
): void {
  const blob = new Blob([bytes], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
