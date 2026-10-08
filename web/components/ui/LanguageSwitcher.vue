<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n, useSwitchLocalePath } from '#imports'
import { localeDir } from '~/utils/locale'
import { useDropdown } from '~/composables/useDropdown'
import Icon from './Icon.vue'

/**
 * Locale links (real <a>, work without JS). `switch` is emitted so callers can persist the choice.
 * `variant="menu"` collapses the list into a compact dropdown (used by the header); the default is the inline list.
 */
const props = withDefaults(defineProps<{ variant?: 'inline' | 'menu' }>(), { variant: 'inline' })
const emit = defineEmits<{ switch: [code: string] }>()
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const items = computed(() => (locales.value as { code: string, name?: string }[]).map(l => ({ code: l.code, name: l.name ?? l.code })))
const current = computed(() => items.value.find(l => l.code === locale.value) ?? items.value[0])
const { open, root, toggle, close, onFocusOut } = useDropdown()
const panelId = useId()
</script>

<template>
  <div v-if="props.variant === 'menu'" ref="root" class="relative" @focusout="onFocusOut">
    <button
      type="button"
      data-dropdown-trigger
      class="inline-flex min-h-touch items-center gap-1.5 rounded-md px-2 font-medium text-ink-soft hover:bg-sunken"
      :class="open ? 'bg-sunken' : ''"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="`${t('nav.language')}: ${current?.name}`"
      @click="toggle"
    >
      <Icon name="globe" :size="18" />
      <span :lang="current?.code" :dir="localeDir(current?.code ?? 'en')" class="text-sm">{{ current?.name }}</span>
      <Icon name="chevron-down" :size="14" class="transition-transform motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
    </button>
    <nav v-show="open" :id="panelId" :aria-label="t('nav.language')" class="absolute end-0 top-full z-50 mt-2 min-w-[10rem] rounded-lg border border-line bg-surface p-1.5 shadow-3">
      <ul>
        <li v-for="l in items" :key="l.code">
          <NuxtLink
            :to="switchLocalePath(l.code as 'ar')"
            :lang="l.code"
            :hreflang="l.code"
            :dir="localeDir(l.code)"
            :aria-current="l.code === locale ? 'true' : undefined"
            class="flex min-h-touch items-center justify-between gap-3 rounded-md px-3 font-medium"
            :class="l.code === locale ? 'bg-primary-soft text-primary-strong' : 'text-ink hover:bg-sunken'"
            @click="emit('switch', l.code); close()"
          >
            <span>{{ l.name }}</span>
            <Icon v-if="l.code === locale" name="check" :size="16" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
  <nav v-else :aria-label="t('nav.language')" class="flex items-center gap-1">
    <Icon name="globe" :size="18" class="hidden text-muted sm:block" />
    <ul class="flex items-center">
      <li v-for="l in items" :key="l.code">
        <NuxtLink
          :to="switchLocalePath(l.code as 'ar')"
          :lang="l.code"
          :hreflang="l.code"
          :dir="localeDir(l.code)"
          :aria-current="l.code === locale ? 'true' : undefined"
          class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md px-1.5 text-sm sm:px-2 font-medium"
          :class="l.code === locale ? 'bg-primary-soft text-primary-strong' : 'text-ink-soft hover:bg-sunken'"
          @click="emit('switch', l.code)"
        >{{ l.name }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>
