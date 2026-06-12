import dayjs, { type Dayjs } from 'dayjs'
import type { License } from '../types/license'

export type ExpiryInfo = {
  daysLeft: number | null
  label: string
  formattedDate: string | null
}

function pluralDays(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) {
    return 'день'
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'дня'
  }
  return 'дней'
}

/** Дней до окончания от локальной полуночи; `null` — бессрочно / без даты */
export function getDaysUntilExpiry(
  expiryDate: string | null,
  isPerpetual: boolean,
  now: Dayjs = dayjs(),
): number | null {
  if (isPerpetual || !expiryDate) {
    return null
  }

  const today = now.startOf('day')
  const expiry = dayjs(expiryDate).startOf('day')
  return expiry.diff(today, 'day')
}

export function formatExpiryDate(expiryDate: string): string {
  return dayjs(expiryDate).format('DD.MM.YYYY')
}

export function formatDaysLeftLabel(daysLeft: number | null): string {
  if (daysLeft === null) {
    return 'Бессрочно'
  }

  if (daysLeft === 0) {
    return 'Истекает сегодня'
  }

  if (daysLeft === 1) {
    return 'Остался 1 день'
  }

  if (daysLeft > 1) {
    return `Осталось ${daysLeft} ${pluralDays(daysLeft)}`
  }

  const overdue = Math.abs(daysLeft)
  if (overdue === 1) {
    return 'Просрочена 1 день назад'
  }

  return `Просрочена ${overdue} ${pluralDays(overdue)} назад`
}

export function getLicenseExpiryInfo(
  license: Pick<License, 'expiryDate' | 'isPerpetual'>,
  now: Dayjs = dayjs(),
): ExpiryInfo {
  const daysLeft = getDaysUntilExpiry(
    license.expiryDate,
    license.isPerpetual,
    now,
  )

  return {
    daysLeft,
    label: formatDaysLeftLabel(daysLeft),
    formattedDate:
      license.isPerpetual || !license.expiryDate
        ? null
        : formatExpiryDate(license.expiryDate),
  }
}
