import dayjs from 'dayjs'
import type { Category } from '../types/category'
import type { License } from '../types/license'
import {
  DEFAULT_APP_SETTINGS,
  SCHEMA_VERSION,
  type VaultData,
  type VaultMeta,
} from '../types'
import { generateId } from '../utils/id'
import { computeLicenseStatus } from '../utils/status'

function createLicense(
  partial: Omit<License, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'images'> &
    Partial<Pick<License, 'id' | 'images' | 'status'>>,
): License {
  const now = dayjs().toISOString()
  const base: License = {
    id: partial.id ?? generateId(),
    images: partial.images ?? [],
    createdAt: now,
    updatedAt: now,
    status: 'active',
    ...partial,
  }

  const status =
    partial.status ??
    computeLicenseStatus(base, {
      expiringThresholdDays: DEFAULT_APP_SETTINGS.expiringThresholdDays,
    })

  return { ...base, status }
}

export function createDemoCategories(): Category[] {
  return [
    { id: generateId(), name: 'Офис', isDemo: true },
    { id: generateId(), name: 'Разработка', isDemo: true },
    { id: generateId(), name: 'Медиа', isDemo: true },
    { id: generateId(), name: 'Подписки', isDemo: true },
  ]
}

export function createDemoLicenses(categories: Category[]): License[] {
  const [office, dev, media, subs] = categories

  return [
    createLicense({
      name: 'Microsoft 365',
      licenseKey: 'DEMO-MS365-XXXX-YYYY',
      platform: 'windows',
      category: office.id,
      activationUrl: 'https://account.microsoft.com/services',
      purchaseUrl: 'Microsoft Store',
      linkedEmail: 'demo@example.com',
      purchaseDate: '2024-01-15',
      expiryDate: dayjs().add(45, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: true,
      comment: 'Семейная подписка',
      tags: ['офис', 'подписка'],
      isDemo: true,
    }),
    createLicense({
      name: 'JetBrains All Products',
      licenseKey: 'DEMO-JB-AAAA-BBBB-CCCC',
      platform: 'windows',
      category: dev.id,
      activationUrl: 'https://account.jetbrains.com/licenses',
      purchaseUrl: 'jetbrains.com',
      linkedEmail: 'dev@example.com',
      purchaseDate: '2023-06-01',
      expiryDate: dayjs().add(10, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: true,
      comment: 'Истекает скоро — демо-статус expiring',
      tags: ['ide'],
      isDemo: true,
    }),
    createLicense({
      name: '1Password Families',
      licenseKey: 'DEMO-1P-FAM-12345',
      platform: 'ios',
      category: subs.id,
      activationUrl: 'https://my.1password.com',
      purchaseUrl: 'App Store',
      linkedEmail: 'family@example.com',
      purchaseDate: '2022-03-10',
      expiryDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: true,
      comment: 'Просрочена — демо-статус expired',
      tags: ['безопасность'],
      isDemo: true,
    }),
    createLicense({
      name: 'Sublime Text',
      licenseKey: 'DEMO-ST-PERPETUAL',
      platform: 'windows',
      category: dev.id,
      activationUrl: 'https://www.sublimetext.com',
      purchaseUrl: 'sublimetext.com',
      linkedEmail: 'dev@example.com',
      purchaseDate: '2020-11-20',
      expiryDate: null,
      isPerpetual: true,
      remind: true,
      comment: 'Бессрочная лицензия',
      tags: ['редактор'],
      isDemo: true,
    }),
    createLicense({
      name: 'Adobe Creative Cloud',
      licenseKey: 'DEMO-ADOBE-ARCHIVED',
      platform: 'web',
      category: media.id,
      activationUrl: 'https://account.adobe.com',
      purchaseUrl: 'adobe.com',
      linkedEmail: 'design@example.com',
      purchaseDate: '2021-05-01',
      expiryDate: dayjs().add(90, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: false,
      comment: 'Не актуально — в архиве',
      tags: ['дизайн'],
      status: 'archived',
      isDemo: true,
    }),
    createLicense({
      name: 'Spotify Premium',
      licenseKey: 'DEMO-SPOTIFY-ANDROID',
      platform: 'android',
      category: subs.id,
      activationUrl: 'https://www.spotify.com/account',
      purchaseUrl: 'Google Play',
      linkedEmail: 'music@example.com',
      purchaseDate: '2025-01-01',
      expiryDate: dayjs().add(20, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: true,
      comment: '',
      tags: ['музыка'],
      isDemo: true,
    }),
    createLicense({
      name: 'Notion Plus',
      licenseKey: 'DEMO-NOTION-WEB',
      platform: 'web',
      category: null,
      activationUrl: 'https://www.notion.so',
      purchaseUrl: 'notion.so',
      linkedEmail: 'work@example.com',
      purchaseDate: '2024-08-01',
      expiryDate: dayjs().add(120, 'day').format('YYYY-MM-DD'),
      isPerpetual: false,
      remind: true,
      comment: 'Без категории — демо active',
      tags: [],
      isDemo: true,
    }),
  ]
}

export function createDemoVaultMeta(): VaultMeta {
  return {
    isDemo: true,
    lastExportAt: null,
    changeCount: 0,
    createdAt: dayjs().toISOString(),
  }
}

export function createDemoVaultData(): VaultData {
  const categories = createDemoCategories()
  const licenses = createDemoLicenses(categories)

  return {
    schemaVersion: SCHEMA_VERSION,
    licenses,
    categories,
    settings: { ...DEFAULT_APP_SETTINGS },
    meta: createDemoVaultMeta(),
  }
}
