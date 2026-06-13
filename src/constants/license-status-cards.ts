import type { LicenseStatus } from '../types/license-status'

export type LicenseStatusCardConfig = {
  status: LicenseStatus
  label: string
  shortLabel: string
  tone: string
  activeRing: string
}

export const LICENSE_STATUS_CARDS: LicenseStatusCardConfig[] = [
  {
    status: 'active',
    label: 'Активные',
    shortLabel: 'Актив.',
    tone: 'text-green-600 dark:text-green-400',
    activeRing: 'ring-green-500/40',
  },
  {
    status: 'expiring',
    label: 'Истекают',
    shortLabel: 'Истек.',
    tone: 'text-amber-600 dark:text-amber-400',
    activeRing: 'ring-amber-500/40',
  },
  {
    status: 'expired',
    label: 'Просрочены',
    shortLabel: 'Проср.',
    tone: 'text-red-600 dark:text-red-400',
    activeRing: 'ring-red-500/40',
  },
  {
    status: 'perpetual',
    label: 'Бессрочные',
    shortLabel: 'Бесср.',
    tone: 'text-gray-700 dark:text-gray-300',
    activeRing: 'ring-gray-400/40',
  },
  {
    status: 'archived',
    label: 'В архиве',
    shortLabel: 'Архив',
    tone: 'text-gray-500 dark:text-gray-500',
    activeRing: 'ring-gray-400/30',
  },
]

export const DASHBOARD_STATUS_CARDS = LICENSE_STATUS_CARDS.filter(
  (card) => card.status !== 'archived',
)
