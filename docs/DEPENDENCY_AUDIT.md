# Dependency audit

Re-run 2026-10-08 (read-only; `web/` and `backend/` were not modified). Supersedes the 2026-10-05/07 text, whose web figures (17 high, 2 advisories) are out of date: new advisories were published since.

## Backend
`composer audit` — "No security vulnerability advisories found." (2026-10-08).

## Web: `npm audit --omit=dev` = 23 findings (4 moderate, 13 high, 6 critical)

Root advisories (everything else is propagation up the tree):

| Advisory | Package (installed) | Patched version exists? | Brought in by | In the production runtime? | Class |
|---|---|---|---|---|---|
| GHSA-x6jw-m9v5-85vh, GHSA-g4wm-2vf7-vfgr, GHSA-858h-whjf-mvg5 (critical: git option/config guard bypass leading to command execution) | simple-git 3.36.0 | **Yes: 4.0.2** (major) | `nuxt` → `@nuxt/devtools@3.4.2` | **No.** Nuxt DevTools is a dev-server feature; `web/.output/server` (15 packages) contains none of it | dev-only |
| GHSA-v5rq-49vh-5v5c (critical) | @simple-git/argv-parser 1.1.1 | **Yes: 2.0.1** | simple-git | **No** (same path) | dev-only |
| GHSA-vfj7-8cjw-p6xm (high, ReDoS in glob brace patterns, <= 3.0.3) | braces 3.0.3 | **No** (3.0.3 is the latest on npm) | micromatch ← unplugin-vue-router / fast-glob / globby; chokidar ← tailwindcss | **No.** Build-time file matching of developer-authored patterns; absent from `.output` | build-time |
| GHSA-86w9-cpqp-85rv (high, RSA PKCS#1 v1.5 verification, <= 1.4.0) | node-forge 1.4.0 | **No** (1.4.0 is the latest) | listhen ← @nuxt/cli / nitropack (dev server HTTPS) | **No** | dev-only |
| GHSA-rj75-hqrm-r3gf (moderate, PostCSS selector parsing is quadratic) | postcss-selector-parser 6.1.4 (tailwind 3 / postcss-nested) | Yes: 7.1.6 (already used elsewhere in the tree) | @nuxtjs/tailwindcss → tailwindcss 3.4.19 | **No.** Runs at build time over the project's own CSS | build-time |

Why `--omit=dev` still lists them: Nuxt and its modules are declared in `dependencies`, but the audit tree walks build and dev tooling. The server artifact (`web/.output`, what `web/Dockerfile` ships) was inspected: none of simple-git, @simple-git, braces, micromatch, node-forge, tailwindcss or postcss-selector-parser is present. **No advisory affects the production runtime.** Exposure is on developer machines and CI build agents, i.e. only if untrusted input reaches those tools (simple-git is used by DevTools for repository inspection on a dev server; CI does not run `nuxt dev`).

## `overrides` experiment (in a COPY of `web/package.json` + lock in the scratchpad; `--package-lock-only`, nothing installed, `web/` untouched)

| Overrides tried | Resulting `npm audit --omit=dev` | Note |
|---|---|---|
| none (baseline) | 23: 4 moderate, 13 high, 6 critical | |
| `simple-git ^4.0.2`, `@simple-git/argv-parser ^2.0.1` | 20: 4 moderate, 16 high, **0 critical** | removes the critical class |
| the two above plus `postcss-selector-parser ^7.1.6` | 17: 0 moderate, 17 high, **0 critical** | the remaining 17 are braces and node-forge propagation, unpatchable today |
`npm audit fix --force` still proposes a *downgrade* of nuxt (to 3.7.4) and is rejected. Moving to Nuxt 4 (`nuxt@4.6.0` is current; `@nuxt/devtools@latest` is a 4.0 beta) is a framework migration, not a dependency bump.

Safety assessment of the overrides: **simple-git 3 → 4 is a major bump of a library that `@nuxt/devtools` pins to ^3.36** — it could break DevTools git features in dev (harmless in production) but is unverified; **postcss-selector-parser 6 → 7 under tailwindcss 3/postcss-nested (which declare ^6)** could change CSS build behaviour and must be checked with a full `npm run build` and the web test/e2e suites. Neither was built or tested here (`web/` is off limits for this task and the disk is nearly full), so neither is declared safe.

## Final decision (2026-10-08)
1. **Production risk: none identified**; the production image contains `.output` only. Keep the Dockerfile rule: never run `nuxt dev` on a server, never build on the production host.
2. **Do not change `web/package.json` now.** If a clean audit gate is wanted in CI, a web owner may add the `simple-git`/`@simple-git/argv-parser` overrides first (smallest change, removes all six criticals), then run `npm ci && npm run build && npm test && npm run typecheck` and the e2e suite; the `postcss-selector-parser` override only after the same checks pass with an actual CSS diff review.
3. **CI policy:** gate `npm audit --omit=dev --audit-level=critical` once the overrides are applied; allow the `braces` and `node-forge` high findings explicitly (no patched release; both build/dev-only) with this document as the justification; re-check weekly with `npm view braces version` and `npm view node-forge version`.
4. **Tracking:** LAUNCH_QUEUE item "web dependency overrides" (P2, owner: Web dev).

## Mobile
Not re-run here (no Flutter toolchain in this task). Last known state: major-version-behind packages and two discontinued transitive packages (PRODUCTION_AUDIT_MOBILE.md).
