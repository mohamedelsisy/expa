import type { Config } from 'tailwindcss'

// Tokens live in assets/css/tokens.css; this file only maps names to the CSS variables.
const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './error.vue',
  ],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    borderRadius: {
      none: '0',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      1: 'var(--elev-1)',
      2: 'var(--elev-2)',
      3: 'var(--elev-3)',
    },
    extend: {
      colors: {
        canvas: c('canvas'),
        surface: c('surface'),
        sunken: c('sunken'),
        line: c('line'),
        'line-strong': c('line-strong'),
        ink: c('ink'),
        'ink-soft': c('ink-soft'),
        muted: c('muted'),
        primary: c('primary'),
        'primary-strong': c('primary-strong'),
        'primary-soft': c('primary-soft'),
        'on-primary': c('on-primary'),
        accent: c('accent'),
        'accent-strong': c('accent-strong'),
        'accent-soft': c('accent-soft'),
        'on-accent': c('on-accent'),
        success: c('success'),
        'success-soft': c('success-soft'),
        warning: c('warning'),
        'warning-soft': c('warning-soft'),
        danger: c('danger'),
        'danger-soft': c('danger-soft'),
        info: c('info'),
        'info-soft': c('info-soft'),
      },
      minHeight: { touch: 'var(--touch-min)' },
      minWidth: { touch: 'var(--touch-min)' },
      height: { 'bottom-nav': 'var(--bottom-nav-h)' },
      spacing: { 'bottom-nav': 'var(--bottom-nav-h)' },
    },
  },
} satisfies Config
