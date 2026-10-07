<script setup lang="ts">
/**
 * Anonymous usage statistics consent for visitors without an account. Signed-in users decide in Privacy settings
 * (purpose `analytics`). The choice is a first-party cookie the BFF turns into the `X-Analytics-Consent` header.
 */
const { t } = useI18n()
const auth = useAuthStore()
const consent = useAnalyticsConsent()
const localePath = useLocalePath()
const visible = computed(() => !auth.isAuthenticated && consent.value !== 'granted' && consent.value !== 'denied')
const decide = (v: 'granted' | 'denied') => { consent.value = v }
</script>

<template>
  <section v-if="visible" :aria-label="t('analyticsConsent.title')" class="container-page pt-4" data-testid="analytics-consent">
    <UiAlert tone="info" :title="t('analyticsConsent.title')">
      <p>{{ t('analyticsConsent.body') }}</p>
      <p class="mt-1 text-sm text-ink-soft"><NuxtLink :to="localePath('/cookies')" class="inline-flex min-h-touch items-center underline underline-offset-4">{{ t('analyticsConsent.more') }}</NuxtLink></p>
      <div class="mt-2 flex flex-wrap gap-2">
        <UiButton variant="secondary" data-testid="analytics-allow" @click="decide('granted')">{{ t('analyticsConsent.allow') }}</UiButton>
        <UiButton variant="secondary" data-testid="analytics-deny" @click="decide('denied')">{{ t('analyticsConsent.deny') }}</UiButton>
      </div>
    </UiAlert>
  </section>
</template>
