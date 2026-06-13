import { expect, test } from '@playwright/test'
import { loadDemoData, setupVault } from './helpers'

test.describe('Напоминания', () => {
  test.beforeEach(async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)
  })

  test('настройка уведомлений в настройках', async ({ page }) => {
    await page.getByRole('button', { name: 'Настройки' }).click()

    const toggle = page.getByRole('checkbox', {
      name: /Уведомления браузера при открытии/,
    })

    await expect(toggle).not.toBeChecked()
    await toggle.check()
    await expect(toggle).toBeChecked()
  })

  test('Adobe Creative Cloud не в списке внимания (remind: false)', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Adobe Creative Cloud' }),
    ).not.toBeVisible()
  })
})
