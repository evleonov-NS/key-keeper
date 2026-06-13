import { useEffect, useMemo, useState } from 'react'
import { Database, Plus } from 'lucide-react'
import type { License } from '../../types/license'
import type { LicenseStatus } from '../../types/license-status'
import type { Platform } from '../../types/platform'
import { LICENSE_STATUS_CARDS } from '../../constants/license-status-cards'
import type { LicensesNavigationIntent } from '../../types/navigation'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseFilterStore } from '../../store/license-filter-store'
import { LicenseCard } from '../licenses/license-card'
import { LicenseBulkBar } from '../licenses/license-bulk-bar'
import { LicenseFormModal } from '../licenses/license-form-modal'
import { LicenseListToolbar } from '../licenses/license-list-toolbar'
import { LicenseTable } from '../licenses/license-table'
import { FilterChip } from '../ui/filter-chip'
import {
  filterLicenses,
  getCategoryFilterLabel,
  getPlatformFilterLabel,
  hasActiveFilters,
} from '../../utils/filter-licenses'
import { collectLicenseTags } from '../../utils/license-tags'
import { isSearchActive } from '../../utils/search'
import { countLicensesByStatus, STATUS_FILTER_LABELS } from '../../utils/status'

type LicenseModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; license: License }

type DemoPanelProps = {
  intent?: LicensesNavigationIntent | null
  onIntentHandled?: () => void
}

