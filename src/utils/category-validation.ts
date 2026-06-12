import type { Category } from '../types/category'

export function normalizeCategoryName(name: string): string {
  return name.trim()
}

export function findDuplicateCategory(
  categories: Category[],
  name: string,
  excludeId?: string,
): Category | undefined {
  const normalized = normalizeCategoryName(name).toLowerCase()
  if (!normalized) {
    return undefined
  }

  return categories.find((category) => {
    if (excludeId && category.id === excludeId) {
      return false
    }
    return normalizeCategoryName(category.name).toLowerCase() === normalized
  })
}

export function validateCategoryName(
  categories: Category[],
  name: string,
  excludeId?: string,
): string | null {
  if (!normalizeCategoryName(name)) {
    return 'Укажите название категории'
  }

  const duplicate = findDuplicateCategory(categories, name, excludeId)
  if (duplicate) {
    return `Категория «${duplicate.name}» уже существует`
  }

  return null
}
