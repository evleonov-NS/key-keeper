import { describe, expect, it } from 'vitest'
import {
  TEST_CATEGORIES,
  TEST_CATEGORY_OFFICE,
  createTestLicense,
} from '../test/fixtures/license'
import {
  expandSearchQuery,
  filterLicensesBySearch,
  findLicenseSearchMatch,
  isSearchActive,
  ruLayoutToEn,
} from './search'

describe('search', () => {
  it('isSearchActive требует минимум 3 символа', () => {
    expect(isSearchActive('ab')).toBe(false)
    expect(isSearchActive('abc')).toBe(true)
  })

  it('ruLayoutToEn преобразует раскладку', () => {
    expect(ruLayoutToEn('руддщ')).toBe('hello')
  })

  it('expandSearchQuery добавляет варианты раскладки', () => {
    const variants = expandSearchQuery('test')
    expect(variants).toContain('test')
    expect(variants.length).toBeGreaterThan(1)
  })

  it('findLicenseSearchMatch находит по названию', () => {
    const license = createTestLicense({ name: 'Adobe Creative Cloud' })
    const match = findLicenseSearchMatch(license, 'Adobe', TEST_CATEGORIES)
    expect(match?.field).toBe('name')
  })

  it('findLicenseSearchMatch находит по платформе', () => {
    const license = createTestLicense({ platform: 'ios' })
    const match = findLicenseSearchMatch(license, 'iphone', TEST_CATEGORIES)
    expect(match?.field).toBe('platform')
  })

  it('findLicenseSearchMatch находит по категории', () => {
    const license = createTestLicense({ category: TEST_CATEGORY_OFFICE.id })
    const match = findLicenseSearchMatch(license, 'Офис', TEST_CATEGORIES)
    expect(match?.field).toBe('category')
  })

  it('filterLicensesBySearch возвращает все записи при коротком запросе', () => {
    const licenses = [
      createTestLicense({ id: '1' }),
      createTestLicense({ id: '2', name: 'Other' }),
    ]
    const results = filterLicensesBySearch(licenses, 'ab', TEST_CATEGORIES)
    expect(results).toHaveLength(2)
    expect(results.every((item) => item.highlight === null)).toBe(true)
  })

  it('filterLicensesBySearch фильтрует по запросу', () => {
    const licenses = [
      createTestLicense({ id: '1', name: 'Microsoft 365' }),
      createTestLicense({ id: '2', name: 'JetBrains' }),
    ]
    const results = filterLicensesBySearch(licenses, 'Microsoft', TEST_CATEGORIES)
    expect(results).toHaveLength(1)
    expect(results[0]?.license.name).toBe('Microsoft 365')
  })
})
