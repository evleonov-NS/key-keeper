import type { LicenseStatus } from './license-status'
import type { Platform } from './platform'

export type License = {
  id: string
  name: string
  licenseKey: string
  platform: Platform
  category: string | null
  activationUrl: string
  purchaseUrl: string
  linkedEmail: string
  purchaseDate: string | null
  expiryDate: string | null
  isPerpetual: boolean
  status: LicenseStatus
  remind: boolean
  comment: string
  images: Blob[]
  tags: string[]
  createdAt: string
  updatedAt: string
  /** Демо-запись — удаляется кнопкой «Очистить демо» */
  isDemo?: boolean
}
