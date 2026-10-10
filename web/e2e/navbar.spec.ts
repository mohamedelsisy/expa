import { expect, test, type Page } from '@playwright/test'
import { adminCookie, expectNoAxeViolations, expectNoOverflow, userCookie } from './helpers'

const settle = (page: Page) => page.waitForTimeout(300) // menu fade is 150ms; axe reads opacity

const EXPLORE = /^(Explore|استكشف|Esplora)$/
const ACCOUNT = /^(My account|حسابي|Il mio account)/
const DIRS = { ar: 'rtl', en: 'ltr', it: 'ltr' } as const

test.describe('desktop header', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  for (const loc of ['ar', 'en', 'it'] as const) {
    test(`${loc}: direction, primary nav hierarchy and Explore menu`, async ({ page, baseURL, context }) => {
      await context.addCookies([userCookie(baseURL!)])
      await page.goto(`/${loc}`, { waitUntil: 'networkidle' })
      expect(await page.evaluate(() => document.documentElement.dir)).toBe(DIRS[loc])
      const nav = page.locator('header nav').first()
      // Ask EXPA and My Italy are primary; Home / Tasks / Profile are no longer flat header links.
      await expect(nav.locator('a[href$="/ask"]')).toBeVisible()
      await expect(nav.locator('a[href$="/dashboard"]')).toBeVisible()
      for (const p of ['/tasks', '/profile']) await expect(nav.locator(`a[href$="${p}"]`)).toHaveCount(0)
      await expect(nav.locator('a[href$="/ask"]')).toContainText('EXPA')

      const trigger = nav.getByRole('button', { name: EXPLORE })
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const panel = page.getByTestId('explore-menu')
      await expect(panel).toBeVisible()
      await settle(page)
      const box = (await panel.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(1280)
      expect(box.height, 'panel is compact').toBeLessThanOrEqual(540)
      await expectNoAxeViolations(page, `${loc} explore open`)
      await page.keyboard.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
      await trigger.click()
      await page.mouse.click(5, 700)
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  }

  test('guests do not see My Italy and get Sign in / Create account', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' })
    const header = page.locator('header').first()
    await expect(header.locator('a[href$="/dashboard"]')).toHaveCount(0)
    await expect(header.getByRole('link', { name: 'Sign in' })).toBeVisible()
    await expect(header.getByRole('link', { name: 'Create account' })).toBeVisible()
  })

  test('keyboard: Explore opens with Enter, Tab walks the links, Escape returns focus', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' })
    const trigger = page.locator('header nav').first().getByRole('button', { name: EXPLORE })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-testid="explore-menu"]'))).toBe(true)
    const first = await page.evaluate(() => document.activeElement?.getAttribute('href'))
    await page.keyboard.press('Tab')
    const second = await page.evaluate(() => document.activeElement?.getAttribute('href'))
    expect(second).not.toBe(first)
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  })

  for (const loc of ['ar', 'en'] as const) {
    test(`${loc}: account menu opens on the correct side, has identity + links; axe clean`, async ({ page, baseURL, context }) => {
      await context.addCookies([userCookie(baseURL!)])
      await page.goto(`/${loc}`, { waitUntil: 'networkidle' })
      const trigger = page.getByRole('button', { name: ACCOUNT })
      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const panel = page.getByTestId('account-menu')
      await expect(panel).toBeVisible()
      await expect(panel).toContainText('Mohamed')
      await expect(panel).toContainText('user@example.test')
      await expect(panel.getByRole('link')).toHaveCount(5) // profile, tasks, security, two-factor, billing (no admin)
      await settle(page)
      const t = (await trigger.boundingBox())!
      const p = (await panel.boundingBox())!
      if (loc === 'ar') expect(Math.abs(p.x - t.x), 'RTL: panel aligns with the trigger start edge').toBeLessThanOrEqual(2)
      else expect(Math.abs(p.x + p.width - (t.x + t.width)), 'LTR: panel aligns with the trigger end edge').toBeLessThanOrEqual(2)
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x + p.width).toBeLessThanOrEqual(1280)
      await expectNoAxeViolations(page, `${loc} account open`)
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
    })
  }

  test('admins see the Admin link in the account menu', async ({ page, baseURL, context }) => {
    await context.addCookies([adminCookie(baseURL!)])
    await page.goto('/en', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: ACCOUNT }).click()
    await expect(page.getByTestId('account-menu').getByRole('link', { name: 'Admin' })).toBeVisible()
  })

  test('language menu lists the native names, marks the current one and switches (ar RTL, en and it LTR)', async ({ page }) => {
    await page.goto('/ar', { waitUntil: 'networkidle' })
    const trigger = page.getByRole('button', { name: /^اللغة: / })
    await expect(trigger).toContainText('العربية')
    await trigger.click()
    const menu = page.getByRole('navigation', { name: 'اللغة' })
    await expect(menu.getByRole('link')).toHaveText(['العربية', 'English', 'Italiano'])
    await expect(menu.getByRole('link', { name: 'العربية' })).toHaveAttribute('aria-current', 'true')
    await settle(page)
    await expectNoAxeViolations(page, 'ar language open')
    await menu.getByRole('link', { name: 'English' }).click()
    await page.waitForURL(/\/en(\/|$)/)
    expect(await page.evaluate(() => document.documentElement.dir)).toBe('ltr')
    await page.getByRole('button', { name: /^Language: / }).click()
    await page.getByRole('link', { name: 'Italiano' }).click()
    await page.waitForURL(/\/it(\/|$)/)
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('it')
  })

  test('scrolled state: stronger separation after scrolling, same height (no layout shift)', async ({ page }) => {
    await page.goto('/en/guides', { waitUntil: 'networkidle' })
    const header = page.locator('header').first()
    await expect(header).toHaveAttribute('data-scrolled', 'false')
    const h0 = (await header.boundingBox())!.height
    await page.evaluate(() => window.scrollTo(0, 400))
    await expect(header).toHaveAttribute('data-scrolled', 'true')
    expect((await header.boundingBox())!.height).toBe(h0)
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(header).toHaveAttribute('data-scrolled', 'false')
  })
})

