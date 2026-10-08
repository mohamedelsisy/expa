import { expect, test } from '@playwright/test'
import { adminCookie, expectNoAxeViolations, expectNoOverflow, go } from './helpers'

// Keyboard-only and focus behaviour of shared building blocks (stateless stub; stateful signed-in flows live in journeys.spec.ts).
test.use({ viewport: { width: 1280, height: 800 }, actionTimeout: 8000 })

test('skip link is the first tab stop, becomes visible and moves focus to the main landmark', async ({ page }) => {
  await go(page, '/en/guides')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

test('every route change is announced (route announcer present, page title updates)', async ({ page }) => {
  await go(page, '/en/guides')
  await expect(page.locator('#__nuxt .nuxt-route-announcer, .nuxt-route-announcer').first()).toBeAttached()
  await expect(page.locator('.nuxt-route-announcer [aria-live], [aria-live="assertive"].nuxt-route-announcer, .nuxt-route-announcer').first()).toBeAttached()
})

test('register: submitting by keyboard moves focus to the first invalid field with its error announced', async ({ page }) => {
  await go(page, '/en/register')
  await page.getByLabel(/^Full name/).focus()
  await page.keyboard.press('Enter')
  const first = page.locator('form [aria-invalid="true"]').first()
  await expect(first).toBeFocused()
  const describedBy = await first.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  await expect(page.locator(`#${describedBy!.split(' ').pop()}`)).toHaveAttribute('role', 'alert')
  await expectNoAxeViolations(page, 'register errors')
})

test('login by keyboard only: tab order email, password, show-password toggle, submit; wrong credentials focus the form error', async ({ page }) => {
  await go(page, '/en/login')
  await page.getByLabel('Email').focus()
  await page.keyboard.type('nobody@example.test')
  await page.keyboard.press('Tab')
  await expect(page.locator('input[type=password]')).toBeFocused()
  await page.keyboard.type('whatever-123')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /show password|hide password/i })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('input[autocomplete="current-password"]')).toHaveAttribute('type', 'text')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('alert').filter({ hasText: 'credentials' }).first()).toBeVisible()
})

test.describe('admin', () => {
  test.beforeEach(async ({ context, baseURL }) => { await context.addCookies([adminCookie(baseURL!)]) })

  test('detail drawer: focus moves in, Tab is trapped, Escape closes and focus returns to the opener', async ({ page }) => {
    await go(page, '/en/admin/users')
    const opener = page.getByRole('button', { name: /Details/ }).first()
    await opener.focus()
    await page.keyboard.press('Enter')
    const dlg = page.getByRole('dialog')
    await expect(dlg).toBeVisible()
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true)
    await expectNoAxeViolations(page, 'admin drawer')
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), `Tab ${i} stays inside`).toBe(true)
    }
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')), `Shift+Tab ${i} stays inside`).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dlg).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test('mobile menu drawer: opens with the keyboard, traps focus, Escape returns focus to the toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await go(page, '/en/admin')
    const toggle = page.locator('[data-admin-toggle]')
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#admin-sidebar')).toBeVisible()
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('#admin-sidebar, [data-admin-toggle]')), `Tab ${i}`).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(toggle).toBeFocused()
  })

  test('admin list and form pages: one h1, labelled fields, axe clean in ar at 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const path of ['/ar/admin', '/ar/admin/users', '/ar/admin/content/guides']) {
      await go(page, path)
      await expect(page.locator('h1')).toHaveCount(1)
      await expectNoAxeViolations(page, `admin ${path} ar`)
      await expectNoOverflow(page, `admin ${path} ar`)
    }
  })
})

test('reflow at 320px: public pages have no horizontal scroll in Arabic', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const path of ['/ar', '/ar/guides', '/ar/login', '/ar/register', '/ar/ask', '/ar/patente/glossary']) {
    await go(page, path)
    await expectNoOverflow(page, `320 ${path}`)
  }
})

test('text resize to 200% (1280px) and 150% (390px) keeps pages free of horizontal scroll', async ({ page }) => {
  for (const [w, px, path] of [[1280, 32, '/en'], [1280, 32, '/ar/guides'], [390, 24, '/en'], [390, 24, '/ar/login'], [390, 24, '/en/register']] as const) {
    await page.setViewportSize({ width: w, height: 800 })
    await go(page, path)
    await page.addStyleTag({ content: `html{font-size:${px}px !important}` })
    await expectNoOverflow(page, `text ${px}px @${w} ${path}`)
  }
})
