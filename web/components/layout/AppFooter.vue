<script setup lang="ts">
const { t } = useI18n()
const explore = [
  { to: '/guides', key: 'guides' }, { to: '/government', key: 'government' }, { to: '/jobs', key: 'jobs' },
  { to: '/study', key: 'study' }, { to: '/pricing', key: 'pricing' },
]
const legal = [{ to: '/privacy', key: 'privacy' }, { to: '/terms', key: 'terms' }, { to: '/cookies', key: 'cookies' }, { to: '/privacy-settings', key: 'settings' }]
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="container-page space-y-4 py-6 text-sm text-muted">
      <div class="grid gap-4 sm:grid-cols-2">
        <nav :aria-label="t('footer.exploreNav')">
          <ul class="flex flex-wrap gap-x-4">
            <li v-for="l in explore" :key="l.key"><UiButton :to="l.to" variant="ghost" class="!min-h-touch !px-2">{{ t(`footer.links.${l.key}`) }}</UiButton></li>
          </ul>
        </nav>
        <nav :aria-label="t('footer.legalNav')">
          <ul class="flex flex-wrap gap-x-4 sm:justify-end">
            <li v-for="l in legal" :key="l.key"><UiButton :to="l.to" variant="ghost" class="!min-h-touch !px-2">{{ t(`footer.links.${l.key}`) }}</UiButton></li>
          </ul>
        </nav>
      </div>
      <p>{{ t('footer.disclaimer') }}</p>
    </div>
  </footer>
</template>
