import { describe, expect, it } from 'vitest'
import { createTestLicense } from '../test/fixtures/license'
import { sortLicenseResults } from './sort-licenses'

describe('sort-licenses', () => {
  const results = [
    { license: createTestLicense({ id: '1', name: 'Zebra App' }), highlight: null },
    { license: createTestLicense({ id: '2', name: 'Alpha App' }), highlight: null },
    {
      license: createTestLicense({
        id: '3',
        name: 'Middle App',
        platform: 'android',
      }),
      highlight: null,
    },
  ]

  it('сортирует по названию А→Я', () => {
    const sorted = sortLicenseResults(results, 'name', 'asc')
    expect(sorted.map((item) => item.license.name)).toEqual([
      'Alpha App',
      'Middle App',
      'Zebra App',
    ])
  })

  it('сортирует по названию Я→А', () => {
    const sorted = sortLicenseResults(results, 'name', 'desc')
    expect(sorted[0]?.license.name).toBe('Zebra App')
  })

  it('ставит бессрочные в конец при сортировке по сроку', () => {
    const dated = [
      {
        license: createTestLicense({
          id: '1',
          name: 'Soon',
          expiryDate: '2026-06-01',
        }),
        highlight: null,
      },
      {
        license: createTestLicense({
          id: '2',
          name: 'Later',
          expiryDate: '2027-01-01',
        }),
        highlight: null,
      },
      {
        license: createTestLicense({
          id: '3',
          name: 'Forever',
          isPerpetual: true,
          expiryDate: null,
        }),
        highlight: null,
      },
    ]

    const sorted = sortLicenseResults(dated, 'expiryDate', 'asc')
    expect(sorted.at(-1)?.license.name).toBe('Forever')
  })
})
