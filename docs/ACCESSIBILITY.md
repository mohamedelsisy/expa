# EXPA web: accessibility

Scope: `web/` (Nuxt). Target: WCAG 2.2 AA. Status of every statement is one of AUTOMATED (a test fails if it regresses), STATIC (checked by reading code / grep, not enforced), or MANUAL_VERIFICATION_REQUIRED (nobody has run a screen reader on it; do not claim it works).

## 1. What automation verifies

| Area | How | Where |
|---|---|---|
| WCAG 2.0/2.1/2.2 A+AA and best-practice rules (axe-core 4.13, includes target-size 24px, labels, names, landmarks, contrast of rendered text) | zero violations asserted on public pages x ar/en/it x 390/1280 px, on ~24 signed-in pages (en + ar), the 2FA pages (en/ar/it), admin pages (ar at 390) | `e2e/smoke.spec.ts`, `e2e/journeys.spec.ts`, `e2e/two-factor.spec.ts`, `e2e/a11y.spec.ts`, `e2e/ra.spec.ts`, `e2e/areas.spec.ts` |
| No horizontal scroll (reflow, WCAG 1.4.10) | 390 and 1280 on all smoke pages; 320 px on 6 Arabic pages | `expectNoOverflow`, `e2e/a11y.spec.ts` |
| Text resize to 200% (WCAG 1.4.4) | root font 32 px at 1280 and 24 px at 390, no horizontal scroll | `e2e/a11y.spec.ts` |
| Skip link is the first tab stop, becomes visible, moves focus to `#main` | Playwright keyboard | `e2e/a11y.spec.ts` |
| Route changes announced | `<NuxtRouteAnnouncer />` present (announces the new title) | `e2e/a11y.spec.ts` (presence only, not the spoken text) |
| Dialog / drawer: focus moves in, Tab and Shift+Tab stay inside, Escape closes, focus returns to the opener | admin detail drawer and the mobile admin menu | `e2e/a11y.spec.ts`, logic in `utils/focus.ts` + `tests/a11y-static.test.ts` |
| Form errors: first invalid field gets focus after submit; error is `role="alert"` and referenced by `aria-describedby`; field has `aria-invalid` | register with API 422 | `e2e/a11y.spec.ts`, `plugins/a11y-focus.client.ts` |
| Keyboard-only flows | login (tab order incl. show-password), ask (Enter sends, answer lands in a polite `role="log"`), documents add, exam runner (roving radio, arrows, confirm dialog), 2FA login and setup | `e2e/a11y.spec.ts`, `e2e/journeys.spec.ts`, `e2e/two-factor.spec.ts` |
| Contrast of design tokens (text pairs >= 4.5, UI pairs >= 3) | computed from `assets/css/tokens.css` | `tests/contrast.test.ts` |
| Contrast of every `text-X` + `bg-Y` combination actually written in a template | scans class strings | `tests/a11y-static.test.ts` (0 failing pairs) |
| Static rules: no positive `tabindex`, every `<img>` has `alt`, every `<table>` has a `<caption>`, scrollable table regions are `role="region"` + focusable, `target=_blank` has `rel`, `outline-none` only on programmatic focus targets | regex over `.vue` files | `tests/a11y-static.test.ts` |
| No physical left/right Tailwind classes (RTL) and no `v-html` | regex | `tests/lint-style.test.ts` |
| i18n parity ar/en/it, same placeholders | JSON diff | `tests/i18n.test.ts` |

Token contrast (computed, light theme; there is no dark theme in the web app, so there is one set): ink on canvas/surface/sunken >= 14:1, ink-soft >= 9:1, muted on its worst background 5.2:1, the weakest text pair is info on sunken 4.88:1, success/warning/danger/info on their soft fills 5.5/5.7/5.6/4.9:1, white on primary 6.41:1, dark on accent 4.7:1, control border (line-strong) on surface 4.25:1 (needs 3:1), focus ring accent on canvas 3.37:1 (needs 3:1).

## 2. Findings and fixes in this pass

