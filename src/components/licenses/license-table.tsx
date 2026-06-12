import dayjs from 'dayjs'
import { Archive, Pencil } from 'lucide-react'
import type { License } from '../../types/license'
import { PLATFORM_LABELS, type Platform } from '../../types/platform'
import type { SearchHighlight } from '../../utils/search'
import { NO_CATEGORY_FILTER } from '../../store/license-filter-store'
import { useCategoryStore } from '../../store/category-store'
import { HighlightText } from '../ui/highlight-text'
import { StatusBadge } from './status-badge'

type LicenseTableRow = {
  license: License
  highlight?: SearchHighlight | null
}

type LicenseTableProps = {
  rows: LicenseTableRow[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  allVisibleSelected: boolean
  someVisibleSelected: boolean
  onEdit: (license: License) => void
  onArchive: (license: License) => void
  onCategoryClick: (categoryId: string) => void
  onPlatformClick: (platform: Platform) => void
  onTagClick: (tag: string) => void
}

function formatExpiry(license: License): string {
  if (license.isPerpetual) {
    return 'Бессрочно'
  }
  if (!license.expiryDate) {
    return '—'
  }
  return dayjs(license.expiryDate).format('DD.MM.YYYY')
}

function formatCreatedAt(value: string): string {
  return dayjs(value).format('DD.MM.YYYY')
}

export function LicenseTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allVisibleSelected,
  someVisibleSelected,
  onEdit,
  onArchive,
  onCategoryClick,
  onPlatformClick,
  onTagClick,
}: LicenseTableProps) {
  const categories = useCategoryStore((state) => state.categories)

  return (
    <div className="rounded-xl border border-border">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-xs text-muted">
            <th className="w-10 px-3 py-2">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(element) => {
                  if (element) {
                    element.indeterminate = someVisibleSelected && !allVisibleSelected
                  }
                }}
                onChange={onToggleSelectAll}
                aria-label="Выбрать все"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
              />
            </th>
            <th className="w-[22%] px-3 py-2 font-medium">Название</th>
            <th className="w-[11%] px-3 py-2 font-medium">Платформа</th>
            <th className="w-[12%] px-3 py-2 font-medium">Категория</th>
            <th className="w-[12%] px-3 py-2 font-medium">Статус</th>
            <th className="w-[11%] px-3 py-2 font-medium">Срок</th>
            <th className="w-[11%] px-3 py-2 font-medium">Добавлена</th>
            <th className="w-[9%] px-3 py-2 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ license, highlight }) => {
            const categoryName =
              categories.find((category) => category.id === license.category)?.name ??
              'Без категории'
            const selected = selectedIds.has(license.id)

            return (
              <tr
                key={license.id}
                className={`border-b border-border last:border-b-0 ${
                  selected ? 'bg-accent/5' : 'bg-surface hover:bg-surface-elevated/60'
                }`}
              >
                <td className="px-3 py-2 align-middle">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(license.id)}
                    aria-label={`Выбрать «${license.name}»`}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                  />
                </td>
                <td className="max-w-[200px] px-3 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() => onEdit(license)}
                    className="w-full truncate text-left font-medium hover:text-accent"
                  >
                    {highlight?.field === 'name' ? (
                      <HighlightText
                        text={license.name}
                        start={highlight.start}
                        end={highlight.end}
                        className="truncate"
                      />
                    ) : (
                      license.name
                    )}
                  </button>
                  {license.tags.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {license.tags.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => onTagClick(item)}
                          className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] text-muted hover:text-accent"
                        >
                          #{item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() => onPlatformClick(license.platform)}
                    className="truncate text-accent hover:underline"
                  >
                    {highlight?.field === 'platform' ? (
                      <HighlightText
                        text={PLATFORM_LABELS[license.platform]}
                        start={highlight.start}
                        end={highlight.end}
                      />
                    ) : (
                      PLATFORM_LABELS[license.platform]
                    )}
                  </button>
                </td>
                <td className="px-3 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() =>
                      onCategoryClick(license.category ?? NO_CATEGORY_FILTER)
                    }
                    className="text-accent hover:underline"
                  >
                    {highlight?.field === 'category' ? (
                      <HighlightText
                        text={categoryName}
                        start={highlight.start}
                        end={highlight.end}
                      />
                    ) : (
                      categoryName
                    )}
                  </button>
                </td>
                <td className="px-3 py-2 align-middle">
                  <StatusBadge status={license.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-middle text-xs text-muted">
                  {formatExpiry(license)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-middle text-xs text-muted">
                  {formatCreatedAt(license.createdAt)}
                </td>
                <td className="px-3 py-2 align-middle">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(license)}
                      aria-label="Редактировать"
                      className="rounded-md p-1.5 text-muted hover:bg-surface-elevated"
                    >
                      <Pencil size={14} />
                    </button>
                    {license.status !== 'archived' ? (
                      <button
                        type="button"
                        onClick={() => onArchive(license)}
                        aria-label="В архив"
                        className="rounded-md p-1.5 text-muted hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                      >
                        <Archive size={14} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
