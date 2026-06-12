import { Archive, ArchiveRestore, Trash2, X } from 'lucide-react'

type LicenseBulkBarProps = {
  selectedCount: number
  showRestore: boolean
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
  onClear: () => void
}

export function LicenseBulkBar({
  selectedCount,
  showRestore,
  onArchive,
  onRestore,
  onDelete,
  onClear,
}: LicenseBulkBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
        Выбрано: {selectedCount}
      </span>

      {showRestore ? (
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-surface-elevated dark:text-gray-200"
        >
          <ArchiveRestore size={14} />
          Восстановить
        </button>
      ) : (
        <button
          type="button"
          onClick={onArchive}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-surface-elevated dark:text-gray-200"
        >
          <Archive size={14} />
          В архив
        </button>
      )}

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
      >
        <Trash2 size={14} />
        Удалить
      </button>

      <button
        type="button"
        onClick={onClear}
        aria-label="Снять выделение"
        className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-gray-700 dark:hover:text-gray-200"
      >
        <X size={14} />
        Снять
      </button>
    </div>
  )
}
