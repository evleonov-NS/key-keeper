import { FileDown, FileSpreadsheet, FileUp, KeyRound, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { useLicenseFilterStore } from '../../store/license-filter-store'

type SettingsPanelProps = {
  onChangePassword: () => void
  onExportVault: () => void
  onImportVault: () => void
  onExportExcel: () => void
}

export function SettingsPanel({
  onChangePassword,
  onExportVault,
  onImportVault,
  onExportExcel,
}: SettingsPanelProps) {
  const loadDemoSeed = useAppStore((state) => state.loadDemoSeed)
  const clearDemo = useAppStore((state) => state.clearDemo)
  const settings = useAppStore((state) => state.settings)
  const setSidebarSortEnabled = useAppStore((state) => state.setSidebarSortEnabled)
  const setExpiringThresholdDays = useAppStore(
    (state) => state.setExpiringThresholdDays,
  )
  const setAutoLockMinutes = useAppStore((state) => state.setAutoLockMinutes)
  const setNotificationsEnabled = useAppStore(
    (state) => state.setNotificationsEnabled,
  )
  const setBackupReminderDays = useAppStore(
    (state) => state.setBackupReminderDays,
  )
  const setBackupReminderChanges = useAppStore(
    (state) => state.setBackupReminderChanges,
  )
  const meta = useAppStore((state) => state.meta)
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
        <h2 className="mb-2 text-lg font-semibold">Резервное копирование</h2>
        <p className="mb-4 text-sm text-muted">
          Зашифрованный файл .vault — основной способ переноса и бэкапа. Пароль
          файла может отличаться от мастер-пароля.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportVault}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated"
          >
            <FileDown size={16} />
            Экспорт .vault
          </button>
          <button
            type="button"
            onClick={onImportVault}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated"
          >
            <FileUp size={16} />
            Импорт .vault
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated"
          >
            <FileSpreadsheet size={16} />
            Экспорт Excel
          </button>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Последний экспорт</dt>
            <dd className="font-medium">
              {meta.lastExportAt
                ? new Date(meta.lastExportAt).toLocaleString('ru-RU')
                : 'ещё не делали'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Изменений с бэкапа</dt>
            <dd className="font-medium">{meta.changeCount}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Напоминание о бэкапе</h2>
        <p className="mb-4 text-sm text-muted">
          Баннер вверху экрана, если давно не экспортировали или накопилось
          много изменений.
        </p>
        <div className="grid max-w-md gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Дней без экспорта</span>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.backupReminderDays}
              onChange={(event) =>
                setBackupReminderDays(Number(event.target.value))
              }
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Изменений до напоминания</span>
            <input
              type="number"
              min={1}
              max={999}
              value={settings.backupReminderChanges}
              onChange={(event) =>
                setBackupReminderChanges(Number(event.target.value))
              }
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Интерфейс</h2>
        <p className="mb-4 text-sm text-muted">
          Дополнительные элементы бокового меню.
        </p>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-elevated">
          <input
            type="checkbox"
            checked={settings.sidebarSortEnabled}
            onChange={(event) => setSidebarSortEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm">
            Сортировка в боковом меню
            <span className="mt-0.5 block text-xs text-muted">
              Поле «Название / срок / платформа…» под категориями
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Напоминания</h2>
        <p className="mb-4 text-sm text-muted">
          Уведомления о лицензиях с включённым флагом «Напоминать». Записи с
          выключенным напоминанием не попадают в список «Требуют внимания».
        </p>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-elevated">
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(event) =>
              setNotificationsEnabled(event.target.checked)
            }
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm">
            Уведомления браузера при открытии
            <span className="mt-0.5 block text-xs text-muted">
              Локально, без сетевых запросов. Браузер запросит разрешение.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Сроки лицензий</h2>
        <p className="mb-4 text-sm text-muted">
          Порог «истекает скоро»: лицензии с оставшимся сроком не больше этого
          значения получают жёлтый статус. Пересчёт применяется сразу.
        </p>
        <label className="flex max-w-xs flex-col gap-1.5">
          <span className="text-sm font-medium">Порог «истекает», дней</span>
          <input
            type="number"
            min={1}
            max={365}
            value={settings.expiringThresholdDays}
            onChange={(event) =>
              setExpiringThresholdDays(Number(event.target.value))
            }
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </section>

      <section className="rounded-card border border-border bg-surface-elevated p-6 shadow-card">
        <h2 className="mb-2 text-lg font-semibold">Хранилище</h2>
        <p className="mb-4 text-sm text-muted">
          Авто-блокировка срабатывает по бездействию, если в шапке выключена
          опция «Сессия до закрытия».
        </p>
        <label className="flex max-w-xs flex-col gap-1.5">
          <span className="text-sm font-medium">Авто-блокировка, мин</span>
          <input
            type="number"
            min={1}
            max={480}
            value={settings.autoLockMinutes}
            onChange={(event) =>
              setAutoLockMinutes(Number(event.target.value))
            }
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </section>
    </div>
  )
}
