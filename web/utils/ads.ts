/**
 * Pure rules for advertising (Google AdSense). Everything that decides WHETHER an ad may be requested lives here so
 * it is unit-tested; the plugin / component only apply the answer.
 *
 * Principles: public content pages only; no request to an ad server before the visitor's consent signal (TCF) allows
 * it; fail closed (unknown plan, missing CMP, timeout => no ads); paid plans see none.
 */

export interface AdsConfig {
  enabled: boolean
  clientId: string
  /** Comma separated plan keys that never see ads (e.g. "plus,pro"). */
  adFreePlans: string
  /** Slot name => AdSense ad-unit id. A slot without an id renders nothing. */
  slots: Record<string, string>
}

/** Route prefixes (after the locale segment) where an ad is never shown, even if a slot is placed there by mistake. */
export const ADS_DENY_PREFIXES = [
  'admin', 'provider', 'dashboard', 'profile', 'onboarding', 'tasks', 'notifications', 'documents', 'settings', 'privacy-settings',
  'ask', 'search', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'my-requests', 'recommendations',
  'pricing', 'patente/run', 'patente/results', 'money/explain', 'housing/check',
] as const

const CLIENT_ID = /^ca-pub-\d{10,20}$/

export function isValidClientId(id: string): boolean {
  return CLIENT_ID.test(id)
}

/** AdSense enabled AND configured with a well-formed publisher id. */
export function adsConfigured(c: Pick<AdsConfig, 'enabled' | 'clientId'>): boolean {
  return c.enabled === true && isValidClientId(c.clientId)
}

export function parsePlanList(csv: string): string[] {
  return csv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

/** Paid plans are ad-free. An unknown plan (not loaded / request failed) is treated as "do not show" by callers. */
export function isAdFreePlan(planKey: string | null | undefined, adFreePlans: string): boolean {
  return !!planKey && parsePlanList(adFreePlans).includes(planKey.toLowerCase())
}

/** `/ar/articles/x` => `articles/x`. Accepts a path without a locale too. */
export function stripLocale(path: string): string {
  return path.replace(/^\/(ar|en|it)(?=\/|$)/, '').replace(/^\/+/, '').replace(/[?#].*$/, '').replace(/\/+$/, '')
}

export function adsAllowedOnPath(path: string): boolean {
  const p = stripLocale(path)
  return !ADS_DENY_PREFIXES.some(d => p === d || p.startsWith(`${d}/`))
}

/** Subset of the IAB TCF v2 TCData object that matters here. */
export interface TcData {
  gdprApplies?: boolean
  eventStatus?: string
  purpose?: { consents?: Record<string, boolean> }
}

/**
 * May an ad be requested? Only once the CMP has produced a decision (`tcloaded` = stored choice, or
 * `useractioncomplete`), and then if GDPR does not apply or purpose 1 (store/access information on a device) is
 * consented. Google applies the other purposes itself from the same TC string (non-personalised otherwise).
 */
export function tcfAllowsAds(d: TcData | null | undefined): boolean {
  if (!d) return false
  if (d.eventStatus !== 'tcloaded' && d.eventStatus !== 'useractioncomplete') return false
  if (d.gdprApplies === false) return true
  return d.purpose?.consents?.['1'] === true
}

export const adsenseSrc = (clientId: string) => `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
/** Google Funding Choices (Google's TCF-certified CMP) message script for a publisher id `ca-pub-123` => `pub-123`. */
export const fundingChoicesSrc = (clientId: string) => `https://fundingchoicesmessages.google.com/i/${encodeURIComponent(clientId.replace(/^ca-/, ''))}?ers=1`

/** Body of /ads.txt (authorised sellers). f08c47fec0942fa0 is Google's certification authority id. */
export function adsTxt(clientId: string): string | null {
  if (!isValidClientId(clientId)) return null
  return `google.com, ${clientId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
}

/** CSP additions needed by AdSense + Funding Choices (see docs/ADS.md). Empty when ads are off. */
export function adsCspSources(on: boolean): { script: string[], frame: string[], connect: string[], img: string[] } {
  if (!on) return { script: [], frame: [], connect: [], img: [] }
  return {
    script: ['https://pagead2.googlesyndication.com', 'https://fundingchoicesmessages.google.com', 'https://partner.googleadservices.com', 'https://tpc.googlesyndication.com', 'https://www.googletagservices.com'],
    frame: ['https://googleads.g.doubleclick.net', 'https://tpc.googlesyndication.com', 'https://fundingchoicesmessages.google.com', 'https://www.google.com'],
    connect: ['https://pagead2.googlesyndication.com', 'https://fundingchoicesmessages.google.com', 'https://*.google.com', 'https://*.doubleclick.net', 'https://*.g.doubleclick.net'],
    img: ['https:'],
  }
}
