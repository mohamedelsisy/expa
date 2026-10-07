import { test } from '@playwright/test'
import { LOCALES, adminCookie, expectNoOverflow, go } from './helpers'

// Long Italian strings (stub guides, user names) at 320/390/768/1280: no horizontal overflow.
// Set E2E_SHOTS=/some/dir to also save full-page screenshots for visual review (never inside the repo).
const WIDTHS = [320, 390, 768, 1280]
const PATHS = ['', '/guides', '/guides/g-1', '/ask', '/pricing', '/study', '/study/finder', '/study/programs', '/cities', '/cities/milano', '/housing', '/articles/a-1', '/services', '/services/p-1', '/learn-italian/practice', '/privacy', '/terms', '/login', '/register']
for (const locale of LOCALES) {
  for (const width of WIDTHS) {
    test(`layout ${locale} @ ${width}`, async ({ page, baseURL, context }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of PATHS) {
        await go(page, `/${locale}${path}`)
        await expectNoOverflow(page, `${locale}${path}@${width}`)
        if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${locale}-${width}-${path.replace(/\W+/g, '_') || 'home'}.png`, fullPage: true })
      }
      await context.addCookies([adminCookie(baseURL!)])
      await go(page, `/${locale}/admin/users`)
      await expectNoOverflow(page, `${locale}/admin/users@${width}`)
      if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${locale}-${width}-admin_users.png`, fullPage: true })
    })
  }
}
