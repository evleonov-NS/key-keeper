import type { License } from '../types/license'
import { PLATFORM_LABELS } from '../types/platform'
import type { LicenseSearchResult } from './search'

export type LicenseSortField = 'name' | 'expiryDate' | 'platform' | 'createdAt'
export type SortOrder = 'asc' | 'desc'

function compareStrings(left: string, right: string): number {
  return left.localeCompare(right, 'ru', { sensitivity: 'base' })
}

function expirySortKey(license: License): number {
  if (license.isPerpetual || !license.expiryDate) {
    return Number.POSITIVE_INFINITY
  }
  return new Date(license.expiryDate).getTime()
}

function compareLicenses(
  left: License,
  right: License,
  field: LicenseSortField,
): number {
  switch (field) {
    case 'name':
      return compareStrings(left.name, right.name)
    case 'platform':
      return compareStrings(
        PLATFORM_LABELS[left.platform],
        PLATFORM_LABELS[right.platform],
      )
    case 'createdAt':
      return left.createdAt.localeCompare(right.createdAt)
    case 'expiryDate':
      return expirySortKey(left) - expirySortKey(right)
    default:
      return 0
  }
}

export function sortLicenseResults(
  results: LicenseSearchResult[],
  sortBy: LicenseSortField,
  sortOrder: SortOrder,
): LicenseSearchResult[] {
  const sorted = [...results].sort((left, right) => {
    const comparison = compareLicenses(left.license, right.license, sortBy)
    return sortOrder === 'asc' ? comparison : -comparison
  })
  return sorted
}

export const SORT_FIELD_LABELS: Record<LicenseSortField, string> = {
  name: 'Название',
  expiryDate: 'Срок окончания',
  platform: 'Платформа',
  createdAt: 'Дата добавления',
}
