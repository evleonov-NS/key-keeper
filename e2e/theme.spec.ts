import { expect, test, type Page } from '@playwright/test'
import { setupVault } from './helpers'

async function expectHtmlTheme(
  page: Page,
  theme: 'light' | 'dark',
): Promise<void> {
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.classList.contains('dark')),
    )
    .toBe(theme === 'dark')
}

async function expectStoredTheme(
  page: Page,
  theme: 'light' | 'dark',
): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('key-keeper-theme')))
    .toBe(theme)
}

test.describe('Тема', () => {
  test.beforeEach(async ({ page }) => {
    await setupVault(page)
  })

  test('переключение светлая ↔ тёмная, класс dark на html', async ({ page }) => {
    await expectHtmlTheme(page, 'light')
    await expectStoredTheme(page, 'light')

    await page.getByRole('button', { name: 'Включить тёмную тему' }).click()
    await expectHtmlTheme(page, 'dark')
    await expectStoredTheme(page, 'dark')

    await page.getByRole('button', { name: 'Включить светлую тему' }).click()
    await expectHtmlTheme(page, 'light')
    await expectStoredTheme(page, 'light')
  })

  test('тёмная тема сохраняется после F5', async ({ page }) => {
    await page.getByRole('button', { name: 'Включить тёмную тему' }).click()
    await expectHtmlTheme(page, 'dark')

    await page.reload()

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible({
      timeout: 60_000,
    })
    await expectHtmlTheme(page, 'dark')
    await expectStoredTheme(page, 'dark')
    await expect(
      page.getByRole('button', { name: 'Включить светлую тему' }),
    ).toBeVisible()
  })
})
