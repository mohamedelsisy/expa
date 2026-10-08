<script setup lang="ts">
import { visibleNav } from '~/utils/admin/nav'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const localePath = useLocalePath()
const persist = usePersistLocale()
const { canAny } = usePermissions()
const open = ref(false)
const gate = useTwoFactorGate()
const groups = computed(() => visibleNav(canAny))
const isActive = (to: string, exact?: boolean) => {
  const full = localePath(to)
  return exact ? route.path === full || route.path === `${full}/` : route.path === full || route.path.startsWith(`${full}/`)
}
// the most specific matching item wins (users vs users/roles)
const activeKey = computed(() => {
  const items = groups.value.flatMap(g => g.items).filter(i => isActive(i.to, i.exact))
  return items.sort((a, b) => b.to.length - a.to.length)[0]?.key
})
watch(() => route.fullPath, () => { open.value = false })

// Mobile drawer behaves like a dialog: focus moves in, Tab is contained, Escape closes and focus returns to the toggle.
const toggleEl = ref<HTMLButtonElement | null>(null)
const asideEl = ref<HTMLElement | null>(null)
function trapKeys(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    open.value = false
    return
  }
  trapTab(e, focusables(asideEl.value, [toggleEl.value]))
}
function closeOnDesktop() { if (window.matchMedia('(min-width: 768px)').matches) open.value = false }
watch(open, async (isOpen, wasOpen) => {
  await nextTick()
  if (isOpen) asideEl.value?.querySelector<HTMLElement>('a[href]')?.focus()
  else if (wasOpen) toggleEl.value?.focus()
})
onMounted(() => { document.addEventListener('keydown', trapKeys); window.addEventListener('resize', closeOnDesktop) })
onBeforeUnmount(() => { document.removeEventListener('keydown', trapKeys); window.removeEventListener('resize', closeOnDesktop) })
async function logout() {
  await auth.logout()
  await navigateTo(localePath('/'))
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <LayoutSkipLink />
    <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div class="flex min-h-[64px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-1 sm:px-6">
        <div class="flex items-center gap-2">
          <button ref="toggleEl" data-admin-toggle type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-ink hover:bg-sunken md:hidden" :aria-expanded="open" aria-controls="admin-sidebar" :aria-label="t('admin.shell.menu')" @click="open = !open"><UiIcon :name="open ? 'x' : 'menu'" :size="24" /></button>
          <LayoutBrandLogo />
          <span class="hidden rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong sm:inline">{{ t('admin.shell.badge') }}</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <UiLanguageSwitcher class="hidden sm:flex" @switch="persist" />
          <NuxtLink :to="localePath('/')" class="hidden min-h-touch items-center gap-1 rounded-md px-3 font-medium text-primary-strong hover:bg-primary-soft sm:inline-flex"><UiIcon name="external" :size="16" />{{ t('admin.shell.backToSite') }}</NuxtLink>
          <UiButton variant="ghost" class="hidden md:inline-flex" @click="logout"><UiIcon name="logout" :size="18" />{{ t('auth.logout') }}</UiButton>
        </div>
      </div>
    </header>
    <div class="flex flex-1">
      <div v-if="open" class="fixed inset-0 z-30 bg-ink/50 md:hidden" aria-hidden="true" @click="open = false" />
      <aside id="admin-sidebar" ref="asideEl" data-admin-drawer class="z-30 w-72 shrink-0 overflow-y-auto border-e border-line bg-surface md:static md:block md:w-64" :class="open ? 'fixed inset-y-0 start-0 block pt-16 shadow-3' : 'hidden'">
        <nav :aria-label="t('admin.shell.nav')" class="space-y-5 p-3">
          <div v-for="g in groups" :key="g.key">
            <p class="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">{{ t(g.label) }}</p>
            <ul>
              <li v-for="i in g.items" :key="i.key">
                <NuxtLink :to="localePath(i.to)" class="flex min-h-touch items-center gap-3 rounded-md px-3 font-medium" :class="activeKey === i.key ? 'bg-primary-soft text-primary-strong' : 'text-ink-soft hover:bg-sunken'" :aria-current="activeKey === i.key ? 'page' : undefined"><UiIcon :name="i.icon" :size="20" />{{ t(i.label) }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div class="space-y-1 border-t border-line pt-3 sm:hidden">
            <UiLanguageSwitcher @switch="persist" />
            <NuxtLink :to="localePath('/')" class="flex min-h-touch items-center gap-3 rounded-md px-3 font-medium text-primary-strong"><UiIcon name="external" :size="20" />{{ t('admin.shell.backToSite') }}</NuxtLink>
            <button type="button" class="flex min-h-touch w-full items-center gap-3 rounded-md px-3 text-start font-medium text-ink-soft" @click="logout"><UiIcon name="logout" :size="20" />{{ t('auth.logout') }}</button>
          </div>
        </nav>
      </aside>
      <main id="main" tabindex="-1" :inert="open || undefined" class="min-w-0 flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">
        <AuthTwoFactorGate v-if="gate" />
        <slot v-else />
      </main>
    </div>
    <UiToastRegion />
  </div>
</template>