test.describe('1024px', () => {
  test.use({ viewport: { width: 1024, height: 700 } })
  for (const loc of ['ar', 'en', 'it'] as const) {
    test(`${loc}: one-line header and the Explore panel fits the viewport`, async ({ page, baseURL, context }) => {
      await context.addCookies([userCookie(baseURL!)])
      await page.goto(`/${loc}`, { waitUntil: 'networkidle' })
      expect((await page.locator('header').first().boundingBox())!.height).toBeLessThanOrEqual(72)
      await page.locator('header nav').first().getByRole('button', { name: EXPLORE }).click()
      const box = (await page.getByTestId('explore-menu').boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(1024)
      expect(box.y + box.height).toBeLessThanOrEqual(700)
      await expectNoOverflow(page, `${loc} 1024 explore open`)
    })
  }
})

for (const w of [390, 430]) {
  test.describe(`mobile menu @ ${w}`, () => {
    test.use({ viewport: { width: w, height: 844 } })

    for (const loc of ['ar', 'en', 'it'] as const) {
      test(`${loc} signed in: opens, 44px targets, no overflow, axe clean, Escape returns focus, route change closes`, async ({ page, baseURL, context }) => {
        await context.addCookies([userCookie(baseURL!)])
        await page.goto(`/${loc}`, { waitUntil: 'networkidle' })
        await expectNoOverflow(page, `${loc} ${w} closed`)
        const btn = page.getByTestId('mobile-menu-button')
        await expect(btn).toHaveAttribute('aria-expanded', 'false')
        const bb = (await btn.boundingBox())!
        expect(bb.width).toBeGreaterThanOrEqual(44)
        expect(bb.height).toBeGreaterThanOrEqual(44)
        await btn.click()
        await expect(btn).toHaveAttribute('aria-expanded', 'true')
        const menu = page.getByTestId('mobile-menu')
        await expect(menu).toBeVisible()
        await settle(page)
        await expectNoOverflow(page, `${loc} ${w} open`)
        // priority order: Explore groups, Ask EXPA, My Italy, account, language
        const groups = menu.locator('button[aria-expanded]')
        expect(await groups.count()).toBe(4)
        await groups.first().click()
        await expect(groups.first()).toHaveAttribute('aria-expanded', 'true')
        for (const el of await menu.locator('a:visible, button:visible').all()) {
          const b = (await el.boundingBox())!
          if (b.height > 0) expect(b.height, `${loc} touch target ${await el.innerText()}`).toBeGreaterThanOrEqual(43.5)
        }
        const order = await menu.locator('a[href$="/ask"], a[href$="/dashboard"], a[href$="/profile"]').evaluateAll(els => els.map(e => e.getAttribute('href')!.split('/').pop()))
        expect(order).toEqual(['ask', 'dashboard', 'profile'])
        await expectNoAxeViolations(page, `${loc} ${w} mobile menu open`)
        expect(await page.evaluate(() => document.documentElement.style.overflow), 'background scroll locked').toBe('hidden')
        await page.keyboard.press('Escape')
        await expect(btn).toHaveAttribute('aria-expanded', 'false')
        await expect(btn).toBeFocused()
        expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
        await btn.click()
        await menu.locator('a[href$="/ask"]').click()
        await page.waitForURL(/\/ask$/)
        await expect(btn).toHaveAttribute('aria-expanded', 'false')
      })
    }

    test('guest: Sign in / Create account inside the menu and outside click closes', async ({ page }) => {
      await page.goto('/en', { waitUntil: 'networkidle' })
      const btn = page.getByTestId('mobile-menu-button')
      await btn.click()
      const menu = page.getByTestId('mobile-menu')
      await expect(menu.getByRole('link', { name: 'Create account' })).toBeVisible()
      await expect(menu.getByRole('link', { name: 'Sign in' })).toBeVisible()
      await expect(menu.locator('a[href$="/dashboard"]')).toHaveCount(0)
      await page.mouse.click(w / 2, 30) // empty header space, outside the menu
      await expect(btn).toHaveAttribute('aria-expanded', 'false')
    })

    test('the bottom navigation is unchanged', async ({ page }) => {
      await page.goto('/en', { waitUntil: 'networkidle' })
      const bottom = page.locator('nav.fixed').filter({ has: page.getByRole('link', { name: 'Tasks' }) })
      await expect(bottom.getByRole('link')).toHaveCount(5)
    })
  })
}

test.describe('no horizontal overflow', () => {
  for (const w of [390, 430, 768, 1024, 1280, 1440]) {
    test(`${w}px in ar, en, it (guest)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 })
      for (const loc of ['ar', 'en', 'it']) {
        await page.goto(`/${loc}`, { waitUntil: 'networkidle' })
        await expectNoOverflow(page, `${loc} ${w}`)
      }
    })
  }
})
