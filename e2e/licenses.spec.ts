import { expect, test } from '@playwright/test'
import { loadDemoData, setupVault } from './helpers'

test.describe('Лицензии', () => {
  test.beforeEach(async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)
    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(page.getByRole('heading', { name: /Лицензии \(7\)/ })).toBeVisible()
  })

  test('демо-данные отображаются на странице', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'JetBrains All Products' })).toBeVisible()
  })

  test('поиск по названию фильтрует список', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: 'Поиск лицензий' })
    await search.fill('Microsoft')

    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'JetBrains All Products' }),
    ).not.toBeVisible()
  })

  test('фильтр платформы Windows', async ({ page }) => {
    await page.getByLabel('Платформа').selectOption('windows')

    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '1Password Families' })).not.toBeVisible()
  })

  test('переключение в табличный вид', async ({ page }) => {
    await page.getByRole('button', { name: 'Таблица' }).click()

    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Название' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Логин / ключ' })).toBeVisible()
  })

  test('копирование ключа в табличном виде', async ({ page }) => {
    await page.getByRole('button', { name: 'Таблица' }).click()

    await page
      .getByRole('row')
      .filter({ hasText: 'Microsoft 365' })
      .getByRole('button', { name: /Скопировать ключ «Microsoft 365»/ })
      .click()

    await expect(
      page
        .getByRole('row')
        .filter({ hasText: 'Microsoft 365' })
        .getByRole('button', { name: /Скопировать ключ «Microsoft 365»/ }),
    ).toContainText('Скопирован')
  })

  test('массовый выбор и панель действий', async ({ page }) => {
    await page.getByLabel('Выбрать все на странице').check()

    const bulkBar = page.getByTestId('license-bulk-bar')

    await expect(bulkBar).toContainText('Выбрано: 7')
    await expect(
      bulkBar.getByRole('button', { name: 'В архив', exact: true }),
    ).toBeVisible()
    await expect(bulkBar.getByRole('button', { name: 'Удалить' })).toBeVisible()
  })
})
