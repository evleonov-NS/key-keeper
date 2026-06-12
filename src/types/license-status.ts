export type LicenseStatus =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'perpetual'
  | 'archived'

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  active: 'Активна',
  expiring: 'Истекает скоро',
  expired: 'Просрочена',
  perpetual: 'Бессрочная',
  archived: 'В архиве',
}
