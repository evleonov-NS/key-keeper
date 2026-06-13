import type { LicenseStatus } from './license-status'

export type LicensesNavigationIntent =
  | { kind: 'edit'; licenseId: string }
  | { kind: 'status'; status: LicenseStatus }
