<script setup lang="ts">
const { t } = useI18n()
const auth = useAuthStore()
const nav = useNav()
const persist = usePersistLocale()
const localePath = useLocalePath()

async function logout() {
  await auth.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <div class="container-page flex min-h-[64px] items-center justify-between gap-3">
      <LayoutBrandLogo />
      <nav :aria-label="t('nav.primary')" class="hidden md:block">
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
      <div class="flex items-center gap-1 sm:gap-2">
        <UiLanguageSwitcher @switch="persist" />
        <template v-if="auth.isAuthenticated">
          <UiButton variant="ghost" class="hidden md:inline-flex" @click="logout"><UiIcon name="logout" :size="18" />{{ t('auth.logout') }}</UiButton>
        </template>
        <template v-else>
          <UiButton to="/login" variant="ghost" class="hidden sm:inline-flex">{{ t('auth.login') }}</UiButton>
          <UiButton to="/register" class="hidden sm:inline-flex">{{ t('auth.register') }}</UiButton>
        </template>
      </div>
    </div>
  </header>
</template>
