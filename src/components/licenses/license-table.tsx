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

function ExpiryLines({ license, compact = false }: { license: License; compact?: boolean }) {
  if (license.isPerpetual) {
    return <span className={compact ? 'text-[11px] text-muted' : undefined}>Бессрочно</span>
  }
  if (!license.expiryDate) {
    return <span className={compact ? 'text-[11px] text-muted' : undefined}>—</span>
  }
  const daysLeft = getDaysUntilExpiry(license.expiryDate, license.isPerpetual)
  return (
    <div className={compact ? 'text-[11px] text-muted leading-snug' : 'leading-snug'}>
      <div>{formatExpiryDate(license.expiryDate)}</div>
      <div className={compact ? undefined : 'text-[11px] text-muted'}>
        {formatDaysLeftLabel(daysLeft)}
      </div>
    </div>
  )
}

function LicenseNameCell({
  license,
  highlight,
  onEdit,
  onTagClick,
  showExpiry = false,
}: {
  license: License
  highlight?: SearchHighlight | null
  onEdit: (license: License) => void
  onTagClick: (tag: string) => void
  showExpiry?: boolean
}) {
  return (
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
      {showExpiry ? (
        <div className="mt-0.5 xl:hidden">
          <ExpiryLines license={license} compact />
        </div>
      ) : null}
      {license.images.length > 0 ? (
        <div className="mt-1 xl:hidden">
          <LicenseTablePhoto license={license} />
        </div>
      ) : null}
      {license.tags.length > 0 || license.images.length > 0 ? (
        <div className="mt-1 hidden min-w-0 items-center gap-2 xl:flex">
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
  )
}

function MetaStackCell({
  license,
  categoryName,
  highlight,
  onPlatformClick,
  onCategoryClick,
}: {
  license: License
  categoryName: string
  highlight?: SearchHighlight | null
  onPlatformClick: (platform: Platform) => void
  onCategoryClick: (categoryId: string) => void
}) {
  return (
    <div className="space-y-0.5 text-[11px] leading-snug">
      <button
        type="button"
        onClick={() => onPlatformClick(license.platform)}
        className="block max-w-full truncate text-left text-accent hover:underline"
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
      <button
        type="button"
        onClick={() => onCategoryClick(license.category ?? NO_CATEGORY_FILTER)}
        className="block max-w-full truncate text-left text-accent hover:underline"
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
      <StatusBadge status={license.status} compact />
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
    <div className="min-w-0 overflow-hidden rounded-xl border border-border xl:overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left text-sm xl:min-w-[48rem]">
        <colgroup className="xl:hidden">
          <col className="w-[6%]" />
          <col className="w-[30%]" />
          <col className="w-[18%]" />
          <col className="w-[36%]" />
          <col className="w-[10%]" />
        </colgroup>
        <colgroup className="hidden xl:contents">
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
            <th className="px-2 py-2 font-medium xl:px-3">Название</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">Платформа</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">Категория</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">Статус</th>
            <th className="px-2 py-2 font-medium xl:hidden">Инфо</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">Срок</th>
            <th className="px-2 py-2 font-medium xl:px-3">Логин / ключ</th>
            <th className="px-1 py-2 font-medium xl:px-3">Действия</th>
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
                <td className="px-2 py-2 align-middle xl:px-3">
                  <LicenseNameCell
                    license={license}
                    highlight={highlight}
                    onEdit={onEdit}
                    onTagClick={onTagClick}
                    showExpiry
                  />
                </td>
                <td className="hidden overflow-hidden px-3 py-2 align-middle xl:table-cell">
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
                <td className="hidden overflow-hidden px-3 py-2 align-middle xl:table-cell">
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
                <td className="hidden px-3 py-2 align-middle xl:table-cell">
                  <StatusBadge status={license.status} />
                </td>
                <td className="px-2 py-2 align-middle xl:hidden">
                  <MetaStackCell
                    license={license}
                    categoryName={categoryName}
                    highlight={highlight}
                    onPlatformClick={onPlatformClick}
                    onCategoryClick={onCategoryClick}
                  />
                </td>
                <td className="hidden px-3 py-2 align-middle text-xs text-muted xl:table-cell">
                  <ExpiryLines license={license} />
                </td>
                <td className="px-2 py-2 align-middle xl:px-3">
                  <LicenseTableCredentialsCell
                    license={license}
                    highlight={highlight}
                  />
                </td>
                <td className="px-1 py-2 align-middle xl:px-3">
                  <div className="flex flex-col items-center gap-0.5 xl:flex-row xl:items-center xl:gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(license)}
                      aria-label="Редактировать"
                      className="rounded-md p-1 text-muted hover:bg-surface-elevated xl:p-1.5"
                    >
                      <Pencil size={14} />
                    </button>
                    {license.status !== 'archived' ? (
                      <button
                        type="button"
                        onClick={() => onArchive(license)}
                        aria-label="В архив"
                        className="rounded-md p-1 text-muted hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 xl:p-1.5"
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
