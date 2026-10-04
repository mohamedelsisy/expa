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
