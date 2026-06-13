import type { License } from '../types/license'
import { getDaysUntilExpiry } from './dates'
import { computeLicenseStatus } from './status'

export function getExpiringSoonLicenses(
  licenses: License[],
  expiringThresholdDays: number,
): License[] {
  return licenses
    .filter(
      (license) =>
        computeLicenseStatus(license, { expiringThresholdDays }) === 'expiring',
    )
    .sort((left, right) => {
      const daysLeft =
        getDaysUntilExpiry(left.expiryDate, left.isPerpetual) ?? Number.POSITIVE_INFINITY
      const daysRight =
        getDaysUntilExpiry(right.expiryDate, right.isPerpetual) ?? Number.POSITIVE_INFINITY
      return daysLeft - daysRight
    })
}

export function countExpiringLicenses(
  licenses: License[],
  expiringThresholdDays: number,
): number {
  return getExpiringSoonLicenses(licenses, expiringThresholdDays).length
}
