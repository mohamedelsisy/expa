// Stateful signed-in journeys for the stub API (auth, onboarding, dashboard, ask, documents, jobs, learn, patente, notifications).
// Only the routes below are handled; everything else falls through to server.mjs. State resets through POST /__journey_reset.
export const JOURNEY_EMAIL = 'journey@example.test'
export const JOURNEY_PASSWORD = 'Journey-Passw0rd!'
const TOKEN = 'stub-journey'
const meta = { locale: 'en' }
const ok = (data, m = {}, status = 200) => ({ status, body: { data, meta: { ...meta, ...m } } })
const page = (items) => ok(items, { page: 1, per_page: 12, total: items.length, last_page: 1 })
const fail = (status, code, message, details) => ({ status, body: { error: { code, message, ...(details ? { details } : {}) } } })
const user = { id: 9, name: 'Mohamed Journey', email: JOURNEY_EMAIL, locale: 'en', email_verified: true, created_at: '2026-09-01T00:00:00Z', roles: [], is_super_admin: false, permissions: [] }
const src = { name: 'Ministero dell\'Interno', url: 'https://www.interno.gov.it', type: 'official', last_verified_at: '2026-09-01T00:00:00Z', freshness: 'fresh' }
const STEPS = [
  { key: 'status', required: true, title: 'Your situation', why: 'To show the right guides.' },
  { key: 'nationality', required: false, title: 'Nationality', why: 'Some rules depend on it.' },
  { key: 'goals', required: false, title: 'Goals', why: 'To suggest next steps.' },
]
const opt = (...v) => v.map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }))
const options = { segment: opt('student', 'worker'), residence_type: opt('permit'), age_range: opt('18_25'), cefr_level: opt('a1', 'a2'), goals: opt('work', 'study'), onboarding_steps: STEPS }
const docTypes = [{ key: 'passport', name: 'Passport' }, { key: 'residence_permit', name: 'Residence permit' }]
const job = (id, saved) => ({ id, title: `Sviluppatore PHP Laravel ${id}`, company: 'Acme S.r.l.', location: 'Milano', city: { slug: 'milano', name: 'Milano' }, remote_mode: 'hybrid', remote_mode_label: 'Hybrid', employment_type: 'full_time', employment_type_label: 'Full time', category: 'it', category_label: 'IT', salary: { min: 30000, max: 40000, currency: 'EUR', period: 'year' }, italian_level: 'b1', english_level: 'b2', experience_years: 3, skills: ['PHP', 'Laravel'], visa_sponsorship: { stated: false, label: 'Visa sponsorship not stated' }, source: 'Example feed', published_at: '2026-09-20T00:00:00Z', expires_at: null, saved, match: { score: 87, confidence: 0.8, reasons: [{ key: 'skills', status: 'match', label: 'Skills', detail: null }, { key: 'italian', status: 'partial', label: 'Italian B1 preferred', detail: null }] } })
const lessons = [{ id: 1, slug: 'al-comune', level: 'a1', level_label: 'A1', type: 'conversation', type_label: 'Conversation', scenario: 'comune', scenario_label: 'Comune', duration_minutes: 10, title: 'Al Comune: chiedere un certificato', summary: 'Ask for a certificate at the town hall.', locale: 'en', fallback: false }]
const exam = (id, answered) => ({ id, mode: 'practice', finished: false, max_errors: null, deadline_at: null, questions: [{ id: 1, statement: 'At a stop sign you must always stop.', statement_it: 'Al segnale di stop bisogna sempre fermarsi.', locale: 'en' }, { id: 2, statement: 'You may park on a motorway.', statement_it: 'In autostrada si può parcheggiare.', locale: 'en' }] })

const finishedExam = () => ({ id: 1, mode: 'practice', correct: 1, errors: 1, total: 2, passed: null, timed_out: false, finished_at: '2026-10-07T10:00:00Z', max_errors: null, finished: true, review: [{ question_id: 1, statement: 'At a stop sign you must always stop.', statement_it: null, your_answer: true, correct_answer: true, correct: true, explanation: 'A stop sign always requires a full stop.' }, { question_id: 2, statement: 'You may park on a motorway.', statement_it: null, your_answer: true, correct_answer: false, correct: false, explanation: 'Parking is not allowed on the carriageway.' }] })

