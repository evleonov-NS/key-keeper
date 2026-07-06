import dayjs from 'dayjs'
import type { Category } from '../types/category'
import type { License } from '../types/license'
import type { LicenseStatus } from '../types/license-status'
import { LICENSE_STATUS_LABELS } from '../types/license-status'
import { PLATFORM_LABELS } from '../types/platform'
import { APP_AUTHOR, APP_VERSION } from '../constants/app-info'
import { downloadBytes } from '../utils/download'

const MASKED_KEY = '••••'

const STATUS_FILL: Record<LicenseStatus, string> = {
  active: 'DCFCE7',
  expiring: 'FEF9C3',
  expired: 'FEE2E2',
  perpetual: 'F3F4F6',
  archived: 'E5E7EB',
}

const HEADER_FILL = 'E0E7FF'

function solidFill(rgb: string) {
  return {
    patternType: 'solid' as const,
    fgColor: { rgb },
    bgColor: { rgb },
  }
}

type ExcelExportOptions = {
  maskKeys: boolean
}

const COLUMNS = [
  'Название',
  'Ключ лицензии',
  'Логин',
  'Платформа',
  'Категория',
  'Статус',
  'Срок действия',
  'Дата покупки',
  'Email',
  'URL активации',
  'Комментарий',
  'Теги',
] as const

function formatDate(value: string | null): string {
  if (!value) {
    return ''
  }
  return dayjs(value).format('DD.MM.YYYY')
}

function buildRow(
  license: License,
  categoryName: string,
  maskKeys: boolean,
): (string | number)[] {
  return [
    license.name,
    maskKeys && license.licenseKey ? MASKED_KEY : license.licenseKey,
    license.accountLogin,
    PLATFORM_LABELS[license.platform],
    categoryName,
    LICENSE_STATUS_LABELS[license.status],
    license.isPerpetual ? 'Бессрочная' : formatDate(license.expiryDate),
    formatDate(license.purchaseDate),
    license.linkedEmail,
    license.activationUrl,
    license.comment,
    license.tags.join(', '),
  ]
}

function autoColumnWidths(rows: (string | number)[][]): { wch: number }[] {
  const widths = COLUMNS.map((header) => header.length)
  for (const row of rows) {
    row.forEach((cell, index) => {
      const length = String(cell).length
      if (length > widths[index]) {
        widths[index] = Math.min(length, 48)
      }
    })
  }
  return widths.map((wch) => ({ wch: wch + 2 }))
}

export async function exportLicensesToExcel(
  licenses: License[],
  categories: Category[],
  options: ExcelExportOptions,
): Promise<void> {
  const XLSX = await import('xlsx-js-style')
  const categoryById = new Map(categories.map((category) => [category.id, category.name]))
  const dataRows = licenses.map((license) => {
    const categoryName = license.category
      ? (categoryById.get(license.category) ?? '')
      : ''
    return buildRow(license, categoryName, options.maskKeys)
  })

  const worksheet = XLSX.utils.aoa_to_sheet([])
  const title = `key-keeper v${APP_VERSION} — ${dayjs().format('DD.MM.YYYY HH:mm')}`
  const subtitle = `Автор: ${APP_AUTHOR}. Данные не шифруются — храните файл в безопасном месте.`

  XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(worksheet, [[subtitle]], { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, [COLUMNS.slice()], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A5' })

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLUMNS.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLUMNS.length - 1 } },
  ]

  const titleCell = worksheet.A1
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'left' },
    }
  }

  const subtitleCell = worksheet.A2
  if (subtitleCell) {
    subtitleCell.s = {
      font: { italic: true, color: { rgb: '6B7280' } },
      alignment: { wrapText: true },
    }
  }

  for (let column = 0; column < COLUMNS.length; column += 1) {
    const cellRef = XLSX.utils.encode_cell({ r: 3, c: column })
    const cell = worksheet[cellRef]
    if (cell) {
      cell.s = {
        font: { bold: true },
        fill: solidFill(HEADER_FILL),
        alignment: { horizontal: 'center' },
      }
    }
  }

  licenses.forEach((license, rowIndex) => {
    const fill = STATUS_FILL[license.status]
    for (let column = 0; column < COLUMNS.length; column += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 4, c: column })
      const cell = worksheet[cellRef]
      if (cell) {
        cell.s = {
          fill: solidFill(fill),
          alignment: { vertical: 'center', wrapText: column >= 9 },
        }
      }
    }
  })

  worksheet['!cols'] = autoColumnWidths(dataRows)

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Лицензии')

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const filename = `key-keeper-licenses-${dayjs().format('YYYY-MM-DD')}.xlsx`
  downloadBytes(filename, new Uint8Array(buffer), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}
