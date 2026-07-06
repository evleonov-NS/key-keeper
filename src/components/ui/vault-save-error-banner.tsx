import { AlertTriangle, X } from 'lucide-react'
import { useAppStore } from '../../store/app-store'

export function VaultSaveErrorBanner() {
  const error = useAppStore((state) => state.error)
  const setError = useAppStore((state) => state.setError)

  if (!error) {
    return null
  }

  return (
    <div
      role="alert"
      className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-red-900 dark:text-red-200">
          <AlertTriangle size={16} className="shrink-0" aria-hidden />
          {error}
        </p>
        <button
          type="button"
          onClick={() => setError(null)}
          aria-label="Скрыть сообщение об ошибке"
          className="shrink-0 rounded-md p-1 text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
