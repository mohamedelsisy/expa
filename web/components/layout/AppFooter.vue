<script setup lang="ts">
import { OWNER_NAME, WHATSAPP_DISPLAY, whatsappUrl } from '~/utils/contact'

const { t } = useI18n()
const community = useCommunityMeta()
onMounted(() => { void community.load() })
const base = [
  { to: '/guides', key: 'guides' }, { to: '/government', key: 'government' }, { to: '/jobs', key: 'jobs' },
  { to: '/study', key: 'study' }, { to: '/housing', key: 'housing' }, { to: '/cities', key: 'cities' },
  { to: '/articles', key: 'articles' }, { to: '/services', key: 'services' },
  { to: '/healthcare', key: 'healthcare' }, { to: '/money', key: 'money' }, { to: '/money/net-salary', key: 'netSalary' }, { to: '/business', key: 'business' },
  { to: '/family', key: 'family' }, { to: '/travel', key: 'travel' }, { to: '/travel/requirements', key: 'travelRequirements' }, { to: '/daily-life', key: 'dailyLife' }, { to: '/about', key: 'about' },
]
const explore = computed(() => [...base, ...(community.enabled.value ? [{ to: '/community', key: 'community' }] : []), { to: '/pricing', key: 'pricing' }])
const year = new Date().getFullYear()
const legal = [{ to: '/privacy', key: 'privacy' }, { to: '/terms', key: 'terms' }, { to: '/cookies', key: 'cookies' }, { to: '/privacy-settings', key: 'settings' }]
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <!-- pb-24 below lg keeps the last row clear of the fixed bottom navigation -->
    <div class="container-page space-y-4 pb-24 pt-6 text-sm text-muted lg:pb-6">
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
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
        <p data-testid="footer-copyright">{{ t('footer.copyright', { year, name: OWNER_NAME }) }}</p>
        <a
          :href="whatsappUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-touch items-center gap-2 rounded-md px-2 font-medium text-primary-strong underline-offset-4 hover:underline"
          data-testid="footer-whatsapp"
          :aria-label="t('footer.whatsappLabel', { number: WHATSAPP_DISPLAY })"
        ><UiIcon name="phone" :size="18" />{{ t('footer.whatsapp') }}<span dir="ltr" class="text-muted">{{ WHATSAPP_DISPLAY }}</span></a>
      </div>
    </div>
  </footer>
</template>
