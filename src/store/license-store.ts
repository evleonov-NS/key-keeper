import { create } from 'zustand'
import type { License } from '../types/license'
import { generateId } from '../utils/id'
import { DEFAULT_APP_SETTINGS } from '../types'
import { computeLicenseStatus } from '../utils/status'

type LicenseStore = {
  licenses: License[]
  setLicenses: (licenses: License[]) => void
  addLicense: (license: Omit<License, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => License
  updateLicense: (id: string, patch: Partial<License>) => void
  removeLicense: (id: string) => void
  clearDemoLicenses: () => void
  hasDemoLicenses: () => boolean
}

export const useLicenseStore = create<LicenseStore>((set, get) => ({
  licenses: [],

  setLicenses: (licenses) => set({ licenses }),

  addLicense: (partial) => {
    const now = new Date().toISOString()
    const license: License = {
      ...partial,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      status: 'active',
    }
    license.status = computeLicenseStatus(license, {
      expiringThresholdDays: DEFAULT_APP_SETTINGS.expiringThresholdDays,
    })

    set((state) => ({ licenses: [...state.licenses, license] }))
    return license
  },

  updateLicense: (id, patch) => {
    set((state) => ({
      licenses: state.licenses.map((license) => {
        if (license.id !== id) {
          return license
        }
        const updated: License = {
          ...license,
          ...patch,
          updatedAt: new Date().toISOString(),
        }
        updated.status = computeLicenseStatus(updated, {
          expiringThresholdDays: DEFAULT_APP_SETTINGS.expiringThresholdDays,
        })
        return updated
      }),
    }))
  },

  removeLicense: (id) => {
    set((state) => ({
      licenses: state.licenses.filter((license) => license.id !== id),
    }))
  },

  clearDemoLicenses: () => {
    set((state) => ({
      licenses: state.licenses.filter((license) => !license.isDemo),
    }))
  },

  hasDemoLicenses: () => get().licenses.some((license) => license.isDemo),
}))
