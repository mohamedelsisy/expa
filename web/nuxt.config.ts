// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  ssr: true,
  typescript: { strict: true, typeCheck: false },

  modules: ['@nuxtjs/i18n', '@nuxtjs/tailwindcss', '@pinia/nuxt'],

  css: [
    '@fontsource/ibm-plex-sans-arabic/arabic-400.css',
    '@fontsource/ibm-plex-sans-arabic/arabic-500.css',
    '@fontsource/ibm-plex-sans-arabic/arabic-700.css',
    '@fontsource/inter/latin-400.css',
    '@fontsource/inter/latin-ext-400.css',
    '@fontsource/inter/latin-500.css',
    '@fontsource/inter/latin-600.css',
    '@fontsource/inter/latin-700.css',
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
  ],

  // Arabic-first: `ar` is default, URL prefix is always present, `/` redirects to `/ar`.
  i18n: {
    locales: [
      { code: 'ar', language: 'ar', dir: 'rtl', name: 'العربية', file: 'ar.json' },
      { code: 'en', language: 'en', dir: 'ltr', name: 'English', file: 'en.json' },
      { code: 'it', language: 'it', dir: 'ltr', name: 'Italiano', file: 'it.json' },
    ],
    defaultLocale: 'ar',
    strategy: 'prefix',
    langDir: 'locales',
    restructureDir: 'i18n',
    detectBrowserLanguage: false,
    vueI18n: 'i18n.config.ts',
    // Only the active locale's messages are fetched (the others load on demand when the user switches).
    lazy: true,
    bundle: { optimizeTranslationDirective: false },
  },

  // Runtime configuration. Every value below is overridable at container start with the matching `NUXT_` variable
  // (NUXT_API_BASE_URL, NUXT_PUBLIC_SITE_URL, ...). Nothing here reads process.env, because that would freeze the
  // value at build time. Production defaults are intentionally empty; the server refuses to boot until they are set
  // (server/plugins/runtime-check.ts). `nuxt dev` gets local defaults.
  runtimeConfig: {
    // Server only. Never exposed to the browser.
    apiBaseUrl: isDev ? 'http://127.0.0.1:8001/api/v1' : '',
    apiTimeoutMs: 10000,
    // Number of reverse proxies in front of this server that append to X-Forwarded-For (0 = none, use the socket address).
    trustedProxyHops: 0,
    // 'auto' (Secure when NODE_ENV=production or X-Forwarded-Proto=https), 'true' or 'false'.
    cookieSecure: 'auto',
    security: {
      // Send Strict-Transport-Security. Enable only when every access path is https.
      hsts: false,
    },
    public: {
      siteUrl: isDev ? 'http://localhost:3000' : '',
    },
  },

  nitro: {
    // Pre-compress static assets (.gz/.br) at build time. Dynamic HTML is compressed by the reverse proxy (docs/DEPLOYMENT.md).
    compressPublicAssets: true,
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0F6B5C' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  routeRules: {
    '/api/**': { headers: { 'cache-control': 'no-store' } },
    // Mock-exam questions and review are never server-rendered, prerendered or cached: SPA shell only.
    // Admin: never cached, never indexed.
    '/ar/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/en/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/it/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/ar/patente/run/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/en/patente/run/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/it/patente/run/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/ar/patente/results/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/en/patente/results/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
    '/it/patente/results/**': { ssr: false, headers: { 'cache-control': 'no-store' } },
  },
})
