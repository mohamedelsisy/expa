import { setResponseHeader } from 'h3'

/** Dynamic so the Sitemap line carries the runtime site URL (NUXT_PUBLIC_SITE_URL). */
export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /*/admin',
    'Disallow: /*/login',
    'Disallow: /*/register',
    'Disallow: /*/forgot-password',
    'Disallow: /*/reset-password',
    'Disallow: /*/verify-email',
    'Disallow: /*/dashboard',
    'Disallow: /*/profile',
    'Disallow: /*/onboarding',
    'Disallow: /*/tasks',
    'Disallow: /*/notifications',
    'Disallow: /*/documents',
    'Disallow: /*/privacy-settings',
    'Disallow: /*/search',
    'Disallow: /*/ask',
    'Disallow: /*/patente/run',
    'Disallow: /*/patente/results',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n')
})
