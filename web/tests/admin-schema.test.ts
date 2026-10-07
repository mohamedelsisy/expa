import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ar from '../i18n/locales/ar.json'
import en from '../i18n/locales/en.json'
import it_ from '../i18n/locales/it.json'
import { CONTENT_MODULES, ENUMS, moduleLabelKeys, moduleByKey } from '../utils/admin/modules'
import { ADMIN_NAV } from '../utils/admin/nav'

const has = (o: unknown, key: string) => key.split('.').reduce<unknown>((x, p) => (x && typeof x === 'object' ? (x as Record<string, unknown>)[p] : undefined), o) !== undefined

describe('module schemas', () => {
  it('declares every lifecycle module with a unique key', () => {
    expect(CONTENT_MODULES.map(m => m.key)).toEqual(['guides', 'government-services', 'government-offices', 'appointment-guides', 'italian-lessons', 'patente-categories', 'patente-topics', 'patente-questions', 'study-universities', 'study-programs', 'study-scholarships', 'legal-documents', 'articles', 'city-profiles', 'marketplace-providers', 'housing-rules', 'italian-vocabulary', 'italian-exercises'])
    expect(new Set(CONTENT_MODULES.map(m => m.key)).size).toBe(CONTENT_MODULES.length)
    expect(moduleByKey('nope')).toBeUndefined()
  })
  for (const m of CONTENT_MODULES) {
    it(`${m.key}: every label, help and enum label exists in ar, en and it`, () => {
      const missing: string[] = []
      for (const key of moduleLabelKeys(m)) for (const [loc, f] of [['ar', ar], ['en', en], ['it', it_]] as const) if (!has(f, key)) missing.push(`${loc}:${key}`)
      expect(missing).toEqual([])
    })
    it(`${m.key}: primary field is translatable, required to publish, and has a max length`, () => {
      const p = m.translatable.find(f => f.key === m.primary)
      expect(p?.requiredToPublish).toBe(true)
      expect(p?.max).toBe(m.primaryMax)
      for (const f of m.translatable) expect(f.max, f.key).toBeGreaterThan(0)
    })
    it(`${m.key}: enum fields point at known enums and filters are declared`, () => {
      for (const a of m.attributes) if (a.enum) expect(ENUMS[a.enum], a.key).toBeDefined()
      for (const f of m.filters) if (f.enum) expect(ENUMS[f.enum], f.key).toBeDefined()
    })
  }
  it('navigation labels exist in all locales', () => {
    const keys = ADMIN_NAV.flatMap(g => [g.label, ...g.items.map(i => i.label)])
    for (const k of keys) for (const f of [ar, en, it_]) expect(has(f, k), k).toBe(true)
  })
})

