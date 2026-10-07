import { expect, test, type Page } from '@playwright/test'
import { expectNoAxeViolations, expectNoOverflow, go } from './helpers'

// Signed-in journeys against the stub API (e2e/stub/journey.mjs). Serial: they share one stateful stub user.
const EMAIL = 'journey@example.test'
const PASSWORD = 'Journey-Passw0rd!'
const API = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 8791}/api/v1`

test.describe.configure({ mode: 'serial' })
test.use({ viewport: { width: 1280, height: 800 }, actionTimeout: 8000 })
test.setTimeout(40_000)

async function login(page: Page, locale = 'en') {
  await go(page, `/${locale}/login`)
  await page.getByLabel(/^(Email|البريد الإلكتروني|E-mail)/).fill(EMAIL)
  await page.locator('input[type=password]').fill(PASSWORD)
  await page.locator('form button[type=submit]').click()
  await page.waitForURL(new RegExp(`/${locale}/dashboard`))
}
const axe = async (page: Page, label: string) => { await expectNoAxeViolations(page, label); await expectNoOverflow(page, label) }

test.beforeAll(async ({ request }) => { await request.post(`${API}/__journey_reset`) })

test('guest is redirected to login; wrong password shows an error; correct login lands on the dashboard', async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForURL(/\/en\/login/)
  await page.getByLabel('Email').fill(EMAIL)
  await page.locator('input[type=password]').fill('wrong-password')
  await page.locator('form button[type=submit]').click()
  await expect(page.getByText('These credentials do not match our records.')).toBeVisible()
  await axe(page, 'login error')
  await page.locator('input[type=password]').fill(PASSWORD)
  await page.locator('form button[type=submit]').click()
  await page.waitForURL(/\/en\/dashboard/)
  await page.waitForLoadState('networkidle')
  await expect.poll(async () => (await page.context().cookies()).find(c => c.name === 'expa_token')?.httpOnly).toBe(true)
  expect(await page.evaluate(() => document.cookie)).not.toContain('expa_token')
})

test('onboarding: consent, answer the required step, skip optional steps, finish', async ({ page }) => {
  await login(page)
  await go(page, '/en/onboarding')
  await page.getByRole('checkbox').check()
  await axe(page, 'onboarding consent')
  await page.getByRole('button', { name: 'Allow and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Your situation' })).toBeVisible()
  // the required step cannot be skipped or left empty
  await expect(page.getByRole('button', { name: 'Skip this step' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Please answer this question to continue.', { exact: false }).or(page.locator('[role=alert], .text-danger').first())).toBeVisible()
  await page.locator('main select').first().selectOption('student')
  await axe(page, 'onboarding step')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Skip this step' }).click()
  await page.getByRole('button', { name: 'Skip this step' }).click()
  await page.waitForURL(/\/en\/dashboard/)
})

test('dashboard shows the score, how it is calculated and next actions', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mohamed')
  await expect(page.getByText('Add your residence permit')).toBeVisible()
  await page.locator('[aria-controls=how-calc]').click()
  await expect(page.getByText('Share of applicable setup tasks marked done.')).toBeVisible()
  await axe(page, 'dashboard')
})

test('ask EXPA: question, labelled answer with sources and disclaimer', async ({ page }) => {
  await login(page)
  await go(page, '/en/ask')
  await page.getByPlaceholder('Type your question…').fill('How can I renew my residence permit?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText('General guidance').first()).toBeVisible()
  await expect(page.getByText('This is general guidance, not legal advice.')).toBeVisible()
  await expect(page.getByText('Renewing a residence permit').first()).toBeVisible()
  await axe(page, 'ask answer')
})

test('documents tracker: consent, add a document, see it listed', async ({ page }) => {
  await login(page)
  await go(page, '/en/documents/new')
  await expect(page.getByRole('heading', { name: 'Add a document' }).first()).toBeVisible()
  await axe(page, 'documents new (consent gate)')
  const allow = page.getByRole('button', { name: /allow|agree|consent/i }).first()
  if (await allow.count()) { await page.getByRole('checkbox').first().check().catch(() => {}); await allow.click() }
  await page.getByLabel('Document type').selectOption('residence_permit')
  await page.getByLabel('Name (optional)').fill('My permesso')
  await page.locator('input[type=date]').nth(1).fill('2026-12-20')
  await page.locator('form button[type=submit]').click()
  await go(page, '/en/documents')
  await expect(page.getByText('My permesso').first()).toBeVisible()
  await axe(page, 'documents list')
})

test('jobs: list with match score, detail, save, saved list, apply link notice', async ({ page }) => {
  await login(page)
  await go(page, '/en/jobs')
  await expect(page.getByText('Sviluppatore PHP Laravel 1').first()).toBeVisible()
  await axe(page, 'jobs list')
  await go(page, '/en/jobs/1')
  await expect(page.getByText('87%').first()).toBeVisible()
  await page.getByRole('button', { name: 'Save job' }).click()
  await expect(page.getByRole('button', { name: 'Remove from saved' })).toBeVisible()
  await axe(page, 'job detail')
  await go(page, '/en/jobs/saved')
  await expect(page.getByText('Sviluppatore PHP Laravel 1').first()).toBeVisible()
})

test('learn Italian: daily plan, open a lesson and mark it complete', async ({ page }) => {
  await login(page)
  await go(page, '/en/learn-italian')
  await expect(page.getByText('Al Comune: chiedere un certificato').first()).toBeVisible()
  await axe(page, 'learn index')
  await go(page, '/en/learn-italian/lessons/al-comune')
  await page.getByRole('button', { name: 'Mark as complete' }).click()
  await expect(page.getByText(/completed/i).first()).toBeVisible()
  await axe(page, 'lesson')
})

test('patente: progress, practice run, answer, submit, results review', async ({ page }) => {
  await login(page)
  await go(page, '/en/patente')
  await axe(page, 'patente index')
  await go(page, '/en/patente/practice')
  await page.getByRole('checkbox').first().check()
  await page.getByRole('button', { name: 'Start practice' }).click()
  await page.waitForURL(/\/en\/patente\/run\/1/)
  await page.getByRole('radio', { name: /^True/i }).first().check()
  await axe(page, 'patente run')
  await page.getByRole('button', { name: 'Finish and submit' }).click()
  const submit = page.getByRole('button', { name: 'Submit now' })
  if (await submit.count()) await submit.click()
  await page.waitForURL(/\/en\/patente\/results\/1/).catch(() => {})
  await expect(page.getByText('A stop sign always requires a full stop.').first()).toBeVisible()
  await axe(page, 'patente results')
})

test('notifications: list, mark one read, mark all read', async ({ page }) => {
  await login(page)
  await go(page, '/en/notifications')
  await expect(page.getByText('Residence permit expires in 74 days')).toBeVisible()
  await axe(page, 'notifications')
  await page.getByRole('button', { name: 'Mark as read' }).first().click()
  await expect(page.getByRole('button', { name: 'Mark as read' })).toHaveCount(1)
  await page.getByRole('button', { name: 'Mark all as read' }).click()
  await expect(page.getByRole('button', { name: 'Mark as read' })).toHaveCount(0)
})

test('devices and sessions: list, revoke another device', async ({ page }) => {
  await login(page)
  await go(page, '/en/settings/security')
  await expect(page.getByTestId('device-1')).toContainText('This device')
  await axe(page, 'sessions')
  await page.getByTestId('device-2').getByRole('button', { name: /Sign out/ }).click()
  await expect(page.getByTestId('device-2')).toHaveCount(0)
})

test('billing: honest notice while payments are off', async ({ page }) => {
  await login(page)
  await go(page, '/en/settings/billing')
  await expect(page.getByTestId('billing-unavailable')).toBeVisible()
  await expect(page.getByText('You are on the free plan.')).toBeVisible()
  await axe(page, 'billing free')
})

test('billing: cancel at period end and invoices when a paid plan exists', async ({ page, request }) => {
  await request.post(`${API}/__journey_setup`, { data: { paid: true, billingOn: true } })
  await login(page)
  await go(page, '/en/settings/billing')
  await expect(page.getByText('EXPA-2026-000001')).toBeVisible()
  await axe(page, 'billing paid')
  await page.getByRole('button', { name: 'Cancel subscription' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel subscription' }).click()
  await expect(page.getByText('Cancellation is already scheduled.')).toBeVisible()
  await request.post(`${API}/__journey_setup`, { data: { paid: false, billingOn: false, canceled: false } })
})

test('community: blocked members list and unblock', async ({ page }) => {
  await login(page)
  await go(page, '/en/community/blocked')
  await expect(page.getByText('Blocked member 1 · since')).toBeVisible()
  await axe(page, 'blocked members')
  await page.getByRole('button', { name: /Unblock/ }).click()
  await expect(page.getByText('You have not blocked anyone')).toBeVisible()
})

test('sign out everywhere ends the session', async ({ page, request }) => {
  await login(page)
  await go(page, '/en/settings/security')
  await page.getByRole('button', { name: 'Sign out of all devices' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Sign out of all devices' }).click()
  await page.waitForURL(/\/en\/login/)
  await request.post(`${API}/__journey_reset`)
})

test('sign out clears the session and protects the dashboard again', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL(/\/en(\/login)?\/?$/)
  await page.goto('/en/dashboard', { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForURL(/\/en\/login/)
})

test('arabic RTL and italian dashboards pass axe', async ({ page }) => {
  for (const loc of ['ar', 'it']) {
    await login(page, loc)
    await axe(page, `dashboard ${loc}`)
    await go(page, `/${loc}/ask`)
    await axe(page, `ask ${loc}`)
    await page.context().clearCookies()
  }
})
