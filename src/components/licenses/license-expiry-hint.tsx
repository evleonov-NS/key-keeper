import type { License } from '../../types/license'
import type { LicenseStatus } from '../../types/license-status'
import { getLicenseExpiryInfo } from '../../utils/dates'

const HINT_STYLES: Record<LicenseStatus, string> = {
  active: 'text-green-700 dark:text-green-400',
  expiring: 'text-amber-700 dark:text-amber-400',
  expired: 'text-red-700 dark:text-red-400',
  perpetual: 'text-muted',
  archived: 'text-muted',
}

type LicenseExpiryHintProps = {
  license: License
  compact?: boolean
}

export function LicenseExpiryHint({
  license,
  compact = false,
}: LicenseExpiryHintProps) {
  if (license.status === 'archived') {
    return null
  }

  const info = getLicenseExpiryInfo(license)

  return (
    <p
      className={`${compact ? 'text-[10px]' : 'text-xs'} ${HINT_STYLES[license.status]}`}
    >
      {info.label}
      {info.formattedDate ? (
        <span className="text-muted"> · до {info.formattedDate}</span>
      ) : null}
    </p>
  )
}
