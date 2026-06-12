export type AppSettings = {
  /** Авто-блокировка по бездействию, минуты */
  autoLockMinutes: number
  /** Порог «истекает скоро», дней */
  expiringThresholdDays: number
  /** Держать сессию до закрытия приложения */
  keepSessionOpen: boolean
  /** Напоминание о бэкапе: дней без экспорта */
  backupReminderDays: number
  /** Напоминание о бэкапе: после N изменений */
  backupReminderChanges: number
  /** Уведомления об истекающих лицензиях */
  notificationsEnabled: boolean
  /** Блок сортировки в боковом меню */
  sidebarSortEnabled: boolean
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoLockMinutes: 60,
  expiringThresholdDays: 14,
  keepSessionOpen: false,
  backupReminderDays: 30,
  backupReminderChanges: 10,
  notificationsEnabled: false,
  sidebarSortEnabled: false,
}
