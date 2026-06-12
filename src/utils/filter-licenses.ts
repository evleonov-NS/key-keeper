import type { Category } from '../types/category'
import type { License } from '../types/license'
import type { LicenseStatus } from '../types/license-status'
import { PLATFORM_LABELS, type Platform } from '../types/platform'
import { NO_CATEGORY_FILTER } from '../store/license-filter-store'
import { computeLicenseStatus } from './status'
import {
  filterLicensesBySearch,
  isSearchActive,
  type LicenseSearchResult,
} from './search'

export type LicenseFilters = {
  query: string
  categoryId: string | null
  platform: Platform | null
  status: LicenseStatus | null
}

export function hasActiveFilters(filters: LicenseFilters): boolean {
  return (
    isSearchActive(filters.query) ||
    filters.categoryId !== null ||
    filters.platform !== null ||
    filters.status !== null
  )
}

function applyCategoryFilter(
  licenses: License[],
  categoryId: string,
): License[] {
  if (categoryId === NO_CATEGORY_FILTER) {
    return licenses.filter((license) => !license.category)
  }
  return licenses.filter((license) => license.category === categoryId)
}

function applyPlatformFilter(
  licenses: License[],
  platform: Platform,
): License[] {
  return licenses.filter((license) => license.platform === platform)
}

function applyStatusFilter(
  licenses: License[],
  status: LicenseStatus,
  expiringThresholdDays: number,
): License[] {
  return licenses.filter(
    (license) =>
      computeLicenseStatus(license, { expiringThresholdDays }) === status,
  )
}

export function filterLicenses(
  licenses: License[],
  filters: LicenseFilters,
  categories: Category[],
  expiringThresholdDays: number,
): LicenseSearchResult[] {
  let scoped = licenses

  if (filters.categoryId !== null) {
    scoped = applyCategoryFilter(scoped, filters.categoryId)
  }

  if (filters.platform !== null) {
    scoped = applyPlatformFilter(scoped, filters.platform)
  }

  if (filters.status !== null) {
    scoped = applyStatusFilter(scoped, filters.status, expiringThresholdDays)
  }

  return filterLicensesBySearch(scoped, filters.query, categories)
}

export function getCategoryFilterLabel(
  categoryId: string,
  categories: Category[],
): string {
  if (categoryId === NO_CATEGORY_FILTER) {
    return 'Без категории'
  }
  return categories.find((category) => category.id === categoryId)?.name ?? 'Категория'
}

export function getPlatformFilterLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform]
}
