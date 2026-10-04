import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
function walk(p: string): string[] {
  const full = join(root, p)
  if (!statSync(full, { throwIfNoEntry: false })) return []
  if (statSync(full).isFile()) return [full]
  return readdirSync(full).flatMap(n => walk(join(p, n)))
}
const files = ['components', 'pages', 'layouts', 'app.vue', 'error.vue'].flatMap(walk).filter(f => /\.(vue|ts)$/.test(f))

// ml-/mr-/pl-/pr-/left-/right-/text-left/text-right/border-l/border-r/rounded-l/rounded-r (with optional variants / negative)
const PHYSICAL = /(?<![\w-])-?(?:ml|mr|pl|pr|left|right)-(?:\d|\[|px|auto)|(?<![\w-])(?:text-left|text-right|border-l(?![\w])|border-r(?![\w])|border-l-|border-r-|rounded-l(?![\w])|rounded-r(?![\w])|rounded-l-|rounded-r-|rounded-tl|rounded-tr|rounded-bl|rounded-br|float-left|float-right)/

describe('source style rules', () => {
  it('scans some files', () => expect(files.length).toBeGreaterThan(20))
  it('uses no physical-direction Tailwind classes', () => {
    const hits: string[] = []
    for (const f of files) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const m = line.match(PHYSICAL)
        if (m) hits.push(`${f.replace(root, '')}:${i + 1} ${m[0]}`)
      })
    }
    expect(hits).toEqual([])
  })
  it('never uses v-html', () => {
    const hits = files.filter(f => /v-html|innerHTML\s*=/.test(readFileSync(f, 'utf8')))
    expect(hits).toEqual([])
  })
  it('has no localStorage token usage', () => {
    const all = [...files, ...walk('stores'), ...walk('composables'), ...walk('middleware')]
    expect(all.filter(f => /localStorage|sessionStorage/.test(readFileSync(f, 'utf8')))).toEqual([])
  })
})
