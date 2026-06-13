import dayjs from 'dayjs'
import type { AppSettings } from '../types/settings'
import type { VaultMeta } from '../types/vault'

export type BackupReminderReason = 'days' | 'changes'

export function getBackupReminderReason(
  meta: VaultMeta,
  settings: AppSettings,
): BackupReminderReason | null {
  const { backupReminderDays, backupReminderChanges } = settings

  if (meta.changeCount >= backupReminderChanges) {
    return 'changes'
  }

  const referenceDate = meta.lastExportAt ?? meta.createdAt
  const daysSince = dayjs().diff(dayjs(referenceDate), 'day')
  if (daysSince >= backupReminderDays) {
    return 'days'
  }

  return null
}

export function shouldShowBackupReminder(
  meta: VaultMeta,
  settings: AppSettings,
): boolean {
  return getBackupReminderReason(meta, settings) !== null
}

export function getBackupReminderMessage(reason: BackupReminderReason): string {
  if (reason === 'changes') {
    return 'С момента последнего бэкапа накопилось много изменений. Сохраните зашифрованную копию .vault.'
  }
  return 'Давно не делали резервную копию. Сохраните зашифрованный файл .vault в надёжное место.'
}
