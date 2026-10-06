<script setup lang="ts">
import type { BillingPlan } from '~/types/api'
import { formatMoney } from '~/utils/money'
import { safeHttpsUrl } from '~/utils/safe'

interface SubscriptionInfo { plan: { key: string }, status: string, billing_available: boolean, current_period_end: string | null }

const { t, locale } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const { request } = useApi()
useSeo(() => ({ title: t('pricing.seo.title'), description: t('pricing.seo.description') }))

const { data, error, refresh, status } = await useAsyncData('pricing-plans', async () => (await request<BillingPlan[]>('billing/plans')).data, { watch: [locale] })
const plans = computed(() => data.value ?? [])
// The subscription endpoint tells us whether a payment provider is configured at all. Guests cannot know, so we assume "no".
const { data: sub } = await useAsyncData('pricing-subscription', async () => {
  if (!auth.isAuthenticated) return null
  try { return (await request<SubscriptionInfo>('billing/subscription', { handle401: false })).data } catch { return null }
}, { watch: [() => auth.isAuthenticated] })
const billingAvailable = computed(() => sub.value?.billing_available === true)
const currentKey = computed(() => sub.value?.plan?.key ?? (auth.isAuthenticated ? 'free' : null))

const KNOWN = ['ai_daily_limit', 'reminders_advanced', 'document_ai', 'human_credits']
function features(p: BillingPlan): { key: string, text: string, on: boolean }[] {
  const f = (p.features && typeof p.features === 'object' && !Array.isArray(p.features) ? p.features : {}) as Record<string, unknown>
  return KNOWN.filter(k => k in f).map((k) => {
    const v = f[k]
    const on = typeof v === 'boolean' ? v : Number(v) > 0
    return { key: k, on, text: typeof v === 'number' ? t(`pricing.features.${k}`, { count: v }) : t(`pricing.features.${k}`) }
  })
}
function price(p: BillingPlan) {
  if (!p.price.amount_minor) return t('pricing.free')
  const amount = formatMoney(p.price.amount_minor / 100, p.price.currency, locale.value, 2)
  return p.price.interval && p.price.interval !== 'none' ? `${amount} / ${t(`pricing.interval.${p.price.interval}`)}` : amount
}

const choosing = ref<string | null>(null)
async function choose(p: BillingPlan) {
  choosing.value = p.key
  try {
    const res = await request<{ checkout_url: string }>('billing/checkout', { method: 'POST', body: { plan: p.key } })
    const url = safeHttpsUrl(res.data.checkout_url)
    if (!url) throw new Error('bad url')
    await navigateTo(url, { external: true })
  } catch (e) {
    toast.error(isApiError(e) && e.status === 503 ? t('pricing.unavailable') : isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    choosing.value = null
  }
}
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('pricing.title') }])
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('pricing.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('pricing.subtitle') }}</p>
    </header>
    <UiAlert v-if="!billingAvailable" tone="info" :title="t('pricing.notEnabledTitle')" class="mb-6" data-testid="payments-disabled">{{ t('pricing.notEnabled') }}</UiAlert>

    <ul v-if="status === 'pending' && !data" class="grid gap-4 md:grid-cols-3" aria-busy="true"><li v-for="n in 3" :key="n"><UiCard><UiSkeleton :lines="5" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!plans.length" :title="t('pricing.emptyTitle')" :description="t('pricing.empty')" icon="euro" />
    <ul v-else class="grid gap-4 md:grid-cols-3">
      <li v-for="p in plans" :key="p.key">
        <UiCard as="article" class="flex h-full flex-col gap-3" :elevated="p.key === currentKey" :aria-labelledby="`plan-${p.key}`">
          <div class="flex items-center justify-between gap-2">
            <h2 :id="`plan-${p.key}`" class="text-xl font-bold">{{ p.name }}</h2>
            <UiBadge v-if="p.key === currentKey" tone="success">{{ t('pricing.current') }}</UiBadge>
          </div>
          <p class="text-2xl font-bold tabular-nums"><bdi>{{ price(p) }}</bdi></p>
          <p v-if="p.description" class="text-ink-soft">{{ p.description }}</p>
          <ul class="space-y-1.5">
            <li v-for="f in features(p)" :key="f.key" class="flex items-start gap-2">
              <UiIcon :name="f.on ? 'check' : 'x'" :size="18" :class="f.on ? 'mt-1 text-success' : 'mt-1 text-muted'" />
              <span :class="f.on ? '' : 'text-muted'"><span class="sr-only">{{ f.on ? t('pricing.included') : t('pricing.notIncluded') }}: </span>{{ f.text }}</span>
            </li>
          </ul>
          <div class="mt-auto pt-2">
            <UiButton v-if="p.key === currentKey || !p.price.amount_minor" variant="secondary" block disabled>{{ p.key === currentKey ? t('pricing.current') : t('pricing.includedFree') }}</UiButton>
            <UiButton v-else-if="!auth.isAuthenticated" to="/login" variant="secondary" block>{{ t('pricing.signInToSubscribe') }}</UiButton>
            <UiButton v-else-if="billingAvailable" block :loading="choosing === p.key" @click="choose(p)">{{ t('pricing.choose', { plan: p.name }) }}</UiButton>
            <UiButton v-else variant="secondary" block disabled>{{ t('pricing.notAvailableYet') }}</UiButton>
          </div>
        </UiCard>
      </li>
    </ul>
    <p class="mt-6 text-sm text-muted">{{ t('pricing.footnote') }}</p>
  </div>
</template>
