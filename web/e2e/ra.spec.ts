import { expect, test } from '@playwright/test'
import { LOCALES, VIEWPORTS, adminCookie, expectNoAxeViolations, expectNoOverflow, go, userCookie } from './helpers'

const API = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 8791}/api/v1`
test.describe.configure({ mode: 'serial' })
test.use({ viewport: { width: 1280, height: 800 }, actionTimeout: 8000 })
test.setTimeout(40_000)

test.describe('net salary estimator', () => {
  test('result shows breakdown, source and disclaimer; stale tables warn; unpublished tables are honest', async ({ page }) => {
    await go(page, '/en/money/net-salary')
    await expect(page.getByTestId('net-notice')).toContainText('not tax or legal advice')
    await page.getByRole('button', { name: 'Calculate estimate' }).click()
    await expect(page.getByText('Enter the gross salary.')).toBeVisible()
    await page.getByLabel('Gross annual salary (EUR)').fill('30000')
    await page.getByRole('button', { name: 'Calculate estimate' }).click()
    await expect(page.getByTestId('net-result')).toBeVisible()
    await expect(page.getByTestId('net-disclaimer')).toContainText('Not tax advice')
    await expect(page.getByTestId('source-name')).toBeVisible()
    await expect(page.getByTestId('net-stale')).toHaveCount(0)
    await expect(page.getByRole('table')).toHaveCount(2)
    await expectNoAxeViolations(page, 'net result')
    await page.getByLabel(/^Tax year/).fill('2001')
    await page.getByRole('button', { name: 'Calculate estimate' }).click()
    await expect(page.getByTestId('net-stale')).toBeVisible()
    await page.getByLabel(/^Tax year/).fill('2000')
    await page.getByRole('button', { name: 'Calculate estimate' }).click()
    await expect(page.getByTestId('net-unavailable')).toContainText('not published yet')
    await expect(page.getByTestId('net-result')).toHaveCount(0)
    await expectNoAxeViolations(page, 'net unavailable')
  })
  test('money landing links to the tool', async ({ page }) => {
    await go(page, '/en/money')
    await expect(page.locator('main a[href="/en/money/net-salary"]')).toHaveCount(1)
  })
})

test.describe('travel requirements', () => {
  test('lists sourced entries and never implies allowed or not allowed when empty', async ({ page }) => {
    await go(page, '/en/travel/requirements')
    await page.getByLabel(/^Nationality/).selectOption('EG')
    await page.getByLabel(/^Destination/).selectOption('FR')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByTestId('travel-item')).toHaveCount(1)
    await expect(page.getByTestId('source-link')).toBeVisible()
    await expect(page.getByTestId('travel-disclaimer')).toBeVisible()
    await expectNoAxeViolations(page, 'travel result')
    await page.getByLabel(/^Nationality/).selectOption('MA')
    await page.getByRole('button', { name: 'Search' }).click()
    const empty = page.getByTestId('travel-empty')
    await expect(empty).toContainText('No verified information')
    await expect(empty).toContainText('does not mean travel is allowed or not allowed')
    await expect(page.getByTestId('travel-item')).toHaveCount(0)
    await expectNoAxeViolations(page, 'travel empty')
  })
  test('needs both countries; travel landing links to the tool', async ({ page }) => {
    await go(page, '/en/travel/requirements')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('Choose a nationality.')).toBeVisible()
    await go(page, '/en/travel')
    await expect(page.locator('main a[href="/en/travel/requirements"]')).toHaveCount(1)
  })
})

test.describe('recommendations', () => {
  test.beforeEach(async ({ context, baseURL, request }) => { await context.addCookies([userCookie(baseURL!)]); await request.get(`${API}/__ra?off=0&left=3`) })
  test('page shows every section with reasons and the third-party label; dashboard embeds it', async ({ page }) => {
    await go(page, '/en/recommendations')
    for (const s of ['guides', 'lessons', 'services', 'reminders']) await expect(page.getByTestId(`recs-${s}`)).toBeVisible()
    await expect(page.getByTestId('rec-third-party')).toHaveText('Third party')
    await expect(page.getByTestId('rec-reason').first()).toContainText('Why')
    await expect(page.getByTestId('recs-off')).toHaveCount(0)
    await expectNoAxeViolations(page, 'recommendations')
    await go(page, '/en/dashboard')
    await expect(page.getByTestId('dashboard-recs')).toBeVisible()
    await expectNoAxeViolations(page, 'dashboard recs')
  })
  test('personalization off shows the notice with a link to consent settings and no services', async ({ page, request }) => {
    await request.get(`${API}/__ra?off=1&left=3`)
    await go(page, '/en/recommendations')
    await expect(page.getByTestId('recs-off')).toBeVisible()
    await expect(page.getByTestId('recs-off').getByRole('link')).toHaveAttribute('href', '/en/privacy-settings')
    await expect(page.getByTestId('recs-services')).toHaveCount(0)
    await expectNoAxeViolations(page, 'recommendations off')
  })
})

test.describe('Patente Teacher', () => {
  test('guests are sent to sign in; signed-in users get a sourced answer; quota is respected', async ({ page, context, baseURL, request }) => {
    await request.get(`${API}/__ra?off=0&left=1`)
    await go(page, '/en/patente/topics/segnali')
    await expect(page.getByTestId('explain-btn')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Sign in to get an explanation' })).toBeVisible()
    await context.addCookies([userCookie(baseURL!)])
    await go(page, '/en/patente/topics/segnali')
    await page.getByTestId('explain-btn').click()
    await expect(page.getByTestId('explain-answer')).toContainText('stop sign')
    await expect(page.getByTestId('ai-source').first()).toBeVisible()
    await expect(page.getByTestId('explain-remaining')).toContainText('0')
    await expectNoAxeViolations(page, 'explain answer')
    await page.getByTestId('explain-btn').click()
    await expect(page.getByTestId('explain-error')).toContainText('Daily AI limit reached')
    await expectNoAxeViolations(page, 'explain quota')
  })
  test('Ask EXPA offers the teacher panel and sends the topic', async ({ page, context, baseURL, request }) => {
    await request.get(`${API}/__ra?off=0&left=3`)
    await context.addCookies([userCookie(baseURL!)])
    await go(page, '/en/ask?patente_topic=segnali&title=Road%20signs')
    await expect(page.getByTestId('teacher-ctx')).toContainText('Road signs')
    await page.getByTestId('teacher-explain').click()
    await expect(page.getByTestId('ask-assistant-msg')).toContainText('stop sign')
    await expectNoAxeViolations(page, 'ask teacher')
  })
})

test.describe('admin content pipeline', () => {
  test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([adminCookie(baseURL!)]) })
  test('content readiness shows real counts per module', async ({ page }) => {
    await go(page, '/en/admin/readiness')
    const row = page.locator('tr[data-module="tax-tables"]')
    await expect(row).toContainText('Tax tables')
    await expect(row.locator('td').nth(0)).toHaveText('5')
    await expect(row.locator('td').nth(1)).toHaveText('3')
    await expect(row.locator('td').nth(2)).toHaveText('2')
    await expect(row.locator('td').nth(3)).toHaveText('1')
    await expect(page.getByTestId('ready-sources')).toContainText('2 sources, 1 active, 1 failing')
    await expectNoAxeViolations(page, 'readiness')
  })
  test('tax table and travel requirement forms expose their fields', async ({ page }) => {
    await go(page, '/en/admin/content/tax-tables/new')
    await expect(page.getByTestId('brackets-editor')).toBeVisible()
    await page.getByRole('button', { name: 'Add bracket' }).click()
    await expect(page.getByLabel('Bracket 1: rate (%)')).toBeVisible()
    await expect(page.getByLabel(/Last verified on/)).toBeVisible()
    await expectNoAxeViolations(page, 'tax table form')
    await go(page, '/en/admin/content/travel-requirements/new')
    await expect(page.getByLabel(/^Nationality/)).toBeVisible()
    await expect(page.getByLabel(/^Destination/)).toBeVisible()
    await expectNoAxeViolations(page, 'travel form')
  })
})

for (const locale of LOCALES) {
  for (const vp of VIEWPORTS) {
    test(`new signed-in pages ${locale} @ ${vp.name}: axe and overflow`, async ({ page, context, baseURL, request }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await request.get(`${API}/__ra?off=0&left=3`)
      await context.addCookies([userCookie(baseURL!)])
      await go(page, `/${locale}/recommendations`)
      await expect(page.getByTestId('recs')).toBeVisible()
      await expectNoOverflow(page, `${locale} recs ${vp.name}`)
      await expectNoAxeViolations(page, `${locale} recs ${vp.name}`)
    })
  }
}

test('explore hub, footer and sitemap link to the new tools', async ({ page, request }) => {
  await go(page, '/en/explore')
  for (const a of ['money/net-salary', 'travel/requirements']) {
    await expect(page.locator(`main a[href="/en/${a}"]`)).toHaveCount(1)
    await expect(page.locator(`footer a[href="/en/${a}"]`)).toHaveCount(1)
  }
  const xml = await (await request.get('/sitemap-en.xml')).text()
  expect(xml).toContain('/en/money/net-salary</loc>')
  expect(xml).toContain('/en/travel/requirements</loc>')
  expect(xml).not.toContain('/recommendations')
})
