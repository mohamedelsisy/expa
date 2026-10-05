# EXPA — Design System

Feel: trustworthy, modern, European, welcoming, premium, simple. Arabic is first-class.

## Foundations (design tokens → Tailwind theme)
- **Color**: Primary *Olive-Teal* `#0F6B5C` (trust, Italian-green nod without flag cliché); accent *Terracotta* `#D9622B` (warmth, CTAs sparingly); neutrals warm gray `#F7F5F2 … #1C1B19`; semantic success `#2E7D32`, warning `#B26A00`, danger `#B3261E`, info `#1565C0`. All text/background pairs ≥ 4.5:1 (checked per token pair). Dark mode: planned P2.
- **Typography**: Arabic — *IBM Plex Sans Arabic* / Latin & Italian — *Inter*. Arabic body ≥ 17px with line-height 1.8 (Arabic needs more leading); Latin 16px / 1.6. Italian terms inside Arabic text rendered in `<span lang="it" dir="ltr">` with a subtle chip style.
- **Spacing**: 4px scale. **Radius**: 8 / 12 / 20. **Elevation**: 3 levels, soft.
- **RTL**: only logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`), icons that imply direction are mirrored, numerals follow user preference (Western digits default).

## Components (web: Vue SFC in `web/components/ui`, mobile: Flutter widgets mirroring tokens)
Button, IconButton, Input, Select, Textarea, Checkbox/Radio/Switch, FormField (label+hint+error), Card, Badge (incl. SourceBadge: official/institutional/verified/third-party), Alert, Modal/Sheet, Tabs, Table, Pagination, Breadcrumbs, Navbar/BottomNav, LanguageSwitcher, ProgressBar/ScoreRing, Timeline/Stepper, Skeleton (loading), EmptyState, ErrorState, Toast, LastVerified indicator (turns amber after 180 days, red after 365).

## Accessibility
Semantic landmarks, visible focus ring (2px accent offset), keyboard operable everything, labels bound to inputs, `aria-live` for toasts, prefers-reduced-motion respected, touch targets ≥ 44px.

## Layout
Mobile-first; breakpoints 640/768/1024/1280/1536. Mobile bottom nav: Home · Explore · Ask EXPA · Tasks · Profile.

## Implemented web tokens and components (web/)
- **Single skin file**: `web/assets/css/tokens.css` (RGB-channel CSS variables). `tailwind.config.ts` maps them: canvas/surface/sunken/line, ink/ink-soft/muted, primary(+strong/soft/on), accent(+strong/soft/on), success/warning/danger/info (+soft). Radius `sm/md/lg` = 8/12/20, shadows `shadow-1..3`, focus ring 2px accent with 2px offset, `--touch-min` 44px.
- **Accessible pairs**: `web/tests/contrast.test.ts` parses the token file and checks declared text pairs at 4.5:1 and non-text at 3:1. Notes: text on the accent fill is dark (`on-accent`), not white; `accent-strong` is the text-safe terracotta; semantic text colors were darkened slightly from the brief's hex values to pass AA on their soft backgrounds.
- **Fonts**: self-hosted `@fontsource` IBM Plex Sans Arabic (400/500/700) and Inter (400-700). Arabic 17px/1.8, Latin 16px/1.6.
- **Components** (`web/components/ui`, used as `<UiX>`): Button, IconButton, TextInput, PasswordInput, Select, Checkbox, FormField (provide/inject wiring of id, aria-describedby, aria-invalid), Card, Badge, SourceBadge, Alert, ProgressBar, ScoreRing (role=img + text alternative), Stepper, Timeline, Skeleton, EmptyState, ErrorState, Toast/ToastRegion (polite + assertive live regions), LanguageSwitcher, FreshnessIndicator (warning for stale/outdated/unverified), ItalianTerm, AutoItalian (wraps Latin parentheticals in Arabic API text), Breadcrumbs, Pagination, Icon (directional icons flip under `rtl:`).

## Web modules added in delivery 2 (web/)
- **New UI primitives**: `UiTextarea`, `UiChips` (single-select filter chips, `aria-pressed`), `UiConfirmInline` (inline destructive confirmation, focus on Cancel, Esc cancels). New icons: bell, send, upload, plus, volume, bookmark, briefcase, car, edit, phone, mail, building, flame, help, check-circle, x-circle.
- **Trust components**: AI answer renderer (`AskMessage`): label badge per class with colour AND icon (official = success/shield, general guidance = info, AI explanation = accent/sparkle, third-party = warning/alert), numbered sources with https-only links and freshness warnings, `[n]` markers become in-page links only when a source with that number exists, text is rendered by interpolation only. `GovBookingBlock` always prints the API notice ("EXPA does not book for you"). `JobsMatchReasons`: score ring plus reasons with ✓ / △ / ✗ / ? glyphs and a screen-reader status word; unknown criteria are shown but never counted against the user.
- **Search combobox** (`SearchCombobox`): ARIA 1.2 combobox/listbox, `aria-activedescendant`, Arrow/Home/End/Enter/Escape/Tab behaviour, polite live count.
- **Mock exam**: server deadline drives a `role="timer"` clock; threshold announcements (10/5/2/1 min, 30/10 s) go through a separate polite live region; auto-submit fires exactly once at zero. Every exam surface is labelled "Mock exam / simulazione" and never claims an official result. Question/review pages are client-only (SPA route rules, no-store) so exam content is never server-rendered or cached.
- **Route mapping**: API `route`/`cta` targets pass through `utils/routes.ts` (allow-list; unknown, absolute, protocol-relative, `javascript:` or traversal targets map to nothing).
- **RTL notes**: Latin content (Italian, salaries, dates, file sizes, phonetics) is isolated with `dir="ltr"`/`<bdi>`; assistant text uses `dir="auto"`; chevrons/arrows flip via the existing directional Icon logic. On phones, signed-in users get the bell in the header and the language switcher moves to Profile (header width at 360px).

## Admin panel (web, T-027)
Role-gated route group `/{locale}/admin/**` in the same Nuxt app; it reuses the tokens and the `components/ui` kit and adds `components/admin/*` and `layouts/admin.vue`.

- **Shell**: sidebar (off-canvas on mobile, `start-0`/`border-e` so it mirrors in RTL), modules filtered by permission (`utils/admin/nav.ts`), breadcrumbs via `AdminPageHeader`, language switcher, link back to the site. Pages are SSR but `no-store` and `noindex`.
- **Gating**: `usePermissions()` (`can`, `canAny`, super admin) is fed by `GET /auth/me` (`roles`, `is_super_admin`, `permissions[]`). `middleware/admin.ts` needs one admin-area permission (else a localized 403 page) plus the page's own `*.view`. The UI only hides/disables; the API stays the authority and 403 messages are shown.
- **One content workspace**: `utils/admin/modules.ts` declares each lifecycle module (fields, enums, translatable fields with max lengths mirrored from `backend/app/Http/Requests`, filters, permission prefix). `ContentList`, `ContentForm`, `TranslationEditor`, `ListEditor`, `WorkflowBar` render all of them; a test checks labels exist in ar/en/it and max lengths equal the backend rules.
- **Translation editor**: ar/en/it tabs (WAI-ARIA tabs, arrow keys), "required to publish" on Arabic (Italian + Arabic for patente questions), "missing" from `missing_locales`, `dir` per panel (ar rtl, en/it ltr regardless of UI language), character counters, plain-text/Markdown hint.
- **Workflow**: buttons = API `allowed_transitions` filtered by permission (`update` submit, `review` approve/reject, `publish` publish/unpublish/archive); schedule dialog; `content_not_publishable` renders `ProblemsChecklist` (each problem code has a localized message and jumps to the field/tab); four-eyes 403 on approve is explained. Warnings: editing in review returns to draft; editing live content re-validates publishing rules.
- **Patterns**: `AdminDataTable` (real `<table>`, caption, `scope`, `aria-sort`, first column is the row header, scroll region is `relative` so `sr-only` captions do not widen the page), `AdminFilters`, URL-synced list state (`utils/admin/listState.ts`: `?q=&status=&sort=&page=`), `AdminDialog` (focus trap, Esc, focus return; `variant="drawer"` slides from the inline-end side).
- **Status colours** are always paired with text: draft neutral, review info, approved accent, published success, archived neutral; freshness fresh/stale/outdated/unverified = success/warning/danger/neutral.
