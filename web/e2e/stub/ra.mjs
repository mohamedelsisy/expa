// Stateless stub for the RA-pass endpoints (recommendations, net salary, travel, Patente Teacher). Test fixtures only.
const meta = { locale: 'en' }
const ok = (data, m = {}) => ({ status: 200, body: { data, meta: { ...meta, ...m } } })
const fail = (status, code, message) => ({ status, body: { error: { code, message } } })
const src = { name: 'Agenzia delle Entrate', url: 'https://www.agenziaentrate.gov.it', type: 'official', last_verified_at: '2026-09-01T00:00:00Z', freshness: 'fresh' }
let recsOff = false
let aiLeft = 3

const recs = () => ({
  personalization: { enabled: !recsOff },
  guides: [{ type: 'guide', slug: 'g-1', title: 'Codice fiscale', route: 'guides/g-1', reason: { code: 'setup_task', text: 'Open item in your setup checklist.' } }],
  lessons: [{ type: 'lesson', slug: 'al-comune', title: 'Al Comune', route: 'learn-italian/lessons/al-comune', reason: { code: 'start', text: 'A good first lesson.' } }],
  services: recsOff ? [] : [{ type: 'service', slug: 'p-1', title: 'Studio Rossi', route: 'providers/p-1', label: 'third_party', verification: 'verified', reason: { code: 'goal', text: 'Matches your goal.' } }],
  reminders: [{ type: 'reminder', document_id: 12, title: 'Residence permit', route: 'my-documents/12', reason: { code: 'missing_expiry', text: 'No expiry date saved yet.' } }],
})

export function ra(method, path, json, auth, url) {
  if (path === '__ra') { recsOff = url.searchParams.get('off') === '1'; aiLeft = Number(url.searchParams.get('left') ?? 3); return ok({}) }
  if (method === 'POST' && path === 'money/net-salary') {
    const y = json?.tax_year
    if (y === 2000) return ok({ available: false, reason: 'tables_not_published', message: 'EXPA has not published tax tables yet.' })
    const g = Number(json?.gross_annual ?? 0)
    const months = json?.months ?? 12
    return ok({ available: true, tax_year: y ?? 2026, estimate: { gross_annual: g, contributions: g * 0.1, deduction: 1000, taxable_income: g * 0.9 - 1000, income_tax: g * 0.2, brackets: [{ from: 0, to: 28000, rate: 23, taxable: 28000, tax: 6440 }, { from: 28000, to: null, rate: 35, taxable: 1000, tax: 350 }], net_annual: g * 0.7, months, net_monthly: (g * 0.7) / months }, table: { name: 'Test table', source: { ...src, freshness: y === 2001 ? 'stale' : 'fresh' } }, disclaimer: 'Estimate only. Not tax advice.' })
  }
  if (method === 'GET' && path === 'countries') return ok([{ code: 'EG', name: 'Egypt' }, { code: 'FR', name: 'France' }, { code: 'IT', name: 'Italy' }, { code: 'MA', name: 'Morocco' }])
  if (method === 'GET' && path === 'travel/requirements') {
    const n = url.searchParams.get('nationality'); const d = url.searchParams.get('destination')
    const base = { nationality: n, destination: d, residence_status: url.searchParams.get('residence_status'), disclaimer: 'Rules change. Check the official source before you travel.' }
    if (n === 'EG' && d === 'FR') return ok({ ...base, available: true, message: null, items: [{ slug: 'eg-fr', nationality: 'EG', residence_status: 'any', title: 'Schengen visa rules', summary: 'Summary of the rule.', requirements: 'Valid passport\nVisa application', notes: null, source: src }] })
    return ok({ ...base, available: false, message: 'EXPA has no verified travel information for this combination.', items: [] })
  }
  if (auth === 'Bearer stub-admin' && method === 'GET') {
    if (path === 'admin/job-sources') return ok([{ id: 1, name: 'Feed A', active: true, last_status: 'ok', consecutive_failures: 0 }, { id: 2, name: 'Feed B', active: false, last_status: 'failed', consecutive_failures: 2 }])
    if (/^admin\/(guides|government\/|appointments\/guides|italian\/|patente\/(categories|topics|questions)|study\/|legal|articles|city-profiles|marketplace\/providers|housing\/rules|money\/tax-tables|travel\/requirements)/.test(path)) {
      const st = url.searchParams.get('filter[status]'); const stale = url.searchParams.get('filter[stale]')
      const total = st === 'published' ? (stale ? 1 : 3) : st === 'draft' ? 2 : 5
      return ok([], { page: 1, per_page: 1, total, last_page: Math.max(total, 1) })
    }
  }
  if (auth === 'Bearer stub-user') {
    if (method === 'GET' && path === 'recommendations') return ok(recs())
    if (method === 'GET' && path === 'ai/usage') return ok({ limit: 10, remaining: aiLeft })
    if (method === 'GET' && path === 'ai/conversations') return ok([], { page: 1, per_page: 30, total: 0, last_page: 1 })
    if (method === 'GET' && path === 'dashboard') return ok({ greeting: { name: 'Mohamed' }, personalization: { enabled: !recsOff }, onboarding: { completed: true, required_complete: true, progress_percent: 100 }, score: { overall: 40, applicable_tasks: 5, done_tasks: 2, categories: [{ key: 'documents', label: 'Documents', done: 2, total: 3, percent: 67 }], how_calculated: 'Share of tasks done.', note: null }, next_actions: [] })
    if (method === 'POST' && path === 'ai/ask') {
      if (aiLeft <= 0) return fail(429, 'ai_limit_reached', 'Daily AI limit reached.')
      aiLeft -= 1
      const topic = json?.patente_topic
      const known = topic === 'segnali'
      return ok({ conversation_id: 5, usage: { remaining: aiLeft }, message: { id: 1, role: 'assistant', content: known ? 'A stop sign means you must stop completely [1].\n\nGlossary: precedenza = right of way.' : 'EXPA has no verified, licensed content for this item.', label: known ? 'ai_explanation' : 'general_guidance', label_text: null, sources: known ? [{ n: 1, title: 'Road signs', ref: { type: 'patente_topic', slug: 'segnali', route: 'patente/topics/segnali' }, source: src }] : [], actions: known ? [] : [{ type: 'route', target: 'patente', label: 'Open Patente' }], degraded: false, disclaimer: null, created_at: '2026-10-07T10:00:01Z' } })
    }
    if (method === 'GET' && path === 'patente/topics') return ok([{ slug: 'segnali', title: 'Road signs', summary: 'Signs.', locale: 'en', fallback: false, source: src, question_count: 2 }])
  }
  if (method === 'GET' && path === 'patente/topics/segnali') return ok({ slug: 'segnali', title: 'Road signs', summary: 'Signs and meanings.', body: 'A stop sign requires a full stop.', locale: 'en', fallback: false, source: src })
  return null
}
