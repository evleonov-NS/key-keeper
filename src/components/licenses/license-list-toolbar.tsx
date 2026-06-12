import type { ReactNode } from 'react'
import { ArrowDownAZ, ArrowUpAZ, LayoutGrid, List } from 'lucide-react'
import type { Category } from '../../types/category'
import type { LicenseStatus } from '../../types/license-status'
import { PLATFORM_LABELS, type Platform } from '../../types/platform'
import {
  NO_CATEGORY_FILTER,
  useLicenseFilterStore,
  type LicenseViewMode,
} from '../../store/license-filter-store'
import { STATUS_FILTER_LABELS } from '../../utils/status'
import { SearchInput } from '../ui/search-input'

const PLATFORMS: Platform[] = ['windows', 'ios', 'android', 'web']

const STATUS_OPTIONS: LicenseStatus[] = [
  'active',
  'expiring',
  'expired',
  'perpetual',
  'archived',
]

type LicenseListToolbarProps = {
  categories: Category[]
  tags: string[]
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-auto"
      >
        {children}
      </select>
    </label>
  )
}

export function LicenseListToolbar({
  categories,
  tags,
}: LicenseListToolbarProps) {
  const query = useLicenseFilterStore((state) => state.query)
  const categoryId = useLicenseFilterStore((state) => state.categoryId)
  const platform = useLicenseFilterStore((state) => state.platform)
  const status = useLicenseFilterStore((state) => state.status)
  const tag = useLicenseFilterStore((state) => state.tag)
  const sortOrder = useLicenseFilterStore((state) => state.sortOrder)
  const viewMode = useLicenseFilterStore((state) => state.viewMode)

  const setQuery = useLicenseFilterStore((state) => state.setQuery)
  const setCategoryFilter = useLicenseFilterStore((state) => state.setCategoryFilter)
  const setPlatformFilter = useLicenseFilterStore((state) => state.setPlatformFilter)
  const setStatusFilter = useLicenseFilterStore((state) => state.setStatusFilter)
  const setTagFilter = useLicenseFilterStore((state) => state.setTagFilter)
  const setSortOrder = useLicenseFilterStore((state) => state.setSortOrder)
  const setViewMode = useLicenseFilterStore((state) => state.setViewMode)

  const sortedCategories = [...categories].sort((left, right) =>
    left.name.localeCompare(right.name, 'ru'),
  )

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <div className="w-full min-w-0 sm:w-[52%]">
          <SearchInput
            value={query}
            onChange={setQuery}
            showHint={false}
            placeholder="Поиск по названию, ключу, логину, платформе, комментарию…"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:ml-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Порядок
            </span>
            <button
              type="button"
              onClick={toggleSortOrder}
              title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2.5 text-xs text-gray-700 transition-colors hover:bg-surface-elevated dark:text-gray-200"
            >
              {sortOrder === 'asc' ? (
                <ArrowDownAZ size={16} />
              ) : (
                <ArrowUpAZ size={16} />
              )}
              {sortOrder === 'asc' ? 'А→Я' : 'Я→А'}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Вид
            </span>
            <div className="inline-flex h-9 items-center rounded-lg border border-border bg-surface p-0.5">
              {(
                [
                  { mode: 'cards' as LicenseViewMode, icon: LayoutGrid, label: 'Карточки' },
                  { mode: 'table' as LicenseViewMode, icon: List, label: 'Таблица' },
                ] as const
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  title={label}
                  aria-label={label}
                  aria-pressed={viewMode === mode}
                  className={`rounded-md p-1.5 transition-colors ${
                    viewMode === mode
                      ? 'bg-accent text-white'
                      : 'text-muted hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 shrink-0" aria-hidden />

      <div className="flex flex-wrap items-end gap-1.5">
        <FilterSelect
          label="Категория"
          value={categoryId ?? ''}
          onChange={(value) =>
            setCategoryFilter(value ? value : null)
          }
        >
          <option value="">Все</option>
          <option value={NO_CATEGORY_FILTER}>Без категории</option>
          {sortedCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Платформа"
          value={platform ?? ''}
          onChange={(value) =>
            setPlatformFilter(value ? (value as Platform) : null)
          }
        >
          <option value="">Все</option>
          {PLATFORMS.map((item) => (
            <option key={item} value={item}>
              {PLATFORM_LABELS[item]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Статус"
          value={status ?? ''}
          onChange={(value) =>
            setStatusFilter(value ? (value as LicenseStatus) : null)
          }
        >
          <option value="">Все</option>
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {STATUS_FILTER_LABELS[item]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Тег"
          value={tag ?? ''}
          onChange={(value) => setTagFilter(value || null)}
        >
          <option value="">Все</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="h-2 shrink-0" aria-hidden />
    </div>
  )
}
