import type { License } from '../types/license'

export function collectLicenseTags(licenses: License[]): string[] {
  const tags = new Set<string>()

  for (const license of licenses) {
    for (const tag of license.tags) {
      const trimmed = tag.trim()
      if (trimmed) {
        tags.add(trimmed)
      }
    }
  }

  return [...tags].sort((left, right) => left.localeCompare(right, 'ru'))
}
