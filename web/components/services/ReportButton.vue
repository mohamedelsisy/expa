<script setup lang="ts">
import { REPORT_REASONS } from '~/utils/services'

/** Report a review (or any community item) with a reason from the API's fixed list. */
const props = defineProps<{ endpoint: string, label?: string }>()
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const open = ref(false)
const reason = ref('')
const note = ref('')
const submitting = ref(false)
const err = ref<string | undefined>()
const options = computed(() => REPORT_REASONS.map(r => ({ value: r, label: t(`report.reasons.${r}`) })))
async function send() {
  err.value = undefined
  if (!reason.value) { err.value = t('report.reasonRequired'); return }
  submitting.value = true
  try {
    await request(props.endpoint, { method: 'POST', body: { reason: reason.value, ...(note.value.trim() ? { note: note.value.trim() } : {}) } })
    toast.success(t('report.thanks'))
    open.value = false; reason.value = ''; note.value = ''
  } catch (e) {
    if (isApiError(e) && e.code === 'already_reported') { toast.info(t('report.already')); open.value = false } else err.value = isApiError(e) ? e.message : t('errors.generic')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <UiButton variant="ghost" :aria-expanded="open" @click="open = !open"><UiIcon name="alert" :size="16" />{{ label ?? t('report.button') }}</UiButton>
    <form v-if="open" class="mt-2 space-y-3 rounded-md border border-line bg-sunken p-3" novalidate @submit.prevent="send">
      <UiFormField :label="t('report.reason')" :error="err" required><UiSelect v-model="reason" :options="options" :placeholder="t('common.choose')" /></UiFormField>
      <UiFormField :label="t('report.note')" optional><UiTextarea v-model="note" :rows="2" :maxlength="500" /></UiFormField>
      <div class="flex gap-2"><UiButton type="submit" :loading="submitting">{{ t('report.send') }}</UiButton><UiButton variant="ghost" @click="open = false">{{ t('common.cancel') }}</UiButton></div>
    </form>
  </div>
</template>
