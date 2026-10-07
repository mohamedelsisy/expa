<script setup lang="ts">
import type { City } from '~/types/api'
import type { CommunityQuestion } from '~/types/extra'
import { parseTags } from '~/utils/community'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const localePath = useLocalePath()
const community = useCommunityMeta()
const meta = await community.load()
if (!meta) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
useSeo(() => ({ title: t('community.askTitle'), description: t('community.askIntro'), noindex: true }))
const { data: cities } = await useAsyncData('community-ask-cities', async () => (await request<City[]>('cities')).data, { watch: [locale] })
const cityOptions = computed(() => (cities.value ?? []).map(c => ({ value: String(c.id), label: c.name })))
const topicOptions = computed(() => meta.topics.map(x => ({ value: x.value, label: x.label })))
const form = reactive({ title: '', body: '', topic: '', city_id: '', tags: '' })
const errors = ref<Record<string, string>>({})
const notice = ref<string | null>(null)
const needVerify = ref(false)
const submitting = ref(false)
const titleMax = 500
const bodyMax = 20000
const sensitive = computed(() => meta.topics.find(x => x.value === form.topic)?.sensitive === true)
async function submit() {
  errors.value = {}; notice.value = null; needVerify.value = false
  if (!form.title.trim()) errors.value.title = t('community.errors.titleRequired')
  if (!form.body.trim()) errors.value.body = t('community.errors.bodyRequired')
  if (Object.keys(errors.value).length) return
  submitting.value = true
  try {
    const res = await request<CommunityQuestion>('community/questions', { method: 'POST', body: {
      title: form.title.trim(), body: form.body.trim(), locale: locale.value,
      ...(form.topic ? { topic: form.topic } : {}), ...(form.city_id ? { city_id: Number(form.city_id) } : {}),
      ...(parseTags(form.tags).length ? { tags: parseTags(form.tags) } : {}),
    } })
    await navigateTo(`${localePath(`/community/${res.data.id}`)}?posted=1`)
  } catch (e) {
    if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else { errors.value = fieldErrors(e); if (!Object.keys(errors.value).length) notice.value = isApiError(e) ? e.message : t('errors.generic') }
  } finally { submitting.value = false }
}
const crumbs = computed(() => [{ label: t('community.title'), to: '/community' }, { label: t('community.askTitle') }])
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <UiBreadcrumbs :items="crumbs" class="mb-6" />
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('community.askTitle') }}</h1>
    <p class="mb-4 text-ink-soft">{{ t('community.askIntro') }}</p>
    <UiAlert tone="warning" class="mb-6">{{ meta.notice }}</UiAlert>
    <AuthVerifyNeeded v-if="needVerify" class="mb-6" />
    <form class="space-y-5" novalidate @submit.prevent="submit">
      <UiFormField :label="t('community.fields.title')" :error="errors.title" required><UiTextInput v-model="form.title" :maxlength="titleMax" /></UiFormField>
      <UiFormField :label="t('community.fields.body')" :hint="t('community.fields.bodyHint')" :error="errors.body" required><UiTextarea v-model="form.body" :rows="8" :maxlength="bodyMax" /></UiFormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <UiFormField :label="t('community.topic')" :error="errors.topic" optional><UiSelect v-model="form.topic" :options="topicOptions" :placeholder="t('community.noTopic')" /></UiFormField>
        <UiFormField :label="t('guides.city')" :error="errors.city_id" optional><UiSelect v-model="form.city_id" :options="cityOptions" :placeholder="t('cityInfo.none')" /></UiFormField>
      </div>
      <UiAlert v-if="sensitive" tone="info">{{ t('community.sensitiveHint') }}</UiAlert>
      <UiFormField :label="t('community.fields.tags')" :hint="t('community.fields.tagsHint')" :error="errors.tags" optional><UiTextInput v-model="form.tags" ltr :maxlength="200" /></UiFormField>
      <p class="text-sm text-muted">{{ t('community.moderationNote') }}</p>
      <UiAlert v-if="notice" tone="warning" data-testid="community-error">{{ notice }}</UiAlert>
      <UiButton type="submit" size="lg" :loading="submitting">{{ t('community.post') }}</UiButton>
    </form>
  </div>
</template>
