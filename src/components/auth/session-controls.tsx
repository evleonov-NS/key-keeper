import { Lock } from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'
import { useAppStore } from '../../store/app-store'

export function SessionControls() {
  const lock = useAuthStore((state) => state.lock)
  const keepSessionOpen = useAppStore((state) => state.settings.keepSessionOpen)
  const updateKeepSession = useAppStore((state) => state.setKeepSessionOpen)

  return (
    <div className="flex items-center gap-2">
      <label className="hidden items-center gap-2 text-xs text-muted sm:flex">
        <input
          type="checkbox"
          checked={keepSessionOpen}
          onChange={(event) => updateKeepSession(event.target.checked)}
          className="rounded border-border"
        />
        Сессия до закрытия
      </label>

      <button
        type="button"
        onClick={() => lock()}
        aria-label="Заблокировать"
        title="Заблокировать"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <Lock size={16} />
      </button>
    </div>
  )
}
