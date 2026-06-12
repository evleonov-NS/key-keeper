const CLEAR_DELAY_MS = 120_000

let clearTimer: ReturnType<typeof setTimeout> | null = null
let lastCopiedValue = ''

/** Копирует текст и очищает буфер через 120 сек, если значение не менялось */
export async function copyWithAutoClear(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  lastCopiedValue = text

  if (clearTimer) {
    clearTimeout(clearTimer)
  }

  clearTimer = setTimeout(() => {
    void clearClipboardIfUnchanged()
  }, CLEAR_DELAY_MS)
}

async function clearClipboardIfUnchanged(): Promise<void> {
  try {
    const current = await navigator.clipboard.readText()
    if (current === lastCopiedValue) {
      await navigator.clipboard.writeText('')
    }
  } catch {
    // Нет доступа к чтению буфера — не очищаем
  }
}
