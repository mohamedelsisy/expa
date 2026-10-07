/**
 * Client-reported analytics (POST /analytics/events). Only `appointment_clicked` is posted by the web app:
 * the backend counts `guide_view` and `job_view` itself on GET /guides/{slug} and /jobs/{id} when the request carries
 * the consent header (added by the BFF from the consent cookie) or the signed-in user consented, so posting those
 * again would double count.
 */
export const ANALYTICS_COOKIE = 'expa_analytics'
export type AnalyticsConsent = 'granted' | 'denied' | null

export const CLIENT_EVENTS = ['appointment_clicked'] as const
export type ClientEvent = typeof CLIENT_EVENTS[number]

/** Backend subject rule: slug-like, max 120 chars. Anything else is dropped (the event is still counted without subject). */
export function cleanSubject(subject: unknown): string | undefined {
  return typeof subject === 'string' && subject.length <= 120 && /^[a-z0-9][a-z0-9\-_/]*$/i.test(subject) ? subject : undefined
}

/** Anonymous visitors need an explicit "granted"; signed-in users are judged by the stored `analytics` consent on the API. */
export function mayReport(authenticated: boolean, consent: AnalyticsConsent): boolean {
  return authenticated ? consent !== 'denied' : consent === 'granted'
}

/** Drops an identical event repeated within `windowMs` (double click, re-render, link + handler). */
export function createDeduper(windowMs = 3000, now: () => number = Date.now) {
  const seen = new Map<string, number>()
  return (key: string): boolean => {
    const t = now()
    const last = seen.get(key)
    if (last !== undefined && t - last < windowMs) return false
    seen.set(key, t)
    return true
  }
}
