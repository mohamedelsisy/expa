<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useSwitchLocalePath } from '#imports'
import { localeDir } from '~/utils/locale'
import Icon from './Icon.vue'

/** Locale links (real <a>, work without JS). `switch` is emitted so callers can persist the choice. */
const emit = defineEmits<{ switch: [code: string] }>()
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const items = computed(() => (locales.value as { code: string, name?: string }[]).map(l => ({ code: l.code, name: l.name ?? l.code })))
</script>

<template>
  <nav :aria-label="t('nav.language')" class="flex items-center gap-1">
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
