import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-react'
import { useCategoryStore } from '../../store/category-store'
import {
  NO_CATEGORY_FILTER,
  useLicenseFilterStore,
} from '../../store/license-filter-store'
import type { AppView } from './app-layout'

type SidebarCategoriesProps = {
  onNavigate: (view: AppView) => void
}

export function SidebarCategories({ onNavigate }: SidebarCategoriesProps) {
  const [expanded, setExpanded] = useState(true)
  const categories = useCategoryStore((state) => state.categories)
  const categoryFilter = useLicenseFilterStore((state) => state.categoryId)
  const setCategoryFilter = useLicenseFilterStore((state) => state.setCategoryFilter)
  const clearCategoryFilter = useLicenseFilterStore((state) => state.clearCategoryFilter)

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((left, right) =>
        left.name.localeCompare(right.name, 'ru'),
      ),
    [categories],
  )

  const selectCategory = (categoryId: string) => {
    if (categoryFilter === categoryId) {
      clearCategoryFilter()
      return
    }
    setCategoryFilter(categoryId)
    onNavigate('licenses')
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-surface-elevated dark:text-gray-200"
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Категории
        {categoryFilter ? (
          <span className="ml-auto rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            фильтр
          </span>
        ) : null}
      </button>

      {expanded ? (
        <ul className="mt-1 space-y-0.5 pl-1">
          <li>
            <button
              type="button"
              onClick={() => selectCategory(NO_CATEGORY_FILTER)}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                categoryFilter === NO_CATEGORY_FILTER
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted hover:bg-surface-elevated hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Без категории
            </button>
          </li>
          {sortedCategories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => selectCategory(category.id)}
                className={`w-full truncate rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                  categoryFilter === category.id
                    ? 'bg-accent/10 font-medium text-accent'
                    : 'text-muted hover:bg-surface-elevated hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
          {sortedCategories.length === 0 ? (
            <li className="px-3 py-1.5 text-xs text-muted">Пока нет категорий</li>
          ) : null}
          <li className="pt-1">
            <button
              type="button"
              onClick={() => onNavigate('categories')}
              className="inline-flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Settings2 size={12} />
              Управление…
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
