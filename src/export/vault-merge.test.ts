import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_SETTINGS, SCHEMA_VERSION } from '../types'
import type { VaultData, VaultMeta } from '../types/vault'
import { applyImportMode, mergeVaultData, replaceVaultData } from './vault-merge'

function createMeta(partial: Partial<VaultMeta> = {}): VaultMeta {
  return {
    isDemo: false,
    lastExportAt: null,
    changeCount: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

function createVault(
  licenses: VaultData['licenses'],
  categories: VaultData['categories'],
  meta = createMeta(),
): VaultData {
  return {
    schemaVersion: SCHEMA_VERSION,
    licenses,
    categories,
    settings: { ...DEFAULT_APP_SETTINGS },
    meta,
  }
}

describe('vault-merge', () => {
  it('merge: объединяет записи, при совпадении id побеждает импорт', () => {
    const current = createVault(
      [{ id: 'a', name: 'Old' } as VaultData['licenses'][number]],
      [{ id: 'c1', name: 'Local' }],
    )
    const imported = createVault(
      [{ id: 'a', name: 'New' } as VaultData['licenses'][number], { id: 'b', name: 'Added' } as VaultData['licenses'][number]],
      [{ id: 'c2', name: 'Remote' }],
    )

    const result = mergeVaultData(current, imported)

    expect(result.licenses.map((item) => item.id).sort()).toEqual(['a', 'b'])
    expect(result.licenses.find((item) => item.id === 'a')?.name).toBe('New')
    expect(result.categories.map((item) => item.id).sort()).toEqual(['c1', 'c2'])
    expect(result.settings).toEqual(current.settings)
    expect(result.meta.changeCount).toBe(4)
  })

  it('replace: подменяет данные, сохраняет createdAt и lastExportAt', () => {
    const currentMeta = createMeta({
      createdAt: '2025-06-01T00:00:00.000Z',
      lastExportAt: '2026-06-01T00:00:00.000Z',
      changeCount: 5,
    })
    const imported = createVault(
      [{ id: 'x', name: 'Imported' } as VaultData['licenses'][number]],
      [{ id: 'y', name: 'Cat' }],
      createMeta({ isDemo: true }),
    )

    const result = replaceVaultData(imported, currentMeta)

    expect(result.licenses).toHaveLength(1)
    expect(result.categories).toHaveLength(1)
    expect(result.meta.createdAt).toBe(currentMeta.createdAt)
    expect(result.meta.lastExportAt).toBe(currentMeta.lastExportAt)
    expect(result.meta.changeCount).toBe(6)
  })

  it('applyImportMode выбирает merge или replace', () => {
    const current = createVault([], [])
    const imported = createVault(
      [{ id: 'z', name: 'Z' } as VaultData['licenses'][number]],
      [],
    )

    expect(applyImportMode(current, imported, 'merge').licenses).toHaveLength(1)
    expect(applyImportMode(current, imported, 'replace').licenses).toHaveLength(1)
  })
})
