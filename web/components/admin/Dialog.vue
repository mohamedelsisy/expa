<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from '#imports'
import Icon from '../ui/Icon.vue'

/** Modal dialog / drawer: focus moves in, Tab is trapped, Esc and the backdrop close it, focus returns to the opener. */
const props = withDefaults(defineProps<{ open: boolean, title: string, variant?: 'center' | 'drawer' }>(), { variant: 'center' })
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const titleId = `dlg-${useId()}`
const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

watch(() => props.open, async (v) => {
  if (v) {
    opener = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    await nextTick()
    const first = panel.value?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.value?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.value
    first?.focus()
  } else {
    document.documentElement.style.overflow = ''
    opener?.focus?.()
  }
})
onBeforeUnmount(() => { if (props.open) document.documentElement.style.overflow = '' })

function trap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !panel.value) return
  const items = focusables(panel.value)
  // Keep focus on the panel itself when nothing inside is focusable.
  if (!items.length) { e.preventDefault(); panel.value.focus(); return }
  trapTab(e, items)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex" :class="variant === 'drawer' ? 'justify-end' : 'items-center justify-center p-4'">
    <div class="absolute inset-0 bg-ink/50" aria-hidden="true" @click="emit('close')" />
    <div
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      class="relative flex max-h-full w-full flex-col overflow-hidden bg-surface shadow-3 outline-none"
      :class="variant === 'drawer' ? 'h-full max-w-xl' : 'max-w-lg rounded-lg'"
      @keydown.esc.stop="emit('close')"
      @keydown="trap"
    >
      <header class="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 :id="titleId" class="text-lg font-bold">{{ title }}</h2>
        <button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft hover:bg-sunken" :aria-label="t('admin.common.close')" @click="emit('close')"><Icon name="x" /></button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4"><slot /></div>
      <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3"><slot name="footer" /></footer>
    </div>
  </div>
</template>
