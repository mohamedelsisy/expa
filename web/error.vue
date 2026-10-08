<script setup lang="ts">
import type { NuxtError } from '#app'
import { localeDir } from '~/utils/locale'

const props = defineProps<{ error: NuxtError }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
useHead({
  htmlAttrs: { lang: () => locale.value, dir: () => localeDir(locale.value) },
  title: () => `${props.error.statusCode === 404 ? t('errors.notFoundTitle') : props.error.statusCode === 403 ? t('errors.forbiddenTitle') : t('errors.title')} | EXPA`,
  meta: [{ name: 'robots', content: 'noindex' }],
})
const notFound = computed(() => props.error.statusCode === 404)
const forbidden = computed(() => props.error.statusCode === 403)
const home = () => clearError({ redirect: localePath('/') })
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LayoutSkipLink />
    <header class="container-page flex min-h-[64px] flex-wrap items-center justify-between gap-y-1">
      <LayoutBrandLogo />
      <UiLanguageSwitcher />
    </header>
    <main id="main" tabindex="-1" class="flex flex-1 items-center justify-center px-4 outline-none">
      <div class="text-center">
        <p class="text-6xl font-bold text-primary" dir="ltr" aria-hidden="true">{{ error.statusCode }}</p>
        <UiErrorState :heading-level="1" :title="notFound ? t('errors.notFoundTitle') : forbidden ? t('errors.forbiddenTitle') : t('errors.title')" :message="notFound ? t('errors.notFound') : forbidden ? t('errors.forbidden') : t('errors.generic')">
          <UiButton @click="home">{{ t('errors.backHome') }}</UiButton>
        </UiErrorState>
      </div>
    </main>
  </div>
</template>
