<script setup lang="ts">
import type { CommunityComment } from '~/types/extra'
import { formatDate } from '~/utils/locale'

/** Comments under a question or an answer, with an add form and own-delete / report actions. */
const props = defineProps<{ questionId: number, answerId?: number, comments: CommunityComment[], canPost: boolean }>()
const emit = defineEmits<{ changed: [] }>()
const { t, locale } = useI18n()
const { request } = useApi()
const toast = useToast()
const open = ref(false)
const body = ref('')
const err = ref<string | undefined>()
const sending = ref(false)
async function send() {
  err.value = undefined
  if (!body.value.trim()) { err.value = t('community.errors.bodyRequired'); return }
  sending.value = true
  try {
    await request(`community/questions/${props.questionId}/comments`, { method: 'POST', body: { body: body.value.trim(), ...(props.answerId ? { answer_id: props.answerId } : {}) } })
    toast.success(t('community.posted'))
    body.value = ''; open.value = false
    emit('changed')
  } catch (e) { err.value = isApiError(e) ? e.message : t('errors.generic') } finally { sending.value = false }
}
const confirmId = ref<number | null>(null)
async function remove(id: number) {
  try { await request(`community/comments/${id}`, { method: 'DELETE' }); confirmId.value = null; emit('changed') } catch (e) { toast.error(isApiError(e) ? e.message : t('errors.generic')) }
}
</script>

<template>
  <div class="space-y-2">
    <ul v-if="comments.length" class="space-y-2 border-s-2 border-line ps-3">
      <li v-for="c in comments" :key="c.id" class="space-y-1 text-sm">
        <p dir="auto">{{ c.body }}</p>
        <p class="flex flex-wrap items-center gap-2 text-xs text-muted"><CommunityLabels :label="t('community.commentLabel')" :status="c.status" :mine="c.mine" /><time v-if="c.created_at" :datetime="c.created_at">{{ formatDate(c.created_at, locale) }}</time></p>
        <div class="flex flex-wrap gap-1"><UiButton v-if="c.mine" variant="ghost" @click="confirmId = c.id">{{ t('common.delete') }}</UiButton><ServicesReportButton v-else-if="canPost" :endpoint="`community/comment/${c.id}/report`" /></div>
        <UiConfirmInline v-if="confirmId === c.id" :message="t('community.deleteConfirm')" :confirm-label="t('common.delete')" @confirm="remove(c.id)" @cancel="confirmId = null" />
      </li>
    </ul>
    <template v-if="canPost">
      <UiButton v-if="!open" variant="ghost" @click="open = true">{{ t('community.addComment') }}</UiButton>
      <form v-else class="space-y-2" novalidate @submit.prevent="send">
        <UiFormField :label="t('community.addComment')" :error="err" required><UiTextarea v-model="body" :rows="2" :maxlength="5000" /></UiFormField>
        <div class="flex gap-2"><UiButton type="submit" :loading="sending">{{ t('community.post') }}</UiButton><UiButton variant="ghost" @click="open = false">{{ t('common.cancel') }}</UiButton></div>
      </form>
    </template>
  </div>
</template>