// Max lengths in the schema must equal the backend validation rules (backend/app/Http/Requests).
const REQ: Record<string, string> = {
  guides: 'GuideRequest', 'government-services': 'GovernmentServiceRequest', 'government-offices': 'GovernmentOfficeRequest', 'appointment-guides': 'AppointmentGuideRequest',
  'italian-lessons': 'ItalianLessonRequest', 'patente-categories': 'PatenteCategoryRequest', 'patente-topics': 'PatenteTopicRequest', 'patente-questions': 'PatenteQuestionRequest',
  'study-universities': 'UniversityRequest', 'study-programs': 'StudyProgramRequest', 'study-scholarships': 'ScholarshipRequest',
  'legal-documents': 'LegalDocumentRequest', articles: 'ArticleRequest', 'city-profiles': 'CityProfileRequest', 'marketplace-providers': 'ProviderRequest', 'housing-rules': 'HousingRuleRequest',
  'italian-vocabulary': 'ItalianVocabularyRequest', 'italian-exercises': 'ItalianExerciseRequest',
}
const dir = join(__dirname, '../../backend/app/Http/Requests')
describe.skipIf(!existsSync(dir))('max lengths match the backend rules', () => {
  for (const m of CONTENT_MODULES) {
    it(m.key, () => {
      if (m.key === 'legal-documents') {
        // The body limit is `config('legal.max_body_chars')`, not a literal in the request class.
        const cfg = readFileSync(join(__dirname, '../../backend/config/legal.php'), 'utf8')
        expect(m.translatable.find(f => f.key === 'body')?.max).toBe(Number(/'max_body_chars' => (\d+)/.exec(cfg)![1]))
        return
      }
      const php = readFileSync(join(dir, `${REQ[m.key]}.php`), 'utf8')
      // Guide-style loops: foreach (['summary', ...] as $f) { $rules[$f] = [... 'max:5000'] }
      const loop = /foreach \(\[([^\]]+)\] as \$f\) \{\s*\$rules\[\$f\] = \[[^\]]*'max:(\d+)'/.exec(php)
      const loopFields = loop ? [...loop[1]!.matchAll(/'(\w+)'/g)].map(x => x[1]!) : []
      const maxOf = (key: string): number | null => {
        if (loopFields.includes(key)) return Number(loop![2])
        const mm = new RegExp(`'${key}'\\s*=>\\s*\\[[^\\]]*'max:(\\d+)'`).exec(php)
        return mm ? Number(mm[1]) : null
      }
      for (const f of m.translatable) {
        if (f.key === m.primary) {
          const pm = /primaryMax\(\): int\s*\{\s*return (\d+);/.exec(php)
          expect(f.max, `${f.key} (primary)`).toBe(pm ? Number(pm[1]) : 255)
        } else if (f.type === 'text' || f.type === 'textarea') {
          expect(f.max, f.key).toBe(maxOf(f.key))
        } else if (f.type === 'list') {
          expect(f.max, f.key).toBe(Number(new RegExp(`'${f.key}\\.\\*'\\s*=>\\s*\\[[^\\]]*'max:(\\d+)'`).exec(php)![1]))
          expect(f.maxItems, f.key).toBe(maxOf(f.key) ?? Number(new RegExp(`'${f.key}'\\s*=>\\s*\\[[^\\]]*'max:(\\d+)'`).exec(php)![1]))
        } else if (f.type === 'steps') {
          expect(f.max).toBe(Number(/'steps\.\*\.text'\s*=>\s*\[[^\]]*'max:(\d+)'/.exec(php)![1]))
          expect(f.titleMax).toBe(Number(/'steps\.\*\.title'\s*=>\s*\[[^\]]*'max:(\d+)'/.exec(php)![1]))
          expect(f.maxItems).toBe(Number(/'steps'\s*=>\s*\[[^\]]*'max:(\d+)'/.exec(php)![1]))
        } else {
          for (const i of f.itemFields ?? []) expect(i.max, i.key).toBe(Number(new RegExp(`'items\\.\\*\\.${i.key}'\\s*=>\\s*\\[[^\\]]*'max:(\\d+)'`).exec(php)![1]))
          expect(f.maxItems).toBe(Number(/'items'\s*=>\s*\[[^\]]*'max:(\d+)'/.exec(php)![1]))
        }
      }
    })
  }
})

describe('endpoints', () => {
  it('live below admin/ and (when the backend is present) match the registered routes and permission prefixes', () => {
    for (const m of CONTENT_MODULES) expect(m.endpoint.startsWith('admin/'), m.key).toBe(true)
    const routes = join(__dirname, '../../backend/routes/api.php')
    if (!existsSync(routes)) return
    const php = readFileSync(routes, 'utf8')
    const modulesDir = join(__dirname, '../../backend/routes/modules')
    const moduleRoutes = existsSync(modulesDir) ? readdirSync(modulesDir).map(f => readFileSync(join(modulesDir, f), 'utf8')).join('\n') : ''
    for (const m of CONTENT_MODULES) {
      const uri = m.endpoint.replace(/^admin\//, '')
      if (php.includes(`$contentAdmin('${uri}', `)) {
        expect(php, m.key).toMatch(new RegExp(`\\$contentAdmin\\('${uri}', \\w+::class, '${m.permission}'\\)`))
      } else {
        // Newer modules register their routes in routes/modules/*.php with their own `can:<prefix>.view` gate.
        expect(moduleRoutes, m.key).toContain(uri)
        expect(moduleRoutes, m.key).toMatch(new RegExp(`can:${m.permission}\\.view|'${uri}', \\w+::class, '${m.permission}'`))
      }
    }
  })
})
