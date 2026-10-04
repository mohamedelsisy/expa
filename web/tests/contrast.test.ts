import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(__dirname, '../assets/css/tokens.css'), 'utf8')
const tokens: Record<string, [number, number, number]> = {}
for (const m of css.matchAll(/--c-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) tokens[m[1]] = [+m[2], +m[3], +m[4]]

const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
export function contrast(a: number[], b: number[]) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// [foreground, background] pairs used by components for TEXT (>= 4.5:1)
const TEXT_PAIRS: [string, string][] = [
  ['ink', 'canvas'], ['ink', 'surface'], ['ink', 'sunken'], ['ink-soft', 'canvas'], ['ink-soft', 'surface'], ['ink-soft', 'sunken'],
  ['muted', 'canvas'], ['muted', 'surface'], ['muted', 'sunken'], ['muted', 'primary-soft'],
  ['on-primary', 'primary'], ['on-primary', 'primary-strong'], ['primary-strong', 'surface'], ['primary-strong', 'canvas'], ['primary-strong', 'primary-soft'],
  ['on-accent', 'accent'], ['accent-strong', 'surface'], ['accent-strong', 'canvas'], ['accent-strong', 'accent-soft'],
  ['success', 'success-soft'], ['success', 'surface'], ['warning', 'warning-soft'], ['warning', 'surface'],
  ['danger', 'danger-soft'], ['danger', 'surface'], ['danger', 'canvas'], ['info', 'info-soft'], ['info', 'surface'],
  ['surface', 'danger'], ['ink', 'success-soft'], ['ink', 'warning-soft'], ['ink', 'danger-soft'], ['ink', 'info-soft'], ['ink', 'primary-soft'],
  ['ink-soft', 'primary-soft'], ['danger', 'sunken'],
]
// Non-text UI parts need >= 3:1
const UI_PAIRS: [string, string][] = [['line-strong', 'surface'], ['accent', 'canvas'], ['primary', 'surface']]

describe('design tokens contrast (WCAG AA)', () => {
  it('parses the token file', () => expect(Object.keys(tokens).length).toBeGreaterThan(20))
  for (const [fg, bg] of TEXT_PAIRS) {
    it(`${fg} on ${bg} >= 4.5`, () => {
      expect(tokens[fg], fg).toBeTruthy()
      expect(tokens[bg], bg).toBeTruthy()
      expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5)
    })
  }
  for (const [fg, bg] of UI_PAIRS) {
    it(`${fg} vs ${bg} >= 3 (non-text)`, () => expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3))
  }
})
