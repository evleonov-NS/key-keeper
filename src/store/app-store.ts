import { create } from 'zustand'
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
  incrementChangeCount: () => void
  loadDemoSeed: () => void
  clearDemo: () => void
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

  getVaultData: () => ({
    schemaVersion: SCHEMA_VERSION,
    licenses: useLicenseStore.getState().licenses,
    categories: useCategoryStore.getState().categories,
    settings: get().settings,
    meta: get().meta,
  }),
}))
