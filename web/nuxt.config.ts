// https://nuxt.com/docs/api/configuration/nuxt-config
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
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    vueI18n: 'i18n.config.ts',
  },

  runtimeConfig: {
    // Server only. Never exposed to the browser.
    apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8001/api/v1',
    apiTimeoutMs: 10000,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
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
  },
})
