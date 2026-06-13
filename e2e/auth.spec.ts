import { expect, test } from '@playwright/test'
import {
  TEST_MASTER_PASSWORD,
  clearAppStorage,
  setupVault,
  unlockVault,
} from './helpers'

test.describe('Аутентификация', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
  })

  test('создание хранилища с мастер-паролем', async ({ page }) => {
    await setupVault(page)

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
  })

  test('разблокировка после блокировки', async ({ page }) => {
    await setupVault(page)

    await page.getByRole('button', { name: 'Заблокировать' }).click()
    await unlockVault(page)

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
  })

  test('неверный пароль показывает ошибку', async ({ page }) => {
    await setupVault(page)
    await page.getByRole('button', { name: 'Заблокировать' }).click()

    await page.locator('#login-password').fill('WrongPass1')
    await page.getByRole('button', { name: 'Разблокировать' }).click()

    await expect(page.getByText('Неверный мастер-пароль')).toBeVisible()
  })

  test('повторный вход с существующим хранилищем', async ({ page }) => {
    await setupVault(page)

    await page.evaluate(() => sessionStorage.clear())
    await page.reload()

    await unlockVault(page, TEST_MASTER_PASSWORD)
    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
  })
})
