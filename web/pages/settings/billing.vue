<script setup lang="ts">
import { formatDate } from '~/utils/locale'
import { formatMoney } from '~/utils/money'
import { isApiError } from '~/utils/errors'

definePageMeta({ middleware: 'auth' })
interface Sub { plan: { key: string, name?: string }, status: string, provider: string | null, current_period_end: string | null, cancel_at_period_end: boolean, billing_available: boolean }
interface Invoice { number: string, total_minor: number, currency: string, description: string | null, issued_at: string, net_minor?: number, tax?: { rate: number | string, amount_minor: number, country: string } }
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('billing.title'), description: t('billing.subtitle'), noindex: true }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('profile.title'), to: '/profile' }, { label: t('billing.title') }])
const { data, error, refresh, status } = await useAsyncData('billing-subscription', async () => (await request<Sub>('billing/subscription')).data)
const { data: invoices, refresh: refreshInvoices } = await useAsyncData('billing-invoices', async () => { try { return (await request<Invoice[]>('billing/invoices')).data } catch { return [] as Invoice[] } })
const sub = computed(() => data.value)
const paid = computed(() => !!sub.value && sub.value.status !== 'free' && sub.value.plan.key !== 'free')
const canCancel = computed(() => paid.value && sub.value!.billing_available && !sub.value!.cancel_at_period_end && ['active', 'trialing', 'past_due'].includes(sub.value!.status))
const confirming = ref(false)
const busy = ref(false)
const failure = ref('')
async function cancel() {
  busy.value = true; failure.value = ''
  try {
    await request('billing/cancel', { method: 'POST' })
    toast.success(t('billing.canceled'))
    confirming.value = false
    await Promise.all([refresh(), refreshInvoices()])
  } catch (e) {
    failure.value = isApiError(e) && e.status === 503 ? t('billing.unavailable') : isApiError(e) ? e.message : t('errors.generic')
  } finally { busy.value = false }
}
const money = (minor: number, cur: string) => formatMoney(minor / 100, cur, locale.value, 2)
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('billing.title') }}</h1>
    <p class="mt-1 mb-6 text-ink-soft">{{ t('billing.subtitle') }}</p>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="3" /></div>
    <UiErrorState v-else-if="error || !sub" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <template v-else>
      <UiAlert v-if="!sub.billing_available" tone="info" class="mb-6" :title="t('pricing.notEnabledTitle')" data-testid="billing-unavailable">{{ t('billing.notAvailable') }}</UiAlert>
      <UiCard class="space-y-3" aria-labelledby="plan-h">
        <h2 id="plan-h" class="text-xl font-bold">{{ t('billing.currentPlan') }}</h2>
        <p class="flex flex-wrap items-center gap-2 text-lg"><span class="font-semibold">{{ sub.plan.name ?? sub.plan.key }}</span><UiBadge tone="neutral">{{ t(`billing.status.${sub.status}`) }}</UiBadge></p>
        <p v-if="sub.current_period_end && paid" class="text-ink-soft">{{ sub.cancel_at_period_end ? t('billing.endsOn', { date: formatDate(sub.current_period_end, locale) }) : t('billing.renewsOn', { date: formatDate(sub.current_period_end, locale) }) }}</p>
        <p v-if="!paid" class="text-ink-soft">{{ t('billing.freePlan') }}</p>
        <div aria-live="polite"><UiAlert v-if="failure" tone="danger">{{ failure }}</UiAlert></div>
        <div class="flex flex-wrap gap-3">
          <UiButton v-if="!paid || !sub.billing_available" to="/pricing" variant="secondary">{{ t('billing.seePlans') }}</UiButton>
          <UiButton v-if="canCancel && !confirming" variant="danger" @click="confirming = true">{{ t('billing.cancel') }}</UiButton>
        </div>
        <UiConfirmInline v-if="confirming" :message="t('billing.cancelConfirm')" :confirm-label="t('billing.cancel')" :loading="busy" @cancel="confirming = false" @confirm="cancel" />
        <p v-if="paid && sub.cancel_at_period_end" class="text-sm text-muted">{{ t('billing.cancelNote') }}</p>
      </UiCard>

      <section aria-labelledby="inv-h" class="mt-8 space-y-3">
        <h2 id="inv-h" class="text-xl font-bold">{{ t('billing.invoices') }}</h2>
        <p v-if="!invoices?.length" class="text-ink-soft">{{ t('billing.noInvoices') }}</p>
        <ul v-else class="space-y-2">
          <li v-for="i in invoices" :key="i.number" class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface p-3">
            <p><span class="font-semibold" dir="ltr">{{ i.number }}</span><span class="text-sm text-muted"> · {{ formatDate(i.issued_at, locale) }}<template v-if="i.description"> · <span dir="auto">{{ i.description }}</span></template></span></p>
            <p class="font-semibold tabular-nums"><bdi>{{ money(i.total_minor, i.currency) }}</bdi><span v-if="i.tax" class="ms-2 text-sm font-normal text-muted">{{ t('billing.vatIncluded', { amount: money(i.tax.amount_minor, i.currency) }) }}</span></p>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