function fresh() {
  return {
    loggedIn: false,
    profile: { done: [], skipped: [], completed: false, consent: false, segment: null },
    consents: { document_storage: false },
    docs: [], nextDoc: 1,
    saved: new Set(), applyClicks: 0,
    lessonStatus: null,
    answers: {}, examFinished: false,
    notes: [
      { id: 'n-1', type: 'reminder', title: 'Residence permit expires in 74 days', body: 'Start preparing the renewal documents.', cta: { type: 'route', target: '/documents' }, read: false, created_at: '2026-10-01T08:00:00Z' },
      { id: 'n-2', type: 'system', title: 'Welcome to EXPA', body: null, cta: null, read: false, created_at: '2026-09-30T08:00:00Z' },
    ],
    aiCount: 0, convos: [],
    tokens: [{ id: 1, name: 'web', last_used_at: '2026-10-07T09:00:00Z', created_at: '2026-10-01T09:00:00Z', expires_at: null, current: true }, { id: 2, name: 'EXPA Android', last_used_at: '2026-10-05T09:00:00Z', created_at: '2026-09-20T09:00:00Z', expires_at: null, current: false }],
    paid: false, canceled: false, billingOn: false, blocks: [{ id: 5, blocked_at: '2026-10-02T10:00:00Z' }],
  }
}
let S = fresh()
const consents = () => ({ profile_personalization: { granted: S.profile.consent, decided: S.profile.consent }, document_storage: { granted: S.consents.document_storage, decided: S.consents.document_storage } })
const profileOnboarding = () => {
  const steps = STEPS.map(s => ({ key: s.key, required: s.required, status: S.profile.done.includes(s.key) ? 'answered' : S.profile.skipped.includes(s.key) ? 'skipped' : 'pending' }))
  const required_complete = steps.filter(s => s.required).every(s => s.status === 'answered')
  const answered = steps.filter(s => s.status !== 'pending').length
  return { steps, required_complete, completed: S.profile.completed, progress_percent: Math.round(100 * answered / steps.length) }
}
const profile = () => ({ user, city: null, segment: S.profile.segment, nationality: null, residence_type: null, age_range: null, italian_level: null, english_level: null, goals: [], onboarding: profileOnboarding() })
const docOut = (d) => ({ id: d.id, type: docTypes.find(t => t.key === d.type) ?? docTypes[0], label: d.label || null, display_name: d.label || (docTypes.find(t => t.key === d.type)?.name ?? ''), issue_date: d.issue_date ?? null, expiry_date: d.expiry_date ?? null, days_remaining: 74, status: d.expiry_date ? 'expiring_soon' : 'no_expiry', status_label: d.expiry_date ? 'Expiring soon' : 'No expiry', notes: d.notes ?? null, reminders_enabled: true, reminder_offsets: [90, 60, 30, 14, 7], upcoming_reminders: [], attachments: [], created_at: '2026-10-01T00:00:00Z' })
const score = () => ({ overall: S.docs.length ? 40 : 0, applicable_tasks: 5, done_tasks: S.docs.length ? 2 : 0, categories: [{ key: 'documents', label: 'Documents', done: S.docs.length ? 2 : 0, total: 3, percent: S.docs.length ? 67 : 0 }, { key: 'italian', label: 'Italian', done: 0, total: 2, percent: 0 }], how_calculated: 'Share of applicable setup tasks marked done.', note: null })

