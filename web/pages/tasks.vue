<script setup lang="ts">
import type { SetupTask } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
const { tasks, pendingKeys, setStatus } = useTasks()
useSeo(() => ({ title: t('tasks.title'), description: t('tasks.subtitle'), noindex: true }))

const { data, error, refresh, status } = await useAsyncData('tasks', () => request<SetupTask[]>('dashboard/tasks'), { watch: [locale] })
watch(data, (d) => { if (d) tasks.value = d.data }, { immediate: true })

const groups = computed(() => {
  const map = new Map<string, { label: string, items: SetupTask[] }>()
  for (const task of tasks.value) {
    if (!map.has(task.category)) map.set(task.category, { label: task.category_label, items: [] })
    map.get(task.category)!.items.push(task)
  }
  return [...map.entries()].map(([key, g]) => ({ key, ...g }))
})
const progress = computed(() => {
  const applicable = tasks.value.filter(x => x.applicable && x.status !== 'dismissed')
  return { done: applicable.filter(x => x.status === 'done').length, total: applicable.length }
})
</script>

<template>
  <div class="container-page max-w-3xl py-8 sm:py-12">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('tasks.title') }}</h1>
    <p class="mt-1 text-ink-soft">{{ t('tasks.subtitle') }}</p>

    <div v-if="status === 'pending' && !data" class="mt-8" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState v-else-if="error" class="mt-8" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiEmptyState v-else-if="!tasks.length" class="mt-8" :title="t('tasks.emptyTitle')" :description="t('tasks.empty')" icon="tasks" />

    <template v-else>
      <div class="mt-6"><UiProgressBar :value="progress.total ? Math.round((progress.done / progress.total) * 100) : null" :label="t('tasks.progress', { done: progress.done, total: progress.total })" show-value /></div>
      <section v-for="g in groups" :key="g.key" class="mt-8" :aria-labelledby="`cat-${g.key}`">
        <h2 :id="`cat-${g.key}`" class="mb-3 text-lg font-bold">{{ g.label }}</h2>
        <ul class="space-y-3">
          <li v-for="task in g.items" :key="task.key">
            <UiCard class="flex flex-col gap-3 !p-4 sm:flex-row sm:items-center" :class="task.status !== 'todo' || !task.applicable ? 'opacity-90' : ''">
              <div class="min-w-0 flex-1">
                <p class="font-semibold" :class="task.status === 'done' ? 'text-ink-soft line-through decoration-1' : ''"><UiAutoItalian :text="task.title" /></p>
                <p class="text-sm text-ink-soft">{{ task.hint }}</p>
                <div class="mt-1 flex flex-wrap items-center gap-2">
                  <UiBadge v-if="task.status === 'done'" tone="success"><UiIcon name="check" :size="14" />{{ t('tasks.status.done') }}</UiBadge>
                  <UiBadge v-else-if="task.status === 'dismissed'">{{ t('tasks.status.dismissed') }}</UiBadge>
                  <NuxtLink v-if="task.guide" :to="localePath(`/guides/${task.guide.slug}`)" class="inline-flex min-h-touch items-center gap-1 text-sm font-medium text-primary-strong underline underline-offset-4">
                    <UiIcon name="book" :size="16" />{{ t('tasks.readGuide') }}
                  </NuxtLink>
                </div>
              </div>
              <div v-if="task.applicable || task.status === 'dismissed'" class="flex shrink-0 flex-wrap gap-2">
                <template v-if="task.status === 'todo'">
                  <UiButton variant="primary" :loading="pendingKeys.has(task.key)" @click="setStatus(task.key, 'done')"><UiIcon name="check" :size="18" />{{ t('tasks.markDone') }}</UiButton>
                  <UiButton variant="ghost" :disabled="pendingKeys.has(task.key)" @click="setStatus(task.key, 'dismissed')">{{ t('tasks.notApplicable') }}</UiButton>
                </template>
                <UiButton v-else variant="secondary" :loading="pendingKeys.has(task.key)" @click="setStatus(task.key, 'todo')"><UiIcon name="refresh" :size="18" />{{ t('tasks.reopen') }}</UiButton>
              </div>
              <p v-else class="text-sm text-muted">{{ t('tasks.notApplicableAuto') }}</p>
            </UiCard>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
