<script setup lang="ts">
/** Signed-in account dropdown (desktop): identity, account links and sign out in one compact panel. */
const { t } = useI18n()
const auth = useAuthStore()
const localePath = useLocalePath()
const { open, root, toggle, close, onFocusOut } = useDropdown()
const { links, displayName, signOut } = useAccountLinks()
const panelId = useId()

async function logout() {
  close()
  await signOut()
}
</script>

<template>
  <div ref="root" class="relative" @focusout="onFocusOut">
    <button
      type="button"
      data-dropdown-trigger
      class="inline-flex min-h-touch items-center gap-1 rounded-full py-1 pe-2 ps-1 text-ink-soft transition-colors hover:bg-sunken motion-reduce:transition-none"
      :class="open ? 'bg-sunken' : ''"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="`${t('nav.account')}: ${displayName}`"
      @click="toggle"
    >
      <LayoutUserAvatar :name="auth.user?.name" :email="auth.user?.email" />
      <UiIcon name="chevron-down" :size="14" class="transition-transform duration-150 motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
    </button>
    <Transition name="menu-pop">
      <div v-show="open" :id="panelId" class="absolute end-0 top-full z-50 mt-2 w-72 rounded-lg border border-line bg-surface p-2 shadow-3" data-testid="account-menu">
        <div class="mb-1 flex items-center gap-3 rounded-md bg-sunken/70 p-3">
          <LayoutUserAvatar :name="auth.user?.name" :email="auth.user?.email" size="lg" />
          <div class="min-w-0">
            <p class="truncate font-semibold text-ink"><bdi>{{ displayName }}</bdi></p>
            <p class="truncate text-sm text-muted"><bdi>{{ auth.user?.email }}</bdi></p>
          </div>
        </div>
        <ul>
          <li v-for="l in links" :key="l.key">
            <NuxtLink :to="localePath(l.to)" class="flex min-h-touch items-center gap-3 rounded-md px-3 text-ink transition-colors hover:bg-sunken motion-reduce:transition-none">
              <UiIcon :name="l.icon" :size="18" class="shrink-0 text-ink-soft" />{{ l.label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="mt-1 border-t border-line pt-1">
          <button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-3 text-start text-ink transition-colors hover:bg-sunken motion-reduce:transition-none" @click="logout">
            <UiIcon name="logout" :size="18" class="shrink-0 text-ink-soft" />{{ t('auth.logout') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
