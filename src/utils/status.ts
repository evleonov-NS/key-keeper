import dayjs from 'dayjs'
import type { License } from '../types/license'
import type { LicenseStatus } from '../types/license-status'
import { getDaysUntilExpiry } from './dates'

type ComputeStatusOptions = {
  expiringThresholdDays?: number
  now?: dayjs.Dayjs
}

/**
 * Расчёт статуса лицензии.
 * Дни до окончания — от локальной полуночи (полная логика на Этапе 7).
 */
export function computeLicenseStatus(
  license: Pick<
    License,
    'isPerpetual' | 'expiryDate' | 'remind' | 'status'
  >,
  options: ComputeStatusOptions = {},
): LicenseStatus {
  const threshold = options.expiringThresholdDays ?? 14
  const today = (options.now ?? dayjs()).startOf('day')

  if (license.status === 'archived') {
    return 'archived'
  }

  const daysLeft = getDaysUntilExpiry(
    license.expiryDate,
    license.isPerpetual,
    today,
  )

  if (daysLeft === null) {
    return 'perpetual'
  }

  if (daysLeft < 0) {
    return 'expired'
  }

  if (daysLeft <= threshold) {
    return 'expiring'
  }

  return 'active'
}

export const STATUS_FILTER_LABELS: Record<LicenseStatus, string> = {
  active: 'Активные',
  expiring: 'Истекают',
  expired: 'Просрочены',
  perpetual: 'Бессрочные',
  archived: 'В архиве',
}

export function countLicensesByStatus(
  licenses: License[],
  expiringThresholdDays = 14,
): Record<LicenseStatus, number> {
  const counts: Record<LicenseStatus, number> = {
    active: 0,
    expiring: 0,
    expired: 0,
    perpetual: 0,
    archived: 0,
  }

  for (const license of licenses) {
    const status = computeLicenseStatus(license, { expiringThresholdDays })
    counts[status] += 1
  }

  return counts
}
