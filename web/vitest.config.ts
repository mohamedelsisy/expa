import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#imports': r('./tests/stubs/imports.ts'),
      '~': r('./'),
    },
  },
  test: { environment: 'happy-dom', include: ['tests/**/*.test.ts'] },
})
