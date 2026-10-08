#!/usr/bin/env node
// EXPA API load/smoke driver. Node >= 18, built-in fetch only (no dependencies; k6/wrk/hey/artillery are not installed here).
// k6 is not available in the authoring environment, so this is the executable baseline; the same scenarios map 1:1 to k6.
//
//   BASE_URL=http://127.0.0.1:8099 USERS=20 DURATION=30 CONCURRENCY=20 node tests/load/load.mjs [--scenarios=login,dashboard,...]
//
// Env: BASE_URL (required, no default on purpose)  PASSWORD (default "password", the factory password of tests/load/setup.sh users)
//      USERS=N  accounts load1@load.test .. loadN@load.test (created by setup.sh)   CONCURRENCY (virtual users)   DURATION seconds
//      SPOOF_IP=1  send a distinct X-Forwarded-For per virtual user (ONLY works when the target has TRUSTED_PROXIES=* : a throwaway server)
//      OUT=path.json write the result summary.
// Throttles are real (login 5/min per email+IP, api 180/min per user, ai 20/min per user, search 60/min): with few users you will
// see 429s. They are counted separately as "throttled" and do NOT count as errors; a high throttled share means "add users/IPs".
// Exit code 1 when a threshold fails.
const BASE = (process.env.BASE_URL || '').replace(/\/$/, '');
if (!BASE) { console.error('BASE_URL is required'); process.exit(2); }
if (/expa\.|\.com|\.it|ngrok/.test(BASE) && process.env.I_UNDERSTAND_THIS_IS_NOT_PRODUCTION !== '1') {
  console.error('Refusing to run against a non-local looking host without I_UNDERSTAND_THIS_IS_NOT_PRODUCTION=1'); process.exit(2);
}
const USERS = +(process.env.USERS || 20), CONC = +(process.env.CONCURRENCY || 20), DUR = +(process.env.DURATION || 30);
const PASSWORD = process.env.PASSWORD || 'password', SPOOF = process.env.SPOOF_IP === '1';
const only = (process.argv.find(a => a.startsWith('--scenarios=')) || '').split('=')[1]?.split(',');