export function DemoPanel({
  intent = null,
  onIntentHandled,
}: DemoPanelProps) {
  const [licenseModal, setLicenseModal] = useState<LicenseModalState>({
    mode: 'closed',
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const query = useLicenseFilterStore((state) => state.query)
  const categoryFilter = useLicenseFilterStore((state) => state.categoryId)
  const platformFilter = useLicenseFilterStore((state) => state.platform)
  const statusFilter = useLicenseFilterStore((state) => state.status)
  const tagFilter = useLicenseFilterStore((state) => state.tag)
  const sortBy = useLicenseFilterStore((state) => state.sortBy)
  const sortOrder = useLicenseFilterStore((state) => state.sortOrder)
  const viewMode = useLicenseFilterStore((state) => state.viewMode)

  const setCategoryFilter = useLicenseFilterStore((state) => state.setCategoryFilter)
  const setPlatformFilter = useLicenseFilterStore((state) => state.setPlatformFilter)
  const setStatusFilter = useLicenseFilterStore((state) => state.setStatusFilter)
  const setTagFilter = useLicenseFilterStore((state) => state.setTagFilter)
  const clearAllFilters = useLicenseFilterStore((state) => state.clearAllFilters)

  const settings = useAppStore((state) => state.settings)

  const licenses = useLicenseStore((state) => state.licenses)
  const archiveLicense = useLicenseStore((state) => state.archiveLicense)
  const archiveLicenses = useLicenseStore((state) => state.archiveLicenses)
  const restoreLicenses = useLicenseStore((state) => state.restoreLicenses)
  const removeLicenses = useLicenseStore((state) => state.removeLicenses)
  const categories = useCategoryStore((state) => state.categories)

  const filters = useMemo(
    () => ({
      query,
      categoryId: categoryFilter,
      platform: platformFilter,
      status: statusFilter,
      tag: tagFilter,
      sortBy,
      sortOrder,
    }),
    [
      query,
      categoryFilter,
      platformFilter,
      statusFilter,
      tagFilter,
      sortBy,
      sortOrder,
    ],
  )

  const filteredResults = useMemo(
    () =>
      filterLicenses(
        licenses,
        filters,
        categories,
        settings.expiringThresholdDays,
      ),
    [licenses, filters, categories, settings.expiringThresholdDays],
  )

  const availableTags = useMemo(
    () => collectLicenseTags(licenses),
    [licenses],
  )

  const visibleIds = useMemo(
    () => filteredResults.map((result) => result.license.id),
    [filteredResults],
  )

  useEffect(() => {
    if (!intent) {
      return
    }

    if (intent.kind === 'status') {
      setStatusFilter(intent.status)
      onIntentHandled?.()
      return
    }

    const license = licenses.find((item) => item.id === intent.licenseId)
    if (license) {
      setLicenseModal({ mode: 'edit', license })
    }
    onIntentHandled?.()
  }, [intent, licenses, onIntentHandled, setStatusFilter])

  useEffect(() => {
    const visible = new Set(visibleIds)
    setSelectedIds((previous) => {
      const next = new Set([...previous].filter((id) => visible.has(id)))
      if (
        next.size === previous.size &&
        [...next].every((id) => previous.has(id))
      ) {
        return previous
      }
      return next
    })
  }, [visibleIds])

  const statusCounts = countLicensesByStatus(
    licenses,
    settings.expiringThresholdDays,
  )

  const filtersActive = hasActiveFilters(filters)
  const searchActive = isSearchActive(query)
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id))
  const someVisibleSelected = visibleIds.some((id) => selectedIds.has(id))

  const selectedLicenses = useMemo(
    () => licenses.filter((license) => selectedIds.has(license.id)),
    [licenses, selectedIds],
  )

  const allSelectedArchived =
    selectedLicenses.length > 0 &&
    selectedLicenses.every((license) => license.status === 'archived')

  const handleArchive = (license: License) => {
    if (
      window.confirm(
        `Переместить «${license.name}» в архив? Запись можно восстановить при редактировании.`,
      )
    ) {
      archiveLicense(license.id)
      setSelectedIds((previous) => {
        const next = new Set(previous)
        next.delete(license.id)
        return next
      })
    }
  }

  const handleBulkArchive = () => {
    const ids = selectedLicenses
      .filter((license) => license.status !== 'archived')
      .map((license) => license.id)
    if (ids.length === 0) {
      return
    }
    if (
      window.confirm(
        `Переместить в архив выбранные записи (${ids.length})? Их можно восстановить позже.`,
      )
    ) {
      archiveLicenses(ids)
      setSelectedIds(new Set())
    }
  }

  const handleBulkRestore = () => {
    const ids = selectedLicenses
      .filter((license) => license.status === 'archived')
      .map((license) => license.id)
    if (ids.length === 0) {
      return
    }
    if (
      window.confirm(
        `Восстановить из архива выбранные записи (${ids.length})?`,
      )
    ) {
      restoreLicenses(ids)
      setSelectedIds(new Set())
    }
  }

  const handleBulkDelete = () => {
    const ids = [...selectedIds]
    if (ids.length === 0) {
      return
    }
    if (
      window.confirm(
        `Удалить безвозвратно ${ids.length} записей? Это действие нельзя отменить.`,
      )
    ) {
      removeLicenses(ids)
      setSelectedIds(new Set())
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((previous) => {
        const next = new Set(previous)
        for (const id of visibleIds) {
          next.delete(id)
        }
        return next
      })
      return
    }
    setSelectedIds((previous) => new Set([...previous, ...visibleIds]))
  }

  const handleCategoryClick = (categoryId: string) => {
    setCategoryFilter(categoryFilter === categoryId ? null : categoryId)
  }

  const handlePlatformClick = (platform: Platform) => {
    setPlatformFilter(platformFilter === platform ? null : platform)
  }

  const handleStatusCardClick = (status: LicenseStatus) => {
    setStatusFilter(statusFilter === status ? null : status)
  }

  const handleTagClick = (tag: string) => {
    setTagFilter(tagFilter === tag ? null : tag)
  }

  const emptyMessage = () => {
    if (searchActive) {
      return `Ничего не найдено по запросу «${query.trim()}».`
    }
    if (filtersActive) {
      return 'Нет лицензий по выбранным фильтрам.'
    }
    return null
  }

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Панель лицензий
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Активные лицензии, подписки и ключи с контролем сроков действия.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-1.5 sm:gap-3">
          {LICENSE_STATUS_CARDS.map((card) => {
            const isActive = statusFilter === card.status
            return (
              <button
                key={card.status}
                type="button"
                onClick={() => handleStatusCardClick(card.status)}
                title={card.label}
                className={`flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-surface p-1 text-center transition-all duration-theme hover:shadow-card sm:aspect-auto sm:items-start sm:px-4 sm:py-3 sm:text-left ${
                  isActive ? `ring-2 ${card.activeRing}` : ''
                }`}
              >
                <p className="text-[9px] leading-tight text-muted sm:hidden">
                  {card.shortLabel}
                </p>
                <p className="hidden text-xs text-muted sm:block">{card.label}</p>
                <p
                  className={`text-base font-semibold leading-none sm:mt-1 sm:text-xl ${card.tone}`}
                >
                  {statusCounts[card.status]}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-accent" />
              <h2 className="text-lg font-semibold">
                Лицензии (
                {filtersActive
                  ? `${filteredResults.length} из ${licenses.length}`
                  : licenses.length}
                )
              </h2>
            </div>

            {categoryFilter !== null ? (
              <FilterChip
                label={`Категория: ${getCategoryFilterLabel(categoryFilter, categories)}`}
                onClear={() => setCategoryFilter(null)}
              />
            ) : null}

            {platformFilter !== null ? (
              <FilterChip
                label={`Платформа: ${getPlatformFilterLabel(platformFilter)}`}
                onClear={() => setPlatformFilter(null)}
              />
            ) : null}

            {statusFilter !== null ? (
              <FilterChip
                label={`Статус: ${STATUS_FILTER_LABELS[statusFilter]}`}
                onClear={() => setStatusFilter(null)}
              />
            ) : null}

            {tagFilter !== null ? (
              <FilterChip
                label={`Тег: ${tagFilter}`}
                onClear={() => setTagFilter(null)}
              />
            ) : null}

            {filtersActive ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-accent hover:underline"
              >
                Сбросить все фильтры
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setLicenseModal({ mode: 'create' })}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>

        {licenses.length > 0 ? (
          <div className="sticky top-14 z-20 -mx-6 border-b border-border bg-surface-elevated px-6 pt-2 pb-0 shadow-sm">
            <LicenseListToolbar categories={categories} tags={availableTags} />
          </div>
        ) : null}

        <LicenseBulkBar
          selectedCount={selectedIds.size}
          showRestore={allSelectedArchived}
          onArchive={handleBulkArchive}
          onRestore={handleBulkRestore}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
        />

        {licenses.length === 0 ? (
          <p className="text-sm text-muted">
            Хранилище пустое. Нажмите «Добавить» или загрузите демо в настройках.
          </p>
        ) : filteredResults.length === 0 ? (
          <p className="text-sm text-muted">{emptyMessage()}</p>
        ) : viewMode === 'table' ? (
          <LicenseTable
            rows={filteredResults}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            allVisibleSelected={allVisibleSelected}
            someVisibleSelected={someVisibleSelected}
            onEdit={(item) => setLicenseModal({ mode: 'edit', license: item })}
            onArchive={handleArchive}
            onCategoryClick={handleCategoryClick}
            onPlatformClick={handlePlatformClick}
            onTagClick={handleTagClick}
          />
        ) : (
          <div className="space-y-3">
            {filteredResults.length > 1 ? (
              <label className="inline-flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate =
                        someVisibleSelected && !allVisibleSelected
                    }
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                />
                Выбрать все на странице
              </label>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredResults.map(({ license, highlight }) => (
                <LicenseCard
                  key={license.id}
                  license={license}
                  highlight={highlight}
                  selectable
                  selected={selectedIds.has(license.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={(item) => setLicenseModal({ mode: 'edit', license: item })}
                  onArchive={handleArchive}
                  onCategoryClick={handleCategoryClick}
                  onPlatformClick={handlePlatformClick}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {licenseModal.mode === 'create' ? (
        <LicenseFormModal
          mode="create"
          onClose={() => setLicenseModal({ mode: 'closed' })}
        />
      ) : null}

      {licenseModal.mode === 'edit' ? (
        <LicenseFormModal
          mode="edit"
          license={licenseModal.license}
          onClose={() => setLicenseModal({ mode: 'closed' })}
        />
      ) : null}
    </div>
  )
}
