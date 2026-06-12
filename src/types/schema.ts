/** Версия схемы vault — для миграций и совместимости бэкапов */
export const SCHEMA_VERSION = 1 as const

export type SchemaVersion = typeof SCHEMA_VERSION
