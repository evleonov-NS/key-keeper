import { KeyRound, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { useLicenseFilterStore } from '../../store/license-filter-store'

type SettingsPanelProps = {
  onChangePassword: () => void
}

export function SettingsPanel({ onChangePassword }: SettingsPanelProps) {
  const loadDemoSeed = useAppStore((state) => state.loadDemoSeed)
  const clearDemo = useAppStore((state) => state.clearDemo)
  const settings = useAppStore((state) => state.settings)
  const hasDemoLicenses = useLicenseStore((state) =>
    state.licenses.some((license) => license.isDemo),
  )
  const clearAllFilters = useLicenseFilterStore((state) => state.clearAllFilters)

  const handleClearDemo = () => {
    if (
      window.confirm(
        'Удалить все демо-записи и категории? Реальные записи не затронуты.',
      )
    ) {
      clearDemo()
      clearAllFilters()
    }
  }

  return (
    <div className="space-y-6">
      <section className="fade-in rounded-card border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="mt-2 text-sm text-muted">
          Безопасность, демо-данные и параметры хранилища.
        </p>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Безопасность</h2>
        <button
          type="button"
          onClick={onChangePassword}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          <KeyRound size={16} />
          Сменить мастер-пароль
        </button>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Демо-данные</h2>
        <p className="mb-4 text-sm text-muted">
          Учебные записи для проверки интерфейса. Не смешивайте с реальными ключами.
        </p>
        <div className="flex flex-wrap gap-2">
          {!hasDemoLicenses ? (
            <button
              type="button"
              onClick={() => loadDemoSeed()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              <Sparkles size={16} />
              Загрузить демо
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
            >
              <Trash2 size={16} />
              Очистить демо
            </button>
          )}
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold">Хранилище</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Авто-блокировка</dt>
            <dd className="font-medium">{settings.autoLockMinutes} мин</dd>
          </div>
          <div>
            <dt className="text-muted">Порог «истекает»</dt>
            <dd className="font-medium">{settings.expiringThresholdDays} дн.</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
