import { useState } from 'react'
import { X } from 'lucide-react'
import { MIN_MASTER_PASSWORD_LENGTH } from '../../crypto/constants'
import { useAuthStore } from '../../store/auth-store'
import { PasswordField } from './password-field'

type ChangePasswordModalProps = {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const changePassword = useAuthStore((state) => state.changePassword)
  const authError = useAuthStore((state) => state.authError)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)

  const handleClose = () => {
    clearAuthError()
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (next.length < MIN_MASTER_PASSWORD_LENGTH || next !== confirm) {
      return
    }

    try {
      await changePassword(current, next)
      handleClose()
    } catch {
      // ошибка уже в store
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-card border border-border bg-surface-elevated p-6 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="change-password-title" className="text-lg font-semibold">
            Смена мастер-пароля
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Закрыть"
            className="rounded-md p-1 text-muted hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField
            id="current-password"
            label="Текущий пароль"
            value={current}
            onChange={setCurrent}
          />
          <PasswordField
            id="new-password"
            label="Новый пароль"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm-new-password"
            label="Подтверждение"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          {authError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
          ) : null}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !current ||
              next.length < MIN_MASTER_PASSWORD_LENGTH ||
              next !== confirm
            }
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение…' : 'Сменить пароль'}
          </button>
        </form>
      </div>
    </div>
  )
}
