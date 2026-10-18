<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const persist = usePersistLocale()
const localePath = useLocalePath()
const headerLinks = useHeaderLinks()
const scrolled = useScrolled()
</script>

<template>
  <!-- The border is always 1px thick; only its colour and the shadow change on scroll, so nothing shifts. -->
  <header
    class="sticky top-0 z-40 border-b bg-surface transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none"
    :class="scrolled ? 'border-line-strong shadow-2' : 'border-line shadow-none'"
    :data-scrolled="scrolled ? 'true' : 'false'"
  >
    <!-- One line on desktop: logo, primary nav (Explore mega menu, Ask EXPA, My Italy), search, then the secondary controls.
         flex-wrap stays as a safety net so large text sizes wrap instead of overflowing horizontally. -->
    <div class="container-page flex min-h-[64px] flex-wrap items-center gap-x-2 gap-y-1 py-1 lg:relative lg:gap-x-4">
      <LayoutBrandLogo class="shrink-0" />
      <nav :aria-label="t('nav.primary')" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li><LayoutExploreMenu /></li>
          <li v-for="item in headerLinks" :key="item.key">
            <NuxtLink
              :to="item.to"
              class="inline-flex min-h-touch items-center gap-2 rounded-md px-3 transition-colors motion-reduce:transition-none"
              :class="[
                item.active ? 'bg-primary-soft text-primary-strong' : item.key === 'ask' ? 'bg-primary-soft/50 text-primary-strong hover:bg-primary-soft' : 'text-ink-soft hover:bg-sunken hover:text-ink',
                item.key === 'ask' ? 'font-semibold' : 'font-medium',
              ]"
              :aria-current="item.active ? 'page' : undefined"
            >
              <UiIcon :name="item.icon" :size="item.key === 'ask' ? 18 : 17" />
              {{ item.label }}
              <span v-if="item.key === 'ask'" aria-hidden="true" class="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary">{{ t('nav.aiTag') }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <!-- From xl up the search box has room even with the longest (Arabic) labels; below that the icon link is used. -->
      <div class="hidden min-w-[9rem] max-w-xs flex-1 xl:block"><SearchBox /></div>
      <div class="ms-auto flex min-w-0 items-center gap-0.5 sm:gap-1">
        <NuxtLink :to="localePath('/search')" class="hidden min-h-touch min-w-touch items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink motion-reduce:transition-none sm:inline-flex xl:hidden" :aria-label="t('search.title')"><UiIcon name="search" :size="22" /></NuxtLink>
        <LayoutNotificationBell v-if="auth.isAuthenticated" />
        <UiLanguageSwitcher variant="menu" class="hidden lg:block" @switch="persist" />
        <LayoutAccountMenu v-if="auth.isAuthenticated" class="hidden lg:block" />
        <template v-else>
          <UiButton to="/login" variant="ghost" class="!px-3 sm:!px-5">{{ t('auth.login') }}</UiButton>
          <UiButton to="/register" class="hidden lg:inline-flex">{{ t('auth.register') }}</UiButton>
        </template>
        <LayoutMobileMenu />
      </div>
    </div>
  </header>
</template>
