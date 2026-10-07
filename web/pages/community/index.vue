<script setup lang="ts">
import type { CommunityQuestion } from '~/types/extra'
import type { City } from '~/types/api'
import { formatDate } from '~/utils/locale'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const localePath = useLocalePath()
const { request } = useApi()
const community = useCommunityMeta()
const meta = await community.load()
if (!meta) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: t('community.seo.title'), description: t('community.seo.description') }))
const get = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
const q = computed(() => get('q'))
const topic = computed(() => get('topic'))
const city = computed(() => get('city'))
const sort = computed(() => get('sort'))
const answered = computed(() => get('answered'))
const mine = computed(() => get('mine'))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = ref(q.value)
watch(q, v => { search.value = v })
const { data: cities } = await useAsyncData('community-cities', async () => (await request<City[]>('cities')).data.map(c => ({ value: c.slug, label: c.name })), { watch: [locale] })
const topicOptions = computed(() => (community.meta.value?.topics ?? []).map(x => ({ value: x.value, label: x.label })))
const sortOptions = computed(() => (community.meta.value?.sorts ?? []).map(v => ({ value: v, label: t(`community.sort.${v}`) })))
const { data, error, refresh, status } = await useAsyncData('community-questions', () => request<CommunityQuestion[]>('community/questions', { query: { q: q.value, topic: topic.value, city: city.value, sort: sort.value, answered: answered.value, mine: mine.value, page: page.value, per_page: 15 } }), { watch: [q, topic, city, sort, answered, mine, page, locale] })
const items = computed(() => data.value?.data ?? [])
const pm = computed(() => data.value?.meta)
const hasFilters = computed(() => !!(q.value || topic.value || city.value || sort.value || answered.value || mine.value))
function setQuery(patch: Record<string, string | number>) {
  const merged: Record<string, unknown> = { q: q.value, topic: topic.value, city: city.value, sort: sort.value, answered: answered.value, mine: mine.value, ...patch }
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(merged)) if (v !== '' && v !== undefined && v !== null) next[k] = String(v)
  if (!('page' in patch)) delete next.page
  return navigateTo({ path: route.path, query: next })
}
const clear = () => { search.value = ''; return navigateTo({ path: route.path }) }
const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('community.title') }])
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">{{ t('community.title') }}</h1><p class="mt-1 text-ink-soft">{{ t('community.subtitle') }}</p></div>
      <UiButton v-if="auth.isAuthenticated" to="/community/ask"><UiIcon name="plus" :size="18" />{{ t('community.ask') }}</UiButton>
      <UiButton v-else :to="`/login?redirect=${encodeURIComponent(localePath('/community'))}`" variant="secondary">{{ t('community.loginToAsk') }}</UiButton>
    </header>
    <UiAlert tone="warning" class="mb-6" data-testid="community-notice">{{ community.meta.value?.notice }}</UiAlert>
    <form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="setQuery({ q: search })">
      <UiFormField :label="t('guides.search')" class="sm:col-span-2 lg:col-span-3"><UiTextInput v-model="search" type="search" inputmode="search" :maxlength="100" :placeholder="t('community.searchPlaceholder')" /></UiFormField>
      <UiFormField :label="t('community.topic')"><UiSelect :model-value="topic" :options="topicOptions" :placeholder="t('community.allTopics')" @update:model-value="setQuery({ topic: $event })" /></UiFormField>
      <UiFormField :label="t('guides.city')"><UiSelect :model-value="city" :options="cities ?? []" :placeholder="t('guides.allCities')" @update:model-value="setQuery({ city: $event })" /></UiFormField>
      <UiFormField :label="t('articles.sortBy')"><UiSelect :model-value="sort" :options="sortOptions" :placeholder="t('community.sort.default')" @update:model-value="setQuery({ sort: $event })" /></UiFormField>
      <div class="flex flex-col justify-end"><UiCheckbox :model-value="answered === '1'" :label="t('community.onlyAnswered')" @update:model-value="setQuery({ answered: $event ? '1' : '' })" /><UiCheckbox v-if="auth.isAuthenticated" :model-value="mine === '1'" :label="t('community.onlyMine')" @update:model-value="setQuery({ mine: $event ? '1' : '' })" /></div>
      <div class="flex items-end gap-2"><UiButton type="submit"><UiIcon name="search" :size="18" />{{ t('guides.searchButton') }}</UiButton><UiButton v-if="hasFilters" variant="ghost" @click="clear">{{ t('guides.clear') }}</UiButton></div>
    </form>
    <ul v-if="status === 'pending' && !data" class="space-y-3" aria-busy="true"><li v-for="n in 4" :key="n"><UiCard><UiSkeleton :lines="3" /></UiCard></li></ul>
    <UiErrorState v-else-if="error" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!items.length" :title="hasFilters ? t('guides.noResultsTitle') : t('community.emptyTitle')" :description="hasFilters ? t('guides.noResults') : t('community.empty')" icon="help"><UiButton v-if="hasFilters" variant="secondary" @click="clear">{{ t('guides.clear') }}</UiButton></UiEmptyState>
    <template v-else>
      <ul class="space-y-3">
        <li v-for="x in items" :key="x.id">
          <UiCard as="article" class="relative space-y-2 hover:shadow-2">
            <div class="flex flex-wrap items-center gap-2"><CommunityLabels :label="x.label" :status="x.status" :mine="x.mine" /><UiBadge v-if="x.topic_label" tone="primary">{{ x.topic_label }}</UiBadge><UiBadge v-if="x.answered" tone="success"><UiIcon name="check" :size="14" />{{ t('community.answered') }}</UiBadge></div>
            <h2 class="text-lg font-bold"><NuxtLink :to="localePath(`/community/${x.id}`)" class="after:absolute after:inset-0 after:content-['']" dir="auto">{{ x.title }}</NuxtLink></h2>
            <p v-if="x.excerpt" class="line-clamp-2 text-ink-soft" dir="auto">{{ x.excerpt }}</p>
            <p class="flex flex-wrap gap-x-3 text-sm text-muted"><span>{{ t('community.votes', { count: x.votes }) }}</span><span>{{ t('community.answersCount', { count: x.answers_count }) }}</span><span v-if="x.city">{{ x.city.name }}</span><time v-if="x.created_at" :datetime="x.created_at">{{ formatDate(x.created_at, locale) }}</time></p>
          </UiCard>
        </li>
      </ul>
      <div class="mt-8"><UiPagination :page="pm?.page ?? 1" :last-page="pm?.last_page ?? 1" @change="setQuery({ page: $event })" /></div>
    </template>
  </div>
</template>
