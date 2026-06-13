import { useState } from 'react'
import { MIN_MASTER_PASSWORD_LENGTH } from '../../crypto/constants'
import { exportVaultBackup } from '../../export/vault-io'
import { VaultFileError } from '../../export/vault-file'
import { PasswordField } from '../auth/password-field'
import { Modal } from '../ui/modal'

type VaultExportModalProps = {
  onClose: () => void
  onSuccess?: () => void
}

export function VaultExportModal({ onClose, onSuccess }: VaultExportModalProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit =
    password.length >= MIN_MASTER_PASSWORD_LENGTH &&
    password === confirm &&
    !isSubmitting

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await exportVaultBackup(password)
      onSuccess?.()
      onClose()
    } catch (caught) {
      if (caught instanceof VaultFileError) {
        setError(caught.message)
      } else {
        setError('Не удалось создать резервную копию')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Экспорт .vault" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-muted">
          Файл шифруется отдельным паролем — он может отличаться от текущего
          мастер-пароля. Сохраните пароль вместе с файлом.
        </p>

        <PasswordField
          id="export-file-password"
          label="Пароль файла"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="export-file-confirm"
          label="Подтверждение пароля"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение…' : 'Скачать .vault'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
