<script setup lang="ts">
import type { DocumentType, UserDocument } from '~/types/api'
import { isConsentRequired } from '~/utils/errors'

/** Create/edit form for a tracked document. Emits `saved` with the API's document. */
const props = defineProps<{ doc?: UserDocument | null, types: DocumentType[] }>()
const emit = defineEmits<{ saved: [doc: UserDocument] }>()
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()

const form = reactive({
  type: props.doc?.type.key ?? '',
  label: props.doc?.label ?? '',
  issue_date: props.doc?.issue_date ?? '',
  expiry_date: props.doc?.expiry_date ?? '',
  notes: props.doc?.notes ?? '',
  reminders_enabled: props.doc?.reminders_enabled ?? true,
  offsets: (props.doc?.reminder_offsets ?? [90, 60, 30, 14, 7]).join(', '),
})
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const needConsent = ref(false)

const typeOptions = computed(() => props.types.map(x => ({ value: x.key, label: x.name })))

function parseOffsets(): number[] | null {
  const parts = form.offsets.split(/[,\s،]+/).filter(Boolean)
  const nums = parts.map(Number)
  return nums.every(n => Number.isInteger(n) && n >= 0 && n <= 730) ? [...new Set(nums)] : null
}

async function save() {
  errors.value = {}
  needConsent.value = false
  const offsets = parseOffsets()
  if (offsets === null) { errors.value = { reminder_offsets: t('documents.form.offsetsInvalid') }; return }
  if (!form.type) { errors.value = { type: t('documents.form.typeRequired') }; return }
  saving.value = true
  const body = {
    type: form.type,
    label: form.label.trim() || null,
    issue_date: form.issue_date || null,
    expiry_date: form.expiry_date || null,
    notes: form.notes.trim() || null,
    reminders_enabled: form.reminders_enabled,
    reminder_offsets: offsets,
  }
  try {
    const res = props.doc
      ? await request<UserDocument>(`my-documents/${props.doc.id}`, { method: 'PATCH', body })
      : await request<UserDocument>('my-documents', { method: 'POST', body })
    toast.success(t('documents.saved'))
    emit('saved', res.data)
  } catch (e) {
    if (isConsentRequired(e, 'document_storage')) needConsent.value = true
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
  <form class="space-y-5" novalidate @submit.prevent="save">
    <ConsentGate v-if="needConsent" purpose="document_storage" @granted="needConsent = false; save()" />
    <UiFormField :label="t('documents.form.type')" :error="errors.type" required>
      <UiSelect v-model="form.type" :options="typeOptions" :placeholder="t('common.choose')" />
    </UiFormField>
    <UiFormField :label="t('documents.form.label')" :hint="t('documents.form.labelHint')" :error="errors.label" optional>
      <UiTextInput v-model="form.label" :maxlength="100" />
    </UiFormField>
    <div class="grid gap-5 sm:grid-cols-2">
      <UiFormField :label="t('documents.form.issue')" :error="errors.issue_date" optional>
        <UiTextInput v-model="form.issue_date" type="date" ltr />
      </UiFormField>
      <UiFormField :label="t('documents.form.expiry')" :error="errors.expiry_date" optional>
        <UiTextInput v-model="form.expiry_date" type="date" ltr />
      </UiFormField>
    </div>
    <UiFormField :label="t('documents.form.notes')" :hint="t('documents.form.notesHint')" :error="errors.notes" optional>
      <UiTextarea v-model="form.notes" :rows="3" :maxlength="2000" />
    </UiFormField>
    <fieldset class="space-y-2">
      <UiCheckbox v-model="form.reminders_enabled" :label="t('documents.form.reminders')" :description="t('documents.form.remindersHint')" />
      <UiFormField v-if="form.reminders_enabled" :label="t('documents.form.offsets')" :hint="t('documents.form.offsetsHint')" :error="errors.reminder_offsets">
        <UiTextInput v-model="form.offsets" inputmode="numeric" ltr />
      </UiFormField>
    </fieldset>
    <UiButton type="submit" :loading="saving">{{ t('common.save') }}</UiButton>
  </form>
</template>
