<script setup lang="ts">
const { t } = useI18n()
useSeo(() => ({ title: t('explore.title'), description: t('explore.subtitle') }))
const auth = useAuthStore()
const localePath = useLocalePath()
const { modules, community } = useExploreModules()
await community.load()
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('explore.title') }}</h1>
      <p class="mt-1 text-ink-soft">{{ t('explore.subtitle') }}</p>
    </header>
    <div class="mb-8 max-w-xl lg:hidden"><SearchBox /></div>
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="m in modules" :key="m.key">
        <UiCard as="article" class="relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2">
          <span class="grid size-12 place-items-center rounded-full bg-primary-soft text-primary-strong"><UiIcon :name="m.icon" :size="24" /></span>
          <h2 class="text-lg font-bold">
            <NuxtLink :to="localePath(m.to)" class="after:absolute after:inset-0 after:content-['']">{{ t(`explore.modules.${m.key}.title`) }}</NuxtLink>
          </h2>
          <p class="text-ink-soft">{{ t(`explore.modules.${m.key}.body`) }}</p>
          <UiBadge v-if="m.auth && !auth.isAuthenticated" class="mt-auto self-start">{{ t('explore.needsAccount') }}</UiBadge>
        </UiCard>
      </li>
    </ul>
  </div>
</template>
