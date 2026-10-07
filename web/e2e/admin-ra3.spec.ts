import { expect, test } from '@playwright/test'
import { adminCookie, expectNoAxeViolations, expectNoOverflow, go } from './helpers'

// RA-3: admin pages for endpoints that already existed (stub admin is a super admin).
test.use({ viewport: { width: 1280, height: 800 }, actionTimeout: 8000 })
test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([adminCookie(baseURL!)]) })

test('AI knowledge base lists indexed items, flags stale ones and rebuilds after confirmation', async ({ page }) => {
  await go(page, '/en/admin/ai/knowledge')
  await expect(page.getByTestId('knowledge-total')).toContainText('3 chunks from 2 items')
  await expect(page.getByText('Stale')).toHaveCount(1)
  await expectNoAxeViolations(page, 'admin knowledge')
  await page.getByRole('button', { name: 'Rebuild index' }).click()
  await expect(page.getByText('Rebuild the whole knowledge index now?')).toBeVisible()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Rebuild index' }).click()
  await expect(page.getByTestId('knowledge-total')).toContainText('7 chunks')
})

test('AI conversations show metadata only with the privacy notice', async ({ page }) => {
  await go(page, '/en/admin/ai/conversations')
  await expect(page.getByTestId('metadata-only')).toContainText('never shown here')
  await expect(page.getByText('immigration: 60')).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expectNoAxeViolations(page, 'admin conversations')
})

test('settings are read only', async ({ page }) => {
  await go(page, '/en/admin/settings')
  await expect(page.getByTestId('settings-readonly')).toBeVisible()
  await expect(page.getByText('four_eyes')).toBeVisible()
  expect(await page.locator('main input, main textarea, main select').count()).toBe(0)
  await expectNoAxeViolations(page, 'admin settings')
})

test('broadcast needs Arabic text, asks for confirmation, then reports the audience size', async ({ page }) => {
  await go(page, '/en/admin/notifications/broadcast')
  await page.getByRole('button', { name: 'Review and send' }).click()
  await expect(page.getByText('The Arabic title and message are required.').first()).toBeVisible()
  await expectNoAxeViolations(page, 'broadcast with error')
  await page.getByLabel('Title').first().fill('تحديث مهم')
  await page.getByLabel('Message').first().fill('سيتم تحديث الخدمة غدًا.')
  await page.getByRole('button', { name: 'Review and send' }).click()
  await expect(page.getByText('Send this announcement now?')).toBeVisible()
  await page.getByRole('button', { name: 'Send announcement' }).click()
  await expect(page.getByTestId('broadcast-sent')).toContainText('42 recipients')
})

test('cities and regions: add a city, refuse deleting one that is in use', async ({ page }) => {
  await go(page, '/en/admin/geography')
  await expect(page.getByRole('table')).toContainText('Milan')
  await expectNoAxeViolations(page, 'admin geography')
  await page.getByRole('button', { name: 'Add a city' }).click()
  await page.getByLabel('Slug').fill('torino')
  await page.getByLabel('Region').last().selectOption({ index: 1 })
  await page.getByLabel(/Name \(Arabic\)/).fill('تورينو')
  await page.getByRole('dialog').locator('button[type=submit]').click()
  await expect(page.getByText('City saved.')).toBeVisible()
  await page.getByRole('button', { name: /^Delete/ }).first().click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('This city is used by offices, guides or jobs and cannot be deleted.')).toBeVisible()
})

test('erasing a user needs the typed email', async ({ page }) => {
  await go(page, '/en/admin/users')
  await page.getByRole('button', { name: /Details/ }).first().click()
  await page.getByRole('button', { name: 'Erase account' }).click()
  const confirm = page.getByRole('button', { name: 'Erase permanently' })
  await expect(confirm).toBeDisabled()
  await page.getByLabel(/Type .* to confirm/).fill('giovanna.maria.rossi.bianchi@example.test')
  await expect(confirm).toBeEnabled()
  await expectNoAxeViolations(page, 'erase confirmation')
  await confirm.click()
  await expect(page.getByText('Erasure started.')).toBeVisible()
})

for (const locale of ['ar', 'it'] as const) {
  test(`admin pages ${locale}: axe and no overflow`, async ({ page }) => {
    for (const p of ['ai/knowledge', 'ai/conversations', 'settings', 'notifications/broadcast', 'geography']) {
      await go(page, `/${locale}/admin/${p}`)
      await expectNoAxeViolations(page, `${locale} ${p}`)
      await expectNoOverflow(page, `${locale} ${p}`)
    }
  })
}
