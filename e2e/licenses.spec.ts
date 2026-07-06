import { expect, test, type Page } from '@playwright/test'
import { addRealLicense, loadDemoData, setupVault } from './helpers'

function licenseArticle(page: Page, name: string) {
  return page.getByRole('article').filter({
    has: page.getByRole('heading', { name }),
  })
}

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

test.describe('CRUD реальной лицензии', () => {
  test('создать, отредактировать и архивировать', async ({ page }) => {
    await setupVault(page)
    await addRealLicense(page, 'E2E CRUD App', 'KEY-CRUD-001')

    await expect(
      page.getByRole('heading', { name: /Лицензии \(1\)/ }),
    ).toBeVisible()

    const card = licenseArticle(page, 'E2E CRUD App')
    await card.hover()
    await card.getByRole('button', { name: 'Редактировать' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.locator('#license-name').fill('E2E CRUD App Updated')
    await dialog.locator('#license-form-submit').click()
    await expect(dialog).not.toBeVisible()

    const updatedCard = licenseArticle(page, 'E2E CRUD App Updated')
    await expect(updatedCard).toBeVisible()

    page.once('dialog', (confirm) => confirm.accept())
    await updatedCard.hover()
    await updatedCard.getByRole('button', { name: 'В архив' }).click()

    await expect(updatedCard.getByText('В архиве')).toBeVisible()
    await expect(
      updatedCard.getByRole('button', { name: 'В архив' }),
    ).not.toBeVisible()
  })
})
