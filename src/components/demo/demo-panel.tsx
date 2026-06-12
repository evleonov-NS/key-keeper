import { useMemo, useState } from 'react'
import { Database, Plus } from 'lucide-react'
import type { License } from '../../types/license'
import type { LicenseStatus } from '../../types/license-status'
import type { Platform } from '../../types/platform'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseFilterStore } from '../../store/license-filter-store'
import { LicenseCard } from '../licenses/license-card'
import { LicenseFormModal } from '../licenses/license-form-modal'
import { FilterChip } from '../ui/filter-chip'
import {
  filterLicenses,
  getCategoryFilterLabel,
  getPlatformFilterLabel,
  hasActiveFilters,
} from '../../utils/filter-licenses'
import { isSearchActive } from '../../utils/search'
import { countLicensesByStatus, STATUS_FILTER_LABELS } from '../../utils/status'

type LicenseModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; license: License }

const STATUS_CARDS: Array<{
  status: LicenseStatus
  label: string
  shortLabel: string
  tone: string
  activeRing: string
}> = [
  {
    status: 'active',
    label: 'Активные',
    shortLabel: 'Актив.',
    tone: 'text-green-600 dark:text-green-400',
    activeRing: 'ring-green-500/40',
  },
  {
    status: 'expiring',
    label: 'Истекают',
    shortLabel: 'Истек.',
    tone: 'text-amber-600 dark:text-amber-400',
    activeRing: 'ring-amber-500/40',
  },
  {
    status: 'expired',
    label: 'Просрочены',
    shortLabel: 'Проср.',
    tone: 'text-red-600 dark:text-red-400',
    activeRing: 'ring-red-500/40',
  },
  {
    status: 'perpetual',
    label: 'Бессрочные',
    shortLabel: 'Бесср.',
    tone: 'text-gray-700 dark:text-gray-300',
    activeRing: 'ring-gray-400/40',
  },
  {
    status: 'archived',
    label: 'В архиве',
    shortLabel: 'Архив',
    tone: 'text-gray-500 dark:text-gray-500',
    activeRing: 'ring-gray-400/30',
  },
]

export function DemoPanel() {
  const [licenseModal, setLicenseModal] = useState<LicenseModalState>({
    mode: 'closed',
  })

  const query = useLicenseFilterStore((state) => state.query)
  const categoryFilter = useLicenseFilterStore((state) => state.categoryId)
  const platformFilter = useLicenseFilterStore((state) => state.platform)
  const statusFilter = useLicenseFilterStore((state) => state.status)
  const setCategoryFilter = useLicenseFilterStore((state) => state.setCategoryFilter)
  const clearCategoryFilter = useLicenseFilterStore((state) => state.clearCategoryFilter)
  const setPlatformFilter = useLicenseFilterStore((state) => state.setPlatformFilter)
  const clearPlatformFilter = useLicenseFilterStore((state) => state.clearPlatformFilter)
  const setStatusFilter = useLicenseFilterStore((state) => state.setStatusFilter)
  const clearStatusFilter = useLicenseFilterStore((state) => state.clearStatusFilter)

  const meta = useAppStore((state) => state.meta)
  const settings = useAppStore((state) => state.settings)

  const licenses = useLicenseStore((state) => state.licenses)
  const archiveLicense = useLicenseStore((state) => state.archiveLicense)
  const categories = useCategoryStore((state) => state.categories)

  const filters = useMemo(
    () => ({
      query,
      categoryId: categoryFilter,
      platform: platformFilter,
      status: statusFilter,
    }),
    [query, categoryFilter, platformFilter, statusFilter],
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

  const statusCounts = countLicensesByStatus(
    licenses,
    settings.expiringThresholdDays,
  )

  const filtersActive = hasActiveFilters(filters)
  const searchActive = isSearchActive(query)

  const handleArchive = (license: License) => {
    if (
      window.confirm(
        `Переместить «${license.name}» в архив? Запись можно восстановить при редактировании.`,
      )
    ) {
      archiveLicense(license.id)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    if (categoryFilter === categoryId) {
      clearCategoryFilter()
      return
    }
    setCategoryFilter(categoryId)
  }

  const handlePlatformClick = (platform: Platform) => {
    if (platformFilter === platform) {
      clearPlatformFilter()
      return
    }
    setPlatformFilter(platform)
  }

  const handleStatusCardClick = (status: LicenseStatus) => {
    if (statusFilter === status) {
      clearStatusFilter()
      return
    }
    setStatusFilter(status)
  }

  const emptyMessage = () => {
    if (searchActive) {
      return `Ничего не найдено по запросу «${query.trim()}».`
    }
    if (categoryFilter !== null) {
      return `Нет лицензий в категории «${getCategoryFilterLabel(categoryFilter, categories)}».`
    }
    if (platformFilter !== null) {
      return `Нет лицензий для платформы «${getPlatformFilterLabel(platformFilter)}».`
    }
    if (statusFilter !== null) {
      return `Нет лицензий со статусом «${STATUS_FILTER_LABELS[statusFilter]}».`
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
          {STATUS_CARDS.map((card) => {
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
                label={`Фильтр: ${getCategoryFilterLabel(categoryFilter, categories)}`}
                onClear={clearCategoryFilter}
              />
            ) : null}

            {platformFilter !== null ? (
              <FilterChip
                label={`Платформа: ${getPlatformFilterLabel(platformFilter)}`}
                onClear={clearPlatformFilter}
              />
            ) : null}

            {statusFilter !== null ? (
              <FilterChip
                label={`Фильтр: ${STATUS_FILTER_LABELS[statusFilter]}`}
                onClear={clearStatusFilter}
              />
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

        {licenses.length === 0 ? (
          <p className="text-sm text-muted">
            Хранилище пустое. Нажмите «Добавить» или загрузите демо в настройках.
          </p>
        ) : filteredResults.length === 0 ? (
          <p className="text-sm text-muted">{emptyMessage()}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredResults.map(({ license, highlight }) => (
              <LicenseCard
                key={license.id}
                license={license}
                highlight={highlight}
                onEdit={(item) => setLicenseModal({ mode: 'edit', license: item })}
                onArchive={handleArchive}
                onCategoryClick={handleCategoryClick}
                onPlatformClick={handlePlatformClick}
              />
            ))}
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

      <p className="text-center text-xs text-muted">
        schemaVersion: {useAppStore.getState().getVaultData().schemaVersion}
        {meta.isDemo ? ' · демо-данные' : ''}
        {' · '}
        зашифрованный блоб
      </p>
    </div>
  )
}
