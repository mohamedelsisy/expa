<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useI18n } from '#imports'

export interface FilterField {
  key: string
  type: 'search' | 'select' | 'date' | 'checkbox'
  label: string
  options?: { value: string, label: string }[]
  placeholder?: string
  ltr?: boolean
}
/** Filter bar for URL-synced lists: selects/dates/checkboxes apply immediately, search applies on submit. */
const props = defineProps<{ fields: FilterField[], filters: Record<string, string>, label?: string }>()
const emit = defineEmits<{ set: [key: string, value: string], clear: [] }>()
const { t } = useI18n()
const draft = reactive<Record<string, string>>({})
watch(() => props.filters, (f) => { for (const x of props.fields) draft[x.key] = f[x.key] ?? '' }, { immediate: true, deep: true })
const active = computed(() => Object.keys(props.filters).length > 0)
const submit = () => { for (const f of props.fields.filter(x => x.type === 'search')) if ((draft[f.key] ?? '') !== (props.filters[f.key] ?? '')) emit('set', f.key, (draft[f.key] ?? '').trim()) }
</script>

<template>
  <form role="search" :aria-label="label ?? t('admin.common.filters')" class="mb-4 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" @submit.prevent="submit">
    <template v-for="f in fields" :key="f.key">
      <UiFormField v-if="f.type === 'search'" :label="f.label">
        <UiTextInput v-model="draft[f.key]!" type="search" inputmode="search" :placeholder="f.placeholder" :ltr="f.ltr" />
      </UiFormField>
      <UiFormField v-else-if="f.type === 'select'" :label="f.label">
        <UiSelect :model-value="filters[f.key] ?? ''" :options="f.options ?? []" :placeholder="t('admin.common.all')" @update:model-value="emit('set', f.key, $event)" />
      </UiFormField>
      <UiFormField v-else-if="f.type === 'date'" :label="f.label">
        <UiTextInput :model-value="filters[f.key] ?? ''" type="date" ltr @update:model-value="emit('set', f.key, $event)" />
      </UiFormField>
      <UiCheckbox v-else :model-value="filters[f.key] === '1'" :label="f.label" @update:model-value="emit('set', f.key, $event ? '1' : '')" />
    </template>
    <div class="flex flex-wrap gap-2">
      <UiButton v-if="fields.some(f => f.type === 'search')" type="submit"><UiIcon name="search" :size="18" />{{ t('admin.common.search') }}</UiButton>
      <UiButton v-if="active" variant="secondary" @click="emit('clear')">{{ t('admin.common.clear') }}</UiButton>
    </div>
  </form>
</template>
