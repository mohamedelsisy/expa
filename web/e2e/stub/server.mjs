// Tiny stand-in for the Laravel API used only by the e2e suite (no backend needed).
// Usage: node e2e/stub/server.mjs [port]. Records the last X-Forwarded-For seen at GET /__last-ip.
import { createServer } from 'node:http'

const port = Number(process.argv[2] ?? process.env.STUB_PORT ?? 8791)
const meta = { locale: 'en' }
const ok = (data, m = {}) => ({ status: 200, body: { data, meta: { ...meta, ...m } } })
const notFound = { status: 404, body: { error: { code: 'not_found', message: 'Not found.' } } }
const src = { name: 'Questura di Milano', url: 'https://questure.poliziadistato.it', type: 'official', last_verified_at: '2026-09-01T00:00:00Z', freshness: 'fresh' }
const LONG = 'Documentazione necessaria per il rinnovo del permesso di soggiorno per lavoro subordinato'
const guide = (i) => ({ id: i, slug: `g-${i}`, category: 'immigration', category_label: 'Immigrazione', italian_term: 'Permesso di soggiorno', applies_to: 'national', region: null, city: null, title: `${LONG} ${i}`, summary: LONG, locale: 'en', fallback: false, available_locales: ['en'], source: src, updated_at: '2026-09-01T00:00:00Z' })
const page = (items) => ok(items, { page: 1, per_page: 12, total: items.length, last_page: 1 })
const admin = { id: 1, name: 'Admin', email: 'admin@example.test', locale: 'en', email_verified: true, created_at: null, roles: ['super_admin'], is_super_admin: true, permissions: [] }
const user = { id: 2, name: 'Mohamed', email: 'user@example.test', locale: 'en', email_verified: true, created_at: null, roles: [], is_super_admin: false, permissions: [] }
const plans = [
  { key: 'free', name: 'Free', description: 'The basics', price: { amount_minor: 0, currency: 'EUR', interval: 'none' }, features: { ai_daily_limit: 10, reminders_advanced: false, document_ai: false, human_credits: 0 } },
  { key: 'plus', name: 'Plus', description: 'More', price: { amount_minor: 599, currency: 'EUR', interval: 'month' }, features: { ai_daily_limit: 100, reminders_advanced: true, document_ai: false, human_credits: 0 } },
]
const purposes = { policy_version: '2026-01', purposes: [
  { key: 'terms', title: 'Terms of use', required: true, why: 'Needed to provide the service.', data: 'Account data.' },
  { key: 'privacy', title: 'Privacy policy', required: true, why: 'Needed to process your data.', data: 'Account data.' },
  { key: 'ai_assistant', title: 'Assistente intelligente e personalizzazione', required: false, why: 'Optional processing of profile data to personalise answers.', data: 'Profile.' },
] }

let lastIp = ''
const routes = {
  'GET health': () => ok({ status: 'ok' }),
  'GET guides': () => page([1, 2, 3].map(guide)),
  'GET guides/categories': () => ok([{ value: 'immigration', label: 'Immigrazione' }]),
  'GET cities': () => ok([{ id: 1, slug: 'milano', name: 'Milano', region: { id: 1, slug: 'lombardia', name: 'Lombardia' } }]),
  'GET privacy/purposes': () => ok(purposes),
  'GET legal/privacy': () => ok({ slug: 'privacy', title: 'Privacy policy', body: '# Data we process\n\nWe process **account data**.\n\n- Name\n- Email', version: '2026-01', published_at: '2026-01-01T00:00:00Z' }),
  'GET billing/plans': () => ok(plans),
  'GET study/meta': () => ok({ degree_levels: [{ value: 'bachelor', label: 'Laurea triennale' }], fields: [{ value: 'engineering', label: 'Ingegneria' }], languages: [{ value: 'en', label: 'English' }, { value: 'it', label: 'Italiano' }, { value: 'both', label: 'Both' }], verify_notice: 'Verify with the university.' }),
  'GET study/programs': () => page([]),
  'GET study/universities': () => page([]),
  'GET study/scholarships': () => page([]),
  'GET government/services': () => page([]),
  'GET jobs': () => page([]),
  'GET appointments/guides': () => page([]),
  'GET italian/lessons': () => page([]),
  'GET italian/levels': () => ok([]),
  'GET italian/meta': () => ok({}),
  'GET patente/categories': () => ok([]),
  'GET patente/topics': () => ok([]),
  'GET patente/rules': () => ok({}),
  'GET jobs/meta': () => ok({}),
  'GET profile/options': () => ok({ segment: [], residence_type: [], age_range: [], cefr_level: [], goals: [], onboarding_steps: [] }),
  'GET notifications': () => ok([], { unread: 0 }),
  'GET admin/users': () => page([{ id: 3, name: 'Giovanna Maria Rossi-Bianchi', email: 'giovanna.maria.rossi.bianchi@example.test', locale: 'it', status: 'active', email_verified: true, roles: ['content_manager'], last_login_at: null, created_at: '2026-01-01T00:00:00Z' }]),
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  const path = url.pathname.replace(/^\/api\/v1\//, '').replace(/^\//, '')
  const auth = req.headers.authorization ?? ''
  let out
  if (path === '__last-ip') out = { status: 200, body: { ip: lastIp } }
  else {
    lastIp = String(req.headers['x-forwarded-for'] ?? '')
    if (req.method === 'GET' && path === 'auth/me') out = auth === 'Bearer stub-admin' ? ok(admin) : auth === 'Bearer stub-user' ? ok(user) : { status: 401, body: { error: { code: 'unauthenticated', message: 'Unauthenticated.' } } }
    else if (req.method === 'GET' && path.startsWith('guides/g-')) out = ok({ ...guide(1), what_is: LONG, who_needs: null, where_to_apply: null, how_to_book: null, costs: null, processing_time: null, required_documents: [], steps: [], body: null })
    else if (req.method === 'GET' && path.startsWith('legal/')) out = routes['GET legal/privacy'] && path === 'legal/privacy' ? routes['GET legal/privacy']() : notFound
    else out = (routes[`${req.method} ${path}`] ?? (() => notFound))()
  }
  res.writeHead(out.status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(out.body))
}).listen(port, '127.0.0.1', () => console.log(`stub api on ${port}`))
