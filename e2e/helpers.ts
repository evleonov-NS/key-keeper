import { expect, type Page } from '@playwright/test'

export const TEST_MASTER_PASSWORD = 'TestVault1'

export async function clearAppStorage(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(async () => {
    sessionStorage.clear()
    localStorage.clear()
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('key-keeper')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })
  await page.reload()
}

export async function setupVault(
  page: Page,
  password = TEST_MASTER_PASSWORD,
): Promise<void> {
  await clearAppStorage(page)
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Создание хранилища' }),
  ).toBeVisible()

  await page.locator('#setup-password').fill(password)
  await page.locator('#setup-confirm').fill(password)
  await page.getByRole('button', { name: 'Создать хранилище' }).click()

  await expect(
    page.getByRole('heading', { name: 'Дашборд' }),
  ).toBeVisible({ timeout: 60_000 })
}

export async function loadDemoData(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Настройки' }).click()
  await page.getByRole('button', { name: 'Загрузить демо' }).click()
  await page.getByRole('button', { name: 'Дашборд' }).click()
  await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
}

export async function unlockVault(
  page: Page,
  password = TEST_MASTER_PASSWORD,
): Promise<void> {
  await expect(
    page.getByRole('heading', { name: 'Разблокировка' }),
  ).toBeVisible()
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: 'Разблокировать' }).click()
  await expect(
    page.getByRole('heading', { name: 'Дашборд' }),
  ).toBeVisible({ timeout: 60_000 })
}
