import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { exportLicensesToExcel } from '../../export/excel-export'
import { useCategoryStore } from '../../store/category-store'
import { useLicenseStore } from '../../store/license-store'
import { Modal } from '../ui/modal'

type ExcelExportModalProps = {
  onClose: () => void
}

export function ExcelExportModal({ onClose }: ExcelExportModalProps) {
  const licenses = useLicenseStore((state) => state.licenses)
  const categories = useCategoryStore((state) => state.categories)
  const [maskKeys, setMaskKeys] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  const handleExport = () => {
    exportLicensesToExcel(licenses, categories, { maskKeys })
    onClose()
  }

  return (
    <Modal title="Экспорт в Excel" onClose={onClose} wide>
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
            onChange={(event) => setMaskKeys(event.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm">
            Маскировать ключи
            <span className="mt-0.5 block text-xs text-muted">
              В колонке «Ключ лицензии» будет •••• вместо реального значения
            </span>
          </span>
        </label>

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

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={handleExport}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Скачать .xlsx
          </button>
        </div>
      </div>
    </Modal>
  )
}
