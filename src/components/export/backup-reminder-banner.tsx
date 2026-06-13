import { HardDriveDownload, X } from 'lucide-react'
import { useAppStore } from '../../store/app-store'
import {
  getBackupReminderMessage,
  getBackupReminderReason,
} from '../../utils/backup-reminder'

type BackupReminderBannerProps = {
  dismissed: boolean
  onDismiss: () => void
  onExport: () => void
}

export function BackupReminderBanner({
  dismissed,
  onDismiss,
  onExport,
}: BackupReminderBannerProps) {
  const meta = useAppStore((state) => state.meta)
  const settings = useAppStore((state) => state.settings)

  const reason = getBackupReminderReason(meta, settings)
  if (!reason || dismissed) {
    return null
  }

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/40"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          {getBackupReminderMessage(reason)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <HardDriveDownload size={14} />
            Экспорт .vault
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Скрыть напоминание"
            className="rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
