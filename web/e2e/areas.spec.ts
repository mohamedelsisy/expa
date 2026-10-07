import { expect, test } from '@playwright/test'
import { LOCALES, expectNoAxeViolations, go } from './helpers'

// RA-6: life-area landing pages and /about. (Axe and overflow in ar/en/it at 390 and 1280 px run in smoke.spec.ts through PAGES.)
const AREAS = ['healthcare', 'money', 'business', 'family', 'travel', 'daily-life'] as const

for (const locale of LOCALES) {
  test(`life areas ${locale}: guides, disclaimer, canonical, hreflang, breadcrumbs`, async ({ page }) => {
    for (const a of AREAS) {
      await go(page, `/${locale}/${a}`)
      await expect(page.getByTestId('area-disclaimer')).toBeVisible()
      expect(await page.locator('link[rel=canonical]').getAttribute('href')).toMatch(new RegExp(`/${locale}/${a}$`))
      expect(await page.locator('link[rel=alternate][hreflang=ar]').getAttribute('href')).toMatch(new RegExp(`/ar/${a}$`))
      expect(await page.locator('meta[name=robots]').count()).toBe(0)
      expect(await page.locator('nav ol li').count(), 'breadcrumbs').toBeGreaterThan(1)
      const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ')
      expect(ld).toContain('CollectionPage')
      expect(ld).toContain('BreadcrumbList')
    }
  })
}

test('stubbed guides are listed; an area without guides shows the honest empty state', async ({ page, context, baseURL }) => {
  await go(page, '/en/healthcare')
  await expect(page.getByRole('heading', { name: 'Guides' })).toBeVisible()
  await expect(page.locator('article').first()).toBeVisible()
  await expect(page.getByText('General navigation information only. EXPA gives no medical advice and no diagnoses. In an emergency call 112.')).toBeVisible()
  // travel: the (admin-token) stub answers an empty list so the empty state is exercised without a separate fixture
  await context.addCookies([{ name: 'expa_token', value: 'stub-admin', url: baseURL! }])
  await go(page, '/en/travel')
  await expect(page.getByText('No guides published yet')).toBeVisible()
  await expect(page.getByText('Entry and travel rules depend on nationality', { exact: false })).toBeVisible()
  await expectNoAxeViolations(page, 'travel empty state')
})

test('about page: honest no-claims text, product description, JSON-LD', async ({ page }) => {
  await go(page, '/en/about')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About EXPA')
  const box = page.getByTestId('about-no-claims')
  await expect(box).toContainText('not a government website')
  await expect(box).toContainText('Nothing here is legal, tax or medical advice')
  expect(await page.locator('script[type="application/ld+json"]').allTextContents().then(a => a.join(' '))).toContain('AboutPage')
})

test('explore hub, footer and sitemap link to the new pages', async ({ page, request }) => {
  await go(page, '/en/explore')
  for (const a of AREAS) await expect(page.locator(`main a[href="/en/${a}"]`)).toHaveCount(1)
  for (const a of [...AREAS, 'about']) await expect(page.locator(`footer a[href="/en/${a}"]`)).toHaveCount(1)
  const xml = await (await request.get('/sitemap-en.xml')).text()
  for (const a of [...AREAS, 'about']) expect(xml).toContain(`/en/${a}</loc>`)
})
