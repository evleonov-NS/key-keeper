import type { License } from '../types/license'

export function normalizeLicenseKey(key: string): string {
  return key.trim()
}

export function findDuplicateLicense(
  licenses: License[],
  licenseKey: string,
  excludeId?: string,
): License | undefined {
  const normalized = normalizeLicenseKey(licenseKey).toLowerCase()
  if (!normalized) {
    return undefined
  }

  return licenses.find((license) => {
    if (excludeId && license.id === excludeId) {
      return false
    }
    return normalizeLicenseKey(license.licenseKey).toLowerCase() === normalized
  })
}

export type LicenseFormValues = {
  name: string
  licenseKey: string
  accountLogin: string
  platform: License['platform']
  category: string | null
  activationUrl: string
  purchaseUrl: string
  linkedEmail: string
  purchaseDate: string
  expiryDate: string
  isPerpetual: boolean
  remind: boolean
  comment: string
  tagsText: string
}

export function parseTags(tagsText: string): string[] {
  return tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function formatTags(tags: string[]): string {
  return tags.join(', ')
}

export function validateLicenseForm(values: LicenseFormValues): string | null {
  if (!values.name.trim()) {
    return 'Укажите название'
  }
  if (!normalizeLicenseKey(values.licenseKey)) {
    return 'Укажите ключ лицензии'
  }
  if (values.isPerpetual && values.expiryDate) {
    return 'Бессрочная лицензия не может иметь дату окончания'
  }
  return null
}

export function toLicensePayload(
  values: LicenseFormValues,
  existing?: License,
  images?: Blob[],
): Omit<License, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  return {
    name: values.name.trim(),
    licenseKey: normalizeLicenseKey(values.licenseKey),
    accountLogin: values.accountLogin.trim(),
    platform: values.platform,
    category: values.category || null,
    activationUrl: values.activationUrl.trim(),
    purchaseUrl: values.purchaseUrl.trim(),
    linkedEmail: values.linkedEmail.trim(),
    purchaseDate: values.purchaseDate || null,
    expiryDate: values.isPerpetual ? null : values.expiryDate || null,
    isPerpetual: values.isPerpetual,
    remind: values.remind,
    comment: values.comment.trim(),
    images: images ?? existing?.images ?? [],
    tags: parseTags(values.tagsText),
    isDemo: existing?.isDemo,
  }
}

export function licenseToFormValues(license: License): LicenseFormValues {
  return {
    name: license.name,
    licenseKey: license.licenseKey,
    accountLogin: license.accountLogin,
    platform: license.platform,
    category: license.category,
    activationUrl: license.activationUrl,
    purchaseUrl: license.purchaseUrl,
    linkedEmail: license.linkedEmail,
    purchaseDate: license.purchaseDate ?? '',
    expiryDate: license.expiryDate ?? '',
    isPerpetual: license.isPerpetual,
    remind: license.remind,
    comment: license.comment,
    tagsText: formatTags(license.tags),
  }
}

export function createEmptyLicenseForm(): LicenseFormValues {
  return {
    name: '',
    licenseKey: '',
    accountLogin: '',
    platform: 'windows',
    category: null,
    activationUrl: '',
    purchaseUrl: '',
    linkedEmail: '',
    purchaseDate: '',
    expiryDate: '',
    isPerpetual: false,
    remind: true,
    comment: '',
    tagsText: '',
  }
}
