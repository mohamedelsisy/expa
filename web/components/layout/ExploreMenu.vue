<script setup lang="ts">
import { EXPLORE_PREFIXES } from '~/composables/useNav'
import { activeModuleKey } from '~/composables/useExploreModules'

/** Desktop "Explore" mega menu: every module, grouped, in one compact panel so the header stays on a single line. */
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const auth = useAuthStore()
const { modules, groups, community } = useExploreModules()
const { open, root, toggle, onFocusOut } = useDropdown()
const panelId = useId()

const active = computed(() => EXPLORE_PREFIXES.some((p) => { const full = localePath(p); return route.path === full || route.path.startsWith(`${full}/`) }))
const currentKey = computed(() => activeModuleKey(route.path, modules.value, localePath))
// The community entry exists only while the feature flag answers; look it up the first time the menu opens.
watch(open, (v) => { if (v) community.load() })
</script>

<template>
  <!-- No `relative` here on purpose: the panel anchors to the header container so it spans the full width under the header. -->
  <div ref="root" @focusout="onFocusOut">
    <button
      type="button"
      data-dropdown-trigger
      class="inline-flex min-h-touch items-center gap-1.5 rounded-md px-3 font-medium transition-colors motion-reduce:transition-none"
      :class="active || open ? 'bg-primary-soft text-primary-strong' : 'text-ink-soft hover:bg-sunken hover:text-ink'"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggle"
    >
      {{ t('nav.explore') }}
      <UiIcon name="chevron-down" :size="16" class="transition-transform duration-150 motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
    </button>
    <Transition name="menu-pop">
      <div
        v-show="open"
        :id="panelId"
        class="absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-lg border border-line bg-surface p-5 shadow-3"
        data-testid="explore-menu"
      >
        <div class="mb-3 flex items-center justify-between gap-4 px-2">
          <p class="text-base font-bold text-ink">{{ t('nav.exploreTitle') }}</p>
          <NuxtLink :to="localePath('/explore')" class="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-primary-strong hover:bg-primary-soft">
            {{ t('nav.allSections') }}<UiIcon name="arrow-end" :size="16" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-4 gap-x-4">
          <section v-for="g in groups" :key="g.key" :aria-labelledby="`${panelId}-${g.key}`">
            <h2 :id="`${panelId}-${g.key}`" class="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-muted">{{ t(`explore.groups.${g.key}`) }}</h2>
            <ul>
              <li v-for="m in g.items" :key="m.key">
                <NuxtLink
                  :to="localePath(m.to)"
                  class="group flex min-h-[2.5rem] items-center gap-2.5 rounded-md px-2 py-0.5 text-sm transition-colors motion-reduce:transition-none"
                  :class="currentKey === m.key ? 'bg-primary-soft font-semibold text-primary-strong' : 'text-ink hover:bg-sunken'"
                  :aria-current="currentKey === m.key ? 'page' : undefined"
                >
                  <span class="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong transition-colors group-hover:bg-surface motion-reduce:transition-none" :class="currentKey === m.key ? 'bg-surface' : ''">
                    <UiIcon :name="m.icon" :size="18" />
                  </span>
                  <span class="min-w-0 flex-1 truncate">{{ t(`explore.modules.${m.key}.title`) }}</span>
                  <UiIcon v-if="m.auth && !auth.isAuthenticated" name="lock" :size="14" class="shrink-0 text-muted" :aria-label="t('explore.needsAccount')" role="img" />
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Transition>
  </div>
</template>
