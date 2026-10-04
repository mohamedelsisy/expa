<script setup lang="ts">
import type { ExamResult, ExamRun } from '~/types/api'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const route = useRoute()
const { request } = useApi()
const localePath = useLocalePath()
const id = computed(() => String(route.params.id))
useSeo(() => ({ title: t('patente.examRunning'), description: t('patente.mockNotice'), noindex: true }))

// Question content is fetched in the browser only: never rendered on the server, never part of the SSR payload.
const exam = ref<ExamRun | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await request<ExamRun | ExamResult>(`patente/exams/${encodeURIComponent(id.value)}`)
    if (res.data.finished) { await navigateTo(localePath(`/patente/results/${id.value}`)); return }
    exam.value = res.data as ExamRun
  } catch (e) {
    error.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    loading.value = false
  }
}
onMounted(load)
const done = () => navigateTo(localePath(`/patente/results/${id.value}`))
</script>

<template>
  <div class="container-page max-w-3xl py-6 sm:py-10">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-xl font-bold sm:text-2xl">{{ exam?.mode === 'practice' ? t('patente.practiceTitle') : t('patente.examTitle') }}</h1>
      <UiBadge tone="warning">{{ t('patente.simulation') }}</UiBadge>
    </div>
    <div v-if="loading" aria-busy="true"><UiSkeleton block :lines="4" /></div>
    <UiErrorState v-else-if="error || !exam" :message="error ?? undefined" retry @retry="load" />
    <PatenteRunner v-else :exam="exam" @finished="done" />
  </div>
</template>
