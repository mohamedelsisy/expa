# Advertising (Google AdSense)

Off by default. Nothing below loads, and `/ads.txt` returns 404, until it is configured.

## What it does
- Shows AdSense units only on public content pages: `/articles/[slug]` (slot `article`) and `/guides/[slug]` (slot `guide`).
- Never on account, document, AI, search, admin, exam or billing pages (`utils/ads.ts` `ADS_DENY_PREFIXES`, enforced by the
  `<AdsSlot>` component even if a slot is placed there by mistake).
- **Consent first.** Google's Funding Choices (TCF-certified CMP) message is loaded; the AdSense script is requested only after
  the TCF decision allows it (`tcfAllowsAds`: a stored/finished choice and purpose 1 consented, or GDPR not applicable).
  No CMP within 10 s, or consent ignored => no ads.
- **Paid plans are ad-free.** Signed-in visitors' plan is read from `GET /billing/subscription`; `plus` and `pro` (configurable)
  never get the script. If the plan cannot be read, no ads are shown.
- Ads are labelled ("Advertisement" / إعلان / Pubblicità) and never mixed into official-information blocks.

## Configure (runtime, no rebuild)
```
NUXT_PUBLIC_ADS_ENABLED=true
NUXT_PUBLIC_ADS_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NUXT_PUBLIC_ADS_AD_FREE_PLANS=plus,pro
NUXT_PUBLIC_ADS_SLOTS_ARTICLE=<ad unit id>
NUXT_PUBLIC_ADS_SLOTS_GUIDE=<ad unit id>
```
The server refuses to start if ads are enabled with a malformed client id.

## Steps in the AdSense account (cannot be done from code)
1. Add the production site and wait for approval (needs real public content, privacy policy, about and contact pages).
2. **Privacy & messaging**: create the GDPR message in Funding Choices for the EEA/UK/CH and publish it.
3. Create two display ad units (article, guide) and set their ids above. Fixed-size/responsive units only (no anchor or
   vignette formats: they cause layout shift and are intrusive on a government-information site).
4. **Blocking controls**: block sensitive categories (legal/immigration services, financial products, adult, gambling) so
   visa-scam style ads do not appear next to official guidance.
5. Confirm `https://<site>/ads.txt` shows the authorised-sellers line.

## Privacy / GDPR
- Update the cookie policy (`cookies` legal document, managed in the backend) to name Google as an advertising partner and to
  explain Funding Choices; record it in docs/GDPR.md. The first-party analytics consent is unrelated and unchanged.
- Signed-in users on a paid plan and users who refuse consent receive no ad request at all.

## CSP
`server/plugins/csp.ts` adds the Google ad and consent hosts (`adsCspSources`) only when ads are configured; without them the
policy is unchanged. Google's tags change: after enabling ads, check the browser console on staging for CSP violations and
extend `adsCspSources` (never with `'unsafe-eval'`).
