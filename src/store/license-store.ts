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
  addLicense: (
    license: Omit<License, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => License
  updateLicense: (id: string, patch: Partial<License>) => void
  archiveLicense: (id: string) => void
  removeLicense: (id: string) => void
  clearDemoLicenses: () => void
  hasDemoLicenses: () => boolean
}

export const useLicenseStore = create<LicenseStore>((set, get) => ({
  licenses: [],

  setLicenses: (licenses) => set({ licenses }),

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
    set((state) => ({
      licenses: state.licenses.map((license) =>
        license.id === id
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

  removeLicense: (id) => {
    set((state) => ({
      licenses: state.licenses.filter((license) => license.id !== id),
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
