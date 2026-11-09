import { x as useRuntimeConfig, z as setResponseHeader, A as defineCachedFunction } from '../nitro/nitro.mjs';
import { b as buildSitemap, c as collectEntries } from './sitemap.mjs';

async function entriesFor(event) {
  const cfg = useRuntimeConfig(event);
  const base = String(cfg.apiBaseUrl).replace(/\/+$/, "");
  return collectEntries(async (path) => {
    const res = await fetch(`${base}/${path}`, { headers: { Accept: "application/json", "Accept-Language": "en" }, signal: AbortSignal.timeout(5e3) });
    return { status: res.status, json: await res.json().catch(() => null) };
  });
}
const cachedEntries = defineCachedFunction(entriesFor, { name: "sitemap-entries", maxAge: 3600, getKey: () => "all", swr: true });
async function localeSitemap(event, locale) {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, "");
  setResponseHeader(event, "content-type", "application/xml; charset=utf-8");
  setResponseHeader(event, "cache-control", "public, max-age=3600");
  return buildSitemap(site, locale, await cachedEntries(event));
}

export { localeSitemap as l };
//# sourceMappingURL=sitemapRoute.mjs.map
