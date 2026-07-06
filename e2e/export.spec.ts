import { expect, test, type Page } from '@playwright/test'
import {
  addRealLicense,
  clearAppStorage,
  loadDemoData,
  setupVault,
  TEST_MASTER_PASSWORD,
  unlockVault,
} from './helpers'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const FILE_BACKUP_PASSWORD = 'BackupFile1'

async function downloadVaultBackup(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Настройки' }).click()
  await page.getByRole('button', { name: 'Экспорт .vault' }).click()
  await page.locator('#export-master-password').fill(TEST_MASTER_PASSWORD)
  await page.locator('#export-file-password').fill(FILE_BACKUP_PASSWORD)
  await page.locator('#export-file-confirm').fill(FILE_BACKUP_PASSWORD)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать .vault' }).click()
  const download = await downloadPromise

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'key-keeper-e2e-'))
  const vaultPath = path.join(tempDir, download.suggestedFilename())
  await download.saveAs(vaultPath)
  return vaultPath
}

async function importVaultFile(
  page: Page,
  vaultPath: string,
  filePassword: string,
  mode: 'merge' | 'replace' = 'merge',
): Promise<void> {
  await page.getByRole('button', { name: 'Импорт .vault' }).click()
  await page.locator('input[type="file"]').setInputFiles(vaultPath)
  await page.locator('#import-file-password').fill(filePassword)
  if (mode === 'replace') {
    await page.getByRole('radio', { name: /Заменить всё/ }).check()
  }
  await page.getByRole('button', { name: 'Импортировать' }).click()
}

test.describe('Экспорт и импорт', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
  })

  test('экспорт .vault скачивает файл', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)

    await page.getByRole('button', { name: 'Настройки' }).click()
    await page.getByRole('button', { name: 'Экспорт .vault' }).click()

    await page.locator('#export-master-password').fill(TEST_MASTER_PASSWORD)
    await page.locator('#export-file-password').fill(FILE_BACKUP_PASSWORD)
    await page.locator('#export-file-confirm').fill(FILE_BACKUP_PASSWORD)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Скачать .vault' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/key-keeper-backup-.*\.vault/)
  })

  test('импорт .vault под паролем файла (merge)', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)

    const vaultPath = await downloadVaultBackup(page)
    await importVaultFile(page, vaultPath, FILE_BACKUP_PASSWORD, 'merge')

    await expect(page.getByText(/Последний экспорт/)).toBeVisible()

    await page.evaluate(() => sessionStorage.clear())
    await page.reload()
    await unlockVault(page)
    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(page.getByText('Microsoft 365')).toBeVisible()
  })

  test('импорт .vault replace — заменяет текущие записи', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)

    const vaultPath = await downloadVaultBackup(page)
    await addRealLicense(page, 'E2E Replace Marker', 'KEY-REPLACE-1')

    await expect(
      page.getByRole('heading', { name: /Лицензии \(8\)/ }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Настройки' }).click()
    await importVaultFile(page, vaultPath, FILE_BACKUP_PASSWORD, 'replace')

    await expect(
      page.getByText('Импорт .vault завершён — хранилище заменён'),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(
      page.getByRole('heading', { name: /Лицензии \(7\)/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Microsoft 365' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'E2E Replace Marker' }),
    ).not.toBeVisible()
  })

  test('импорт .vault — неверный пароль файла', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)

    const vaultPath = await downloadVaultBackup(page)
    await importVaultFile(page, vaultPath, 'WrongFilePass1')

    await expect(page.getByRole('alert')).toHaveText('Неверный пароль файла')
    await expect(
      page.getByRole('heading', { name: 'Импорт .vault' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Отмена' }).click()
    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(
      page.getByRole('heading', { name: /Лицензии \(7\)/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Microsoft 365' }),
    ).toBeVisible()
  })

  test('Excel-экспорт: предупреждение и маскировка', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)

    await page.getByRole('button', { name: 'Настройки' }).click()
    await page.getByRole('button', { name: 'Экспорт Excel' }).click()

    await expect(
      page.getByText('Файл Excel не шифруется', { exact: false }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Скачать .xlsx' }),
    ).toBeDisabled()

    await page.getByLabel('Я понимаю риски и хочу выгрузить данные в открытом виде').check()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Скачать .xlsx' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/key-keeper-licenses-.*\.xlsx/)
  })
})
