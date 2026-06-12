import type { Category } from '../types/category'
import type { License } from '../types/license'

/** Минимальная длина запроса для фильтрации списка */
export const MIN_SEARCH_LENGTH = 3

/** Поля лицензии, участвующие в поиске */
export const SEARCHABLE_FIELDS = [
  'name',
  'licenseKey',
  'accountLogin',
  'comment',
  'category',
  'tags',
] as const

export type SearchableField = (typeof SEARCHABLE_FIELDS)[number]

export type SearchHighlight = {
  field: SearchableField
  start: number
  end: number
}

export type LicenseSearchResult = {
  license: License
  highlight: SearchHighlight | null
}

/** ЙЦУКЕН → QWERTY (физические клавиши, основные буквы) */
const RU_TO_EN: Record<string, string> = {
  й: 'q',
  ц: 'w',
  у: 'e',
  к: 'r',
  е: 't',
  н: 'y',
  г: 'u',
  ш: 'i',
  щ: 'o',
  з: 'p',
  ф: 'a',
  ы: 's',
  в: 'd',
  а: 'f',
  п: 'g',
  р: 'h',
  о: 'j',
  л: 'k',
  д: 'l',
  я: 'z',
  ч: 'x',
  с: 'c',
  м: 'v',
  и: 'b',
  т: 'n',
  ь: 'm',
}

const EN_TO_RU = Object.fromEntries(
  Object.entries(RU_TO_EN).map(([ru, en]) => [en, ru]),
) as Record<string, string>

function mapChars(text: string, table: Record<string, string>): string {
  return text
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = table[lower]
      if (!mapped) {
        return char
      }
      return char === lower ? mapped : mapped.toUpperCase()
    })
    .join('')
}

/** Русская раскладка → те же клавиши в EN */
export function ruLayoutToEn(text: string): string {
  return mapChars(text, RU_TO_EN)
}

/** EN-раскладка → те же клавиши в RU */
export function enLayoutToRu(text: string): string {
  return mapChars(text, EN_TO_RU)
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

/** Варианты запроса с учётом обеих раскладок */
export function expandSearchQuery(query: string): string[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  return uniqueStrings([
    trimmed,
    ruLayoutToEn(trimmed),
    enLayoutToRu(trimmed),
  ]).map((value) => value.toLowerCase())
}

function expandFieldValue(value: string): string[] {
  return uniqueStrings([value, ruLayoutToEn(value), enLayoutToRu(value)]).map(
    (item) => item.toLowerCase(),
  )
}

function findHighlightInRaw(
  rawValue: string,
  queryVariants: string[],
): { start: number; end: number } | null {
  const lower = rawValue.toLowerCase()

  for (const query of queryVariants) {
    if (query.length < MIN_SEARCH_LENGTH) {
      continue
    }

    const index = lower.indexOf(query)
    if (index !== -1) {
      return { start: index, end: index + query.length }
    }
  }

  return null
}

function fieldMatchesQuery(
  rawValue: string,
  queryVariants: string[],
): boolean {
  const fieldVariants = expandFieldValue(rawValue)

  for (const query of queryVariants) {
    if (query.length < MIN_SEARCH_LENGTH) {
      continue
    }

    for (const field of fieldVariants) {
      if (field.includes(query)) {
        return true
      }
    }
  }

  return false
}

function findMatchInField(
  field: SearchableField,
  rawValue: string,
  queryVariants: string[],
): SearchHighlight | null {
  if (!fieldMatchesQuery(rawValue, queryVariants)) {
    return null
  }

  const highlight = findHighlightInRaw(rawValue, queryVariants)
  if (!highlight) {
    // Совпадение через раскладку, но подсветка по прямому вхождению недоступна
    return { field, start: 0, end: Math.min(rawValue.length, MIN_SEARCH_LENGTH) }
  }

  return { field, ...highlight }
}

function resolveCategoryName(
  license: License,
  categories: Category[],
): string {
  if (!license.category) {
    return ''
  }
  return categories.find((category) => category.id === license.category)?.name ?? ''
}

export function findLicenseSearchMatch(
  license: License,
  query: string,
  categories: Category[] = [],
): SearchHighlight | null {
  const queryVariants = expandSearchQuery(query)
  if (queryVariants.every((variant) => variant.length < MIN_SEARCH_LENGTH)) {
    return null
  }

  const categoryName = resolveCategoryName(license, categories)
  const tagsText = license.tags.join(' ')

  const fields: Array<[SearchableField, string]> = [
    ['name', license.name],
    ['licenseKey', license.licenseKey],
    ['accountLogin', license.accountLogin],
    ['comment', license.comment],
    ['category', categoryName],
    ['tags', tagsText],
  ]

  for (const [field, value] of fields) {
    if (!value) {
      continue
    }

    const match = findMatchInField(field, value, queryVariants)
    if (match) {
      return match
    }
  }

  return null
}

export function filterLicensesBySearch(
  licenses: License[],
  query: string,
  categories: Category[] = [],
): LicenseSearchResult[] {
  const trimmed = query.trim()

  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return licenses.map((license) => ({ license, highlight: null }))
  }

  return licenses
    .map((license) => ({
      license,
      highlight: findLicenseSearchMatch(license, trimmed, categories),
    }))
    .filter((item) => item.highlight !== null)
}

export function isSearchActive(query: string): boolean {
  return query.trim().length >= MIN_SEARCH_LENGTH
}
