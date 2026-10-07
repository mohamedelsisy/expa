import { expect, test } from '@playwright/test'
import { expectNoAxeViolations, expectNoOverflow, go, userCookie } from './helpers'

// One serial suite: the stub API keeps consent/analytics state that these flows change.
test.describe.configure({ mode: 'serial' })
const API = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 8791}`
test.beforeEach(async ({ request }) => { await request.post(`${API}/__reset`) })

test('housing checker: consent gate, then a result with assumptions, could-not-detect and a separate disclaimer', async ({ page, context, baseURL }) => {
  await context.addCookies([userCookie(baseURL!)])
  await go(page, '/en/housing/check')
  await expect(page.getByTestId('consent-gate')).toBeVisible()
  await page.getByLabel('Listing or contract text').fill('Affitto monolocale a Milano, canone 700 euro al mese, spese escluse, caparra due mensilità.')
  await page.getByRole('button', { name: 'Check this text' }).click()
  await expect(page.getByTestId('consent-gate')).toBeVisible()
  await page.getByRole('button', { name: 'Allow and continue' }).click()
  await expect(page.getByText('Permission saved.')).toBeVisible()
  await page.getByRole('button', { name: 'Check this text' }).click()
  await expect(page.getByTestId('housing-result')).toBeVisible()
  await expect(page.getByTestId('monthly-total')).toContainText('700')
  await expect(page.getByTestId('assumptions')).toContainText('NOT counted')
  await expect(page.getByTestId('could-not-detect')).toContainText('Notice period')
  await expect(page.getByTestId('housing-disclaimer')).toContainText('not legal advice')
  await expect(page.getByTestId('housing-saved-note')).toContainText('Nothing was saved')
  await expectNoAxeViolations(page, 'housing result')
  await expectNoOverflow(page, 'housing result')
})

test('document explainer: a file that cannot be read switches to paste mode; unclear dates are not invented', async ({ page, context, baseURL, request }) => {
  await request.put(`${API}/api/v1/profile/consents`, { data: { consents: { document_analysis: true } } })
  await context.addCookies([userCookie(baseURL!)])
  await go(page, '/en/documents/explain')
  await page.getByTestId('mode-file').click()
  await page.locator('input[type=file]').setInputFiles({ name: 'letter.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 1, 2, 3]) })
  await page.getByRole('button', { name: 'Explain this document' }).click()
  await expect(page.getByTestId('explain-notice')).toContainText('paste the text')
  await expect(page.getByLabel('Document text')).toBeVisible()
  await page.getByLabel('Document text').fill('Comune di Milano: avviso di pagamento TARI entro il 18 novembre.')
  await page.getByRole('button', { name: 'Explain this document' }).click()
  await expect(page.getByTestId('explain-type')).toHaveText('Letter from the Comune')
  await expect(page.getByTestId('date-unclear')).toHaveText('Date not clear')
  await expect(page.getByTestId('explain-actions').getByRole('link')).toHaveAttribute('href', '/en/documents')
  await expect(page.getByTestId('explain-disclaimer')).toBeVisible()
  await expect(page.getByTestId('explain-stored')).toContainText('Nothing')
  await expectNoAxeViolations(page, 'explain result')
})

test('contact request needs the explicit consent checkbox and never claims a booking', async ({ page, context, baseURL }) => {
  await context.addCookies([userCookie(baseURL!)])
  await go(page, '/en/services/p-1')
  await expect(page.getByTestId('provider-notice')).toContainText('third-party')
  await page.getByLabel('Your message').fill('I need a sworn translation of a birth certificate.')
  await page.getByRole('button', { name: 'Send request' }).click()
  await expect(page.getByTestId('consent-error')).toBeVisible()
  await expect(page.getByTestId('lead-sent')).toHaveCount(0)
  await page.getByLabel(/I agree that EXPA shares my name/).check()
  await page.getByRole('button', { name: 'Send request' }).click()
  await expect(page.getByTestId('lead-sent')).toContainText('not a booking')
})

test('guide views carry the consent header only after the banner is accepted; appointment clicks are reported once', async ({ page, request }) => {
  await go(page, '/en/guides/g-1')
  expect((await (await request.get(`${API}/__state`)).json()).guideConsent).toBeNull()
  await page.getByTestId('analytics-allow').click()
  await page.goto('/en/guides/g-1', { waitUntil: 'networkidle' })
  expect((await (await request.get(`${API}/__state`)).json()).guideConsent).toBe('granted')
  await expect(page.getByTestId('analytics-consent')).toHaveCount(0)
  await page.goto('/en/appointments/ag-1', { waitUntil: 'networkidle' })
  const link = page.getByTestId('booking-link')
  await link.evaluate((a: HTMLAnchorElement) => { a.target = '_self'; a.href = '#booked' })
  await link.dblclick()
  await expect.poll(async () => (await (await request.get(`${API}/__state`)).json()).analytics.length).toBeGreaterThan(0)
  const events = (await (await request.get(`${API}/__state`)).json()).analytics
  expect(events).toHaveLength(1)
  expect(events[0]).toMatchObject({ name: 'appointment_clicked', subject: 'ag-1', consent: 'granted', client: 'web' })
})

test('community entries stay hidden while the feature is off', async ({ page }) => {
  await go(page, '/en/explore')
  await expect(page.getByRole('link', { name: /^Community/ })).toHaveCount(0)
  const res = await page.goto('/en/community', { waitUntil: 'networkidle' })
  expect(res?.status()).toBe(404)
})
