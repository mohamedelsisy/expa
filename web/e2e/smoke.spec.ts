import { expect, test } from '@playwright/test'
import { LOCALES, PAGES, VIEWPORTS, expectNoAxeViolations, expectNoOverflow } from './helpers'

// Public pages x locales x viewports: axe zero violations, no horizontal overflow, one h1, no hydration warnings.
for (const locale of LOCALES) {
  for (const vp of VIEWPORTS) {
    test.describe(`${locale} @ ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })
      for (const path of PAGES) {
        test(`/${locale}${path}`, async ({ page }) => {
          const logs: string[] = []
          page.on('console', (m) => { if (/hydrat/i.test(m.text())) logs.push(m.text()) })
          const res = await page.goto(`/${locale}${path}`, { waitUntil: 'networkidle' })
          expect(res?.status()).toBeLessThan(400)
          expect(await page.locator('html').getAttribute('lang')).toBe(locale)
          expect(await page.locator('html').getAttribute('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr')
          expect(await page.locator('h1').count(), 'exactly one h1').toBe(1)
          await expectNoOverflow(page, `${locale}${path}@${vp.name}`)
          await expectNoAxeViolations(page, `${locale}${path}@${vp.name}`)
          expect(logs).toEqual([])
        })
      }
    })
  }
}