Fixed:
1. Header search box collapsed to ~50 px and was partially covered by neighbours for an admin user in Arabic at 1280 px (axe `target-size`). Search box now appears from `xl` with a minimum width, an icon link replaces it below (`components/layout/AppHeader.vue`).
2. Headers overflowed horizontally when text was enlarged (24 px root at 390 px: guest header 130 px too wide). All four headers (public, admin, auth, error) now wrap.
3. Exam runner: ArrowLeft/ArrowRight/ArrowDown/ArrowUp on an unanswered question did not move to the second option (the move was computed from the stored answer, not from the focused option). Now computed from focus (`components/patente/Runner.vue`).
4. Server-side form errors did not move focus; a keyboard or screen-reader user had to hunt for the message. Global plugin focuses the first `aria-invalid` field after a submit (sync or async, up to 8 s).
5. Client-side navigation was silent for screen readers. Added `<NuxtRouteAnnouncer />`.
6. Content served in a fallback language (for example English on an Arabic page) had no `lang`/`dir`, so a screen reader read it with the wrong voice. Guide and article pages and cards and city info blocks now use `contentLang()`. (Other detail pages that show `fallback` content still do not, see "left".)
7. Star rating (review form) uses visually hidden radios; the focus ring was invisible. The label now shows the ring (`has-[:focus-visible]`).
8. Dialog and drawer focus trapping was implemented twice with different rules (`AdminDialog`, admin layout). Both now use `utils/focus.ts` (also handles `summary`, hidden inputs, empty dialogs).
9. `/admin/readiness` table had no caption; retry button inside it was below the 44 px target.
10. 2FA UI built to the same rules: labelled code field with `autocomplete="one-time-code"`, `inputmode="numeric"`, errors associated and focused, countdown that is NOT a live region (one polite announcement at 1 minute left, alert at expiry), recovery codes in an ordered list with an acknowledgement before "Done".

Checked and found already fine (no change): skip link and `#main` on every layout, one `<h1>` per page (smoke test), landmarks, form labels/hints/errors through `UiFormField`, toasts (separate polite and assertive regions), table markup (scope, caption, aria-sort, focusable scroll regions), reduced motion (`prefers-reduced-motion` in `main.css`), 44 px touch targets (`min-h-touch`), logical CSS properties everywhere, Italian terms in Arabic (`lang="it" dir="ltr"` through `UiItalianTerm`/`UiAutoItalian`, vocabulary, lessons, exam statements).

