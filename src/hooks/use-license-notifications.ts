import { useEffect } from 'react'
import type { License } from '../types/license'
import {
  NOTIFICATION_SESSION_KEY,
  countAttentionLicenses,
  getAttentionLicenses,
} from '../utils/reminders'
import { formatDaysLeftLabel, getDaysUntilExpiry } from '../utils/dates'

type UseLicenseNotificationsOptions = {
  licenses: License[]
  expiringThresholdDays: number
  notificationsEnabled: boolean
  isUnlocked: boolean
}

function buildNotificationBody(
  licenses: License[],
  expiringThresholdDays: number,
): string {
  const attention = getAttentionLicenses(licenses, expiringThresholdDays)
  const preview = attention.slice(0, 3).map((license) => {
    const daysLeft = getDaysUntilExpiry(license.expiryDate, license.isPerpetual)
    return `${license.name}: ${formatDaysLeftLabel(daysLeft)}`
  })

  if (attention.length <= 3) {
    return preview.join('\n')
  }

  return `${preview.join('\n')}\nи ещё ${attention.length - 3}`
}

export function useLicenseNotifications({
  licenses,
  expiringThresholdDays,
  notificationsEnabled,
  isUnlocked,
}: UseLicenseNotificationsOptions): void {
  useEffect(() => {
    if (!isUnlocked || !notificationsEnabled) {
      return
    }

    const attentionCount = countAttentionLicenses(licenses, expiringThresholdDays)
    if (attentionCount === 0) {
      return
    }

    if (!('Notification' in window)) {
      return
    }

    if (sessionStorage.getItem(NOTIFICATION_SESSION_KEY)) {
      return
    }

    void (async () => {
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }

      if (permission !== 'granted') {
        return
      }

      const body = buildNotificationBody(licenses, expiringThresholdDays)
      const label =
        attentionCount === 1
          ? '1 лицензия требует внимания'
          : `${attentionCount} лицензии требуют внимания`

      new Notification('key-keeper', {
        body: `${label}\n${body}`,
        tag: 'key-keeper-attention',
      })

      sessionStorage.setItem(NOTIFICATION_SESSION_KEY, '1')
    })()
  }, [
    isUnlocked,
    notificationsEnabled,
    licenses,
    expiringThresholdDays,
  ])
}
