import { Archive, Pencil } from 'lucide-react'
import type { License } from '../../types/license'
import { PLATFORM_LABELS, type Platform } from '../../types/platform'
import { formatDaysLeftLabel, formatExpiryDate, getDaysUntilExpiry } from '../../utils/dates'
import type { SearchHighlight } from '../../utils/search'
import { NO_CATEGORY_FILTER } from '../../store/license-filter-store'
import { useCategoryStore } from '../../store/category-store'
import { HighlightText } from '../ui/highlight-text'
import { LicenseTableCredentialsCell } from './license-table-credentials-cell'
import { LicenseTablePhoto } from './license-table-photo'
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

function ExpiryTableCell({ license }: { license: License }) {
  if (license.isPerpetual) {
    return <span>Бессрочно</span>
  }
  if (!license.expiryDate) {
    return <span>—</span>
  }
  const daysLeft = getDaysUntilExpiry(license.expiryDate, license.isPerpetual)
  return (
    <div className="leading-snug">
      <div>{formatExpiryDate(license.expiryDate)}</div>
      <div className="text-[11px]">{formatDaysLeftLabel(daysLeft)}</div>
    </div>
  )
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
    <div className="min-w-0 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[48rem] table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-[5%]" />
          <col className="w-[24%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[17%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-surface text-xs text-muted">
            <th className="py-2 pl-3 pr-2">
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
            <th className="px-3 py-2 font-medium">Название</th>
            <th className="px-3 py-2 font-medium">Платформа</th>
            <th className="px-3 py-2 font-medium">Категория</th>
            <th className="px-3 py-2 font-medium">Статус</th>
            <th className="px-3 py-2 font-medium">Срок</th>
            <th className="px-3 py-2 font-medium">Логин / ключ</th>
            <th className="px-3 py-2 font-medium">Действия</th>
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
                <td className="py-2 pl-3 pr-2 align-middle">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(license.id)}
                    aria-label={`Выбрать «${license.name}»`}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                  />
                </td>
                <td className="px-3 py-2 align-middle">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onEdit(license)}
                      className="block w-full min-w-0 text-left font-medium hover:text-accent"
                    >
                      {highlight?.field === 'name' ? (
                        <HighlightText
                          text={license.name}
                          start={highlight.start}
                          end={highlight.end}
                          className="block truncate"
                        />
                      ) : (
                        <span className="block truncate">{license.name}</span>
                      )}
                    </button>
                    {license.tags.length > 0 || license.images.length > 0 ? (
                      <div className="mt-1 flex min-w-0 items-center gap-2">
                        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
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
                        {license.images.length > 0 ? (
                          <LicenseTablePhoto license={license} />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="overflow-hidden px-3 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() => onPlatformClick(license.platform)}
                    className="block w-full truncate text-left text-accent hover:underline"
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
                <td className="overflow-hidden px-3 py-2 align-middle">
                  <button
                    type="button"
                    onClick={() =>
                      onCategoryClick(license.category ?? NO_CATEGORY_FILTER)
                    }
                    className="block w-full truncate text-left text-accent hover:underline"
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
                <td className="px-3 py-2 align-middle text-xs text-muted">
                  <ExpiryTableCell license={license} />
                </td>
                <td className="px-3 py-2 align-middle">
                  <LicenseTableCredentialsCell
                    license={license}
                    highlight={highlight}
                  />
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
