<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { useLocalePath } from '#imports'
import Icon from './Icon.vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'md' | 'lg'
  /** In-app path (locale prefix added automatically). */
  to?: string
  /** External URL (opens in same tab unless `newTab`). */
  href?: string
  newTab?: boolean
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), { variant: 'primary', size: 'md', type: 'button' })

const localePath = useLocalePath()
const NuxtLink = resolveComponent('NuxtLink')
const tag = computed(() => (props.to ? NuxtLink : props.href ? 'a' : 'button'))
const attrs = computed(() => {
  if (props.to) return { to: localePath(props.to) }
  if (props.href) return { href: props.href, ...(props.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
  return { type: props.type, disabled: props.disabled }
})
// While loading the button stays focusable (aria-disabled) but ignores activation, so focus and context are not lost.
function guard(e: Event) {
  if (props.loading) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}
const styles: Record<string, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-strong',
  accent: 'bg-accent text-on-accent hover:brightness-95',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-primary-strong hover:bg-primary-soft',
  danger: 'bg-danger text-surface hover:brightness-90',
}
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="loading ? 'true' : undefined"
    @click.capture="guard"
    class="inline-flex min-h-touch items-center justify-center gap-2 rounded-md px-5 py-2 text-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-progress aria-disabled:opacity-60"
    :class="[styles[variant], size === 'lg' ? 'min-h-[52px] px-7 text-lg' : '', block ? 'w-full' : '']"
  >
    <span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
    <slot />
  </component>
</template>
