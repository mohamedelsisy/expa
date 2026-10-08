import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export const LOCALES = ['ar', 'en', 'it'] as const
export const VIEWPORTS = [{ name: '390', width: 390, height: 844 }, { name: '1280', width: 1280, height: 800 }] as const
export const PAGES = ['', '/login', '/register', '/guides', '/ask', '/privacy', '/pricing', '/housing', '/articles', '/articles/a-1', '/cities', '/cities/milano', '/services', '/services/p-1', '/learn-italian/practice', '/learn-italian/vocabulary', '/patente/glossary', '/guides/g-1?city=milano', '/healthcare', '/money', '/business', '/family', '/travel', '/money/net-salary', '/travel/requirements', '/patente/topics/segnali', '/daily-life', '/about'] as const

export async function expectNoOverflow(page: Page, label: string) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(o.sw, `${label}: horizontal overflow (scrollWidth ${o.sw} > ${o.iw})`).toBeLessThanOrEqual(o.iw)
}

export async function expectNoAxeViolations(page: Page, label: string) {
  const r = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
  const summary = r.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`)
  expect(summary, `${label}: axe violations`).toEqual([])
}

export const adminCookie = (baseURL: string) => ({ name: 'expa_token', value: 'stub-admin', url: baseURL })
export const userCookie = (baseURL: string) => ({ name: 'expa_token', value: 'stub-user', url: baseURL })

/** goto that tolerates a client-side redirect aborting the first navigation (guest -> login). */
export async function go(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: 'networkidle' })
  } catch {
    await page.goto(url, { waitUntil: 'networkidle' })
  }
}
