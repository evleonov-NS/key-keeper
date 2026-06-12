import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { computeLicenseStatus, countLicensesByStatus } from './status'
import { createTestLicense } from '../test/fixtures/license'

describe('status', () => {
  const today = dayjs('2026-06-01')

  it('возвращает archived для архивных записей', () => {
    expect(
      computeLicenseStatus(
        { status: 'archived', isPerpetual: false, expiryDate: '2026-12-01', remind: false },
        { now: today },
      ),
    ).toBe('archived')
  })

  it('возвращает perpetual для бессрочных', () => {
    expect(
      computeLicenseStatus(
        { status: 'active', isPerpetual: true, expiryDate: null, remind: false },
        { now: today },
      ),
    ).toBe('perpetual')
  })

  it('возвращает expired для просроченных', () => {
    expect(
      computeLicenseStatus(
        { status: 'active', isPerpetual: false, expiryDate: '2026-05-01', remind: true },
        { now: today },
      ),
    ).toBe('expired')
  })

  it('возвращает expiring в пределах порога', () => {
    expect(
      computeLicenseStatus(
        { status: 'active', isPerpetual: false, expiryDate: '2026-06-10', remind: true },
        { now: today, expiringThresholdDays: 14 },
      ),
    ).toBe('expiring')
  })

  it('возвращает active при достаточном запасе срока', () => {
    expect(
      computeLicenseStatus(
        { status: 'active', isPerpetual: false, expiryDate: '2026-12-01', remind: true },
        { now: today, expiringThresholdDays: 14 },
      ),
    ).toBe('active')
  })

  it('countLicensesByStatus считает статусы', () => {
    const licenses = [
      createTestLicense({ id: '1', isPerpetual: true, expiryDate: null }),
      createTestLicense({
        id: '2',
        isPerpetual: false,
        expiryDate: '2026-05-01',
      }),
      createTestLicense({
        id: '3',
        isPerpetual: false,
        expiryDate: '2026-12-01',
      }),
    ]

    const counts = countLicensesByStatus(licenses, 14)
    expect(counts.perpetual).toBe(1)
    expect(counts.expired).toBe(1)
    expect(counts.active).toBe(1)
  })
})
