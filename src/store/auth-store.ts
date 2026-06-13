import { create } from 'zustand'
import {
  clearSessionKey,
  clearTabSession,
  getSessionKey,
  saveTabSession,
} from '../crypto'
import {
  changeMasterPassword,
  createVault,
  isVaultInitialized,
  tryRestoreTabSession,
  unlockVault,
} from '../storage/vault-service'
import {
  startVaultPersistence,
  stopVaultPersistence,
} from '../storage/vault-persistence'
import { useLicenseFilterStore } from './license-filter-store'
import { useAppStore } from './app-store'
import { clearNotificationSessionFlag } from '../utils/reminders'
import { DEFAULT_APP_SETTINGS, SCHEMA_VERSION, type VaultData } from '../types'

export type AuthPhase = 'checking' | 'setup' | 'locked' | 'unlocked'

type AuthStore = {
  phase: AuthPhase
  authError: string | null
  isSubmitting: boolean
  initialize: () => Promise<void>
  setupMasterPassword: (password: string) => Promise<void>
  login: (password: string) => Promise<void>
  lock: () => void
  changePassword: (current: string, next: string) => Promise<void>
  clearAuthError: () => void
}

function createEmptyVaultData(): VaultData {
  return {
    schemaVersion: SCHEMA_VERSION,
    licenses: [],
    categories: [],
    settings: { ...DEFAULT_APP_SETTINGS },
    meta: {
      isDemo: false,
      lastExportAt: null,
      changeCount: 0,
      createdAt: new Date().toISOString(),
    },
  }
}

async function persistTabSessionFromSettings(
  settings: VaultData['settings'],
): Promise<void> {
  const key = getSessionKey()
  if (!key) {
    return
  }
  await saveTabSession(
    key,
    settings.keepSessionOpen,
    settings.autoLockMinutes,
  )
}

function finishUnlock(vaultData: VaultData): void {
  useAppStore.getState().applyVaultData(vaultData)
  startVaultPersistence()
  void persistTabSessionFromSettings(vaultData.settings)
}

export const useAuthStore = create<AuthStore>((set) => ({
  phase: 'checking',
  authError: null,
  isSubmitting: false,

  initialize: async () => {
    set({ phase: 'checking', authError: null })
    const exists = await isVaultInitialized()

    if (!exists) {
      set({ phase: 'setup' })
      return
    }

    const restored = await tryRestoreTabSession()
    if (restored) {
      finishUnlock(restored)
      set({ phase: 'unlocked' })
      return
    }

    clearTabSession()
    set({ phase: 'locked' })
  },

  setupMasterPassword: async (password) => {
    set({ isSubmitting: true, authError: null })
    try {
      const vaultData = createEmptyVaultData()
      await createVault(password, vaultData)
      finishUnlock(vaultData)
      set({ phase: 'unlocked', isSubmitting: false })
    } catch {
      set({
        authError: 'Не удалось создать хранилище',
        isSubmitting: false,
      })
    }
  },

  login: async (password) => {
    set({ isSubmitting: true, authError: null })
    try {
      const vaultData = await unlockVault(password)
      finishUnlock(vaultData)
      set({ phase: 'unlocked', isSubmitting: false })
    } catch {
      set({
        authError: 'Неверный мастер-пароль',
        isSubmitting: false,
      })
    }
  },

  lock: () => {
    stopVaultPersistence()
    clearSessionKey()
    clearTabSession()
    clearNotificationSessionFlag()
    useAppStore.getState().resetStores()
    useLicenseFilterStore.getState().clearAllFilters()
    set({ phase: 'locked', authError: null })
  },

  changePassword: async (current, next) => {
    set({ isSubmitting: true, authError: null })
    try {
      await changeMasterPassword(current, next)
      const settings = useAppStore.getState().settings
      await persistTabSessionFromSettings(settings)
      set({ isSubmitting: false })
    } catch {
      set({
        authError: 'Не удалось сменить пароль. Проверьте текущий пароль.',
        isSubmitting: false,
      })
      throw new Error('change-password-failed')
    }
  },

  clearAuthError: () => set({ authError: null }),
}))
