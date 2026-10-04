<script setup lang="ts">
import type { AppNotification } from '~/types/api'
import { formatDateTime } from '~/utils/locale'
import { mapApiAction } from '~/utils/routes'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { request } = useApi()
const toast = useToast()
const { setUnread } = useNotifications()
useSeo(() => ({ title: t('notifications.title'), description: t('notifications.subtitle'), noindex: true }))

const filter = computed(() => (route.query.filter === 'unread' ? 'unread' : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data, error, refresh, status } = await useAsyncData('notifications', () => request<AppNotification[]>('notifications', {
  query: { unread: filter.value ? 1 : undefined, page: page.value, per_page: 20 },
}), { watch: [filter, page, locale] })

const items = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
watch(meta, (m) => { if (m && typeof m.unread === 'number') setUnread(m.unread) }, { immediate: true })

const busy = ref<string | null>(null)
const busyAll = ref(false)

function setFilter(v: string) {
  return navigateTo({ path: route.path, query: v ? { filter: v } : {} })
}
const changePage = (p: number) => navigateTo({ path: route.path, query: { ...route.query, page: p } })

async function markRead(n: AppNotification, quiet = false) {
  if (n.read) return
  busy.value = n.id
  try {
    await request(`notifications/${n.id}/read`, { method: 'POST' })
    n.read = true
    setUnread((meta.value?.unread ?? 1) - 1)
    if (data.value) data.value.meta.unread = Math.max(0, (data.value.meta.unread ?? 1) - 1)
    if (!quiet) toast.success(t('notifications.markedRead'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    busy.value = null
  }
}
async function markAll() {
  busyAll.value = true
  try {
    await request('notifications/read-all', { method: 'POST' })
    setUnread(0)
    toast.success(t('notifications.allMarkedRead'))
    await refresh()
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    busyAll.value = false
  }
}
async function remove(n: AppNotification) {
  busy.value = n.id
  try {
    await request(`notifications/${n.id}`, { method: 'DELETE' })
    toast.success(t('notifications.deleted'))
    await refresh()
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    busy.value = null
  }
}
const ctaPath = (n: AppNotification) => mapApiAction(n.cta)
async function open(n: AppNotification) {
  const to = ctaPath(n)
  if (!to) return
  await markRead(n, true)
  await navigateTo(localePath(to))
}
const chips = computed(() => [{ value: '', label: t('notifications.all') }, { value: 'unread', label: t('notifications.unread') }])
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('notifications.title') }}</h1>
        <p class="mt-1 text-ink-soft">{{ t('notifications.subtitle') }}</p>
      </div>
      <UiButton variant="secondary" :loading="busyAll" :disabled="!meta?.unread" @click="markAll"><UiIcon name="check" :size="18" />{{ t('notifications.markAll') }}</UiButton>
    </header>

    <UiChips :model-value="filter" :options="chips" :label="t('notifications.filter')" class="mb-5" @update:model-value="setFilter" />
    <p class="sr-only" role="status" aria-live="polite">{{ meta ? t('notifications.unreadCount', { count: meta.unread ?? 0 }) : '' }}</p>

    <ul v-if="status === 'pending' && !data" aria-busy="true" class="space-y-3"><li v-for="n in 4" :key="n"><UiCard><UiSkeleton :lines="2" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="filter ? t('notifications.emptyUnreadTitle') : t('notifications.emptyTitle')" :description="filter ? t('notifications.emptyUnread') : t('notifications.empty')" icon="bell" />
    <template v-else>
      <ul class="space-y-3">
        <li v-for="n in items" :key="n.id">
          <UiCard as="article" class="space-y-2" :class="n.read ? '' : 'border-primary'" :data-read="n.read ? 'true' : 'false'">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="flex flex-wrap items-center gap-2 font-semibold">
                  <UiBadge v-if="!n.read" tone="accent">{{ t('notifications.new') }}</UiBadge>
                  <UiAutoItalian :text="n.title" />
                </p>
                <p v-if="n.body" class="mt-1 text-ink-soft"><UiAutoItalian :text="n.body" /></p>
                <p class="mt-1 text-xs text-muted"><time :datetime="n.created_at ?? undefined">{{ formatDateTime(n.created_at, locale) }}</time></p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <UiButton v-if="ctaPath(n)" variant="primary" @click="open(n)">{{ t('notifications.open') }}<UiIcon name="arrow-end" :size="16" /></UiButton>
              <UiButton v-if="!n.read" variant="secondary" :loading="busy === n.id" @click="markRead(n)"><UiIcon name="check" :size="16" />{{ t('notifications.markRead') }}</UiButton>
              <UiButton variant="ghost" :disabled="busy === n.id" @click="remove(n)"><UiIcon name="trash" :size="16" />{{ t('common.delete') }}</UiButton>
            </div>
          </UiCard>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="meta?.page ?? 1" :last-page="meta?.last_page ?? 1" @change="changePage" /></div>
    </template>
  </div>
</template>