/** Returns {status, body} or null when this stub does not handle the request. */
export function journey(method, path, json, auth) {
  if (path === '__journey_reset') { S = fresh(); return ok({}) }
  if (path === '__journey_setup') { Object.assign(S, json ?? {}); return ok({}) }
  if (method === 'POST' && path === 'auth/login') {
    if (json?.email === JOURNEY_EMAIL && json?.password === JOURNEY_PASSWORD) { S.loggedIn = true; return ok({ user, token: TOKEN }) }
    if (json?.email === JOURNEY_EMAIL || json?.email === 'nobody@example.test') return fail(422, 'invalid_credentials', 'These credentials do not match our records.')
    return null
  }
  if (auth !== `Bearer ${TOKEN}`) return null
  if (!S.loggedIn) return fail(401, 'unauthenticated', 'Unauthenticated.')
  const m = (re) => path.match(re)
  if (method === 'POST' && path === 'auth/logout') { S.loggedIn = false; return { status: 204, body: null } }
  if (method === 'GET' && path === 'auth/me') return ok(user)
  // onboarding
  if (method === 'GET' && path === 'privacy/purposes') return ok({ policy_version: '2026-01', purposes: [{ key: 'terms', title: 'Terms of use', required: true, why: 'Needed.', data: 'Account data.' }, { key: 'profile_personalization', title: 'Personalizzazione del profilo', required: false, why: 'Optional use of profile details to personalise EXPA.', data: 'Profile answers.' }, { key: 'document_storage', title: 'Document tracker', required: false, why: 'Store document dates.', data: 'Document dates.' }] })
  if (method === 'GET' && path === 'profile/options') return ok(options)
  if (method === 'GET' && path === 'profile') return ok(profile())
  if (method === 'GET' && path === 'profile/consents') return ok({ policy_version: '2026-01', consents: consents() })
  if (method === 'PUT' && path === 'profile/consents') { for (const [k, v] of Object.entries(json?.consents ?? {})) { if (k === 'profile_personalization') S.profile.consent = !!v; else S.consents[k] = !!v } return ok({ policy_version: '2026-01', consents: consents() }) }
  if (method === 'PATCH' && path === 'profile') { S.profile.segment = json?.segment ?? S.profile.segment; if (json?.segment) S.profile.done.push('status'); if (json?.nationality) S.profile.done.push('nationality'); return ok(profile()) }
  if (method === 'POST' && path === 'profile/onboarding/skip') { S.profile.skipped.push(json?.step); return ok({}) }
  if (method === 'POST' && path === 'profile/onboarding/complete') {
    if (!profileOnboarding().required_complete) return fail(422, 'onboarding_incomplete', 'Please answer the required questions first.')
    S.profile.completed = true; return ok(profile())
  }
  // dashboard
  if (method === 'GET' && path === 'dashboard') return ok({ greeting: { name: 'Mohamed' }, personalization: { enabled: S.profile.consent }, onboarding: { completed: S.profile.completed, required_complete: profileOnboarding().required_complete, progress_percent: profileOnboarding().progress_percent }, score: score(), next_actions: [{ key: 'doc', type: 'document', priority: 1, title: 'Add your residence permit', description: 'Track its expiry date and get reminders.', cta: { type: 'route', target: '/documents/new' } }] })
  // ask
  if (method === 'GET' && path === 'ai/usage') return ok({ limit: 10, remaining: 10 - S.aiCount })
  if (method === 'GET' && path === 'ai/conversations') return page(S.convos)
  if (method === 'POST' && path === 'ai/ask') {
    S.aiCount += 1; S.convos = [{ id: 1, title: String(json?.message ?? '').slice(0, 40), updated_at: '2026-10-07T10:00:00Z' }]
    return ok({ conversation_id: 1, usage: { remaining: 10 - S.aiCount }, message: { id: S.aiCount, role: 'assistant', content: 'To renew your **permesso di soggiorno**, start with the kit from the post office.', label: 'general_guidance', label_text: 'General guidance', sources: [{ n: 1, title: 'Renewing a residence permit', ref: { type: 'guide', slug: 'g-1' }, source: src }], actions: [{ type: 'guide', target: 'g-1', label: 'Open the guide' }], degraded: false, disclaimer: 'This is general guidance, not legal advice.', created_at: '2026-10-07T10:00:01Z' } })
  }
  // documents
  if (method === 'GET' && path === 'document-types') return ok(docTypes)
  if (method === 'GET' && path === 'my-documents') return ok(S.docs.map(docOut), { page: 1, per_page: 20, total: S.docs.length, last_page: 1 })
  if (method === 'POST' && path === 'my-documents') {
    const d = { id: S.nextDoc++, type: json?.type ?? 'passport', label: json?.label, issue_date: json?.issue_date, expiry_date: json?.expiry_date, notes: json?.notes }
    S.docs.push(d); return ok(docOut(d), {}, 201)
  }
  let r
  if ((r = m(/^my-documents\/(\d+)$/))) {
    const d = S.docs.find(x => x.id === Number(r[1])); if (!d) return fail(404, 'not_found', 'Not found.')
    if (method === 'GET') return ok(docOut(d))
    if (method === 'DELETE') { S.docs = S.docs.filter(x => x !== d); return { status: 204, body: null } }
  }
  // jobs
  if (method === 'GET' && path === 'jobs/meta') return ok({ remote_modes: opt('remote', 'hybrid'), employment_types: opt('full_time'), categories: opt('it'), apply_notice: 'EXPA does not apply for you. You apply on the employer site.' })
  if (method === 'GET' && path === 'jobs') return page([1, 2].map(i => job(i, S.saved.has(i))))
  if (method === 'GET' && path === 'jobs/saved') return page([...S.saved].map(i => job(i, true)))
  if ((r = m(/^jobs\/(\d+)$/)) && method === 'GET') return ok({ ...job(Number(r[1]), S.saved.has(Number(r[1]))), description: 'Cerchiamo uno sviluppatore PHP con esperienza Laravel.' })
  if ((r = m(/^jobs\/(\d+)\/save$/))) { if (method === 'POST') S.saved.add(Number(r[1])); else S.saved.delete(Number(r[1])); return ok({ saved: method === 'POST' }) }
  if ((r = m(/^jobs\/(\d+)\/apply-click$/))) { S.applyClicks++; return ok({ apply_url: 'https://jobs.example.test/apply/1', notice: 'You are leaving EXPA to apply on the employer site.' }) }
  // learn italian
  if (method === 'GET' && path === 'italian/meta') return ok({ types: opt('conversation'), scenarios: opt('comune') })
  if (method === 'GET' && path === 'italian/daily') return ok({ level: 'a1', level_label: 'A1', slots: [{ slot: 1, type: 'conversation', type_label: 'Conversation', lesson: { slug: 'al-comune', level: 'a1', title: lessons[0].title, duration_minutes: 10 }, done_today: S.lessonStatus === 'completed' }], minutes: 10, done_today: S.lessonStatus === 'completed' ? 1 : 0, total: 1, streak: S.lessonStatus === 'completed' ? 1 : 0, practice: null })
  if (method === 'GET' && path === 'italian/progress') return ok({ levels: [{ level: 'a1', label: 'A1', total: 1, completed: S.lessonStatus === 'completed' ? 1 : 0, percent: S.lessonStatus === 'completed' ? 100 : 0 }], streak: S.lessonStatus === 'completed' ? 1 : 0, completed_today: S.lessonStatus === 'completed' })
  if (method === 'GET' && path === 'italian/lessons') return page(lessons.map(l => ({ ...l, progress: S.lessonStatus ? { status: S.lessonStatus, score: null } : null })))
  if (method === 'GET' && path === 'italian/lessons/al-comune') return ok({ ...lessons[0], progress: S.lessonStatus ? { status: S.lessonStatus, score: null } : null, body: '## Frasi utili\n\nBuongiorno, vorrei un **certificato di residenza**.', items: [{ id: 1, kind: 'phrase', it: 'Vorrei un certificato.', translation: 'I would like a certificate.' }] })
  if (method === 'POST' && path === 'italian/lessons/al-comune/progress') { S.lessonStatus = json?.status ?? 'completed'; return ok({ status: S.lessonStatus, streak: 1 }) }
  // patente
  if (method === 'GET' && path === 'patente/progress') return ok({ summary: { exams_taken: S.examFinished ? 1 : 0, exams_passed: 0, average_errors: null, recent_pass_rate: null, practice_sessions: S.examFinished ? 1 : 0 }, topics: [], rules: { questions: 30, max_errors: 3, minutes: 20, late_grace_seconds: 5 } })
  if (method === 'GET' && path === 'patente/categories') return ok([{ slug: 'b', title: 'Patente B', summary: 'Cars.', locale: 'en', fallback: false, source: src }])
  if (method === 'GET' && path === 'patente/topics') return ok([{ slug: 'segnali', title: 'Road signs', summary: 'Signs and meanings.', locale: 'en', fallback: false, source: src, question_count: 2 }])
  if (method === 'GET' && path === 'patente/rules') return ok({ questions: 30, max_errors: 3, minutes: 20, late_grace_seconds: 5, practice_max_questions: 40 })
  if (method === 'POST' && path === 'patente/exams') { S.examFinished = false; S.answers = {}; return ok(exam(1), {}, 201) }
  if (method === 'GET' && path === 'patente/exams') return page(S.examFinished ? [{ id: 1, mode: 'practice', correct: 1, errors: 1, total: 2, passed: null, timed_out: false, finished_at: '2026-10-07T10:00:00Z' }] : [])
  if ((r = m(/^patente\/exams\/(\d+)$/)) && method === 'GET') return ok(S.examFinished ? finishedExam() : exam(1))
  if (method === 'POST' && m(/^patente\/exams\/\d+\/check$/)) return ok({ question_id: json?.question_id, correct: json?.question_id === 1 ? json?.answer === true : json?.answer === false, correct_answer: json?.question_id === 1, explanation: 'A stop sign always requires a full stop.' })
  if (method === 'POST' && m(/^patente\/exams\/\d+\/answers$/)) { S.examFinished = true; return ok(finishedExam()) }
  // sessions, billing, community blocks
  if (method === 'GET' && path === 'auth/tokens') return ok(S.tokens.map(t => ({ ...t })))
  if ((r = m(/^auth\/tokens\/(\d+)$/)) && method === 'DELETE') { S.tokens = S.tokens.filter(t => t.id !== Number(r[1])); return { status: 204, body: null } }
  if (method === 'POST' && path === 'auth/logout-all') { S.tokens = []; S.loggedIn = false; return { status: 204, body: null } }
  if (method === 'GET' && path === 'billing/subscription') return ok({ plan: { key: S.paid ? 'plus' : 'free', name: S.paid ? 'Plus' : 'Free' }, status: S.paid ? 'active' : 'free', provider: null, current_period_end: S.paid ? '2026-11-07T00:00:00Z' : null, cancel_at_period_end: S.canceled, billing_available: S.billingOn })
  if (method === 'GET' && path === 'billing/invoices') return ok(S.paid ? [{ number: 'EXPA-2026-000001', total_minor: 599, currency: 'EUR', description: 'Plus, monthly', issued_at: '2026-10-07T00:00:00Z' }] : [])
  if (method === 'POST' && path === 'billing/cancel') { S.canceled = true; return ok({ cancel_at_period_end: true, access_until: '2026-11-07T00:00:00Z' }) }
  if (method === 'GET' && path === 'community/meta') return ok({ topics: [], notice: 'Community content is not verified.', limits: {}, sorts: ['recent'] })
  if (method === 'GET' && path === 'community/blocks') return ok(S.blocks.map(b => ({ ...b })))
  if ((r = m(/^community\/blocks\/(\d+)$/)) && method === 'DELETE') { S.blocks = S.blocks.filter(b => b.id !== Number(r[1])); return { status: 204, body: null } }
  if (method === 'GET' && path === 'community/questions') return page([])
  // notifications
  if (method === 'GET' && path === 'notifications') return ok(S.notes, { unread: S.notes.filter(n => !n.read).length })
  if ((r = m(/^notifications\/([\w-]+)\/read$/))) { const n = S.notes.find(x => x.id === r[1]); if (n) n.read = true; return ok({}) }
  if (method === 'POST' && path === 'notifications/read-all') { S.notes.forEach(n => { n.read = true }); return ok({}) }
  if ((r = m(/^notifications\/([\w-]+)$/)) && method === 'DELETE') { S.notes = S.notes.filter(n => n.id !== r[1]); return { status: 204, body: null } }
  return null
}

