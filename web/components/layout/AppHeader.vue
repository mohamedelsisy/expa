<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const nav = useNav()
const persist = usePersistLocale()
const localePath = useLocalePath()

// Desktop primary links. "Explore" becomes a dropdown holding every module, and "Profile" lives in the account menu.
const links = computed(() => nav.value.filter(i => i.key !== 'profile'))
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <!-- One line on desktop: logo, primary links (+ Explore dropdown), search, then the language / account controls.
         flex-wrap stays as a safety net so large text sizes wrap instead of overflowing horizontally. -->
    <div class="container-page relative flex min-h-[64px] flex-wrap items-center gap-x-2 gap-y-1 py-1 lg:gap-x-4">
      <LayoutBrandLogo class="shrink-0" />
      <nav :aria-label="t('nav.primary')" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in links" :key="item.key">
            <LayoutExploreMenu v-if="item.key === 'explore'" />
            <NuxtLink
              v-else
              :to="item.to"
              class="inline-flex min-h-touch items-center gap-2 rounded-md px-3 font-medium"
              :class="item.active ? 'bg-primary-soft text-primary-strong' : 'text-ink-soft hover:bg-sunken'"
              :aria-current="item.active ? 'page' : undefined"
            >{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <!-- From xl up the search box has room even with the longest (Arabic, admin) labels; below that the icon link is used. -->
      <div class="hidden min-w-[9rem] max-w-xs flex-1 xl:block"><SearchBox /></div>
      <div class="ms-auto flex min-w-0 items-center gap-0.5 sm:gap-2">
        <NuxtLink :to="localePath('/search')" class="hidden min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft hover:bg-sunken sm:inline-flex xl:hidden" :aria-label="t('search.title')"><UiIcon name="search" :size="22" /></NuxtLink>
        <LayoutNotificationBell v-if="auth.isAuthenticated" />
        <UiLanguageSwitcher variant="menu" @switch="persist" />
        <LayoutAccountMenu v-if="auth.isAuthenticated" class="hidden lg:block" />
        <template v-else>
          <UiButton to="/login" variant="ghost" class="!px-2 sm:!px-5">{{ t('auth.login') }}</UiButton>
          <UiButton to="/register" class="hidden lg:inline-flex">{{ t('auth.register') }}</UiButton>
        </template>
      </div>
    </div>
  </header>
</template>
