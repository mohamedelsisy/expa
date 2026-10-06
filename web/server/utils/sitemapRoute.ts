import type { H3Event } from 'h3'
import { setResponseHeader } from 'h3'
import { type SitemapLocale, buildSitemap, collectEntries } from './sitemap'

async function entriesFor(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  const base = String(cfg.apiBaseUrl).replace(/\/+$/, '')
  return collectEntries(async (path) => {
    const res = await fetch(`${base}/${path}`, { headers: { Accept: 'application/json', 'Accept-Language': 'en' }, signal: AbortSignal.timeout(5000) })
    return { status: res.status, json: await res.json().catch(() => null) }
  })
}

/** Cached for an hour so crawlers cannot turn the sitemap into API load. */
export const cachedEntries = defineCachedFunction(entriesFor, { name: 'sitemap-entries', maxAge: 3600, getKey: () => 'all', swr: true })

export async function localeSitemap(event: H3Event, locale: SitemapLocale) {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return buildSitemap(site, locale, await cachedEntries(event))
}
