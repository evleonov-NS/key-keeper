import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  formatDaysLeftLabel,
  formatExpiryDate,
  getDaysUntilExpiry,
  getLicenseExpiryInfo,
} from './dates'

describe('dates', () => {
  const today = dayjs('2026-06-12')

  it('getDaysUntilExpiry считает от локальной полуночи', () => {
    expect(getDaysUntilExpiry('2026-06-20', false, today)).toBe(8)
    expect(getDaysUntilExpiry('2026-06-12', false, today)).toBe(0)
    expect(getDaysUntilExpiry('2026-06-10', false, today)).toBe(-2)
  })

  it('getDaysUntilExpiry возвращает null для бессрочных', () => {
    expect(getDaysUntilExpiry(null, true, today)).toBeNull()
    expect(getDaysUntilExpiry('2026-12-01', true, today)).toBeNull()
  })

  it('formatDaysLeftLabel склоняет дни', () => {
    expect(formatDaysLeftLabel(5)).toBe('Осталось 5 дней')
    expect(formatDaysLeftLabel(2)).toBe('Осталось 2 дня')
    expect(formatDaysLeftLabel(1)).toBe('Остался 1 день')
    expect(formatDaysLeftLabel(0)).toBe('Истекает сегодня')
    expect(formatDaysLeftLabel(-3)).toBe('Просрочена 3 дня назад')
    expect(formatDaysLeftLabel(null)).toBe('Бессрочно')
  })

  it('formatExpiryDate в формате DD.MM.YYYY', () => {
    expect(formatExpiryDate('2026-12-25')).toBe('25.12.2026')
  })

  it('getLicenseExpiryInfo объединяет дату и подпись', () => {
    const info = getLicenseExpiryInfo(
      { expiryDate: '2026-06-20', isPerpetual: false },
      today,
    )
    expect(info.daysLeft).toBe(8)
    expect(info.label).toBe('Осталось 8 дней')
    expect(info.formattedDate).toBe('20.06.2026')
  })
})
