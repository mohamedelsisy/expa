import { expect, test, type Page } from '@playwright/test'
import { adminCookie, expectNoAxeViolations, expectNoOverflow, go } from './helpers'

// Pricing, checkout return and admin plans against the stub API (own state + token in e2e/stub/journey.mjs: billing()).
const API = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 8791}/api/v1`
const billingCookie = (baseURL: string) => ({ name: 'expa_token', value: 'stub-billing', url: baseURL })
test.describe.configure({ mode: 'serial' })
test.use({ viewport: { width: 1280, height: 800 }, actionTimeout: 8000 })
test.setTimeout(45_000)
const axe = async (page: Page, label: string) => { await expectNoAxeViolations(page, label); await expectNoOverflow(page, label) }

test.beforeEach(async ({ request }) => { await request.post(`${API}/__billing_reset`) })
test.afterAll(async ({ request }) => { await request.post(`${API}/__billing_reset`) })

test.describe('pricing', () => {
  test('payments off: prices stay visible, nothing can be bought, honest note, guest signs in and returns', async ({ page }) => {
    await go(page, '/en/pricing')
    await expect(page.getByTestId('payments-disabled')).toContainText('Payments are not enabled yet')
    await expect(page.getByRole('heading', { name: 'Plus' })).toBeVisible()
    await expect(page.getByText('€5.99 / month')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toHaveCount(0) // inactive plans are not listed
    const signIn = page.getByTestId('plan-signin')
    await expect(signIn).toHaveAttribute('href', /\/en\/login\?redirect=(%2F|\/)en(%2F|\/)pricing$/)
    await axe(page, 'pricing off')
  })

  test('payments off, signed in: buy buttons are disabled', async ({ page, context, baseURL }) => {
    await context.addCookies([billingCookie(baseURL!)])
    await go(page, '/en/pricing')
    await expect(page.getByTestId('payments-disabled')).toBeVisible()
    await expect(page.getByTestId('unavailable-plus')).toBeDisabled()
    await expect(page.getByTestId('choose-plus')).toHaveCount(0)
  })

  test('payments on: checkout redirects to the hosted page with only the plan key', async ({ page, context, baseURL, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { billingOn: true } })
    await context.addCookies([billingCookie(baseURL!)])
    await page.route('https://checkout.stripe.test/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Hosted checkout</title>' }))
    await go(page, '/en/pricing')
    await expect(page.getByTestId('payments-disabled')).toHaveCount(0)
    await axe(page, 'pricing on')
    await page.getByTestId('choose-plus').click()
    await page.waitForURL('https://checkout.stripe.test/c/pay/cs_test_plus')
    const state = await (await request.get(`${API}/__billing_state`)).json()
    expect(state.data.lastCheckout).toEqual({ plan: 'plus', keys: ['plan'] })
  })

  test('checkout errors show friendly messages (503 and 429)', async ({ page, context, baseURL, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { billingOn: true } })
    await context.addCookies([billingCookie(baseURL!)])
    await go(page, '/en/pricing')
    await request.post(`${API}/__billing_setup`, { data: { billingOn: false } })
    await page.getByTestId('choose-plus').click()
    await expect(page.getByText('Checkout is not available right now. Please try again later.')).toBeVisible()
    await request.post(`${API}/__billing_setup`, { data: { billingOn: true, checkoutError: 429 } })
    await page.getByTestId('choose-plus').click()
    await expect(page.getByText('Too many attempts. Please wait a moment and try again.')).toBeVisible()
  })

  test('Arabic page is RTL, formats the price with Intl and has no overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await go(page, '/ar/pricing')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByRole('heading', { name: 'Plus' })).toBeVisible()
    await expect(page.getByTestId('payments-disabled')).toBeVisible()
    await axe(page, 'pricing ar mobile')
  })
})

test.describe('checkout return', () => {
  test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([billingCookie(baseURL!)]) })

  test('success shows processing, grants nothing client-side, then confirms once the server reports the new plan', async ({ page, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { billingOn: true, upgradeAfterPolls: 3 } })
    await go(page, '/en/settings/billing?checkout=success&session_id=cs_test_abc')
    const ret = page.getByTestId('checkout-return')
    await expect(ret).toContainText('Processing your payment')
    await expect(page.getByText('You are on the free plan.')).toBeVisible()
    await axe(page, 'billing processing')
    await expect(ret).toContainText('Subscription active', { timeout: 20_000 })
    await expect(ret).not.toContainText('Processing your payment')
    await expect(page.getByText('Plus', { exact: true })).toBeVisible()
  })

  test('cancelled shows a neutral message and leaves the plan alone', async ({ page, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { billingOn: true } })
    await go(page, '/en/settings/billing?checkout=cancelled')
    const ret = page.getByTestId('checkout-return')
    await expect(ret).toContainText('Checkout cancelled')
    await expect(ret).toContainText('Nothing was charged')
    await expect(page.getByText('You are on the free plan.')).toBeVisible()
    await axe(page, 'billing cancelled')
    expect((await (await request.get(`${API}/__billing_state`)).json()).data.polls).toBe(1)
  })

  test('without the query string no return message is shown', async ({ page }) => {
    await go(page, '/en/settings/billing')
    await expect(page.getByTestId('checkout-return')).toBeEmpty()
  })
})

test.describe('admin plans', () => {
  test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([adminCookie(baseURL!)]) })

  test('lists plans, billing-off and new-checkouts-only notices; free plan is locked', async ({ page }) => {
    await go(page, '/en/admin/plans')
    await expect(page.getByTestId('plans-billing-off')).toBeVisible()
    await expect(page.getByTestId('plans-newonly')).toContainText('new checkouts only')
    await expect(page.getByRole('table')).toContainText('€5.99 / month')
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Plans and prices' }).first()).toBeVisible()
    await axe(page, 'admin plans')
    await page.getByTestId('edit-free').click()
    const dlg = page.getByRole('dialog')
    await expect(dlg.getByText('The free plan always stays active')).toBeVisible()
    await expect(dlg.getByLabel(/^Price \(EUR\)/)).toBeDisabled()
    await expect(dlg.getByLabel(/^Billing interval/)).toBeDisabled()
    await expect(dlg.getByLabel('Plan is active')).toBeDisabled()
    await axe(page, 'admin plan dialog free')
  })

  test('edit validates, converts euros to cents, saves and the public price follows', async ({ page, request }) => {
    await go(page, '/en/admin/plans')
    await page.getByTestId('edit-plus').click()
    const dlg = page.getByRole('dialog')
    const price = dlg.getByLabel(/^Price \(EUR\)/)
    await expect(price).toHaveValue('5.99')
    await price.fill('abc')
    await dlg.getByTestId('plan-save').click()
    await expect(dlg.getByText('Enter a valid price in euros with at most two decimals.')).toBeVisible()
    await price.fill('1000.01')
    await dlg.getByTestId('plan-save').click()
    await expect(dlg.getByText(/cannot be more than 1000\.00 EUR/)).toBeVisible()
    await dlg.getByTestId('plan-save').click()
    await price.fill('7,50')
    await dlg.getByLabel(/^Assistant questions per day/).fill('150')
    await dlg.getByTestId('plan-save').click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('table')).toContainText('€7.50 / month')
    const state = await (await request.get(`${API}/__billing_state`)).json()
    expect(state.data.patches).toEqual([{ price_minor: 750, currency: 'EUR', features: { ai_daily_limit: 150 } }])
    const pub = await (await request.get(`${API}/billing/plans`)).json()
    expect(pub.data.find((p: { key: string }) => p.key === 'plus').price.amount_minor).toBe(750)
  })

  test('an active paid plan needs a price; activating with a price works', async ({ page, request }) => {
    await go(page, '/en/admin/plans')
    await page.getByTestId('edit-pro').click()
    const dlg = page.getByRole('dialog')
    await dlg.getByLabel('Plan is active').check()
    await dlg.getByTestId('plan-save').click()
    await expect(dlg.getByText('An active paid plan needs a price above zero.')).toBeVisible()
    await dlg.getByLabel(/^Price \(EUR\)/).fill('14.99')
    await dlg.getByTestId('plan-save').click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const pub = await (await request.get(`${API}/billing/plans`)).json()
    expect(pub.data.map((p: { key: string }) => p.key)).toEqual(['free', 'plus', 'pro'])
  })

  test('server validation errors are surfaced next to the field', async ({ page, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { rejectEnName: true } })
    await go(page, '/en/admin/plans')
    await page.getByTestId('edit-plus').click()
    const dlg = page.getByRole('dialog')
    await dlg.getByLabel('Name').nth(1).fill('Taken')
    await dlg.getByTestId('plan-save').click()
    await expect(dlg.getByText('This name is already used by another plan.')).toBeVisible()
    await expect(dlg.getByTestId('plan-failure')).toContainText('Please correct the highlighted fields.')
    await axe(page, 'admin plan dialog error')
  })

  test('warns when a Stripe price id overrides the price', async ({ page, request }) => {
    await request.post(`${API}/__billing_setup`, { data: { stripe: { plus: true } } })
    await go(page, '/en/admin/plans')
    await expect(page.getByRole('table')).toContainText('Stripe price id')
    await page.getByTestId('edit-plus').click()
    const dlg = page.getByRole('dialog')
    await expect(dlg.getByText('Stripe keeps charging the price defined there')).toBeVisible()
    await dlg.getByLabel(/^Price \(EUR\)/).fill('6.49')
    await dlg.getByTestId('plan-save').click()
    await expect(page.getByTestId('plans-stripe-warning')).toBeVisible()
  })

  test('Arabic admin page is RTL and fits a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await go(page, '/ar/admin/plans')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByTestId('plans-newonly')).toBeVisible()
    await expectNoOverflow(page, 'admin plans ar')
    await expectNoAxeViolations(page, 'admin plans ar')
  })
})

test('a signed-in user without admin permissions cannot open admin plans', async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: 'expa_token', value: 'stub-user', url: baseURL! }])
  const res = await page.goto('/en/admin/plans', { waitUntil: 'networkidle' })
  expect(res?.status()).toBe(403)
})
