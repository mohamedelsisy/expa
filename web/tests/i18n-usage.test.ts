import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import en from '../i18n/locales/en.json'

const root = join(__dirname, '..')
const walk = (p: string): string[] => {
  const full = join(root, p)
  if (!statSync(full, { throwIfNoEntry: false })) return []
  return statSync(full).isFile() ? [full] : readdirSync(full).flatMap(n => walk(join(p, n)))
}
const files = ['pages', 'components', 'layouts', 'composables', 'app.vue', 'error.vue'].flatMap(walk).filter(f => /\.(vue|ts)$/.test(f))
const has = (k: string) => k.split('.').reduce<unknown>((o, p) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[p] : undefined), en) !== undefined

describe('i18n key usage', () => {
  it('every literal t(\'key\') used in the source exists in the message files', () => {
    const missing: string[] = []
    for (const f of files) {
      for (const m of readFileSync(f, 'utf8').matchAll(/\bt\(\s*(['"`])([^'"`$]+)\1/g)) if (!has(m[2]!)) missing.push(`${f.replace(root, '')}: ${m[2]}`)
    }
    expect(missing).toEqual([])
  })
})
