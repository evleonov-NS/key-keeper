import { useMemo } from 'react'
import { Database, KeyRound, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { useCategoryStore } from '../../store/category-store'
import { useSearchStore } from '../../store/search-store'
import { LicenseCard } from '../licenses/license-card'
import { countLicensesByStatus } from '../../utils/status'
import { filterLicensesBySearch, isSearchActive } from '../../utils/search'

type DemoPanelProps = {
  onChangePassword: () => void
}

export function DemoPanel({ onChangePassword }: DemoPanelProps) {
  const searchQuery = useSearchStore((state) => state.query)
  const clearQuery = useSearchStore((state) => state.clearQuery)

  const meta = useAppStore((state) => state.meta)
  const settings = useAppStore((state) => state.settings)
  const loadDemoSeed = useAppStore((state) => state.loadDemoSeed)
  const clearDemo = useAppStore((state) => state.clearDemo)

  const licenses = useLicenseStore((state) => state.licenses)
  const hasDemoLicenses = useLicenseStore((state) =>
    state.licenses.some((license) => license.isDemo),
  )
  const categories = useCategoryStore((state) => state.categories)

  const searchResults = useMemo(
    () => filterLicensesBySearch(licenses, searchQuery),
    [licenses, searchQuery],
  )

  const statusCounts = countLicensesByStatus(
    licenses,
    settings.expiringThresholdDays,
  )

  const handleClearDemo = () => {
    if (
      window.confirm(
        'Удалить все демо-записи и категории? Реальные записи не затронуты.',
      )
    ) {
      clearDemo()
      clearQuery()
    }
  }

  const searchActive = isSearchActive(searchQuery)

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Добро пожаловать
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Данные зашифрованы и сохранены в IndexedDB. Поиск — в боковом
              меню. Попробуйте{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-xs">ьшс</code>{' '}
              в русской раскладке.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onChangePassword}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              <KeyRound size={16} />
              Сменить пароль
            </button>

            {!hasDemoLicenses ? (
              <button
                type="button"
                onClick={() => loadDemoSeed()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
              >
                <Sparkles size={16} />
                Загрузить демо
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
              >
                <Trash2 size={16} />
                Очистить демо
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Активные', value: statusCounts.active, tone: 'text-green-600 dark:text-green-400' },
            { label: 'Истекают', value: statusCounts.expiring, tone: 'text-amber-600 dark:text-amber-400' },
            { label: 'Просрочены', value: statusCounts.expired, tone: 'text-red-600 dark:text-red-400' },
            { label: 'Бессрочные', value: statusCounts.perpetual, tone: 'text-gray-700 dark:text-gray-300' },
            { label: 'В архиве', value: statusCounts.archived, tone: 'text-gray-500 dark:text-gray-500' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <p className="text-xs text-muted">{card.label}</p>
              <p className={`mt-1 text-xl font-semibold ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Database size={18} className="text-accent" />
          <h2 className="text-lg font-semibold">
            Лицензии (
            {searchActive ? `${searchResults.length} из ${licenses.length}` : licenses.length}
            )
          </h2>
        </div>

        {licenses.length === 0 ? (
          <p className="text-sm text-muted">
            Хранилище пустое. Нажмите «Загрузить демо» для учебных записей или
            добавьте лицензии на Этапе 3.
          </p>
        ) : searchActive && searchResults.length === 0 ? (
          <p className="text-sm text-muted">
            Ничего не найдено по запросу «{searchQuery.trim()}».
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {searchResults.map(({ license, highlight }) => (
              <LicenseCard
                key={license.id}
                license={license}
                highlight={highlight}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-muted">
        Категории: {categories.map((category) => category.name).join(', ') ||
          '—'}
        {' · '}
        schemaVersion: {useAppStore.getState().getVaultData().schemaVersion}
        {meta.isDemo ? ' · демо-данные' : ''}
        {' · '}
        зашифрованный блоб
      </p>
    </div>
  )
}
