import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import type { License } from '../types/license'
import { countExpiringLicenses, getExpiringSoonLicenses } from './dashboard'

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

describe('getExpiringSoonLicenses', () => {
  it('возвращает только истекающие и сортирует по сроку', () => {
    const today = dayjs()
    const licenses = [
      createLicense({
        id: 'later',
        name: 'Later',
        expiryDate: today.add(12, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        id: 'soon',
        name: 'Soon',
        expiryDate: today.add(5, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        id: 'active',
        name: 'Active',
        expiryDate: today.add(40, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        id: 'expired',
        name: 'Expired',
        expiryDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
    ]

    const result = getExpiringSoonLicenses(licenses, 14).map((license) => license.id)

    expect(result).toEqual(['soon', 'later'])
  })

  it('не включает архивные записи', () => {
    const licenses = [
      createLicense({
        name: 'Archived',
        expiryDate: '2026-06-14',
        isPerpetual: false,
        status: 'archived',
      }),
    ]

    expect(getExpiringSoonLicenses(licenses, 14)).toHaveLength(0)
  })
})

describe('countExpiringLicenses', () => {
  it('считает количество истекающих', () => {
    const licenses = [
      createLicense({
        name: 'One',
        expiryDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
      createLicense({
        name: 'Two',
        expiryDate: dayjs().add(40, 'day').format('YYYY-MM-DD'),
        isPerpetual: false,
      }),
    ]

    expect(countExpiringLicenses(licenses, 14)).toBe(1)
  })
})
