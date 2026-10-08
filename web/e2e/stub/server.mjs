// Tiny stand-in for the Laravel API used only by the e2e suite (no backend needed).
// Usage: node e2e/stub/server.mjs [port]. Records the last X-Forwarded-For seen at GET /__last-ip.
import { createServer } from 'node:http'
import { adminJourney, journey } from './journey.mjs'
import { ra } from './ra.mjs'
import { twoFactor } from './twofactor.mjs'

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

const article = (i) => ({ id: i, slug: `a-${i}`, category: 'housing', category_label: 'Casa', title: `Come cercare casa a Milano senza sorprese ${i}`, excerpt: LONG, author_name: 'Redazione EXPA', cover_image_url: null, reading_minutes: 4, city: null, region: null, locale: 'en', fallback: false, available_locales: ['en'], published_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-02T00:00:00Z', content_type: 'editorial', source: null })
const provider = (i) => ({ id: i, slug: `p-${i}`, category: 'translator', category_label: 'Traduttore', display_name: `Studio di traduzione giurata Rossi e Associati ${i}`, headline: LONG, city: { id: 1, slug: 'milano', name: 'Milano' }, region: null, serves_online: true, languages: ['ar', 'it'], verification: { status: 'verified', label: 'Verified by EXPA staff', verified_at: '2026-08-01', valid_until: '2027-08-01' }, rating: { average: 4.5, count: 2 }, locale: 'en', fallback: false, source_type: 'third_party', official: false, notice: 'Independent third-party provider. EXPA does not endorse it.' })
const blockInfo = { key: 'transport', label: 'Transport', title: 'Metro e tram', body: '## Biglietti\n\nBuy a ticket **before** boarding.\n\n- Metro\n- Tram', locale: 'en', fallback: false, info_type: 'general_guidance', info_label: 'General guidance', source: null }
const cityProfile = { slug: 'milano', name: 'Milano', region: { slug: 'lombardia', name: 'Lombardia' }, headline: 'Vivere a Milano', summary: LONG, seo_description: LONG, locale: 'en', fallback: false, available_locales: ['en'], updated_at: '2026-09-01T00:00:00Z' }
const vocab = { slug: 'permesso', lemma: 'permesso di soggiorno', part_of_speech: 'noun', level: 'a1', level_label: 'A1', category: 'immigration_office', category_label: 'Immigration office', gloss: 'residence permit', example_it: 'Devo rinnovare il permesso.', example_gloss: 'I must renew the permit.', locale: 'en', fallback: false, audio: null, progress: null, reviewed: false, reviewed_at: null, review_notice: 'Not reviewed by a teacher yet.' }
const exercise = { slug: 'ex-1', type: 'multiple_choice', type_label: 'Multiple choice', level: 'a1', level_label: 'A1', scenario: 'comune', scenario_label: 'Comune', vocabulary: null, prompt: 'Scegli la parola giusta', locale: 'en', fallback: false, audio: null, form: { stem: 'Ho bisogno del ___', choices: [{ index: 0, text: 'permesso' }, { index: 1, text: 'gatto' }] }, reviewed: true, reviewed_at: '2026-09-01T00:00:00Z', review_notice: null }
// Mutable state for the authenticated flows (reset through POST /__reset).
const state = { consents: { housing_analysis: false, document_analysis: false }, analytics: [], guideConsent: null }
const consentsPayload = () => ({ policy_version: '2026-01', consents: Object.fromEntries(Object.entries(state.consents).map(([k, g]) => [k, { granted: g, decided: g }])) })
const housingResult = { language: 'it', facts: { rent_monthly: 700, utilities: 'excluded', contract_keywords: ['4+4'], cash_payment_mentioned: true }, evidence: {}, red_flags: [{ id: 'cash', severity: 'warning', title: 'Cash payment mentioned', explanation: 'Ask for a traceable payment method.', basis: 'general_guidance', source: null }], questions: [{ id: 'reg', severity: 'info', title: 'Registration', explanation: null, basis: 'general_guidance', source: null, question: 'Will the contract be registered?' }], could_not_detect: [{ key: 'notice_period_mentioned', label: 'Notice period' }], cost: { currency: 'EUR', monthly_total: 700, components: [{ key: 'rent', amount: 700, source: 'text' }], one_time: [{ key: 'deposit', amount: 1400, source: 'text', derived: true }], assumptions: [{ code: 'utilities_not_counted_excluded', text: 'Utilities are NOT counted.' }] }, confidence: 'medium', notes: [], explanation: null, disclaimer: 'Automatic general check, not legal advice.', persisted: false, saved_id: null, usage: { remaining: 4 } }
const explainResult = { classification: { type: 'comune_letter', type_label: 'Letter from the Comune', confidence: 0.8 }, summary: 'You are asked to pay a local tax.', label: 'ai_explanation', label_text: 'AI explanation', key_dates: [{ label: 'Pay by', label_key: 'deadline', date: null, text: 'entro il 18 novembre', year_missing: true, past: false }], suggested_actions: [{ type: 'reminder', label: 'Track this in My documents', target: 'my-documents' }], language: 'it', disclaimer: 'General explanation, check with the office.', sources: [], degraded: false, persisted: false, usage: { remaining: 3 } }
let lastIp = ''
const probeIps = {} // ip_probe=<id> requests record their own forwarded IP so parallel workers cannot overwrite it
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
  'GET articles': () => page([1, 2].map(article)),
  'GET articles/categories': () => ok([{ value: 'housing', label: 'Casa' }]),
  'GET city-profiles': () => page([cityProfile]),
  'GET providers/meta': () => ok({ categories: [{ value: 'translator', label: 'Traduttore' }], notice: 'Providers are independent third parties. EXPA does not endorse them.', list_unverified: false, sorts: ['relevance', 'rating', '-rating', 'name'] }),
  'GET providers': () => page([1, 2].map(provider)),
  'GET italian/scenarios': () => ok([{ value: 'comune', label: 'Comune', lessons: 1, vocabulary: 1, exercises: 1 }]),
  'GET italian/vocabulary': () => page([vocab]),
  'GET italian/exercises': () => page([exercise]),
  'GET patente/glossary': () => ok([{ ...vocab, slug: 'precedenza', lemma: 'precedenza', gloss: 'right of way', category: 'patente', category_label: 'Driving licence', reviewed: true, review_notice: null }]),
  'GET profile/consents': () => ok(consentsPayload()),
  'GET housing/usage': () => ok({ limit: 5, remaining: 5, max_chars: 12000, resets_at: '2026-10-08T00:00:00Z' }),
  'GET housing/checks': () => ok([]),
  'GET documents/explain/usage': () => ok({ limit: 5, remaining: 5, ocr_available: true, max_file_kb: 8192, max_text_chars: 15000 }),
  'GET appointments/guides/ag-1': () => ok({ id: 1, slug: 'ag-1', office_type: 'questura', office_type_label: 'Questura', title: 'Permesso di soggiorno', summary: LONG, booking: { method: 'online', method_label: 'Online', url: 'https://www.poliziadistato.it', booked_by_expa: false, notice: 'EXPA does not book for you.' }, locale: 'en', fallback: false, source: src, updated_at: '2026-09-01T00:00:00Z', steps: [], tips: null, cautions: null }),
  'GET profile/options': () => ok({ segment: [], residence_type: [], age_range: [], cefr_level: [], goals: [], onboarding_steps: [] }),
  'GET notifications': () => ok([], { unread: 0 }),
  'GET admin/users': () => page([{ id: 3, name: 'Giovanna Maria Rossi-Bianchi', email: 'giovanna.maria.rossi.bianchi@example.test', locale: 'it', status: 'active', email_verified: true, roles: ['content_manager'], last_login_at: null, created_at: '2026-01-01T00:00:00Z' }]),
}

createServer((req, res) => {
  const chunks = []
  req.on('data', c => chunks.push(c))
  req.on('end', () => handle(req, res, Buffer.concat(chunks)))
}).listen(port, '127.0.0.1', () => console.log(`stub api on ${port}`))

function handle(req, res, raw) {
  const url = new URL(req.url, 'http://x')
  const path = url.pathname.replace(/^\/api\/v1\//, '').replace(/^\//, '')
  const auth = req.headers.authorization ?? ''
  let out
  const ct = String(req.headers['content-type'] ?? '')
  let json = null
  if (/json/.test(ct) && raw.length) { try { json = JSON.parse(raw.toString()) } catch { json = null } }
  const jr = twoFactor(req.method, path, json, auth) ?? journey(req.method, path, json, auth) ?? ra(req.method, path, json, auth, url) ?? adminJourney(req.method, path, json, auth, url)
  if (jr) out = jr
  else if (path === '__last-ip') out = { status: 200, body: { ip: url.searchParams.get('probe') ? probeIps[url.searchParams.get('probe')] ?? '' : lastIp } }
  else if (path === '__state') out = { status: 200, body: state }
  else if (path === '__reset') { state.consents = { housing_analysis: false, document_analysis: false }; state.analytics = []; state.guideConsent = null; out = { status: 200, body: {} } }
  else if (req.method === 'PUT' && path === 'profile/consents') { for (const [k, v] of Object.entries(json?.consents ?? {})) state.consents[k] = !!v; out = ok(consentsPayload()) }
  else if (req.method === 'POST' && path === 'housing/check') out = !state.consents.housing_analysis ? { status: 403, body: { error: { code: 'consent_required', message: 'Consent required.', details: { purpose: ['housing_analysis'] } } } } : ok(housingResult)
  else if (req.method === 'POST' && path === 'documents/explain') {
    if (!state.consents.document_analysis) out = { status: 403, body: { error: { code: 'consent_required', message: 'Consent required.', details: { purpose: ['document_analysis'] } } } }
    else if (/multipart/.test(ct)) out = { status: 422, body: { error: { code: 'ocr_failed', message: 'The text could not be read.', details: { fallback: ['text'] } } } }
    else out = ok(explainResult)
  }
  else if (req.method === 'POST' && path === 'providers/p-1/leads') out = json?.consent_share_contact === true ? { status: 201, body: { data: { id: 1, status: 'new', request_type: 'contact', created_at: '2026-10-01T00:00:00Z', message: json.message, notice: 'Your request was sent. This is not a booking.' }, meta } } : { status: 422, body: { error: { code: 'validation_failed', message: 'Invalid.', details: { consent_share_contact: ['Required.'] } } } }
  else if (req.method === 'POST' && path === 'auth/register') out = { status: 422, body: { error: { code: 'validation_failed', message: 'The given data was invalid.', details: { name: ['The name field is required.'], email: ['The email field is required.'], password: ['The password field is required.'] } } } }
  else if (req.method === 'POST' && path === 'analytics/events') { state.analytics.push({ ...json, consent: req.headers['x-analytics-consent'] ?? null, client: req.headers['x-client'] ?? null }); out = { status: 204, body: null } }
  else {
    if (req.method === 'GET' && path.startsWith('guides/g-')) state.guideConsent = req.headers['x-analytics-consent'] ?? null
    lastIp = String(req.headers['x-forwarded-for'] ?? '')
    if (url.searchParams.get('ip_probe')) probeIps[url.searchParams.get('ip_probe')] = lastIp
    if (req.method === 'GET' && path === 'auth/me') out = auth === 'Bearer stub-admin' ? ok(admin) : auth === 'Bearer stub-user' ? ok(user) : { status: 401, body: { error: { code: 'unauthenticated', message: 'Unauthenticated.' } } }
    else if (req.method === 'GET' && /^guides\/g-\d+\/local-info$/.test(path)) out = ok({ guide: 'g-1', city: url.searchParams.get('city'), block: url.searchParams.get('city') === 'milano' ? blockInfo : null })
    else if (req.method === 'GET' && /^articles\/a-\d+$/.test(path)) out = ok({ ...article(1), body: '## Titolo\n\nTesto **importante** con [link](https://www.example.it).\n\n- uno\n- due', tags: ['casa'], seo: { title: 'Casa', description: LONG, canonical_path: '/articles/a-1', alternates: ['en'] }, related_guides: [], related_articles: [], disclaimer: 'Editorial content, not official information.' })
    else if (req.method === 'GET' && path === 'cities/milano') out = ok({ ...cityProfile, blocks: [blockInfo, { ...blockInfo, key: 'healthcare', label: 'Healthcare', title: 'Medico di base', info_type: 'official_info', info_label: 'Official information', source: src }], guides: [guide(1)], articles: [article(1)], offices_count: 2, disclaimer: 'General information about the city.' })
    else if (req.method === 'GET' && /^providers\/p-\d+$/.test(path)) out = ok({ ...provider(1), description: LONG, availability_note: null, areas: [], services: [{ name: 'Traduzione giurata', description: null, price_from_eur: 40 }], contact: { email: 'studio@example.test' }, can_request_contact: true, updated_at: '2026-09-01T00:00:00Z' })
    else if (req.method === 'GET' && /^providers\/p-\d+\/reviews$/.test(path)) out = page([{ id: 1, rating: 5, body: 'Veloci e precisi nella traduzione dei documenti.', locale: 'it', created_at: '2026-09-01', reply: null, label: 'User review, moderated' }])
    else if (req.method === 'GET' && path.startsWith('guides/g-')) out = ok({ ...guide(1), what_is: LONG, who_needs: null, where_to_apply: null, how_to_book: null, costs: null, processing_time: null, required_documents: [], steps: [], body: null })
    else if (req.method === 'GET' && path.startsWith('legal/')) out = routes['GET legal/privacy'] && path === 'legal/privacy' ? routes['GET legal/privacy']() : notFound
    else out = (routes[`${req.method} ${path}`] ?? (() => notFound))()
  }
  res.writeHead(out.status, { 'content-type': 'application/json', ...(out.headers ?? {}) })
  res.end(out.status === 204 ? undefined : JSON.stringify(out.body))
}
