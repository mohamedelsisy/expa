<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const route = useRoute()
const persist = usePersistLocale()
const headerLinks = useHeaderLinks()
const { modules, groups, community } = useExploreModules()
const { links: accountLinks, displayName, signOut } = useAccountLinks()
const { open, root, toggle, close, onFocusOut } = useDropdown()
const panelId = useId()
const currentKey = computed(() => activeModuleKey(route.path, modules.value, localePath))

// Explore groups are accordions (collapsed by default so Ask, My Italy and the account stay in reach); the group of the current page starts open.
const expanded = ref<Set<string>>(new Set())
function toggleGroup(key: string) {
  const next = new Set(expanded.value)
  if (!next.delete(key)) next.add(key)
  expanded.value = next
}
watch(open, (v) => {
  if (v) {
    community.load()
    const g = groups.value.find(x => x.items.some(m => m.key === currentKey.value))
    if (g && !expanded.value.has(g.key)) toggleGroup(g.key)
  }
  // Keep the page behind the panel from scrolling while it is open.
  document.documentElement.style.overflow = v ? 'hidden' : ''
})

let mq: MediaQueryList | null = null
const onWide = (e: MediaQueryListEvent) => { if (e.matches) close() }
onMounted(() => {
  mq = window.matchMedia('(min-width: 1024px)')
  mq.addEventListener('change', onWide)
})
onBeforeUnmount(() => {
  mq?.removeEventListener('change', onWide)
  document.documentElement.style.overflow = ''
})

async function logout() {
  close()
  await signOut()
}
const tile = 'grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong'
</script>

<template>
  <!-- Below lg only. Not `relative`: the panel anchors to the sticky header so it spans the full width under it. -->
  <div ref="root" class="lg:hidden" @focusout="onFocusOut">
    <button
      type="button"
      data-dropdown-trigger
      data-testid="mobile-menu-button"
      class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink transition-colors hover:bg-sunken motion-reduce:transition-none"
      :class="open ? 'bg-sunken' : ''"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="open ? t('nav.closeMenu') : t('nav.openMenu')"
      @click="toggle"
    >
      <UiIcon :name="open ? 'x' : 'menu'" :size="24" />
    </button>
    <div v-show="open" class="absolute inset-x-0 top-full z-40 h-screen bg-ink/30" aria-hidden="true" @click="close()" />
    <Transition name="menu-pop">
      <div
        v-show="open"
        :id="panelId"
        data-testid="mobile-menu"
        class="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4.5rem-var(--bottom-nav-h))] overflow-y-auto overscroll-contain border-b border-line bg-surface px-4 pb-6 pt-2 shadow-3 sm:px-6"
      >
        <!-- 1. Explore -->
        <section :aria-labelledby="`${panelId}-explore`" class="py-2">
          <div class="flex items-center justify-between gap-3">
            <h2 :id="`${panelId}-explore`" class="text-xs font-bold uppercase tracking-wide text-muted">{{ t('nav.explore') }}</h2>
            <NuxtLink :to="localePath('/explore')" class="inline-flex min-h-touch items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-primary-strong">
              {{ t('nav.allSections') }}<UiIcon name="arrow-end" :size="16" />
            </NuxtLink>
          </div>
          <div v-for="g in groups" :key="g.key" class="border-t border-line first:border-t-0">
            <h3 class="text-base">
              <button
                type="button"
                class="flex min-h-touch w-full items-center justify-between gap-3 rounded-md px-2 text-start font-semibold text-ink"
                :aria-expanded="expanded.has(g.key)"
                :aria-controls="`${panelId}-${g.key}`"
                @click="toggleGroup(g.key)"
              >
                {{ t(`explore.groups.${g.key}`) }}
                <UiIcon name="chevron-down" :size="18" class="text-muted transition-transform duration-150 motion-reduce:transition-none" :class="expanded.has(g.key) ? 'rotate-180' : ''" />
              </button>
            </h3>
            <ul v-show="expanded.has(g.key)" :id="`${panelId}-${g.key}`" class="grid grid-cols-1 gap-x-2 pb-2 min-[480px]:grid-cols-2">
              <li v-for="m in g.items" :key="m.key">
                <NuxtLink
                  :to="localePath(m.to)"
                  class="flex min-h-touch items-center gap-2.5 rounded-md px-2 text-sm"
                  :class="currentKey === m.key ? 'bg-primary-soft font-semibold text-primary-strong' : 'text-ink'"
                  :aria-current="currentKey === m.key ? 'page' : undefined"
                >
                  <span :class="tile"><UiIcon :name="m.icon" :size="18" /></span>
                  <span class="min-w-0 flex-1 truncate">{{ t(`explore.modules.${m.key}.title`) }}</span>
                  <UiIcon v-if="m.auth && !auth.isAuthenticated" name="lock" :size="14" class="shrink-0 text-muted" :aria-label="t('explore.needsAccount')" role="img" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>

        <!-- 2. Ask EXPA, 3. My Italy -->
        <ul class="mt-1 grid gap-1 border-t border-line pt-3">
          <li v-for="l in headerLinks" :key="l.key">
            <NuxtLink
              :to="l.to"
              class="flex min-h-touch items-center gap-3 rounded-md px-2 font-semibold"
              :class="l.active ? 'bg-primary-soft text-primary-strong' : l.key === 'ask' ? 'bg-primary-soft/60 text-primary-strong' : 'text-ink'"
              :aria-current="l.active ? 'page' : undefined"
            >
              <span :class="tile"><UiIcon :name="l.icon" :size="18" /></span>
              <span class="min-w-0 flex-1 truncate">{{ l.label }}</span>
              <span v-if="l.key === 'ask'" aria-hidden="true" class="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-on-primary">{{ t('nav.aiTag') }}</span>
            </NuxtLink>
          </li>
        </ul>

        <!-- 4. Account -->
        <section :aria-label="t('nav.account')" class="mt-3 border-t border-line pt-3">
          <template v-if="auth.isAuthenticated">
            <div class="mb-1 flex items-center gap-3 px-2 py-1">
              <LayoutUserAvatar :name="auth.user?.name" :email="auth.user?.email" size="lg" />
              <div class="min-w-0">
                <p class="truncate font-semibold text-ink"><bdi>{{ displayName }}</bdi></p>
                <p class="truncate text-sm text-muted"><bdi>{{ auth.user?.email }}</bdi></p>
              </div>
            </div>
            <ul class="grid grid-cols-1 min-[480px]:grid-cols-2 min-[480px]:gap-x-2">
              <li v-for="l in accountLinks" :key="l.key">
                <NuxtLink :to="localePath(l.to)" class="flex min-h-touch items-center gap-3 rounded-md px-2 text-sm text-ink">
                  <UiIcon :name="l.icon" :size="18" class="shrink-0 text-ink-soft" />{{ l.label }}
                </NuxtLink>
              </li>
              <li>
                <button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-2 text-start text-sm text-ink" @click="logout">
                  <UiIcon name="logout" :size="18" class="shrink-0 text-ink-soft" />{{ t('auth.logout') }}
                </button>
              </li>
            </ul>
          </template>
          <div v-else class="grid grid-cols-2 gap-2">
            <UiButton to="/login" variant="secondary" block>{{ t('auth.login') }}</UiButton>
            <UiButton to="/register" block>{{ t('auth.register') }}</UiButton>
          </div>
        </section>

        <!-- 5. Language -->
        <div class="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <UiLanguageSwitcher @switch="persist" />
        </div>
      </div>
    </Transition>
  </div>
</template>
