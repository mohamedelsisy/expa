# Load testing — baseline plan

Status 2026-10-08: **plan and tooling written; a short dev-machine smoke was run; NO load test has been run.** Nothing here supports a capacity or latency claim for production.

## Tooling

Available on the authoring machine: `ab` (ApacheBench), Node 25. Not installed: `k6`, `wrk`, `hey`, `artillery` (checked with `which`). The executable baseline is therefore `tests/load/load.mjs`, a dependency-free Node script (built-in `fetch`, concurrency by virtual users, weighted scenarios, p50/p95/p99, pass/fail thresholds, JSON output). If k6 is adopted later the scenarios map one-to-one (table below). `ab` is only suitable for single GET endpoints (no auth flow).

| File | Purpose |
|---|---|
| `tests/load/load.mjs` | scenarios: `login`, `dashboard`, `search`, `jobs`, `guides`, `guide` (detail), `ai_ask` (fake LLM) |
| `tests/load/setup.sh` | builds a throwaway SQLite database (migrate + seed), N verified users `load1..N@load.test` (password `password`), starts its own `artisan serve` on another port with `AI_DRIVER=fake`, file cache, `TRUSTED_PROXIES=*` |

The script refuses hostnames that look like real environments unless `I_UNDERSTAND_THIS_IS_NOT_PRODUCTION=1` is set; use that variable only for a dedicated staging environment.

## Data and environment setup

- Never load-test production or the shared preview (`:8001`, tunnel). The shared throttles (api 180/min per user or IP, login 5/min per email+IP and 30/min per IP, search 60/min, ai 20/min per user, uploads 30/h) are real; they are counted as `429 throttled`, not as errors, and a high throttled share means "use more users/IPs".
- Throwaway run: `WORK=<scratch dir> USERS=20 PORT=8099 tests/load/setup.sh`, then `BASE_URL=http://127.0.0.1:8099 USERS=20 CONCURRENCY=20 DURATION=25 SPOOF_IP=1 node tests/load/load.mjs`; stop with `kill $(cat $WORK/serve.pid)`. `SPOOF_IP=1` sends a distinct `X-Forwarded-For` per virtual user, which only works because the throwaway server trusts all proxies.
- Staging run (the real baseline): staging stack from `docker-compose.staging.yml` with production-like resources, MySQL, Redis, `AI_DRIVER=fake` (never spend LLM money in a load test), mail to Mailpit, seeded with realistic volumes (see below). Create the test users with `tinker` or an admin script on staging only; set `TRUSTED_PROXIES` to the real subnet and use real distinct source IPs (several load generators) instead of `SPOOF_IP`, or temporarily allow the generator subnet.
- Content volume: the test database has **no guides, jobs or search content** (the product ships empty), so `guide` detail is skipped and `guides`/`jobs`/`search` measure empty-result paths. Before a meaningful run, seed at least 500 guides (3 locales), 5 000 job listings, 2 000 search index rows and 1 000 users, via factories on staging only, and run `expa:search-reindex`.

## Scenarios and success criteria (staging-like, steady state)

| Scenario | Endpoint | Weight | p95 target | Error budget |
|---|---|---|---|---|
| auth | `POST /auth/login` | 1 | <= 800 ms (bcrypt cost 12 dominates) | < 1% |
| dashboard | `GET /dashboard` (authenticated) | 4 | <= 600 ms | < 1% |
| search | `GET /search?q=` | 3 | <= 700 ms | < 1% |
| jobs list | `GET /jobs?per_page=20` | 3 | <= 600 ms | < 1% |
| content list | `GET /guides?per_page=20` | 3 | <= 500 ms | < 1% |
| content detail | `GET /guides/{slug}` | 3 | <= 500 ms | < 1% |
| AI ask (fake LLM) | `POST /ai/ask` | 1 | <= 3 000 ms | < 1% |

Programme-level criteria to agree before the run (none are validated yet): sustained 50 and 150 concurrent virtual users for 10 minutes each with no 5xx and the thresholds above; CPU of api below 75% and no php-fpm "max_children reached" warning; MySQL slow-query count and connections stable; queue depth returns to zero within 2 minutes after a burst; memory flat over a 30-minute soak; recovery after a 2-minute overload without restarts. The audit's general budget "API p95 300 ms without AI" (LAUNCH_CHECKLIST section 9) is stricter than the table above for the heavier endpoints; decide which applies.

Phases: (1) smoke 20 VU x 30 s, (2) baseline 50 VU x 10 min, (3) stress ramp to the first sign of errors, (4) soak 30 min at 50% of the stress knee, (5) spike 10x for 1 minute. Record: commit SHA, image tags, resource limits, data volumes, script output JSON (`OUT=`), plus DB/Redis/container metrics.

Not covered by this plan yet: web (Nuxt SSR) page load, file upload with ClamAV, queue throughput of job imports, billing webhooks, mobile network conditions. Add Lighthouse/WebPageTest for the web and a separate upload test.

## What was run (2026-10-08) — dev-machine smoke, not a load test

Setup: Apple M2 (8 cores, 8 GB RAM, nearly full disk, other dev servers running at the same time), PHP 8.3 `artisan serve` with 4 workers, SQLite file database, file cache, bcrypt rounds 4 in the throwaway database, `AI_DRIVER=fake`, empty content, 20 users, 20 virtual users, 25 seconds, `SPOOF_IP=1`. Run twice; the first run exposed that the helper had not marked the users verified (AI returned 403), fixed in `setup.sh`; numbers below are the second run.

| Scenario | requests | ok | 429 | errors | p50 ms | p95 ms | p99 ms | vs target |
|---|---|---|---|---|---|---|---|---|
| login | 113 | 72 | 41 | 0 | 232 | 334 | 392 | pass |
| dashboard | 401 | 401 | 0 | 0 | 238 | 547 | 901 | pass |
| search | 296 | 296 | 0 | 0 | 232 | 466 | 825 | pass |
| jobs | 323 | 323 | 0 | 0 | 230 | 510 | 741 | pass |
| guides | 297 | 297 | 0 | 0 | 234 | 523 | 941 | **fail** (p95 target 500) |
| guide detail | 0 | - | - | - | - | - | - | skipped: no content |
| ai_ask (fake) | 102 | 102 | 0 | 0 | 242 | 682 | 949 | pass |

Total 1 532 requests in 25.8 s = 59.5 req/s, zero 5xx. First run (before the verification fix): about 43.6 req/s, dashboard p95 650 ms and guides p95 599 ms, 78 `ai_ask` 403s caused by the setup bug. Interpretation limits: the p50 of about 230 ms for trivial empty-result endpoints under 20 concurrent clients on a development server shows the saturation of the single PHP built-in server on a busy laptop, not application cost; SQLite, empty tables, no TLS, no php-fpm/opcache tuning and competing processes make these numbers incomparable to staging. They only show that the scripts work, authentication and throttling behave as designed (login 429s are the 5/min per email+IP limit), and that no endpoint errored under light concurrency.

## What was NOT run

Any test on staging or production-like infrastructure, MySQL or Redis behaviour, php-fpm sizing, TLS/edge overhead, content-sized data, the Nuxt web tier, uploads, sustained/soak/stress/spike phases, `ab` runs, and any real LLM call. The shared preview on `:8001` was not loaded (only one `GET /api/v1/health` from `healthcheck.sh`).
