import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { exportLicensesToExcel } from '../../export/excel-export'
import { checkMasterPassword } from '../../storage/vault-service'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseStore } from '../../store/license-store'
import { PasswordField } from '../auth/password-field'
import { Modal, ModalCancelButton } from '../ui/modal'

type ExcelExportModalProps = {
  onClose: () => void
  onSuccess?: (message: string) => void
}

export function ExcelExportModal({ onClose, onSuccess }: ExcelExportModalProps) {
  const licenses = useLicenseStore((state) => state.licenses)
  const categories = useCategoryStore((state) => state.categories)
  const [maskKeys, setMaskKeys] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty =
    !maskKeys || confirmed || masterPassword.length > 0

  const needsMasterPassword = !maskKeys

  const handleExport = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (needsMasterPassword) {
        const valid = await checkMasterPassword(masterPassword)
        if (!valid) {
          setError('Неверный мастер-пароль')
          return
        }
      }

      await exportLicensesToExcel(licenses, categories, { maskKeys })
      onSuccess?.('Экспорт Excel завершён')
      onClose()
    } catch {
      setError('Не удалось создать файл Excel')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    confirmed &&
    !isSubmitting &&
    (!needsMasterPassword || masterPassword.length > 0)

  return (
    <Modal title="Экспорт в Excel" onClose={onClose} dirty={isDirty} wide>
      <div className="space-y-4">
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Файл Excel <strong>не шифруется</strong>. Ключи, логины и прочие
            данные будут в открытом виде. Не отправляйте файл по почте и не
            храните в общих папках.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={maskKeys}
            onChange={(event) => {
              setMaskKeys(event.target.checked)
              setMasterPassword('')
              setError(null)
            }}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm">
            Маскировать ключи
            <span className="mt-0.5 block text-xs text-muted">
              В колонке «Ключ лицензии» будет •••• вместо реального значения
            </span>
          </span>
        </label>

        {needsMasterPassword ? (
          <PasswordField
            id="excel-export-master-password"
            label="Мастер-пароль"
            value={masterPassword}
            onChange={setMasterPassword}
          />
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm">
            Я понимаю риски и хочу выгрузить данные в открытом виде
          </span>
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <ModalCancelButton onClose={onClose} />
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleExport()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение…' : 'Скачать .xlsx'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
