import { create } from 'zustand'
import { getSessionKey, saveTabSession } from '../crypto'
import { createDemoVaultData } from '../data/demo-seed'
import {
  DEFAULT_APP_SETTINGS,
  SCHEMA_VERSION,
  type AppSettings,
  type VaultData,
  type VaultMeta,
} from '../types'
import { useCategoryStore } from './category-store'
import { useLicenseStore } from './license-store'

type AppStore = {
  settings: AppSettings
  meta: VaultMeta
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setKeepSessionOpen: (keepSessionOpen: boolean) => void
  setAutoLockMinutes: (minutes: number) => void
  setSidebarSortEnabled: (sidebarSortEnabled: boolean) => void
  setExpiringThresholdDays: (days: number) => void
  setNotificationsEnabled: (notificationsEnabled: boolean) => void
  setBackupReminderDays: (days: number) => void
  setBackupReminderChanges: (count: number) => void
  markExportCompleted: () => void
  incrementChangeCount: () => void
  loadDemoSeed: () => void
  clearDemo: () => void
  applyVaultData: (vault: VaultData) => void
  resetStores: () => void
  getVaultData: () => VaultData
}

function createEmptyMeta(): VaultMeta {
  return {
    isDemo: false,
    lastExportAt: null,
    changeCount: 0,
    createdAt: new Date().toISOString(),
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  settings: { ...DEFAULT_APP_SETTINGS },
  meta: createEmptyMeta(),
  isLoading: false,
  error: null,
  isInitialized: false,

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setKeepSessionOpen: (keepSessionOpen) => {
    set((state) => ({
      settings: { ...state.settings, keepSessionOpen },
    }))

    const key = getSessionKey()
    if (key) {
      const { settings } = get()
      void saveTabSession(key, keepSessionOpen, settings.autoLockMinutes)
    }
  },

  setAutoLockMinutes: (minutes) => {
    const autoLockMinutes = Math.min(480, Math.max(1, Math.round(minutes)))
    set((state) => ({
      settings: { ...state.settings, autoLockMinutes },
    }))
    get().incrementChangeCount()

    const key = getSessionKey()
    if (key) {
      const { settings } = get()
      void saveTabSession(key, settings.keepSessionOpen, autoLockMinutes)
    }
  },

  setSidebarSortEnabled: (sidebarSortEnabled) => {
    set((state) => ({
      settings: { ...state.settings, sidebarSortEnabled },
    }))
    get().incrementChangeCount()
  },

  setExpiringThresholdDays: (days) => {
    const expiringThresholdDays = Math.min(365, Math.max(1, Math.round(days)))
    set((state) => ({
      settings: { ...state.settings, expiringThresholdDays },
    }))
    useLicenseStore.getState().refreshAllStatuses()
    get().incrementChangeCount()
  },

  setNotificationsEnabled: (notificationsEnabled) => {
    set((state) => ({
      settings: { ...state.settings, notificationsEnabled },
    }))
    get().incrementChangeCount()

    if (
      notificationsEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      void Notification.requestPermission()
    }
  },

  setBackupReminderDays: (days) => {
    const backupReminderDays = Math.min(365, Math.max(1, Math.round(days)))
    set((state) => ({
      settings: { ...state.settings, backupReminderDays },
    }))
    get().incrementChangeCount()
  },

  setBackupReminderChanges: (count) => {
    const backupReminderChanges = Math.min(999, Math.max(1, Math.round(count)))
    set((state) => ({
      settings: { ...state.settings, backupReminderChanges },
    }))
    get().incrementChangeCount()
  },

  markExportCompleted: () =>
    set((state) => ({
      meta: {
        ...state.meta,
        lastExportAt: new Date().toISOString(),
        changeCount: 0,
      },
    })),

  incrementChangeCount: () =>
    set((state) => ({
      meta: { ...state.meta, changeCount: state.meta.changeCount + 1 },
    })),

  loadDemoSeed: () => {
    const demo = createDemoVaultData()
    useLicenseStore.getState().setLicenses(demo.licenses)
    useCategoryStore.getState().setCategories(demo.categories)
    set({
      settings: demo.settings,
      meta: demo.meta,
      isInitialized: true,
      error: null,
    })
  },

  clearDemo: () => {
    useLicenseStore.getState().clearDemoLicenses()
    useCategoryStore.getState().clearDemoCategories()
    set((state) => ({
      meta: { ...state.meta, isDemo: false },
    }))
  },

  applyVaultData: (vault) => {
    useLicenseStore.getState().setLicenses(vault.licenses)
    useCategoryStore.getState().setCategories(vault.categories)
    set({
      settings: { ...DEFAULT_APP_SETTINGS, ...vault.settings },
      meta: vault.meta,
      isInitialized: true,
      error: null,
    })
  },

  resetStores: () => {
    useLicenseStore.getState().setLicenses([])
    useCategoryStore.getState().setCategories([])
    set({
      settings: { ...DEFAULT_APP_SETTINGS },
      meta: createEmptyMeta(),
      isInitialized: false,
      error: null,
    })
  },

  getVaultData: () => ({
    schemaVersion: SCHEMA_VERSION,
    licenses: useLicenseStore.getState().licenses,
    categories: useCategoryStore.getState().categories,
    settings: get().settings,
    meta: get().meta,
  }),
}))
