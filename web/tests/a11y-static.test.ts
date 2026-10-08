import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { nextTrapIndex } from '../utils/focus'
import { contentLang } from '../utils/locale'

const root = join(__dirname, '..')
const walk = (p: string): string[] => {
  const full = join(root, p)
  if (!statSync(full, { throwIfNoEntry: false })) return []
  return statSync(full).isFile() ? [full] : readdirSync(full).flatMap(n => walk(join(p, n)))
}
const vue = ['components', 'pages', 'layouts', 'app.vue', 'error.vue'].flatMap(walk).filter(f => f.endsWith('.vue'))
const rel = (f: string) => f.replace(`${root}/`, '')

describe('focus trap logic', () => {
  it('wraps forwards and backwards and handles empty/unknown focus', () => {
    expect(nextTrapIndex(2, 3, false)).toBe(0)
    expect(nextTrapIndex(0, 3, true)).toBe(2)
    expect(nextTrapIndex(1, 3, false)).toBe(2)
    expect(nextTrapIndex(1, 3, true)).toBe(0)
    expect(nextTrapIndex(-1, 3, false)).toBe(0)
    expect(nextTrapIndex(-1, 3, true)).toBe(2)
    expect(nextTrapIndex(0, 0, false)).toBe(-1)
  })
})

describe('content language attributes', () => {
  it('marks only fallback content', () => {
    expect(contentLang({ fallback: true, locale: 'en' })).toEqual({ lang: 'en', dir: 'ltr' })
    expect(contentLang({ fallback: true, locale: 'ar' })).toEqual({ lang: 'ar', dir: 'rtl' })
    expect(contentLang({ fallback: false, locale: 'en' })).toEqual({})
    expect(contentLang(null)).toEqual({})
  })
})

describe('static accessibility rules', () => {
  it('uses no positive tabindex', () => {
    const hits = vue.filter(f => /tabindex="[1-9]/.test(readFileSync(f, 'utf8'))).map(rel)
    expect(hits).toEqual([])
  })
  it('every <img> has an alt attribute', () => {
    const hits: string[] = []
    for (const f of vue) for (const m of readFileSync(f, 'utf8').matchAll(/<img\b[^>]*>/g)) if (!/\balt=|:alt=/.test(m[0])) hits.push(rel(f))
    expect(hits).toEqual([])
  })
  it('every real <table> has a caption', () => {
    const hits = vue.filter((f) => { const s = readFileSync(f, 'utf8'); return /<table\b/.test(s) && !/<caption\b/.test(s) }).map(rel)
    expect(hits).toEqual([])
  })
  it('every scrollable table region is keyboard reachable and named', () => {
    const hits: string[] = []
    for (const f of vue) for (const m of readFileSync(f, 'utf8').matchAll(/<div[^>]*overflow-x-auto[^>]*>/g)) if (/<table/.test(readFileSync(f, 'utf8')) && !/role="region"/.test(m[0]) && /rounded/.test(m[0])) hits.push(`${rel(f)}: ${m[0].slice(0, 80)}`)
    expect(hits).toEqual([])
  })
  it('target=_blank links carry rel=noopener', () => {
    const hits: string[] = []
    for (const f of vue) for (const m of readFileSync(f, 'utf8').matchAll(/<(?:a|NuxtLink)\b[^>]*target="_blank"[^>]*>/g)) if (!/noopener/.test(m[0])) hits.push(rel(f))
    expect(hits).toEqual([])
  })
  it('does not remove the focus ring from interactive elements', () => {
    // `outline-none` is only allowed on programmatic focus targets (tabindex="-1") and the dialog panel.
    const hits: string[] = []
    for (const f of vue) readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (/outline-none/.test(line) && !/tabindex="-1"/.test(line) && !/focus-visible:ring/.test(line)) hits.push(`${rel(f)}:${i + 1}`)
    })
    expect(hits.filter(h => !h.startsWith('components/admin/Dialog.vue'))).toEqual([])
  })
})

describe('text/background utility pairs used in templates meet WCAG AA', () => {
  const css = readFileSync(join(root, 'assets/css/tokens.css'), 'utf8')
  const tok: Record<string, number[]> = { white: [255, 255, 255] }
  for (const m of css.matchAll(/--c-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) tok[m[1]!] = [+m[2]!, +m[3]!, +m[4]!]
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
  const lum = (r: number[]) => 0.2126 * lin(r[0]!) + 0.7152 * lin(r[1]!) + 0.0722 * lin(r[2]!)
  const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05) }
  const NAMES = 'canvas|surface|sunken|ink-soft|ink|muted|primary-strong|primary-soft|primary|on-primary|accent-strong|accent-soft|accent|on-accent|success-soft|warning-soft|danger-soft|info-soft|success|warning|danger|info|white'
  it('finds no sub-4.5:1 combination inside one class string', () => {
    const bad: string[] = []
    for (const f of vue) readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/class="([^"]*)"|:class="([^"]*)"/g)) {
        const s = m[1] ?? m[2] ?? ''
        // ternary branches are separate alternatives
        for (const part of s.split(/\?|:(?=\s*['"])|,/)) {
          const fg = [...part.matchAll(new RegExp(`(?<![\\w-])text-(${NAMES})(?![\\w-])`, 'g'))].map(x => x[1]!)
          const bg = [...part.matchAll(new RegExp(`(?<![\\w-])bg-(${NAMES})(?![\\w/-])`, 'g'))].map(x => x[1]!)
          for (const a of fg) for (const b of bg) if (tok[a] && tok[b] && ratio(tok[a], tok[b]) < 4.5) bad.push(`${rel(f)}:${i + 1} text-${a} on bg-${b}`)
        }
      }
    })
    expect(bad).toEqual([])
  })
})
