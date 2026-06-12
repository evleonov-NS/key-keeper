import type { Category } from './category'
import type { License } from './license'
import type { SchemaVersion } from './schema'
import type { AppSettings } from './settings'

export type VaultMeta = {
  /** Загружены ли демо-данные в текущую сессию */
  isDemo: boolean
  /** Дата последнего экспорта .vault (ISO) */
  lastExportAt: string | null
  /** Счётчик изменений с последнего бэкапа */
  changeCount: number
  /** Время создания vault (ISO) */
  createdAt: string
}

export type VaultData = {
  schemaVersion: SchemaVersion
  licenses: License[]
  categories: Category[]
  settings: AppSettings
  meta: VaultMeta
}