// Thresholds (staging-like targets; docs/LOAD_TESTING.md). p95 in ms, err = max share of non-2xx/non-429 responses.
const SCEN = {
  login:      { w: 1, p95: 800,  err: 0.01, run: (c) => c.post('/auth/login', { email: c.email, password: PASSWORD, device_name: 'load' }, false) },
  dashboard:  { w: 4, p95: 600,  err: 0.01, run: (c) => c.get('/dashboard') },
  search:     { w: 3, p95: 700,  err: 0.01, run: (c) => c.get('/search?q=' + pick(['permesso', 'residenza', 'codice fiscale', 'patente', 'lavoro']), false) },
  jobs:       { w: 3, p95: 600,  err: 0.01, run: (c) => c.get('/jobs?per_page=20', false) },
  guides:     { w: 3, p95: 500,  err: 0.01, run: (c) => c.get('/guides?per_page=20', false) },
  guide:      { w: 3, p95: 500,  err: 0.01, run: async (c) => { const s = await c.guideSlug(); return s ? c.get('/guides/' + s, false) : c.skip(); } },
  ai_ask:     { w: 1, p95: 3000, err: 0.01, run: (c) => c.post('/ai/ask', { message: 'How do I renew my permesso di soggiorno?' }) }, // AI_DRIVER=fake only
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const names = Object.keys(SCEN).filter(n => !only || only.includes(n));
const stats = Object.fromEntries(names.map(n => [n, { n: 0, ok: 0, throttled: 0, err: 0, lat: [], codes: {} }]));
let slugCache = null;

class Client {
  constructor(i) { this.i = i; this.email = `load${(i % USERS) + 1}@load.test`; this.token = null; this.ip = `10.${(i >> 8) & 255}.${i & 255}.${1 + (i % 250)}`; }
  headers(auth) { const h = { Accept: 'application/json', 'Accept-Language': 'en', 'Content-Type': 'application/json' };
    if (SPOOF) h['X-Forwarded-For'] = this.ip; if (auth && this.token) h.Authorization = 'Bearer ' + this.token; return h; }
  async req(method, path, body, auth = true) {
    const t = performance.now();
    try { const r = await fetch(BASE + '/api/v1' + path, { method, headers: this.headers(auth), body: body ? JSON.stringify(body) : undefined });
      const text = await r.text(); return { status: r.status, ms: performance.now() - t, text }; }
    catch (e) { return { status: 0, ms: performance.now() - t, text: String(e) }; }
  }
  get(p, auth = true) { return this.req('GET', p, null, auth); }
  post(p, b, auth = true) { return this.req('POST', p, b, auth); }
  skip() { return { status: -1 }; }
  async login() { const r = await this.req('POST', '/auth/login', { email: this.email, password: PASSWORD, device_name: 'load' }, false);
    if (r.status !== 200) throw new Error(`setup login failed for ${this.email}: HTTP ${r.status} (run tests/load/setup.sh first)`);
    this.token = JSON.parse(r.text).data.token; }
  async guideSlug() { if (slugCache) return slugCache; const r = await this.get('/guides?per_page=1', false);
    try { const d = JSON.parse(r.text).data; slugCache = (Array.isArray(d) ? d : d.data || [])[0]?.slug || null; } catch { slugCache = null; } return slugCache; }
}

const weighted = names.flatMap(n => Array(SCEN[n].w).fill(n));
const end = Date.now() + DUR * 1000; let started = 0;
async function vu(i) {
  const c = new Client(i);
  await c.login();
  while (Date.now() < end) {
    const n = pick(weighted), r = await SCEN[n].run(c), s = stats[n];
    if (r.status === -1) continue;
    s.n++; s.codes[r.status] = (s.codes[r.status] || 0) + 1;
    if (r.status === 429) s.throttled++; else if (r.status >= 200 && r.status < 300) { s.ok++; s.lat.push(r.ms); } else s.err++;
    if (r.status === 401 && n !== 'login') await c.login().catch(() => {});
    started++;
  }
}
const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))]); };

const t0 = Date.now();
const res = await Promise.allSettled(Array.from({ length: CONC }, (_, i) => vu(i)));
const failedSetup = res.filter(r => r.status === 'rejected').map(r => r.reason.message);
const secs = (Date.now() - t0) / 1000; let failed = failedSetup.length > 0;
const summary = { base: BASE, concurrency: CONC, users: USERS, duration_s: +secs.toFixed(1), total_requests: started, rps: +(started / secs).toFixed(1), setup_failures: failedSetup.slice(0, 3), scenarios: {} };
console.log(`\nscenario    reqs   ok  429  err   p50   p95   p99  (ms)   threshold`);
for (const n of names) {
  const s = stats[n], T = SCEN[n]; const p95 = pct(s.lat, .95), errShare = s.n - s.throttled ? s.err / (s.n - s.throttled) : 0;
  const pass = (p95 === null || p95 <= T.p95) && errShare <= T.err; if (!pass) failed = true;
  summary.scenarios[n] = { reqs: s.n, ok: s.ok, throttled: s.throttled, errors: s.err, p50: pct(s.lat, .5), p95, p99: pct(s.lat, .99), codes: s.codes, pass };
  console.log(`${n.padEnd(11)} ${String(s.n).padStart(5)} ${String(s.ok).padStart(4)} ${String(s.throttled).padStart(4)} ${String(s.err).padStart(4)} ${String(pct(s.lat, .5) ?? '-').padStart(5)} ${String(p95 ?? '-').padStart(5)} ${String(pct(s.lat, .99) ?? '-').padStart(5)}        p95<=${T.p95} err<=${T.err * 100}% ${pass ? 'PASS' : 'FAIL'}`);
}
if (failedSetup.length) console.log('setup failures:', failedSetup.slice(0, 3));
console.log(`total ${started} requests in ${secs.toFixed(1)}s = ${summary.rps} req/s`);
if (process.env.OUT) (await import('node:fs')).writeFileSync(process.env.OUT, JSON.stringify(summary, null, 2));
process.exit(failed ? 1 : 0);
