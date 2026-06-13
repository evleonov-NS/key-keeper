import type { License } from '../types/license'
import { getDaysUntilExpiry } from './dates'
import { computeLicenseStatus } from './status'

export const NOTIFICATION_SESSION_KEY = 'key-keeper-notifications-shown'

export function clearNotificationSessionFlag(): void {
  sessionStorage.removeItem(NOTIFICATION_SESSION_KEY)
}

export function isRemindableLicense(license: License): boolean {
  return license.remind && license.status !== 'archived'
}

/** Истекающие и просроченные лицензии с `remind: true`, по срочности */
export function getAttentionLicenses(
  licenses: License[],
  expiringThresholdDays: number,
): License[] {
  return licenses
    .filter(isRemindableLicense)
    .filter((license) => {
      const status = computeLicenseStatus(license, { expiringThresholdDays })
      return status === 'expiring' || status === 'expired'
    })
    .sort((left, right) => {
      const daysLeft =
        getDaysUntilExpiry(left.expiryDate, left.isPerpetual) ??
        Number.POSITIVE_INFINITY
      const daysRight =
        getDaysUntilExpiry(right.expiryDate, right.isPerpetual) ??
        Number.POSITIVE_INFINITY
      return daysLeft - daysRight
    })
}

export function countAttentionLicenses(
  licenses: License[],
  expiringThresholdDays: number,
): number {
  return getAttentionLicenses(licenses, expiringThresholdDays).length
}
