import { jsonLd } from '~/utils/safe'
import { localeDir } from '~/utils/locale'

interface SeoInput {
  title: string
  description: string
  type?: 'website' | 'article'
  /** Absolute-path image for OG; defaults to the brand mark. */
  image?: string
  noindex?: boolean
  jsonLdData?: Record<string, unknown>
}

/** Per-page SEO: title, description, OG/Twitter, canonical, hreflang alternates, <html lang dir>, JSON-LD. */
export function useSeo(input: SeoInput | (() => SeoInput)) {
  const { locale, locales } = useI18n()
  const route = useRoute()
  const switchLocalePath = useSwitchLocalePath()
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const get = () => (typeof input === 'function' ? input() : input)

  const links = computed(() => {
    const list: { rel: string, href: string, hreflang?: string }[] = [
      { rel: 'canonical', href: siteUrl + (switchLocalePath(locale.value) || route.path) },
    ]
    for (const l of locales.value as { code: string }[]) {
      list.push({ rel: 'alternate', hreflang: l.code, href: siteUrl + switchLocalePath(l.code as 'ar') })
    }
    list.push({ rel: 'alternate', hreflang: 'x-default', href: siteUrl + switchLocalePath('ar') })
    return list
  })

  useHead(() => {
    const i = get()
    return {
      htmlAttrs: { lang: locale.value, dir: localeDir(locale.value) },
      title: i.title,
      link: links.value,
      meta: [
        { name: 'description', content: i.description },
        ...(i.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
      ],
      script: i.jsonLdData ? [{ type: 'application/ld+json', innerHTML: jsonLd(i.jsonLdData) }] : [],
    }
  })
  useSeoMeta(() => {
    const i = get()
    return {
      ogTitle: i.title,
      ogDescription: i.description,
      ogType: i.type ?? 'website',
      ogSiteName: 'EXPA',
      ogLocale: locale.value,
      ogUrl: siteUrl + (switchLocalePath(locale.value) || route.path),
      ogImage: siteUrl + (i.image ?? '/og-image.svg'),
      twitterCard: 'summary_large_image' as const,
      twitterTitle: i.title,
      twitterDescription: i.description,
    }
  })
}
