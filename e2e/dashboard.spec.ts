import { expect, test } from '@playwright/test'
import { loadDemoData, setupVault } from './helpers'

test.describe('Дашборд', () => {
  test.beforeEach(async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)
  })

  test('сводные счётчики отображаются', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
    await expect(page.getByTitle('Истекают: перейти к списку')).toContainText('1')
    await expect(page.getByTitle('Просрочены: перейти к списку')).toContainText('1')
  })

  test('блок «Истекает скоро» показывает JetBrains', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Истекает скоро' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'JetBrains All Products' })).toBeVisible()
  })

  test('счётчик в заголовке вкладки', async ({ page }) => {
    await expect(page).toHaveTitle(/\(1\) key-keeper/)
  })

  test('переход к лицензии по кнопке «Открыть»', async ({ page }) => {
    await page
      .getByRole('article')
      .filter({ hasText: 'JetBrains All Products' })
      .getByRole('button', { name: 'Открыть' })
      .click()

    await expect(page.getByRole('heading', { name: 'Редактирование' })).toBeVisible()
  })

  test('фильтр по счётчику «Просрочены»', async ({ page }) => {
    await page.getByTitle('Просрочены: перейти к списку').click()

    await expect(page.getByRole('heading', { name: /Лицензии/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: '1Password Families' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).not.toBeVisible()
  })
})
