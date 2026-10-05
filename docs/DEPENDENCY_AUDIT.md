# Dependency audit

## Backend
`composer audit` — no advisories (checked 2026-10-05).

## Web (`npm audit --omit=dev`): 17 "high", 2 root advisories
| Advisory | Package (installed / latest on npm) | Path | Reaches production runtime? |
|---|---|---|---|
| GHSA-vfj7-8cjw-p6xm (braces, ReDoS via deeply nested patterns, range <=3.0.3) | braces 3.0.3 / **3.0.3** | micromatch ← unplugin-vue-router ← @nuxtjs/i18n; chokidar ← tailwindcss ← @nuxtjs/tailwindcss | **No.** Build/dev-time glob matching of developer-authored patterns; none of braces/micromatch/fast-glob/tailwindcss is present in `web/.output/server/node_modules`. |
| GHSA-86w9-cpqp-85rv (node-forge, RSA PKCS#1 v1.5 signature verification, range <=1.4.0) | node-forge 1.4.0 / **1.4.0** | listhen ← @nuxt/cli (nuxt dev server HTTPS) | **No.** Dev server only; not in the production bundle. |

The other 15 entries are the same two advisories propagating up the dependency tree.

## Why nothing was changed
- No patched release exists: the latest published braces (3.0.3) and node-forge (1.4.0) are themselves inside the vulnerable ranges.
- `npm audit fix --force` proposes `nuxt@3.15.1` and `@nuxtjs/tailwindcss@6.1.3`, i.e. **downgrades** of the framework to versions older than the ones in use; rejected as unsafe/breaking and not a real fix.
- No `overrides` possible without a fixed version.

## Mitigation / follow-up
- Production image must only contain `.output` (Dockerfile does); never run `nuxt dev` on a server.
- Re-run `npm audit` in CI (non-blocking for these two advisories until a patched release exists) and bump when braces/node-forge publish fixes.
