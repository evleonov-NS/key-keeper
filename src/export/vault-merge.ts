import {
  DEFAULT_APP_SETTINGS,
  SCHEMA_VERSION,
  type VaultData,
  type VaultMeta,
} from '../types'

export type ImportMode = 'merge' | 'replace'

export function mergeVaultData(current: VaultData, imported: VaultData): VaultData {
  const licenseById = new Map(current.licenses.map((license) => [license.id, license]))
  for (const license of imported.licenses) {
    licenseById.set(license.id, license)
  }

  const categoryById = new Map(
    current.categories.map((category) => [category.id, category]),
  )
  for (const category of imported.categories) {
    categoryById.set(category.id, category)
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    licenses: [...licenseById.values()],
    categories: [...categoryById.values()],
    settings: { ...current.settings },
    meta: {
      ...current.meta,
      changeCount: current.meta.changeCount + 1,
      isDemo: current.meta.isDemo || imported.meta.isDemo,
    },
  }
}

export function replaceVaultData(
  imported: VaultData,
  currentMeta: VaultMeta,
): VaultData {
  return {
    schemaVersion: SCHEMA_VERSION,
    licenses: imported.licenses,
    categories: imported.categories,
    settings: { ...DEFAULT_APP_SETTINGS, ...imported.settings },
    meta: {
      ...imported.meta,
      createdAt: currentMeta.createdAt,
      changeCount: currentMeta.changeCount + 1,
      lastExportAt: currentMeta.lastExportAt,
    },
  }
}

export function applyImportMode(
  current: VaultData,
  imported: VaultData,
  mode: ImportMode,
): VaultData {
  return mode === 'merge'
    ? mergeVaultData(current, imported)
    : replaceVaultData(imported, current.meta)
}
