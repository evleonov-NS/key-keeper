import { describe, expect, it } from 'vitest'
import { createTestLicense } from '../test/fixtures/license'
import { collectLicenseTags } from './license-tags'

describe('license-tags', () => {
  it('собирает уникальные теги в алфавитном порядке', () => {
    const tags = collectLicenseTags([
      createTestLicense({ tags: ['дизайн', 'офис'] }),
      createTestLicense({ id: '2', tags: ['офис', '  ', 'подписка'] }),
    ])

    expect(tags).toEqual(['дизайн', 'офис', 'подписка'])
  })
})
