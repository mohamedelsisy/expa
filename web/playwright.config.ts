import { defineConfig } from '@playwright/test'

// E2E runs against a production build (`npm run build`) served on a free port with a stub API (no backend needed).
const WEB = Number(process.env.E2E_WEB_PORT ?? 3217)
const API = Number(process.env.E2E_API_PORT ?? 8791)
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  retries: 0,
  workers: 2,
  reporter: [['list']],
  // E2E_CHROMIUM=/path/to/chrome-headless-shell lets offline machines reuse an already installed Chromium.
  use: { baseURL: `http://127.0.0.1:${WEB}`, trace: 'off', launchOptions: process.env.E2E_CHROMIUM ? { executablePath: process.env.E2E_CHROMIUM } : {} },
  webServer: [
    { command: `node e2e/stub/server.mjs ${API}`, port: API, reuseExistingServer: false },
    {
      command: 'node .output/server/index.mjs',
      port: WEB,
      reuseExistingServer: false,
      env: {
        PORT: String(WEB), HOST: '127.0.0.1', NODE_ENV: 'production', EXPA_ALLOW_LOCAL: '1',
        NUXT_API_BASE_URL: `http://127.0.0.1:${API}/api/v1`, NUXT_PUBLIC_SITE_URL: `http://127.0.0.1:${WEB}`,
        NUXT_TRUSTED_PROXY_HOPS: '1',
      },
    },
  ],
})
