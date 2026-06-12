import type { LicenseStatus } from '../../types/license-status'
import { LICENSE_STATUS_LABELS } from '../../types/license-status'

const STATUS_STYLES: Record<LicenseStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  perpetual: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800/60 dark:text-gray-500',
}

type StatusBadgeProps = {
  status: LicenseStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {LICENSE_STATUS_LABELS[status]}
    </span>
  )
}
