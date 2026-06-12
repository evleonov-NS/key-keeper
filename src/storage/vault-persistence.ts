import { useAppStore } from '../store/app-store'
import { useCategoryStore } from '../store/category-store'
import { useLicenseStore } from '../store/license-store'
import { getSessionKey } from '../crypto/session-key'
import { persistVault } from './vault-service'

const SAVE_DEBOUNCE_MS = 400

let saveTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribers: Array<() => void> = []

function scheduleSave(): void {
  if (!getSessionKey()) {
    return
  }

  if (saveTimer) {
    clearTimeout(saveTimer)
  }

  saveTimer = setTimeout(async () => {
    try {
      const vaultData = useAppStore.getState().getVaultData()
      await persistVault(vaultData)
    } catch {
      // Не логируем содержимое vault
      useAppStore.getState().setError('Не удалось сохранить хранилище')
    }
  }, SAVE_DEBOUNCE_MS)
}

export function startVaultPersistence(): void {
  stopVaultPersistence()

  unsubscribers = [
    useLicenseStore.subscribe(scheduleSave),
    useCategoryStore.subscribe(scheduleSave),
    useAppStore.subscribe((state, prev) => {
      if (
        state.settings !== prev.settings ||
        state.meta !== prev.meta
      ) {
        scheduleSave()
      }
    }),
  ]
}

export function stopVaultPersistence(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }

  for (const unsubscribe of unsubscribers) {
    unsubscribe()
  }
  unsubscribers = []
}
