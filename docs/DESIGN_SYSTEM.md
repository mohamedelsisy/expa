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
