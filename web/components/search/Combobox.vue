<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from '#imports'
import type { Suggestion } from '~/types/api'
import Icon from '../ui/Icon.vue'

/**
 * ARIA 1.2 combobox with a list popup. The parent owns fetching; this owns keyboard behaviour:
 * ArrowDown/ArrowUp move (wrapping), Enter picks the active suggestion or submits the text, Escape closes
 * (a second Escape clears), Tab/blur close. Focus never leaves the input (aria-activedescendant).
 */
const props = defineProps<{ modelValue: string, suggestions: Suggestion[], label: string, placeholder?: string, typeLabel?: (type: string) => string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string], submit: [query: string], select: [s: Suggestion] }>()
const { t } = useI18n()

const uid = useId()
const listId = `sb-list-${uid}`
const optId = (i: number) => `sb-opt-${uid}-${i}`
const open = ref(false)
const active = ref(-1)
const expanded = computed(() => open.value && props.suggestions.length > 0)

watch(() => props.suggestions, () => { active.value = -1 })

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  open.value = true
}
function move(delta: 1 | -1) {
  if (!props.suggestions.length) return
  open.value = true
  const n = props.suggestions.length
  active.value = active.value === -1 ? (delta === 1 ? 0 : n - 1) : (active.value + delta + n) % n
}
function choose(i: number) {
  const s = props.suggestions[i]
  if (!s) return
  emit('update:modelValue', s.title)
  emit('select', s)
  open.value = false
  active.value = -1
}
function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); move(1); break
    case 'ArrowUp': e.preventDefault(); move(-1); break
    case 'Home': if (expanded.value) { e.preventDefault(); active.value = 0 } break
    case 'End': if (expanded.value) { e.preventDefault(); active.value = props.suggestions.length - 1 } break
    case 'Enter':
      e.preventDefault()
      if (expanded.value && active.value >= 0) choose(active.value)
      else { open.value = false; emit('submit', props.modelValue.trim()) }
      break
    case 'Escape':
      if (expanded.value) { e.preventDefault(); open.value = false; active.value = -1 }
      else if (props.modelValue) { e.preventDefault(); emit('update:modelValue', '') }
      break
    case 'Tab': open.value = false; break
  }
}
</script>

<template>
  <div class="relative" @focusout="(e: FocusEvent) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) open = false }">
    <div class="relative">
      <Icon name="search" :size="18" class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        role="combobox"
        autocomplete="off"
        enterkeyhint="search"
        :aria-label="label"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-controls="listId"
        :aria-activedescendant="expanded && active >= 0 ? optId(active) : undefined"
        :value="modelValue"
        :placeholder="placeholder"
        maxlength="100"
        class="block min-h-touch w-full rounded-md border border-line-strong bg-surface ps-10 pe-3 py-2 text-ink placeholder:text-muted"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open = true"
      >
    </div>
    <ul
      v-show="expanded"
      :id="listId"
      role="listbox"
      :aria-label="t('search.suggestions')"
      class="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-md border border-line bg-surface py-1 shadow-3"
    >
      <li
        v-for="(s, i) in suggestions"
        :id="optId(i)"
        :key="`${s.type}-${s.title}`"
        role="option"
        :aria-selected="i === active ? 'true' : 'false'"
        class="flex min-h-touch cursor-pointer items-center justify-between gap-3 px-3 py-2"
        :class="i === active ? 'bg-primary-soft text-primary-strong' : 'text-ink hover:bg-sunken'"
        @mousedown.prevent="choose(i)"
      >
        <span class="min-w-0 truncate">{{ s.title }}</span>
        <span class="shrink-0 text-xs text-muted">{{ typeLabel ? typeLabel(s.type) : s.type }}</span>
      </li>
    </ul>
    <p class="sr-only" role="status" aria-live="polite">{{ expanded ? t('search.suggestionsCount', { count: suggestions.length }) : '' }}</p>
  </div>
</template>
