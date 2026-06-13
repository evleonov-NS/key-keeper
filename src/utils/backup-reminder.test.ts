import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_SETTINGS } from '../types/settings'
import type { VaultMeta } from '../types/vault'
import {
  getBackupReminderReason,
  shouldShowBackupReminder,
} from './backup-reminder'

function createMeta(partial: Partial<VaultMeta> = {}): VaultMeta {
  return {
    isDemo: false,
    lastExportAt: null,
    changeCount: 0,
    createdAt: '2020-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('backup-reminder', () => {
  it('напоминание по числу изменений', () => {
    const meta = createMeta({ changeCount: 10 })
    const settings = { ...DEFAULT_APP_SETTINGS, backupReminderChanges: 10 }

    expect(getBackupReminderReason(meta, settings)).toBe('changes')
    expect(shouldShowBackupReminder(meta, settings)).toBe(true)
  })

  it('напоминание по дням без экспорта', () => {
    const meta = createMeta({
      changeCount: 2,
      lastExportAt: '2020-01-01T00:00:00.000Z',
    })
    const settings = { ...DEFAULT_APP_SETTINGS, backupReminderDays: 30 }

    expect(getBackupReminderReason(meta, settings)).toBe('days')
  })

  it('без напоминания при свежем экспорте и малых изменениях', () => {
    const meta = createMeta({
      changeCount: 1,
      lastExportAt: new Date().toISOString(),
    })

    expect(shouldShowBackupReminder(meta, DEFAULT_APP_SETTINGS)).toBe(false)
  })
})
