# EXPA web (Nuxt 3)

Arabic-first (ar default, en, it) web app. Talks to the Laravel API only through a server-side BFF; the Sanctum token lives in an httpOnly cookie and never reaches browser JavaScript.

## Run
```bash
cp .env.example .env          # API_BASE_URL defaults to http://127.0.0.1:8001/api/v1
npm install
npm run dev                   # http://localhost:3000  (redirects / -> /ar)
```
Backend: from `../backend`, `php artisan serve --port=8001` (set `APP_URL` to the API origin and `FRONTEND_URL` to this app so email links work).

## Scripts
`npm run test` (Vitest) · `npm run typecheck` · `npm run build` · `npm run lint` (style/contrast rule tests)

## Structure
- `assets/css/tokens.css`: the single file to re-skin (colors, radius, elevation, fonts, focus ring). `tailwind.config.ts` only maps names to variables.
- `components/ui`: UI kit (`<UiButton>`, `<UiFormField>`, ...). `components/layout`, `components/guide`, `components/profile`.
- `server/utils/bff.ts`: framework-free BFF core (tested with mocked fetch). `server/api/auth/*` set/clear the cookie; `server/api/proxy/[...path].ts` forwards with the bearer token.
- `i18n/locales/{ar,en,it}.json`: all UI text. Tests enforce identical keys and no empty values.
- `BACKEND_REQUESTS.md`: API gaps noticed.

## Rules enforced by tests
Logical CSS only (no `ml-/mr-/left-/text-left...`), no `v-html`, no web storage, AA contrast for token pairs.
