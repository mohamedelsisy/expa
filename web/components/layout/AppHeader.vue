<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const nav = useNav()
const persist = usePersistLocale()
const { hasAdminAccess } = usePermissions()
const localePath = useLocalePath()

async function logout() {
  await auth.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <div class="container-page flex min-h-[64px] flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1">
      <LayoutBrandLogo />
      <nav :aria-label="t('nav.primary')" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in nav" :key="item.key">
            <NuxtLink
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
      <div class="flex min-w-0 items-center gap-0.5 sm:gap-2">
        <NuxtLink :to="localePath('/search')" class="hidden min-h-touch min-w-touch items-center justify-center rounded-md text-ink-soft hover:bg-sunken sm:inline-flex xl:hidden" :aria-label="t('search.title')"><UiIcon name="search" :size="22" /></NuxtLink>
        <LayoutNotificationBell v-if="auth.isAuthenticated" />
        <UiLanguageSwitcher :class="auth.isAuthenticated ? 'hidden sm:flex' : ''" @switch="persist" />
        <template v-if="auth.isAuthenticated">
          <UiButton v-if="hasAdminAccess" to="/admin" variant="secondary" class="hidden lg:inline-flex"><UiIcon name="shield" :size="18" />{{ t('nav.admin') }}</UiButton>
          <UiButton variant="ghost" class="hidden lg:inline-flex" @click="logout"><UiIcon name="logout" :size="18" />{{ t('auth.logout') }}</UiButton>
        </template>
        <template v-else>
          <UiButton to="/login" variant="ghost" class="!px-2 sm:!px-5">{{ t('auth.login') }}</UiButton>
          <UiButton to="/register" class="hidden lg:inline-flex">{{ t('auth.register') }}</UiButton>
        </template>
      </div>
    </div>
  </header>
</template>
