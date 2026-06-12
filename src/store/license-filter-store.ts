import { create } from 'zustand'
import type { LicenseStatus } from '../types/license-status'
import type { Platform } from '../types/platform'
import type { LicenseSortField, SortOrder } from '../utils/sort-licenses'

/** Маркер фильтра «без категории» */
export const NO_CATEGORY_FILTER = '__none__'

export type LicenseViewMode = 'cards' | 'table'

const FILTER_STORAGE_KEY = 'key-keeper-license-filters'

type PersistedFilters = {
  query: string
  categoryId: string | null
  platform: Platform | null
  status: LicenseStatus | null
  tag: string | null
  sortBy: LicenseSortField
  sortOrder: SortOrder
  viewMode: LicenseViewMode
}

type LicenseFilterStore = PersistedFilters & {
  setQuery: (query: string) => void
  clearQuery: () => void
  setCategoryFilter: (categoryId: string | null) => void
  setPlatformFilter: (platform: Platform | null) => void
  setStatusFilter: (status: LicenseStatus | null) => void
  setTagFilter: (tag: string | null) => void
  setSortBy: (sortBy: LicenseSortField) => void
  setSortOrder: (sortOrder: SortOrder) => void
  setViewMode: (viewMode: LicenseViewMode) => void
  clearAllFilters: () => void
  hydrateFromSession: () => void
}

const DEFAULT_FILTERS: PersistedFilters = {
  query: '',
  categoryId: null,
  platform: null,
  status: null,
  tag: null,
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'cards',
}

function readPersistedFilters(): Partial<PersistedFilters> {
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as Partial<PersistedFilters>
  } catch {
    return {}
  }
}

function persistFilters(state: PersistedFilters): void {
  sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(state))
}

function pickPersisted(state: LicenseFilterStore): PersistedFilters {
  return {
    query: state.query,
    categoryId: state.categoryId,
    platform: state.platform,
    status: state.status,
    tag: state.tag,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    viewMode: state.viewMode,
  }
}

export const useLicenseFilterStore = create<LicenseFilterStore>((set, get) => ({
  ...DEFAULT_FILTERS,
  ...readPersistedFilters(),

  setQuery: (query) => {
    set({ query })
    persistFilters(pickPersisted({ ...get(), query }))
  },

  clearQuery: () => {
    set({ query: '' })
    persistFilters(pickPersisted({ ...get(), query: '' }))
  },

  setCategoryFilter: (categoryId) => {
    set({ categoryId })
    persistFilters(pickPersisted({ ...get(), categoryId }))
  },

  setPlatformFilter: (platform) => {
    set({ platform })
    persistFilters(pickPersisted({ ...get(), platform }))
  },

  setStatusFilter: (status) => {
    set({ status })
    persistFilters(pickPersisted({ ...get(), status }))
  },

  setTagFilter: (tag) => {
    set({ tag })
    persistFilters(pickPersisted({ ...get(), tag }))
  },

  setSortBy: (sortBy) => {
    set({ sortBy })
    persistFilters(pickPersisted({ ...get(), sortBy }))
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder })
    persistFilters(pickPersisted({ ...get(), sortOrder }))
  },

  setViewMode: (viewMode) => {
    set({ viewMode })
    persistFilters(pickPersisted({ ...get(), viewMode }))
  },

  clearAllFilters: () => {
    set({
      query: '',
      categoryId: null,
      platform: null,
      status: null,
      tag: null,
    })
    persistFilters({
      ...pickPersisted(get()),
      query: '',
      categoryId: null,
      platform: null,
      status: null,
      tag: null,
    })
  },

  hydrateFromSession: () => {
    set({ ...DEFAULT_FILTERS, ...readPersistedFilters() })
  },
}))
