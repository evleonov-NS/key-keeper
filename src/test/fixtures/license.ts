import type { Category } from '../../types/category'
import type { License } from '../../types/license'

export const TEST_CATEGORY_OFFICE: Category = {
  id: 'cat-office',
  name: 'Офис',
}

export const TEST_CATEGORY_DEV: Category = {
  id: 'cat-dev',
  name: 'Разработка',
}

export const TEST_CATEGORIES: Category[] = [
  TEST_CATEGORY_OFFICE,
  TEST_CATEGORY_DEV,
]

export function createTestLicense(overrides: Partial<License> = {}): License {
  return {
    id: 'lic-1',
    name: 'Microsoft 365',
    licenseKey: 'DEMO-MS365-XXXX',
    accountLogin: 'user@example.com',
    platform: 'windows',
    category: TEST_CATEGORY_OFFICE.id,
    activationUrl: '',
    purchaseUrl: '',
    linkedEmail: '',
    purchaseDate: '2024-01-01',
    expiryDate: '2026-12-31',
    isPerpetual: false,
    status: 'active',
    remind: true,
    comment: 'Семейная подписка',
    images: [],
    tags: ['офис', 'подписка'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}
