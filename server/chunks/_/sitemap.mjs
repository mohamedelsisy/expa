const SITEMAP_LOCALES = ["ar", "en", "it"];
const STATIC_PATHS = [
  "/",
  "/explore",
  "/guides",
  "/government",
  "/appointments",
  "/learn-italian",
  "/patente",
  "/jobs",
  "/study",
  "/study/universities",
  "/study/programs",
  "/study/scholarships",
  "/study/finder",
  "/cities",
  "/pricing",
  "/housing",
  "/articles",
  "/services",
  "/healthcare",
  "/money",
  "/money/net-salary",
  "/business",
  "/family",
  "/travel",
  "/travel/requirements",
  "/daily-life",
  "/about"
];
const LEGAL_SLUGS = ["privacy", "terms", "cookies"];
const DYNAMIC_SOURCES = [
  { api: "guides", path: (s) => `/guides/${s}` },
  { api: "government/services", path: (s) => `/government/services/${s}` },
  { api: "government/offices", path: (s) => `/government/offices/${s}` },
  { api: "appointments/guides", path: (s) => `/appointments/${s}` },
  { api: "italian/lessons", path: (s) => `/learn-italian/lessons/${s}` },
  { api: "patente/topics", path: (s) => `/patente/topics/${s}` },
  { api: "study/universities", path: (s) => `/study/universities/${s}` },
  { api: "study/programs", path: (s) => `/study/programs/${s}` },
  { api: "study/scholarships", path: (s) => `/study/scholarships/${s}` },
  { api: "articles", path: (s) => `/articles/${s}` },
  { api: "city-profiles", path: (s) => `/cities/${s}` },
  { api: "providers", path: (s) => `/services/${s}` }
];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const url = (site, locale, path) => `${site}/${locale}${path === "/" ? "" : path}`;
const SLUG = /^[A-Za-z0-9._~-]+$/;
function buildSitemap(site, locale, entries) {
  const body = entries.map((e) => {
    const alt = [...SITEMAP_LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(url(site, l, e.path))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(url(site, "ar", e.path))}"/>`].join("");
    const lastmod = e.lastmod && !Number.isNaN(Date.parse(e.lastmod)) ? `<lastmod>${new Date(e.lastmod).toISOString().slice(0, 10)}</lastmod>` : "";
    return `<url><loc>${esc(url(site, locale, e.path))}</loc>${lastmod}${alt}</url>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`;
}
function buildSitemapIndex(site) {
  const body = SITEMAP_LOCALES.map((l) => `<sitemap><loc>${esc(`${site}/sitemap-${l}.xml`)}</loc></sitemap>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}
async function collectEntries(fetchJson, maxPages = 20) {
  var _a, _b, _c;
  const entries = STATIC_PATHS.map((path) => ({ path }));
  for (const slug of LEGAL_SLUGS) {
    const r = await fetchJson(`legal/${slug}`).catch(() => null);
    const d = (_a = r == null ? void 0 : r.json) == null ? void 0 : _a.data;
    if ((r == null ? void 0 : r.status) === 200 && d) entries.push({ path: `/${slug}`, lastmod: d.published_at });
  }
  for (const src of DYNAMIC_SOURCES) {
    for (let page = 1; page <= maxPages; page++) {
      const r = await fetchJson(`${src.api}?per_page=50&page=${page}`).catch(() => null);
      const j = r == null ? void 0 : r.json;
      if (!r || r.status !== 200 || !Array.isArray(j == null ? void 0 : j.data)) break;
      for (const item of j.data) if (typeof item.slug === "string" && SLUG.test(item.slug)) entries.push({ path: src.path(item.slug), lastmod: item.updated_at });
      if (page >= ((_c = (_b = j.meta) == null ? void 0 : _b.last_page) != null ? _c : 1)) break;
    }
  }
  return entries;
}

export { buildSitemapIndex as a, buildSitemap as b, collectEntries as c };
//# sourceMappingURL=sitemap.mjs.map
