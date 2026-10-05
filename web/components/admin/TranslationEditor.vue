<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from '#imports'
import { LOCALE_CODES, type Loc, type TranslatableField } from '~/utils/admin/modules'
import { localeDir } from '~/utils/locale'
import type { TrFields, TrValue } from '~/utils/admin/form'
import FormField from '../ui/FormField.vue'
import TextInput from '../ui/TextInput.vue'
import Textarea from '../ui/Textarea.vue'
import Badge from '../ui/Badge.vue'
import ListEditor from './ListEditor.vue'

/**
 * ar / en / it tabs. "Missing" comes from the API's `missing_locales` (cleared live once the primary field is typed);
 * Arabic (and any `requiredLocales`) is marked required-to-publish; ar is rtl, en/it ltr whatever the UI language.
 */
const props = defineProps<{
  modelValue: Record<Loc, TrFields>
  fields: TranslatableField[]
  primary: string
  requiredLocales: readonly string[]
  missingLocales: readonly string[]
  errors?: Record<string, Record<string, string>>
  disabled?: boolean
  active: Loc
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<Loc, TrFields>], 'update:active': [value: Loc] }>()
const { t } = useI18n()
const uid = useId()
const tabId = (l: string) => `${uid}-tab-${l}`
const panelId = (l: string) => `${uid}-panel-${l}`

const typed = (l: Loc) => { const v = props.modelValue[l]?.[props.primary]; return typeof v === 'string' && v.trim() !== '' }
const isMissing = (l: Loc) => props.missingLocales.includes(l) && !typed(l)
const hasError = (l: string) => !!props.errors?.[l] && Object.keys(props.errors[l]!).length > 0

function setField(l: Loc, key: string, v: TrValue) {
  emit('update:modelValue', { ...props.modelValue, [l]: { ...props.modelValue[l], [key]: v } })
}
const refs = ref<Record<string, HTMLElement | null>>({})
function onKey(e: KeyboardEvent, l: Loc) {
  const i = LOCALE_CODES.indexOf(l)
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  const rtl = document.documentElement.dir === 'rtl'
  const next = LOCALE_CODES[(i + (rtl ? -step : step) + LOCALE_CODES.length) % LOCALE_CODES.length]!
  e.preventDefault()
  emit('update:active', next)
  refs.value[next]?.focus()
}
const len = (v: TrValue | undefined) => (typeof v === 'string' ? v.length : 0)
const near = (v: TrValue | undefined, max: number) => len(v) >= max * 0.9
const tabs = computed(() => LOCALE_CODES.map(l => ({ l, missing: isMissing(l), required: props.requiredLocales.includes(l), error: hasError(l) })))
</script>

<template>
  <div data-testid="translation-editor">
    <div role="tablist" :aria-label="t('admin.translation.tabs')" class="flex flex-wrap gap-1 border-b border-line">
      <button
        v-for="x in tabs"
        :id="tabId(x.l)"
        :key="x.l"
        :ref="(el) => (refs[x.l] = el as HTMLElement | null)"
        type="button"
        role="tab"
        :data-locale="x.l"
        :aria-selected="active === x.l"
        :aria-controls="panelId(x.l)"
        :tabindex="active === x.l ? 0 : -1"
        class="inline-flex min-h-touch flex-wrap items-center gap-x-2 gap-y-1 rounded-t-md border border-b-0 px-3 py-1 font-medium"
        :class="active === x.l ? 'border-line bg-surface text-primary-strong' : 'border-transparent text-ink-soft hover:bg-sunken'"
        @click="emit('update:active', x.l)"
        @keydown="onKey($event, x.l)"
      >
        <span>{{ t(`languages.${x.l}`) }}</span>
        <Badge v-if="x.required" tone="accent" data-testid="required-marker">{{ t('admin.translation.requiredToPublish') }}</Badge>
        <Badge v-if="x.missing" tone="warning" data-testid="missing-marker">{{ t('admin.translation.missing') }}</Badge>
        <Badge v-if="x.error" tone="danger">{{ t('admin.translation.hasErrors') }}</Badge>
      </button>
    </div>
    <div
      v-for="l in LOCALE_CODES"
      v-show="active === l"
      :id="panelId(l)"
      :key="l"
      role="tabpanel"
      :aria-labelledby="tabId(l)"
      :dir="localeDir(l)"
      :lang="l"
      :data-locale-panel="l"
      class="space-y-4 rounded-b-md border border-line bg-surface p-4"
    >
      <p class="text-sm text-muted" dir="auto">{{ t('admin.translation.plainTextHint') }}</p>
      <div v-for="f in fields" :key="f.key" :data-admin-field="`tr:${l}:${f.key}`">
        <FormField :label="t(`admin.fields.${f.key}`)" :error="errors?.[l]?.[f.key]" :required="f.key === primary && requiredLocales.includes(l)" :optional="f.key !== primary && !f.requiredToPublish" :hint="f.requiredToPublish && requiredLocales.includes(l) ? t('admin.translation.fieldRequiredToPublish') : undefined">
          <TextInput v-if="f.type === 'text'" :model-value="(modelValue[l][f.key] as string) ?? ''" :maxlength="f.max" :dir="localeDir(l)" :disabled="disabled" @update:model-value="setField(l, f.key, $event)" />
          <Textarea v-else-if="f.type === 'textarea'" :model-value="(modelValue[l][f.key] as string) ?? ''" :rows="f.rows ?? 4" :maxlength="f.max" :dir="localeDir(l)" :disabled="disabled" @update:model-value="setField(l, f.key, $event)" />
          <ListEditor v-else :field="f" :locale="l" :model-value="(modelValue[l][f.key] as never) ?? []" :disabled="disabled" @update:model-value="setField(l, f.key, $event as TrValue)" />
        </FormField>
        <p v-if="f.type === 'text' || f.type === 'textarea'" class="mt-1 text-end text-xs tabular-nums" :class="near(modelValue[l][f.key], f.max) ? 'text-warning font-semibold' : 'text-muted'" :data-counter="`${l}:${f.key}`" dir="ltr">{{ len(modelValue[l][f.key]) }}/{{ f.max }}</p>
      </div>
    </div>
  </div>
</template>
