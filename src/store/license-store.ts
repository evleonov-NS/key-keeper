import { create } from 'zustand'
import type { License } from '../types/license'
import { generateId } from '../utils/id'
import { computeLicenseStatus } from '../utils/status'
import { useAppStore } from './app-store'

function getExpiringThreshold(): number {
  return useAppStore.getState().settings.expiringThresholdDays
}

function withComputedStatus(license: License): License {
  return {
    ...license,
    status: computeLicenseStatus(license, {
      expiringThresholdDays: getExpiringThreshold(),
    }),
  }
}

type LicenseStore = {
  licenses: License[]
  setLicenses: (licenses: License[]) => void
  refreshAllStatuses: () => void
  addLicense: (
    license: Omit<License, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => License
  updateLicense: (id: string, patch: Partial<License>) => void
  archiveLicense: (id: string) => void
  archiveLicenses: (ids: string[]) => void
  restoreLicense: (id: string) => void
  restoreLicenses: (ids: string[]) => void
  removeLicense: (id: string) => void
  removeLicenses: (ids: string[]) => void
  clearDemoLicenses: () => void
  hasDemoLicenses: () => boolean
}

export const useLicenseStore = create<LicenseStore>((set, get) => ({
  licenses: [],

  setLicenses: (licenses) =>
    set({ licenses: licenses.map((license) => withComputedStatus(license)) }),

  refreshAllStatuses: () => {
    set((state) => ({
      licenses: state.licenses.map((license) => withComputedStatus(license)),
    }))
  },

  addLicense: (partial) => {
    const now = new Date().toISOString()
    const license = withComputedStatus({
      ...partial,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      status: 'active',
    })

    set((state) => ({ licenses: [...state.licenses, license] }))
    useAppStore.getState().incrementChangeCount()
    return license
  },

  updateLicense: (id, patch) => {
    set((state) => ({
      licenses: state.licenses.map((license) => {
        if (license.id !== id) {
          return license
        }
        return withComputedStatus({
          ...license,
          ...patch,
          updatedAt: new Date().toISOString(),
        })
      }),
    }))
    useAppStore.getState().incrementChangeCount()
  },

  archiveLicense: (id) => {
    get().archiveLicenses([id])
  },

  archiveLicenses: (ids) => {
    if (ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    set((state) => ({
      licenses: state.licenses.map((license) =>
        idSet.has(license.id)
          ? withComputedStatus({
              ...license,
              status: 'archived',
              updatedAt: new Date().toISOString(),
            })
          : license,
      ),
    }))
    useAppStore.getState().incrementChangeCount()
  },

  restoreLicense: (id) => {
    get().restoreLicenses([id])
  },

  restoreLicenses: (ids) => {
    if (ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    set((state) => ({
      licenses: state.licenses.map((license) => {
        if (!idSet.has(license.id) || license.status !== 'archived') {
          return license
        }
        return withComputedStatus({
          ...license,
          status: 'active',
          updatedAt: new Date().toISOString(),
        })
      }),
    }))
    useAppStore.getState().incrementChangeCount()
  },

  removeLicense: (id) => {
    get().removeLicenses([id])
  },

  removeLicenses: (ids) => {
    if (ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    set((state) => ({
      licenses: state.licenses.filter((license) => !idSet.has(license.id)),
    }))
    useAppStore.getState().incrementChangeCount()
  },

  clearDemoLicenses: () => {
    set((state) => ({
      licenses: state.licenses.filter((license) => !license.isDemo),
    }))
    useAppStore.getState().incrementChangeCount()
  },

  hasDemoLicenses: () => get().licenses.some((license) => license.isDemo),
}))
