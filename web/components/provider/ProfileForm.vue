<script setup lang="ts">
import type { City } from '~/types/api'
import type { PortalProfile } from '~/types/extra'
import { PORTAL_LOCALES, formToBody, newServiceRow, profileToForm, validateProfile, type Loc } from '~/utils/provider'
import { SERVICE_LANGUAGES, languageName } from '~/utils/services'

/** Edit the provider's own listing. On a live listing the API keeps edits pending until an admin approves them. */
const props = defineProps<{ profile: PortalProfile, categories: { value: string, label: string }[], cities: City[] }>()
const emit = defineEmits<{ saved: [profile: PortalProfile, pending: boolean] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const form = reactive(profileToForm(props.profile))
const editLoc = ref<Loc>((PORTAL_LOCALES as readonly string[]).includes(locale.value) ? locale.value as Loc : 'ar')
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const cityOptions = computed(() => props.cities.map(c => ({ value: String(c.id), label: c.name })))
const locOptions = computed(() => PORTAL_LOCALES.map(l => ({ value: l, label: t(`languages.${l}`) })))
const tr = computed(() => form.translations[editLoc.value])
const toggleLang = (code: string, on: boolean) => { form.languages = on ? [...new Set([...form.languages, code])] : form.languages.filter(l => l !== code) }

async function save() {
  errors.value = {}
  const problems = validateProfile(form)
  if (Object.keys(problems).length) {
    for (const [k, v] of Object.entries(problems)) errors.value[k] = t(`provider.errors.${v}`)
    return
  }
  saving.value = true
  try {
    const res = await request<PortalProfile>('provider/profile', { method: 'PUT', body: formToBody(form) })
    const pending = res.meta && (res.meta as { pending_admin_approval?: boolean }).pending_admin_approval === true
    toast.success(pending ? t('provider.profile.savedPending') : t('provider.profile.saved'))
    emit('saved', res.data, !!pending)
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally { saving.value = false }
}
</script>

<template>
  <form class="space-y-8" novalidate @submit.prevent="save">
    <UiAlert v-if="profile.status === 'published'" tone="info" data-testid="live-edit-note">{{ t('provider.profile.liveNote') }}</UiAlert>
    <fieldset class="space-y-4 rounded-lg border border-line p-4">
      <legend class="px-2 font-semibold">{{ t('provider.profile.basics') }}</legend>
      <UiFormField :label="t('provider.fields.display_name')" :error="errors.display_name" required><UiTextInput v-model="form.display_name" :maxlength="160" /></UiFormField>
      <UiFormField :label="t('provider.fields.category')" :error="errors.category" required><UiSelect v-model="form.category" :options="categories" :placeholder="t('common.choose')" /></UiFormField>
      <UiFormField :label="t('provider.fields.city')" :error="errors.city_id" optional><UiSelect v-model="form.city_id" :options="cityOptions" :placeholder="t('provider.fields.noCity')" /></UiFormField>
      <UiCheckbox v-model="form.serves_online" :label="t('provider.fields.serves_online')" />
      <UiFormField :label="t('provider.fields.languages')" group :error="errors.languages">
        <div class="grid gap-x-4 sm:grid-cols-2"><UiCheckbox v-for="l in SERVICE_LANGUAGES" :key="l" :model-value="form.languages.includes(l)" :label="languageName(l, locale)" @update:model-value="toggleLang(l, $event)" /></div>
      </UiFormField>
    </fieldset>

    <fieldset class="space-y-4 rounded-lg border border-line p-4">
      <legend class="px-2 font-semibold">{{ t('provider.profile.contact') }}</legend>
      <p class="text-sm text-ink-soft">{{ t('provider.profile.contactNote') }}</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div><UiFormField :label="t('provider.fields.contact_email')" :error="errors.contact_email" optional><UiTextInput v-model="form.contact_email" type="email" ltr :maxlength="190" /></UiFormField><UiCheckbox v-model="form.show_email" :label="t('provider.fields.show')" /></div>
        <div><UiFormField :label="t('provider.fields.contact_phone')" :error="errors.contact_phone" optional><UiTextInput v-model="form.contact_phone" type="tel" ltr :maxlength="25" /></UiFormField><UiCheckbox v-model="form.show_phone" :label="t('provider.fields.show')" /></div>
        <div class="sm:col-span-2"><UiFormField :label="t('provider.fields.website')" :hint="t('provider.fields.websiteHint')" :error="errors.website" optional><UiTextInput v-model="form.website" type="url" ltr :maxlength="2048" /></UiFormField><UiCheckbox v-model="form.show_website" :label="t('provider.fields.show')" /></div>
      </div>
    </fieldset>

    <fieldset class="space-y-4 rounded-lg border border-line p-4">
      <legend class="px-2 font-semibold">{{ t('provider.profile.texts') }}</legend>
      <UiFormField :label="t('provider.profile.editLang')" :hint="t('provider.profile.editLangHint')" class="max-w-xs"><UiSelect v-model="editLoc" :options="locOptions" /></UiFormField>
      <UiAlert v-if="errors.translations" tone="warning">{{ errors.translations }}</UiAlert>
      <UiFormField :label="t('provider.fields.headline')" :error="errors[`translations.${editLoc}.headline`]"><UiTextInput v-model="tr.headline" :maxlength="200" :dir="editLoc === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
      <UiFormField :label="t('provider.fields.description')" :error="errors[`translations.${editLoc}.description`]" optional><UiTextarea v-model="tr.description" :rows="5" :maxlength="5000" :dir="editLoc === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
      <UiFormField :label="t('provider.fields.availability_note')" optional><UiTextInput v-model="tr.availability_note" :maxlength="500" :dir="editLoc === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
    </fieldset>

    <fieldset class="space-y-4 rounded-lg border border-line p-4">
      <legend class="px-2 font-semibold">{{ t('provider.profile.services') }}</legend>
      <p class="text-sm text-ink-soft">{{ t('provider.profile.servicesNote') }}</p>
      <UiAlert v-if="errors.services" tone="warning">{{ errors.services }}</UiAlert>
      <ul class="space-y-4">
        <li v-for="(s, i) in form.services" :key="i" class="space-y-3 rounded-md border border-line bg-surface p-3">
          <UiFormField :label="t('provider.fields.service_name')"><UiTextInput v-model="s.translations[editLoc].name" :maxlength="160" :dir="editLoc === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
          <UiFormField :label="t('provider.fields.service_description')" optional><UiTextInput v-model="s.translations[editLoc].description" :maxlength="1000" :dir="editLoc === 'ar' ? 'rtl' : 'ltr'" /></UiFormField>
          <UiFormField :label="t('provider.fields.price_from')" :hint="t('provider.fields.price_hint')" optional class="max-w-xs"><UiTextInput v-model="s.price" inputmode="numeric" ltr :maxlength="7" /></UiFormField>
          <UiButton variant="ghost" @click="form.services.splice(i, 1)"><UiIcon name="trash" :size="16" />{{ t('provider.profile.removeService') }}</UiButton>
        </li>
      </ul>
      <UiButton variant="secondary" @click="form.services.push(newServiceRow())"><UiIcon name="plus" :size="16" />{{ t('provider.profile.addService') }}</UiButton>
    </fieldset>
    <UiButton type="submit" size="lg" :loading="saving">{{ t('common.save') }}</UiButton>
  </form>
</template>
