import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { License } from '../types/license'
import {
  countAttentionLicenses,
  formatAttentionLicensesLabel,
  getAttentionLicenses,
  isRemindableLicense,
} from './reminders'

function createLicense(
  partial: Partial<License> & Pick<License, 'name' | 'expiryDate' | 'isPerpetual'>,
): License {
  return {
    id: partial.id ?? 'id',
    licenseKey: 'KEY',
    platform: 'windows',
    category: null,
    activationUrl: '',
    purchaseUrl: '',
    linkedEmail: '',
    purchaseDate: null,
    remind: true,
    comment: '',
    tags: [],
    images: [],
    accountLogin: '',
    isDemo: false,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('isRemindableLicense', () => {
  it('исключает архив и remind: false', () => {
    expect(
      isRemindableLicense(
        createLicense({
          name: 'Archived',
          expiryDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
          isPerpetual: false,
          status: 'archived',
        }),
      ),
    ).toBe(false)

    expect(
      isRemindableLicense(
        createLicense({
          name: 'Muted',
          expiryDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
          isPerpetual: false,
          remind: false,
        }),
      ),
    ).toBe(false)
  })
})

describe('getAttentionLicenses', () => {
  it('возвращает истекающие и просроченные с remind, сортирует по срочности', () => {
    const today = dayjs()
    const licenses = [
      createLicense({
        id: 'expiring',
        name: 'Expiring',
        expiryDate: today.add(8, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        id: 'expired',
        name: 'Expired',
        expiryDate: today.subtract(3, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        id: 'muted',
        name: 'Muted',
        expiryDate: today.add(5, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
        remind: false,
      }),
      createLicense({
        id: 'active',
        name: 'Active',
        expiryDate: today.add(60, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
    ]

    const result = getAttentionLicenses(licenses, 14).map((license) => license.id)

    expect(result).toEqual(['expired', 'expiring'])
  })
})

describe('countAttentionLicenses', () => {
  it('считает только напоминаемые', () => {
    const today = dayjs()
    const licenses = [
      createLicense({
        name: 'One',
        expiryDate: today.add(5, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        name: 'Two',
        expiryDate: today.add(5, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
        remind: false,
      }),
    ]

    expect(countAttentionLicenses(licenses, 14)).toBe(1)
  })
})

describe('formatAttentionLicensesLabel', () => {
  it('склоняет «лицензия» по правилам русского языка', () => {
    expect(formatAttentionLicensesLabel(1)).toBe('1 лицензия требует внимания')
    expect(formatAttentionLicensesLabel(2)).toBe('2 лицензии требуют внимания')
    expect(formatAttentionLicensesLabel(5)).toBe('5 лицензий требуют внимания')
    expect(formatAttentionLicensesLabel(11)).toBe('11 лицензий требуют внимания')
    expect(formatAttentionLicensesLabel(21)).toBe('21 лицензия требует внимания')
    expect(formatAttentionLicensesLabel(22)).toBe('22 лицензии требуют внимания')
  })
})
