<script setup lang="ts">
/** Signed-in account dropdown: replaces the separate Admin and Sign-out buttons so the header stays on one line. */
const { t } = useI18n()
const auth = useAuthStore()
const localePath = useLocalePath()
const { hasAdminAccess } = usePermissions()
const { open, root, toggle, close, onFocusOut } = useDropdown()
const panelId = useId()

const displayName = computed(() => auth.user?.name?.trim() || t('nav.account'))
const links = computed(() => [
  { key: 'profile', to: '/profile', icon: 'user', label: t('nav.profile') },
  { key: 'security', to: '/settings/security', icon: 'lock', label: t('nav.security') },
  { key: 'twoFactor', to: '/settings/two-factor', icon: 'shield', label: t('nav.twoFactor') },
  { key: 'billing', to: '/settings/billing', icon: 'euro', label: t('nav.billing') },
])

async function logout() {
  close()
  await auth.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div ref="root" class="relative" @focusout="onFocusOut">
    <button
      type="button"
      data-dropdown-trigger
      class="inline-flex min-h-touch max-w-[12rem] items-center gap-2 rounded-md px-2 font-medium text-ink hover:bg-sunken"
      :class="open ? 'bg-sunken' : ''"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="`${t('nav.account')}: ${displayName}`"
      @click="toggle"
    >
      <span class="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong" aria-hidden="true"><UiIcon name="user" :size="18" /></span>
      <span class="hidden min-w-0 truncate xl:inline" dir="auto">{{ displayName }}</span>
      <UiIcon name="chevron-down" :size="16" class="shrink-0 transition-transform motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
    </button>
    <div v-show="open" :id="panelId" class="absolute end-0 top-full z-50 mt-2 w-72 rounded-lg border border-line bg-surface p-2 shadow-3" data-testid="account-menu">
      <p class="truncate px-2 pb-2 pt-1 text-sm text-muted" dir="auto">{{ auth.user?.email }}</p>
      <ul class="border-t border-line pt-1">
        <li v-for="l in links" :key="l.key">
          <NuxtLink :to="localePath(l.to)" class="flex min-h-touch items-center gap-2.5 rounded-md px-2 text-ink hover:bg-sunken">
            <UiIcon :name="l.icon" :size="18" class="shrink-0 text-primary-strong" />{{ l.label }}
          </NuxtLink>
        </li>
        <li v-if="hasAdminAccess">
          <NuxtLink :to="localePath('/admin')" class="flex min-h-touch items-center gap-2.5 rounded-md px-2 text-ink hover:bg-sunken">
            <UiIcon name="shield" :size="18" class="shrink-0 text-primary-strong" />{{ t('nav.admin') }}
          </NuxtLink>
        </li>
      </ul>
      <div class="mt-1 border-t border-line pt-1">
        <button type="button" class="flex min-h-touch w-full items-center gap-2.5 rounded-md px-2 text-start text-ink hover:bg-sunken" @click="logout">
          <UiIcon name="logout" :size="18" class="shrink-0 text-primary-strong" />{{ t('auth.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>
