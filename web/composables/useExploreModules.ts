export interface ExploreModule { key: string, to: string, icon: string, auth?: boolean }

/** How the modules are grouped in the header "Explore" menu. Every module must appear in exactly one group (unit-tested). */
export const EXPLORE_GROUPS = [
  { key: 'life', modules: ['guides', 'government', 'appointments', 'documents', 'healthcare', 'housing', 'dailyLife', 'family', 'cities'] },
  { key: 'work', modules: ['jobs', 'money', 'netSalary', 'business', 'travel', 'travelRequirements'] },
  { key: 'learn', modules: ['study', 'learnItalian', 'patente'] },
  { key: 'more', modules: ['recommendations', 'explain', 'articles', 'services', 'community', 'pricing', 'search'] },
] as const

/** Every module the platform offers: the single source for the Explore hub page and the header Explore menu. */
export function useExploreModules() {
  const community = useCommunityMeta()
  const modules = computed<ExploreModule[]>(() => [
    { key: 'guides', to: '/guides', icon: 'book' },
    { key: 'government', to: '/government', icon: 'building' },
    { key: 'appointments', to: '/appointments', icon: 'calendar' },
    { key: 'documents', to: '/documents', icon: 'file', auth: true },
    { key: 'learnItalian', to: '/learn-italian', icon: 'sparkle' },
    { key: 'patente', to: '/patente', icon: 'car' },
    { key: 'jobs', to: '/jobs', icon: 'briefcase' },
    { key: 'study', to: '/study', icon: 'book' },
    { key: 'cities', to: '/cities', icon: 'map' },
    { key: 'housing', to: '/housing', icon: 'home' },
    { key: 'healthcare', to: '/healthcare', icon: 'shield' },
    { key: 'money', to: '/money', icon: 'euro' },
    { key: 'business', to: '/business', icon: 'briefcase' },
    { key: 'family', to: '/family', icon: 'user' },
    { key: 'travel', to: '/travel', icon: 'globe' },
    { key: 'netSalary', to: '/money/net-salary', icon: 'euro' },
    { key: 'travelRequirements', to: '/travel/requirements', icon: 'globe' },
    { key: 'recommendations', to: '/recommendations', icon: 'sparkle', auth: true },
    { key: 'dailyLife', to: '/daily-life', icon: 'home' },
    { key: 'explain', to: '/documents/explain', icon: 'file', auth: true },
    { key: 'articles', to: '/articles', icon: 'list' },
    { key: 'services', to: '/services', icon: 'user' },
    ...(community.enabled.value ? [{ key: 'community', to: '/community', icon: 'help' }] : []),
    { key: 'pricing', to: '/pricing', icon: 'euro' },
    { key: 'search', to: '/search', icon: 'search' },
  ])
  const groups = computed(() => EXPLORE_GROUPS.map(g => ({
    key: g.key,
    items: (g.modules as readonly string[]).map(k => modules.value.find(m => m.key === k)).filter((m): m is ExploreModule => !!m),
  })).filter(g => g.items.length))
  return { modules, groups, community }
}