// ----------------------------------------------------------------------- admin (stub-admin, a super admin)
const A = { chunks: 3 }
export function adminJourney(method, path, json, auth, url) {
  if (auth === 'Bearer stub-admin' && method === 'GET' && path === 'guides' && url.searchParams.get('category') === 'travel') return page([])
  if (auth !== 'Bearer stub-admin') return null
  const row = (i, st) => ({ item_type: 'guide', item_id: i, item_slug: `g-${i}`, locale: 'en', title: `Permesso di soggiorno ${i}`, source_name: 'Questura di Milano', source_url: 'https://questure.poliziadistato.it', source_type: 'official', last_verified_at: st ? '2025-01-01T00:00:00Z' : '2026-09-01T00:00:00Z', chunks: 2 })
  if (method === 'GET' && path === 'admin/ai/knowledge') return ok([row(1, false), row(2, true)], { page: 1, per_page: 25, total: 2, last_page: 1, chunks_total: A.chunks, stale_after_days: 180 })
  if (method === 'POST' && path === 'admin/ai/knowledge/reindex') { A.chunks = 7; return ok({ chunks: 7 }) }
  if (method === 'GET' && path === 'admin/ai/conversations') return ok([{ id: 11, user_id: 2, locale: 'ar', messages: 6, degraded: 1, created_at: '2026-10-01T10:00:00Z', updated_at: '2026-10-02T10:00:00Z' }], { page: 1, per_page: 25, total: 1, last_page: 1 })
  if (method === 'GET' && path === 'admin/ai/usage') return ok({ questions_30d: 120, degraded_30d: 4, tokens_in_30d: 50000, tokens_out_30d: 20000, by_intent: [{ intent: 'immigration', total: 60 }, { intent: 'jobs', total: 20 }] })
  if (method === 'GET' && path === 'admin/settings') return ok({ environment: 'production', locales: ['ar', 'en', 'it'], default_locale: 'ar', content: { four_eyes: true, required_locales_to_publish: ['ar'], stale_after_days: 180 }, ai: { driver: 'null', daily_limits: { free: 10, plus: 100 }, daily_token_budget_enabled: false }, billing: { provider: 'none', currency: 'EUR', vat_configured: false }, queue: { connection: 'redis', cache: 'redis' } })
  if (method === 'POST' && path === 'admin/notifications/broadcast') return json?.title?.ar && json?.body?.ar ? ok({ queued: true, recipients: 42 }, {}, 202) : fail(422, 'validation_failed', 'Invalid.', { title: ['The title.ar field is required.'] })
  if (method === 'GET' && path === 'admin/roles') return ok([{ key: 'content_manager', label: 'Content manager', privileged: false, permissions: [] }])
  if (method === 'GET' && path === 'admin/regions') return ok([{ id: 1, code: 'MI', slug: 'lombardia', cities: 1, translations: { ar: 'لومبارديا', en: 'Lombardy', it: 'Lombardia' } }])
  if (method === 'GET' && path === 'admin/cities') return ok([{ id: 1, slug: 'milano', region_id: 1, translations: { ar: 'ميلانو', en: 'Milan', it: 'Milano' } }, ...(A.extraCity ? [{ id: 2, slug: A.extraCity, region_id: 1, translations: { ar: 'مدينة', en: 'Town' } }] : [])], { page: 1, per_page: 50, total: 1, last_page: 1 })
  if (method === 'POST' && path === 'admin/cities') { A.extraCity = json?.slug; return ok({ id: 2, slug: json?.slug, region_id: json?.region_id, translations: {} }, {}, 201) }
  if (method === 'DELETE' && path === 'admin/cities/1') return fail(409, 'city_in_use', 'In use.')
  if (method === 'DELETE' && path === 'admin/cities/2') { A.extraCity = null; return { status: 204, body: null } }
  if (method === 'DELETE' && path === 'admin/users/3') return { status: 202, body: { data: { message: 'Erasure started.' }, meta } }
  return null
}
