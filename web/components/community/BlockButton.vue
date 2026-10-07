<script setup lang="ts">
import { isApiError } from '~/utils/errors'

/** Block the author of a question or answer. The API never reveals who is blocked, only the content is hidden afterwards. */
const props = defineProps<{ type: 'question' | 'answer' | 'comment', id: number }>()
const emit = defineEmits<{ blocked: [] }>()
const { t } = useI18n()
const { request } = useApi()
const toast = useToast()
const confirming = ref(false)
const busy = ref(false)
async function block() {
  busy.value = true
  try {
    await request('community/blocks', { method: 'POST', body: { type: props.type, id: props.id } })
    toast.success(t('community.blocks.done'))
    confirming.value = false
    emit('blocked')
  } catch (e) {
    toast.error(isApiError(e) ? e.message : t('errors.generic'))
  } finally { busy.value = false }
}
</script>

<template>
  <div>
    <UiButton variant="ghost" :aria-expanded="confirming" @click="confirming = !confirming"><UiIcon name="x-circle" :size="16" />{{ t('community.blocks.button') }}</UiButton>
    <UiConfirmInline v-if="confirming" class="mt-2" :message="t('community.blocks.confirm')" :confirm-label="t('community.blocks.button')" :loading="busy" @cancel="confirming = false" @confirm="block" />
  </div>
</template>
