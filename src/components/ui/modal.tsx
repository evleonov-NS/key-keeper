import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'

const DEFAULT_DISCARD_MESSAGE = 'Закрыть без сохранения изменений?'
type ModalProps = {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
  dirty?: boolean
  discardMessage?: string
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
  dirty = false,
  discardMessage = DEFAULT_DISCARD_MESSAGE,
}: ModalProps) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  useEffect(() => {
    setConfirmingDiscard(false)
  }, [dirty])

  const requestClose = () => {
    if (dirty) {
      setConfirmingDiscard(true)
      return
    }
    onClose()
  }

  const confirmDiscard = () => {
    setConfirmingDiscard(false)
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (confirmingDiscard) {
        setConfirmingDiscard(false)
        return
      }

      if (dirty) {
        setConfirmingDiscard(true)
        return
      }

      onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmingDiscard, dirty, onClose])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (confirmingDiscard) {
      setConfirmingDiscard(false)
      return
    }

    requestClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`my-4 w-full rounded-card border border-border bg-surface-elevated shadow-card ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Закрыть"
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {confirmingDiscard ? (
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm">{discardMessage}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDiscard(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                Остаться
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Закрыть без сохранения
              </button>
            </div>
          </div>
        ) : null}

        <div className="px-5 py-4">{children}</div>      </div>
    </div>
  )
}

const cancelButtonClass =
  'rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface'

type ModalCancelButtonProps = {
  onClose: () => void
  children?: ReactNode
}

export function ModalCancelButton({
  onClose,
  children = 'Отмена',
}: ModalCancelButtonProps) {
  return (
    <button type="button" onClick={onClose} className={cancelButtonClass}>
      {children}
    </button>
  )
}