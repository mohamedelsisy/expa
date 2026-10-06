import { jsonLd } from '~/utils/safe'
import { localeDir } from '~/utils/locale'
import { canonicalPath, isFilteredVariant, ogImageFor, ogLocale, ogLocaleAlternates } from '~/utils/seo'

interface SeoInput {
  title: string
  description: string
  type?: 'website' | 'article'
  /** Absolute-path image for OG; defaults to the branded PNG. */
  image?: string
  noindex?: boolean
  /** Content is served in another language than the URL's: never index it and do not advertise it as this locale. */
  fallback?: boolean
  /** One schema.org object or several (Organization, WebSite, Article ...). */
  jsonLdData?: Record<string, unknown> | Record<string, unknown>[]
}

/** Per-page SEO: title, description, OG/Twitter, canonical, hreflang alternates, <html lang dir>, JSON-LD. */
export function useSeo(input: SeoInput | (() => SeoInput)) {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const get = () => (typeof input === 'function' ? input() : input)
  const here = () => canonicalPath(switchLocalePath(locale.value) || route.path)
  const robots = () => {
    const i = get()
    if (i.noindex || i.fallback) return 'noindex, follow'
    return isFilteredVariant(route.fullPath) ? 'noindex, follow' : null
  }

  const links = computed(() => {
    const list: { rel: string, href: string, hreflang?: string }[] = [{ rel: 'canonical', href: siteUrl + here() }]
    if (!get().fallback) {
      for (const l of locales.value as { code: string }[]) {
        list.push({ rel: 'alternate', hreflang: l.code, href: siteUrl + canonicalPath(switchLocalePath(l.code as 'ar')) })
      }
      list.push({ rel: 'alternate', hreflang: 'x-default', href: siteUrl + canonicalPath(switchLocalePath('ar')) })
    }
    return list
  })

  useHead(() => {
    const i = get()
    const ld = i.jsonLdData ? (Array.isArray(i.jsonLdData) ? i.jsonLdData : [i.jsonLdData]) : []
    const r = robots()
    return {
      htmlAttrs: { lang: locale.value, dir: localeDir(locale.value) },
      title: i.title,
      link: links.value,
      meta: [
        { name: 'description', content: i.description },
        ...(r ? [{ name: 'robots', content: r }] : []),
      ],
      script: ld.map(d => ({ type: 'application/ld+json', innerHTML: jsonLd(d) })),
    }
  })
  // Getter form: OG/Twitter tags follow reactive title and locale changes.
  useSeoMeta({
    ogTitle: () => get().title,
    ogDescription: () => get().description,
    ogType: () => get().type ?? 'website',
    ogSiteName: 'EXPA',
    ogLocale: () => ogLocale(locale.value),
    ogLocaleAlternate: () => ogLocaleAlternates(locale.value),
    ogUrl: () => siteUrl + here(),
    ogImage: () => siteUrl + ogImageFor(get().image),
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: 'image/png',
    ogImageAlt: () => get().title,
    twitterCard: 'summary_large_image',
    twitterTitle: () => get().title,
    twitterDescription: () => get().description,
    twitterImage: () => siteUrl + ogImageFor(get().image),
  })
}
