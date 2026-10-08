<script setup lang="ts">
import type { MyReview } from '~/types/extra'
import { REVIEW_MAX } from '~/utils/services'

/** Write a review. It is always moderated first: the success message says so (it does not appear immediately). */
const props = defineProps<{ slug: string }>()
const { t } = useI18n()
const { request } = useApi()
const rating = ref(0)
const body = ref('')
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const needVerify = ref(false)
const done = ref(false)
const notice = ref<string | null>(null)

async function submit() {
  errors.value = {}
  notice.value = null
  needVerify.value = false
  if (rating.value < 1) { errors.value = { rating: t('services.review.ratingRequired') }; return }
  if (body.value.length > REVIEW_MAX) { errors.value = { body: t('services.review.tooLong', { max: REVIEW_MAX }) }; return }
  submitting.value = true
  try {
    await request<MyReview>(`providers/${encodeURIComponent(props.slug)}/reviews`, { method: 'POST', body: { rating: rating.value, ...(body.value.trim() ? { body: body.value.trim() } : {}) } })
    done.value = true
  } catch (e) {
    if (isApiError(e) && e.code === 'email_not_verified') needVerify.value = true
    else if (isApiError(e) && ['review_exists', 'account_too_new', 'link_not_allowed', 'too_many_links', 'duplicate_content', 'new_account_throttled'].includes(e.code)) notice.value = e.message
    else {
      errors.value = fieldErrors(e)
      if (!Object.keys(errors.value).length) notice.value = isApiError(e) ? e.message : t('errors.generic')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-3" aria-labelledby="wr-h">
    <h3 id="wr-h" class="text-lg font-bold">{{ t('services.review.write') }}</h3>
    <UiAlert v-if="done" tone="success" data-testid="review-pending">{{ t('services.review.pending') }}</UiAlert>
    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <AuthVerifyNeeded v-if="needVerify" />
      <fieldset class="space-y-1">
        <legend class="font-medium">{{ t('services.review.rating') }} <span class="text-danger" aria-hidden="true">*</span></legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="t('services.review.rating')">
          <label v-for="n in 5" :key="n" class="inline-flex min-h-touch min-w-touch cursor-pointer items-center justify-center gap-1 rounded-md border px-3 font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent" :class="rating === n ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface'">
            <input v-model.number="rating" type="radio" name="rating" :value="n" class="sr-only"><span aria-hidden="true">{{ n }}</span><span class="sr-only">{{ t('services.review.stars', { count: n }) }}</span>
          </label>
        </div>
        <p v-if="errors.rating" class="text-sm text-danger" role="alert">{{ errors.rating }}</p>
      </fieldset>
      <UiFormField :label="t('services.review.body')" :hint="t('services.review.hint')" :error="errors.body" optional><UiTextarea v-model="body" :rows="4" :maxlength="REVIEW_MAX + 100" /></UiFormField>
      <UiAlert v-if="notice" tone="warning">{{ notice }}</UiAlert>
      <UiButton type="submit" :loading="submitting">{{ t('services.review.submit') }}</UiButton>
    </form>
  </section>
</template>
