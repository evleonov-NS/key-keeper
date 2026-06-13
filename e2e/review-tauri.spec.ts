import { expect, test } from '@playwright/test'
import {
  TEST_MASTER_PASSWORD,
  addRealLicense,
  attachConsoleCollector,
  clearAppStorage,
  loadDemoData,
  setupVault,
  unlockVault,
} from './helpers'

const NEW_MASTER_PASSWORD = 'NewVault12'

test.describe('Ревью перед Tauri', () => {
  test('консоль без ошибок: вход, F5, блокировка, разблокировка', async ({
    page,
  }) => {
    const errors = attachConsoleCollector(page)
    await setupVault(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible({
      timeout: 60_000,
    })
    await page.getByRole('button', { name: 'Заблокировать' }).click()
    await unlockVault(page)
    expect(errors).toEqual([])
  })

  test('смена мастер-пароля — данные сохраняются после F5', async ({
    page,
  }) => {
    test.setTimeout(180_000)

    await setupVault(page)
    await loadDemoData(page)

    await page.getByRole('button', { name: 'Настройки' }).click()
    await page.getByRole('button', { name: 'Сменить мастер-пароль' }).click()
    await page.locator('#current-password').fill(TEST_MASTER_PASSWORD)
    await page.locator('#new-password').fill(NEW_MASTER_PASSWORD)
    await page.locator('#confirm-new-password').fill(NEW_MASTER_PASSWORD)
    await page.getByRole('button', { name: 'Сменить пароль' }).click()
    await expect(
      page.getByRole('heading', { name: 'Смена мастер-пароля' }),
    ).not.toBeVisible({ timeout: 120_000 })

    await page.evaluate(() => sessionStorage.clear())
    await page.reload()
    await unlockVault(page, NEW_MASTER_PASSWORD)

    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).toBeVisible()
  })

  test('«Сессия до закрытия» — F5 без повторного пароля', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await setupVault(page)

    await page.getByLabel('Сессия до закрытия').check()
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible({
      timeout: 60_000,
    })
    await expect(
      page.getByRole('heading', { name: 'Разблокировка' }),
    ).not.toBeVisible()
  })

  test('баннер бэкапа при превышении порога изменений', async ({ page }) => {
    await setupVault(page)
    await page.getByRole('button', { name: 'Настройки' }).click()

    const changesInput = page.getByLabel('Изменений до напоминания')
    await changesInput.fill('1')
    await changesInput.blur()

    await expect(
      page.getByText('Сохраните зашифрованную копию .vault', { exact: false }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Экспорт .vault' }).first(),
    ).toBeVisible()
  })

  test('демо: очистка не удаляет реальные записи', async ({ page }) => {
    await setupVault(page)
    await loadDemoData(page)
    await addRealLicense(page, 'Моя реальная лицензия', 'REAL-KEY-001')

    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Моя реальная лицензия' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Настройки' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Очистить демо' }).click()

    await page.getByRole('button', { name: 'Лицензии' }).click()
    await expect(page.getByRole('heading', { name: 'Microsoft 365' })).not.toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Моя реальная лицензия' }),
    ).toBeVisible()
  })

  for (const viewport of [
    { name: 'мобильный', width: 375, height: 812 },
    { name: 'планшет', width: 768, height: 1024 },
    { name: 'десктоп', width: 1280, height: 800 },
  ]) {
    test(`вёрстка дашборда: ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await setupVault(page)
      await loadDemoData(page)

      await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible()
      const statLabel =
        viewport.width < 640 ? 'Актив.' : 'Активные'
      await expect(page.getByText(statLabel, { exact: false })).toBeVisible()

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      )
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      )
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  }
})
