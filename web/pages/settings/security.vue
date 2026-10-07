<script setup lang="ts">
import { formatDateTime } from '~/utils/locale'
import { isApiError } from '~/utils/errors'

definePageMeta({ middleware: 'auth' })
interface Device { id: number, name: string | null, last_used_at: string | null, created_at: string | null, expires_at: string | null, current: boolean }
const { t, locale } = useI18n()
const { request } = useApi()
const auth = useAuthStore()
const toast = useToast()
const localePath = useLocalePath()
useSeo(() => ({ title: t('sessions.title'), description: t('sessions.subtitle'), noindex: true }))
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('profile.title'), to: '/profile' }, { label: t('sessions.title') }])
const { data, error, refresh, status } = await useAsyncData('auth-tokens', async () => (await request<Device[]>('auth/tokens')).data)
const busy = ref<number | 'all' | null>(null)
const confirmAll = ref(false)

async function endSession() {
  await auth.logout()
  await navigateTo(localePath('/login'))
}
async function revoke(d: Device) {
  busy.value = d.id
  try {
    await request(`auth/tokens/${d.id}`, { method: 'DELETE' })
    if (d.current) { await endSession(); return }
    toast.success(t('sessions.revoked'))
    await refresh()
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) } finally { busy.value = null }
}
async function logoutAll() {
  busy.value = 'all'
  try {
    await request('auth/logout-all', { method: 'POST' })
    await endSession()
  } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')); busy.value = null }
}
const label = (d: Device) => d.name || t('sessions.unknownDevice')
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('sessions.title') }}</h1>
    <p class="mt-1 mb-6 text-ink-soft">{{ t('sessions.subtitle') }}</p>
    <div v-if="status === 'pending' && !data" aria-busy="true"><UiSkeleton block :lines="3" /></div>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!data?.length" :title="t('sessions.emptyTitle')" :description="t('sessions.empty')" icon="lock" />
    <template v-else>
      <ul class="space-y-3">
        <li v-for="d in data" :key="d.id" class="space-y-1 rounded-lg border border-line bg-surface p-4" :data-testid="`device-${d.id}`">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="flex flex-wrap items-center gap-2 font-semibold"><span dir="auto">{{ label(d) }}</span><UiBadge v-if="d.current" tone="success">{{ t('sessions.thisDevice') }}</UiBadge></p>
            <UiButton variant="secondary" :loading="busy === d.id" @click="revoke(d)">{{ d.current ? t('sessions.signOutHere') : t('sessions.revoke') }}<span class="sr-only"> {{ label(d) }}</span></UiButton>
          </div>
          <p class="text-sm text-muted">{{ t('sessions.lastUsed', { date: d.last_used_at ? formatDateTime(d.last_used_at, locale) : t('sessions.never') }) }}<span v-if="d.expires_at"> · {{ t('sessions.expires', { date: formatDateTime(d.expires_at, locale) }) }}</span></p>
        </li>
      </ul>
      <section aria-labelledby="all-h" class="mt-8 space-y-3">
        <h2 id="all-h" class="text-xl font-bold">{{ t('sessions.allTitle') }}</h2>
        <p class="text-ink-soft">{{ t('sessions.allHelp') }}</p>
        <UiButton v-if="!confirmAll" variant="danger" @click="confirmAll = true">{{ t('sessions.logoutAll') }}</UiButton>
        <UiConfirmInline v-else :message="t('sessions.logoutAllConfirm')" :confirm-label="t('sessions.logoutAll')" :loading="busy === 'all'" @cancel="confirmAll = false" @confirm="logoutAll" />
      </section>
    </template>
  </div>
</template>