Left (not fixed):
- `lang`/`dir` for `fallback` content on the remaining detail pages (government services, appointments, study, patente topics, lessons, cities page body, search results). Low frequency (only when a translation is missing). Same one-line `v-bind="contentLang(x)"` per element.
- Icon mirroring: icons are symmetric or directional only through `aria-hidden` arrows in a few places (pagination arrows, back links). Not audited glyph by glyph; see manual item M-RTL-3.
- No dark theme exists, so dark contrast is not applicable. If one is added, extend `tests/contrast.test.ts`.
- Charts/score ring (`UiScoreRing`, progress bars) expose text equivalents; the admin analytics tables are tables. No custom chart exists that needs a data table alternative.
- Audio listening exercises use browser speech synthesis; there is no transcript for pre-recorded audio because there is none yet (BACKEND_REQUESTS #30).

## 3. MANUAL_VERIFICATION_REQUIRED

Nobody has run these on a real screen reader. Record the result (pass/fail, device, OS, reader version) next to each line before launch. Run each in Arabic (RTL) and one of English/Italian.

Environments: VoiceOver on macOS Safari and iOS Safari; TalkBack on Android Chrome; NVDA on Windows with Firefox and Chrome. Also: browser zoom 200% and 400%, OS "increase contrast" / Windows forced colors, keyboard only (no mouse).

| ID | Scenario | Expected announcement / behaviour |
|---|---|---|
| M-NAV-1 | Load `/ar`, press Tab once | "Skip to main content" (Arabic text) link focused and visible; Enter moves to the main region, next Tab goes to the first control inside |
| M-NAV-2 | Follow a link to another page (for example Guides) | Page title is spoken after navigation ("... | EXPA"), focus is not lost into the void |
| M-NAV-3 | Landmarks rotor / NVDA D key | banner, navigation "Main navigation", search, main, contentinfo; mobile bottom nav is a named navigation |
| M-FORM-1 | Login with a wrong password | Error message read automatically ("These credentials do not match..."), focus remains in the form; field is announced "invalid" |
| M-FORM-2 | Register, submit empty | Focus lands on "Full name"; reader says the field name, "required", "invalid entry", then the error text; Tab moves to the next field with its error |
| M-FORM-3 | Password field | "Show password" toggle announces pressed state; typed password is not spoken as plain text |
| M-2FA-1 | Staff login with 2FA | After the password, the heading "Two-step verification" and the code field are announced; the field is announced as "6-digit code, edit text, required, <hint>"; the OS offers the SMS/authenticator autofill where supported |
| M-2FA-2 | Wait until 1 minute remains | One polite announcement "Less than one minute left to enter the code." (not every second). At expiry an alert says the step expired; focus can reach "Start again" |
| M-2FA-3 | Wrong code | Alert "That code is not correct..." and focus back in the field; after 5 wrong codes the alert says how many seconds to wait and the button is announced "dimmed/unavailable" |
| M-2FA-4 | Setup: QR code | The QR image has a text alternative; the manual-key disclosure ("Cannot scan the code?") opens with Space/Enter and the key is read in groups of four letters, left-to-right, in Arabic UI too |
| M-2FA-5 | Recovery codes screen | Heading receives focus and is read; the warning "shown only once" is read; the list is announced as a list of 10 items; "Done" stays disabled until the checkbox is checked ("dimmed") |
| M-2FA-6 | Admin without 2FA | Gate heading is read on arrival; the "Set up now" link is the first tab stop in the main region |
| M-DLG-1 | Admin users: "Details" opens the drawer | Reader says dialog with the user's name as its title; Tab cycles inside; Escape closes; focus returns to the "Details" button of that row |
| M-DLG-2 | Mobile admin menu | Toggle announces expanded/collapsed; background content is not reachable while open; Escape returns focus to the toggle |
| M-ASK-1 | Ask EXPA: send a question | Sending state is announced ("busy"); the answer is read once through the polite log region; source and "General guidance" label are read before the disclaimer; sources are links with meaningful names |
| M-EXAM-1 | Patente practice | Question counter ("Question 1 of 2") is read; the true/false group is announced as a radio group with "1 of 2"; arrows move and select; the live status announces progress; the timer is not read every second (exam mode) |
| M-EXAM-2 | Finish and submit | The confirmation is announced as an alert dialog, focus starts on a button inside it; after submit the results heading is read |
| M-TABLE-1 | Admin list / net-salary table | Table caption read first, column headers announced when moving by cell, sortable columns announce sort state; the scrolling region is focusable and named |
| M-LANG-1 | Arabic page with Italian terms ("Permesso di soggiorno") and fallback-language cards | The reader switches to an Italian voice for `lang="it"` fragments and to English for English fallback cards; digits and Latin text are not reversed |
| M-LANG-2 | Language switcher | Current language is announced as current/selected; changing it announces the new page title in the new language |
| M-TOAST-1 | Any success toast and any error toast | Success is polite; errors are assertive, stay until dismissed, and the dismiss button is reachable |
| M-RTL-1 | Arabic layout at 200% and 400% zoom | No clipped text, no horizontal scroll, focus order follows the visual (right-to-left) order |
| M-RTL-2 | Windows forced colors / high contrast | Focus ring, borders of inputs, badges and progress bars remain visible; status badges still carry text |
| M-RTL-3 | Directional icons (arrows, chevrons) in Arabic | Pointing in the reading direction (back = right in RTL); fix `rtl:` mirroring where wrong |
| M-MOTION-1 | OS reduced motion on | Spinners may still turn but no sliding or smooth scrolling; nothing essential relies on animation |
| M-TOUCH-1 | iOS/Android, one-handed | All primary actions reachable with 44 px targets; bottom navigation does not cover focused fields (scroll into view) |

## 4. How to re-run

```
cd web
npm run test                 # includes tests/a11y-static.test.ts, contrast, i18n, lint-style
npm run typecheck
EXPA_BUILD_DIR=.nuxt-b EXPA_OUTPUT_DIR=.output-b NUXT_IGNORE_LOCK=1 npm run build
EXPA_OUTPUT_DIR=.output-b E2E_CHROMIUM=<chrome-headless-shell> npx playwright test   # whole suite incl. axe
```
