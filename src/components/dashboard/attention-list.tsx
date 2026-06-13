import { AlertTriangle } from 'lucide-react'
import type { License } from '../../types/license'
import { ExpiringSoonItem } from './expiring-soon-item'

type AttentionListProps = {
  licenses: License[]
  onOpenLicense: (license: License) => void
}

export function AttentionList({ licenses, onOpenLicense }: AttentionListProps) {
  if (licenses.length === 0) {
    return (
      <div className="fade-in rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center">
        <p className="text-sm text-muted">
          Нет лицензий, которые требуют внимания.
        </p>
        <p className="mt-1 text-xs text-muted">
          Учитываются только записи с включённым напоминанием.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
        <AlertTriangle size={16} />
        <span>
          {licenses.length === 1
            ? '1 лицензия требует внимания'
            : `${licenses.length} лицензии требуют внимания`}
        </span>
      </div>

      <div className="space-y-3">
        {licenses.map((license, index) => (
          <ExpiringSoonItem
            key={license.id}
            license={license}
            animationDelayMs={80 + index * 60}
            onOpen={onOpenLicense}
          />
        ))}
      </div>
    </div>
  )
}
