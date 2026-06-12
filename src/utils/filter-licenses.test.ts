import { describe, expect, it } from 'vitest'
import { NO_CATEGORY_FILTER } from '../store/license-filter-store'
import {
  TEST_CATEGORIES,
  TEST_CATEGORY_OFFICE,
  createTestLicense,
} from '../test/fixtures/license'
import { filterLicenses, hasActiveFilters } from './filter-licenses'

const defaultFilters = {
  query: '',
  categoryId: null,
  platform: null,
  status: null,
  tag: null,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
}

describe('filter-licenses', () => {
  const licenses = [
    createTestLicense({
      id: '1',
      name: 'Microsoft 365',
      platform: 'windows',
      category: TEST_CATEGORY_OFFICE.id,
      tags: ['офис'],
    }),
    createTestLicense({
      id: '2',
      name: '1Password',
      platform: 'ios',
      category: null,
      tags: ['безопасность'],
      isPerpetual: true,
      expiryDate: null,
    }),
    createTestLicense({
      id: '3',
      name: 'Figma',
      platform: 'web',
      category: TEST_CATEGORY_OFFICE.id,
      tags: ['дизайн'],
      expiryDate: '2026-05-01',
      status: 'expired',
    }),
  ]

  it('hasActiveFilters false без фильтров', () => {
    expect(hasActiveFilters(defaultFilters)).toBe(false)
  })

  it('комбинирует фильтр платформы и тега', () => {
    const results = filterLicenses(
      licenses,
      {
        ...defaultFilters,
        platform: 'windows',
        tag: 'офис',
      },
      TEST_CATEGORIES,
      14,
    )
    expect(results).toHaveLength(1)
    expect(results[0]?.license.name).toBe('Microsoft 365')
  })

  it('фильтрует категорию «без категории»', () => {
    const results = filterLicenses(
      licenses,
      { ...defaultFilters, categoryId: NO_CATEGORY_FILTER },
      TEST_CATEGORIES,
      14,
    )
    expect(results).toHaveLength(1)
    expect(results[0]?.license.name).toBe('1Password')
  })

  it('ищет и фильтрует по статусу одновременно', () => {
    const results = filterLicenses(
      licenses,
      {
        ...defaultFilters,
        query: 'Figma',
        status: 'expired',
      },
      TEST_CATEGORIES,
      14,
    )
    expect(results).toHaveLength(1)
    expect(results[0]?.license.name).toBe('Figma')
  })
})
