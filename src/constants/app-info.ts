/**
 * Версия приложения (SemVer). Синхронизировать с package.json при релизе.
 * schemaVersion (данные vault) — отдельно, в types/schema.ts.
 */
export const APP_VERSION = '0.9.0'

export const APP_AUTHOR = 'Леонов'

/** Дата и время выпуска текущей версии (ISO 8601, локаль MSK) */
export const APP_RELEASED_AT = '2026-06-14T21:00:00+03:00'

export function formatLocalDateTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatAppReleaseDate(iso: string = APP_RELEASED_AT): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
