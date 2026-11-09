import { j as jsonLd } from './safe-B2eSdAXJ.mjs';
import { u as useI18n, f as useRoute, m as useSwitchLocalePath, b as useRuntimeConfig, p as useHead, q as localeDir, r as useSeoMeta } from './server.mjs';
import { computed } from 'vue';

const CANONICAL_PARAMS = ["page"];
function canonicalPath(path) {
  const [base = "", rest = ""] = path.split("#")[0].split("?", 2);
  const params = new URLSearchParams(rest);
  const keep = new URLSearchParams();
  for (const k of CANONICAL_PARAMS) {
    const v = params.get(k);
    if (v && !(k === "page" && (v === "1" || !/^\d+$/.test(v)))) keep.set(k, v);
  }
  const q = keep.toString();
  const clean = base.length > 1 ? base.replace(/\/+$/, "") : base;
  return q ? `${clean}?${q}` : clean;
}
function isFilteredVariant(path) {
  const [, rest = ""] = path.split("?", 2);
  const params = new URLSearchParams(rest);
  for (const k of params.keys()) if (!CANONICAL_PARAMS.includes(k) && !k.startsWith("utm_")) return true;
  return false;
}
const OG_LOCALE = { ar: "ar_AR", en: "en_GB", it: "it_IT" };
const ogLocale = (code) => {
  var _a;
  return (_a = OG_LOCALE[code]) != null ? _a : code;
};
const ogLocaleAlternates = (code) => Object.keys(OG_LOCALE).filter((c) => c !== code).map(ogLocale);
function breadcrumbLd(items, currentUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => {
      var _a;
      return { "@type": "ListItem", position: i + 1, name: c.name, item: (_a = c.url) != null ? _a : currentUrl };
    })
  };
}
const DEFAULT_OG_IMAGE = "/og-image.png";
const ogImageFor = (image) => image != null ? image : DEFAULT_OG_IMAGE;
function useSeo(input) {
  const { locale, locales } = useI18n();
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, "");
  const get = () => typeof input === "function" ? input() : input;
  const here = () => canonicalPath(switchLocalePath(locale.value) || route.path);
  const robots = () => {
    const i = get();
    if (i.noindex || i.fallback) return "noindex, follow";
    return isFilteredVariant(route.fullPath) ? "noindex, follow" : null;
  };
  const links = computed(() => {
    const list = [{ rel: "canonical", href: siteUrl + here() }];
    if (!get().fallback) {
      for (const l of locales.value) {
        list.push({ rel: "alternate", hreflang: l.code, href: siteUrl + canonicalPath(switchLocalePath(l.code)) });
      }
      list.push({ rel: "alternate", hreflang: "x-default", href: siteUrl + canonicalPath(switchLocalePath("ar")) });
    }
    return list;
  });
  useHead(() => {
    const i = get();
    const ld = i.jsonLdData ? Array.isArray(i.jsonLdData) ? i.jsonLdData : [i.jsonLdData] : [];
    const r = robots();
    return {
      htmlAttrs: { lang: locale.value, dir: localeDir(locale.value) },
      title: i.title,
      link: links.value,
      meta: [
        { name: "description", content: i.description },
        ...r ? [{ name: "robots", content: r }] : []
      ],
      script: ld.map((d) => ({ type: "application/ld+json", innerHTML: jsonLd(d) }))
    };
  });
  useSeoMeta({
    ogTitle: () => get().title,
    ogDescription: () => get().description,
    ogType: () => {
      var _a;
      return (_a = get().type) != null ? _a : "website";
    },
    ogSiteName: "EXPA",
    ogLocale: () => ogLocale(locale.value),
    ogLocaleAlternate: () => ogLocaleAlternates(locale.value),
    ogUrl: () => siteUrl + here(),
    ogImage: () => siteUrl + ogImageFor(get().image),
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: "image/png",
    ogImageAlt: () => get().title,
    twitterCard: "summary_large_image",
    twitterTitle: () => get().title,
    twitterDescription: () => get().description,
    twitterImage: () => siteUrl + ogImageFor(get().image)
  });
}

export { breadcrumbLd as b, useSeo as u };
//# sourceMappingURL=useSeo-BU4sLOnV.mjs.map
