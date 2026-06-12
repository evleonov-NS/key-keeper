import { create } from 'zustand'
import { clearSessionKey } from '../crypto/session-key'
import {
  changeMasterPassword,
  createVault,
  isVaultInitialized,
  unlockVault,
} from '../storage/vault-service'
import {
  startVaultPersistence,
  stopVaultPersistence,
} from '../storage/vault-persistence'
import { useSearchStore } from './search-store'
import { useAppStore } from './app-store'
import { DEFAULT_APP_SETTINGS, SCHEMA_VERSION } from '../types'

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

function createEmptyVaultData() {
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

export const useAuthStore = create<AuthStore>((set) => ({
  phase: 'checking',
  authError: null,
  isSubmitting: false,

  initialize: async () => {
    set({ phase: 'checking', authError: null })
    const exists = await isVaultInitialized()
    set({ phase: exists ? 'locked' : 'setup' })
  },

  setupMasterPassword: async (password) => {
    set({ isSubmitting: true, authError: null })
    try {
      const vaultData = createEmptyVaultData()
      await createVault(password, vaultData)
      useAppStore.getState().applyVaultData(vaultData)
      startVaultPersistence()
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
      useAppStore.getState().applyVaultData(vaultData)
      startVaultPersistence()
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
    useAppStore.getState().resetStores()
    useSearchStore.getState().clearQuery()
    set({ phase: 'locked', authError: null })
  },

  changePassword: async (current, next) => {
    set({ isSubmitting: true, authError: null })
    try {
      await changeMasterPassword(current, next)
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
