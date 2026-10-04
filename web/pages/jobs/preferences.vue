<script setup lang="ts">
import type { City, JobProfile, JobsMeta } from '~/types/api'
import { isConsentRequired } from '~/utils/errors'

definePageMeta({ middleware: 'auth' })
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
useSeo(() => ({ title: t('jobs.preferences'), description: t('jobs.prefsSubtitle'), noindex: true }))

const { data, error, refresh } = await useAsyncData('job-prefs', async () => {
  const [p, meta, cities] = await Promise.all([request<JobProfile>('jobs/profile'), request<JobsMeta>('jobs/meta'), request<City[]>('cities')])
  return { profile: p.data, meta: meta.data, cities: cities.data }
}, { watch: [locale] })
const { granted, load } = useConsent('profile_personalization')
onMounted(load)

const form = reactive({ skills: '', experience: '', education: '', remote: '', types: [] as string[], salary: '', cityId: '' })
watch(data, (d) => {
  if (!d) return
  const p = d.profile
  Object.assign(form, { skills: p.skills.join(', '), experience: p.experience_years?.toString() ?? '', education: p.education ?? '', remote: p.remote_preference ?? '', types: [...p.employment_types], salary: p.salary_min_year?.toString() ?? '', cityId: p.city_id?.toString() ?? '' })
}, { immediate: true })

const errors = ref<Record<string, string>>({})
const saving = ref(false)
const needConsent = computed(() => granted.value === false)
const EDU = ['none', 'school', 'vocational', 'bachelor', 'master', 'phd']
const eduOptions = computed(() => EDU.map(v => ({ value: v, label: t(`jobs.education.${v}`) })))
const remoteOptions = computed(() => ['any', 'remote_only', 'onsite_only'].map(v => ({ value: v, label: t(`jobs.remotePref.${v}`) })))
const cityOptions = computed(() => (data.value?.cities ?? []).map(c => ({ value: String(c.id), label: c.name })))
const toggleType = (v: string, on: boolean) => { form.types = on ? [...new Set([...form.types, v])] : form.types.filter(x => x !== v) }
const num = (s: string) => (s.trim() === '' ? null : Number(s))

async function save() {
  errors.value = {}
  saving.value = true
  try {
    const skills = form.skills.split(/[,\n،]+/).map(s => s.trim()).filter(Boolean).slice(0, 40)
    await request<JobProfile>('jobs/profile', { method: 'PUT', body: {
      skills, experience_years: num(form.experience), education: form.education || null, remote_preference: form.remote || null,
      employment_types: form.types, salary_min_year: num(form.salary), city_id: num(form.cityId),
    } })
    toast.success(t('profile.saved'))
    await refresh()
  } catch (e) {
    if (isConsentRequired(e, 'profile_personalization')) granted.value = false
    else {
      errors.value = fieldErrors(e)
      if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <h1 class="mb-2 text-2xl font-bold sm:text-3xl">{{ t('jobs.preferences') }}</h1>
    <p class="mb-6 text-ink-soft">{{ t('jobs.prefsSubtitle') }}</p>
    <ConsentGate v-if="needConsent" purpose="profile_personalization" class="mb-6" @granted="granted = true" />
    <UiErrorState v-if="error || !data" :message="isApiError(error) ? error.message : undefined" retry @retry="refresh()" />
    <UiCard v-else>
      <form class="space-y-5" novalidate @submit.prevent="save">
        <UiFormField :label="t('jobs.skills')" :hint="t('jobs.skillsHint')" :error="errors.skills"><UiTextarea v-model="form.skills" :rows="2" /></UiFormField>
        <div class="grid gap-5 sm:grid-cols-2">
          <UiFormField :label="t('jobs.experience')" :error="errors.experience_years" optional><UiTextInput v-model="form.experience" type="number" inputmode="numeric" ltr /></UiFormField>
          <UiFormField :label="t('jobs.educationLabel')" :error="errors.education" optional><UiSelect v-model="form.education" :options="eduOptions" :placeholder="t('common.choose')" /></UiFormField>
          <UiFormField :label="t('jobs.remotePrefLabel')" :error="errors.remote_preference" optional><UiSelect v-model="form.remote" :options="remoteOptions" :placeholder="t('common.choose')" /></UiFormField>
          <UiFormField :label="t('jobs.salaryMin')" :error="errors.salary_min_year" optional><UiTextInput v-model="form.salary" type="number" inputmode="numeric" ltr /></UiFormField>
          <UiFormField :label="t('guides.city')" :error="errors.city_id" optional><UiSelect v-model="form.cityId" :options="cityOptions" :placeholder="t('common.choose')" /></UiFormField>
        </div>
        <UiFormField :label="t('jobs.employmentType')" group :error="errors.employment_types">
          <UiCheckbox v-for="o in data.meta.employment_types" :key="o.value" :model-value="form.types.includes(o.value)" :label="o.label" @update:model-value="toggleType(o.value, $event)" />
        </UiFormField>
        <UiButton type="submit" :loading="saving">{{ t('common.save') }}</UiButton>
      </form>
    </UiCard>
  </div>
</template>
