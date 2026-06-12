import { create } from 'zustand'
import type { LicenseStatus } from '../types/license-status'
import type { Platform } from '../types/platform'

/** Маркер фильтра «без категории» */
export const NO_CATEGORY_FILTER = '__none__'

type LicenseFilterStore = {
  query: string
  categoryId: string | null
  platform: Platform | null
  status: LicenseStatus | null
  setQuery: (query: string) => void
  clearQuery: () => void
  setCategoryFilter: (categoryId: string) => void
  clearCategoryFilter: () => void
  setPlatformFilter: (platform: Platform) => void
  clearPlatformFilter: () => void
  setStatusFilter: (status: LicenseStatus) => void
  clearStatusFilter: () => void
  clearAllFilters: () => void
}

export const useLicenseFilterStore = create<LicenseFilterStore>((set) => ({
  query: '',
  categoryId: null,
  platform: null,
  status: null,

  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: '' }),

  setCategoryFilter: (categoryId) =>
    set({ categoryId, platform: null, status: null }),

  clearCategoryFilter: () => set({ categoryId: null }),

  setPlatformFilter: (platform) =>
    set({ platform, categoryId: null, status: null }),

  clearPlatformFilter: () => set({ platform: null }),

  setStatusFilter: (status) =>
    set({ status, categoryId: null, platform: null }),

  clearStatusFilter: () => set({ status: null }),

  clearAllFilters: () =>
    set({ query: '', categoryId: null, platform: null, status: null }),
}))
