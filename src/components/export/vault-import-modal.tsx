import { useRef, useState } from 'react'
import { importVaultBackup } from '../../export/vault-io'
import { VaultFileError } from '../../export/vault-file'
import type { ImportMode } from '../../export/vault-merge'
import { PasswordField } from '../auth/password-field'
import { Modal } from '../ui/modal'

type VaultImportModalProps = {
  onClose: () => void
  onSuccess?: () => void
}

export function VaultImportModal({ onClose, onSuccess }: VaultImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<ImportMode>('merge')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = Boolean(file) && password.length > 0 && !isSubmitting

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file || !canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      await importVaultBackup(bytes, password, mode)
      onSuccess?.()
      onClose()
    } catch (caught) {
      if (caught instanceof VaultFileError) {
        setError(caught.message)
      } else {
        setError('Не удалось импортировать файл')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Импорт .vault" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-muted">
          Введите пароль, которым был зашифрован этот файл. После импорта данные
          перешифруются текущим мастер-паролем сессии.
        </p>

        <div>
          <span className="mb-1.5 block text-sm font-medium">Файл бэкапа</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".vault"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent"
          />
          {file ? (
            <p className="mt-1 text-xs text-muted">{file.name}</p>
          ) : null}
        </div>

        <PasswordField
          id="import-file-password"
          label="Пароль файла"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Режим импорта</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <input
              type="radio"
              name="import-mode"
              value="merge"
              checked={mode === 'merge'}
              onChange={() => setMode('merge')}
              className="mt-0.5"
            />
            <span className="text-sm">
              Объединить
              <span className="mt-0.5 block text-xs text-muted">
                Добавить записи из файла; при совпадении id — версия из файла
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <input
              type="radio"
              name="import-mode"
              value="replace"
              checked={mode === 'replace'}
              onChange={() => setMode('replace')}
              className="mt-0.5"
            />
            <span className="text-sm">
              Заменить всё
              <span className="mt-0.5 block text-xs text-muted">
                Текущие лицензии и категории будут заменены содержимым файла
              </span>
            </span>
          </label>
        </fieldset>

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
            {isSubmitting ? 'Импорт…' : 'Импортировать'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
