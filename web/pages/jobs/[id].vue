<script setup lang="ts">
import type { Job } from '~/types/api'
import { formatDateTime } from '~/utils/locale'
import { formatSalary } from '~/utils/money'
import { safeHttpsUrl } from '~/utils/safe'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const { request } = useApi()
const toast = useToast()
const id = computed(() => String(route.params.id))
const { data: job, error, refresh, status } = await useAsyncData(() => `job-${id.value}`, async () => (await request<Job>(`jobs/${encodeURIComponent(id.value)}`)).data, { watch: [locale] })
if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: job.value ? `${job.value.title} | EXPA` : t('jobs.title'), description: job.value ? `${job.value.company ?? ''} ${job.value.location ?? ''}`.trim() || t('jobs.subtitle') : t('jobs.subtitle'), type: 'article' }))
const crumbs = computed(() => [{ label: t('jobs.title'), to: '/jobs' }, { label: job.value?.title ?? '' }])

const saved = ref(false)
watch(job, (j) => { saved.value = !!j?.saved }, { immediate: true })
const saving = ref(false)
async function toggleSave() {
  saving.value = true
  const next = !saved.value
  try {
    await request(`jobs/${id.value}/save`, { method: next ? 'POST' : 'DELETE' })
    saved.value = next
    toast.success(next ? t('jobs.savedToast') : t('jobs.unsavedToast'))
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally {
    saving.value = false
  }
}

const applyUrl = ref<string | null>(null)
const applyNotice = ref<string | null>(null)
const applying = ref(false)
const applyError = ref<string | null>(null)
async function apply() {
  applying.value = true
  applyError.value = null
  try {
    const res = await request<{ apply_url: string | null, notice: string }>(`jobs/${id.value}/apply-click`, { method: 'POST' })
    applyNotice.value = res.data.notice
    const url = safeHttpsUrl(res.data.apply_url)
    if (!url) { applyError.value = t('jobs.noApplyLink'); return }
    applyUrl.value = url
    window.open(url, '_blank', 'noopener,noreferrer') // may be blocked: the visible link below is the fallback
  } catch (e) {
    applyError.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    applying.value = false
  }
}
const salary = computed(() => formatSalary(job.value?.salary, locale.value, p => t(`jobs.period.${p}`)))
const localePath = useLocalePath()
</script>

<template>
  <div class="container-page max-w-4xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <div v-if="status === 'pending' && !job" aria-busy="true"><UiSkeleton block :lines="6" /></div>
    <UiErrorState :heading-level="1" v-else-if="error || !job" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article class="min-w-0 space-y-6">
        <header class="space-y-3">
          <div class="flex flex-wrap gap-2"><UiBadge tone="primary">{{ job.category_label }}</UiBadge><UiBadge>{{ job.employment_type_label }}</UiBadge><UiBadge>{{ job.remote_mode_label }}</UiBadge></div>
          <h1 class="text-3xl font-bold">{{ job.title }}</h1>
          <p class="text-lg text-ink-soft">{{ job.company }}<template v-if="job.city || job.location"> · {{ job.city?.name ?? job.location }}</template></p>
          <p v-if="job.source" class="text-sm text-muted">{{ t('jobs.via', { source: job.source }) }}</p>
          <p v-if="job.published_at" class="text-sm text-muted"><time :datetime="job.published_at">{{ formatDateTime(job.published_at, locale) }}</time></p>
        </header>

        <dl class="grid gap-3 sm:grid-cols-2">
          <div v-if="salary"><dt class="text-sm text-muted">{{ t('jobs.salary') }}</dt><dd class="font-semibold tabular-nums" data-testid="job-salary"><bdi>{{ salary }}</bdi></dd></div>
          <div><dt class="text-sm text-muted">{{ t('jobs.visa') }}</dt><dd class="font-semibold" data-testid="visa-label">{{ job.visa_sponsorship.label }}</dd></div>
          <div v-if="job.italian_level"><dt class="text-sm text-muted">{{ t('jobs.italianRequired') }}</dt><dd class="font-semibold">{{ job.italian_level.toUpperCase() }}</dd></div>
          <div v-if="job.english_level"><dt class="text-sm text-muted">{{ t('jobs.englishRequired') }}</dt><dd class="font-semibold">{{ job.english_level.toUpperCase() }}</dd></div>
          <div v-if="job.experience_years != null"><dt class="text-sm text-muted">{{ t('jobs.experience') }}</dt><dd class="font-semibold">{{ t('jobs.years', { count: job.experience_years }) }}</dd></div>
        </dl>
        <section v-if="job.skills.length" aria-labelledby="sk-h"><h2 id="sk-h" class="mb-2 text-xl font-bold">{{ t('jobs.skills') }}</h2><ul class="flex flex-wrap gap-2"><li v-for="s in job.skills" :key="s"><UiBadge>{{ s }}</UiBadge></li></ul></section>
        <section v-if="job.description" aria-labelledby="ds-h"><h2 id="ds-h" class="mb-2 text-xl font-bold">{{ t('jobs.description') }}</h2><p class="prose-plain text-lg" dir="auto">{{ job.description }}</p></section>
      </article>

      <aside class="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <UiCard class="space-y-3">
          <UiAlert tone="info" data-testid="apply-notice">{{ job.apply_notice }}</UiAlert>
          <template v-if="auth.isAuthenticated">
            <UiButton block size="lg" :loading="applying" data-testid="apply-btn" @click="apply"><UiIcon name="external" :size="18" />{{ t('jobs.apply') }}</UiButton>
            <p v-if="applyUrl" class="text-sm"><a :href="applyUrl" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-touch items-center gap-1 font-medium text-primary-strong underline underline-offset-4" data-testid="apply-link">{{ t('jobs.openOriginal') }}<span class="sr-only">{{ t('a11y.opensNewTab') }}</span></a></p>
            <UiAlert v-if="applyError" tone="warning">{{ applyError }}</UiAlert>
            <UiButton block variant="secondary" :loading="saving" :aria-pressed="saved" @click="toggleSave"><UiIcon name="bookmark" :size="18" />{{ saved ? t('jobs.unsave') : t('jobs.save') }}</UiButton>
          </template>
          <UiButton v-else block :to="`/login?redirect=${encodeURIComponent(localePath(`/jobs/${job.id}`))}`" variant="secondary">{{ t('jobs.loginToApply') }}</UiButton>
        </UiCard>
        <UiCard v-if="auth.isAuthenticated" class="space-y-3">
          <JobsMatchReasons v-if="job.match" :match="job.match" />
          <p v-else class="text-muted">{{ t('jobs.match.noScore') }}</p>
          <UiButton to="/jobs/preferences" variant="ghost">{{ t('jobs.improveMatch') }}</UiButton>
        </UiCard>
      </aside>
    </div>
  </div>
</template>
