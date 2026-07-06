import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export const TOAST_AUTO_DISMISS_MS = 3_000

export type ToastItem = {
  id: string
  message: string
}

type ToastContainerProps = {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const [remainingSec, setRemainingSec] = useState(
    Math.ceil(TOAST_AUTO_DISMISS_MS / 1000),
  )

  useEffect(() => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const left = Math.max(0, Math.ceil((TOAST_AUTO_DISMISS_MS - elapsed) / 1000))
      setRemainingSec(left)
      if (left === 0) {
        window.clearInterval(timer)
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      role="status"
      className="fade-in flex max-w-sm items-start gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 shadow-card"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        <p className="mt-0.5 text-xs text-muted">
          Закроется через {remainingSec} с
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Закрыть уведомление"
        className="shrink-0 rounded-md p-1 text-muted hover:bg-surface"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,24rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
