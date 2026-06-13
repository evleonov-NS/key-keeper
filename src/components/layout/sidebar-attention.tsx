import { useMemo, useState } from 'react'
import { Bell, ChevronDown, ChevronRight } from 'lucide-react'
import type { License } from '../../types/license'
import { useAppStore } from '../../store/app-store'
import { useLicenseStore } from '../../store/license-store'
import { getAttentionLicenses } from '../../utils/reminders'
import { formatDaysLeftLabel, getDaysUntilExpiry } from '../../utils/dates'
import type { AppView } from './app-layout'

const SIDEBAR_PREVIEW_LIMIT = 5

type SidebarAttentionProps = {
  onNavigate: (view: AppView) => void
  onOpenLicense: (license: License) => void
}

export function SidebarAttention({
  onNavigate,
  onOpenLicense,
}: SidebarAttentionProps) {
  const [expanded, setExpanded] = useState(true)
  const licenses = useLicenseStore((state) => state.licenses)
  const expiringThresholdDays = useAppStore(
    (state) => state.settings.expiringThresholdDays,
  )

  const attention = useMemo(
    () => getAttentionLicenses(licenses, expiringThresholdDays),
    [licenses, expiringThresholdDays],
  )

  if (attention.length === 0) {
    return null
  }

  const preview = attention.slice(0, SIDEBAR_PREVIEW_LIMIT)
  const hiddenCount = attention.length - preview.length

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-amber-700 transition-colors hover:bg-surface-elevated dark:text-amber-400"
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Bell size={14} />
        Требуют внимания
        <span className="ml-auto rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          {attention.length}
        </span>
      </button>

      {expanded ? (
        <ul className="mt-1 space-y-0.5 pl-1">
          {preview.map((license) => {
            const daysLeft = getDaysUntilExpiry(
              license.expiryDate,
              license.isPerpetual,
            )
            return (
              <li key={license.id}>
                <button
                  type="button"
                  onClick={() => onOpenLicense(license)}
                  className="w-full rounded-lg px-3 py-1.5 text-left transition-colors hover:bg-surface-elevated"
                >
                  <span className="block truncate text-xs font-medium">
                    {license.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted">
                    {formatDaysLeftLabel(daysLeft)}
                  </span>
                </button>
              </li>
            )
          })}
          {hiddenCount > 0 ? (
            <li>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-accent transition-colors hover:bg-surface-elevated"
              >
                Ещё {hiddenCount} на дашборде…
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
