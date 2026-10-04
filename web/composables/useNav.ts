export interface NavItem { key: string, to: string, icon: string, label: string, active: boolean }

/** Primary navigation shared by the desktop header and the mobile bottom nav. */
export function useNav() {
  const { t } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()
  const auth = useAuthStore()

  return computed<NavItem[]>(() => {
    const defs = [
      { key: 'home', to: auth.isAuthenticated ? '/dashboard' : '/', icon: 'home', label: t('nav.home') },
      { key: 'explore', to: '/guides', icon: 'compass', label: t('nav.explore') },
      { key: 'ask', to: '/ask', icon: 'sparkle', label: t('nav.ask') },
      { key: 'tasks', to: '/tasks', icon: 'tasks', label: t('nav.tasks') },
      { key: 'profile', to: '/profile', icon: 'user', label: t('nav.profile') },
    ]
    return defs.map((d) => {
      const target = localePath(d.to)
      const active = d.to === '/' ? route.path === target || route.path === `${target}/` : route.path === target || route.path.startsWith(`${target}/`)
      return { ...d, to: target, active }
    })
  })
}

/** Persists a language choice to the account when signed in (best effort, never blocks navigation). */
export function usePersistLocale() {
  const auth = useAuthStore()
  const { request } = useApi()
  return async (code: string) => {
    if (!auth.isAuthenticated) return
    try {
      const res = await request<{ user: typeof auth.user }>('profile', { method: 'PATCH', body: { locale: code }, handle401: false })
      if (res.data?.user) auth.setUser(res.data.user)
    } catch {
      /* the UI language still switches; persistence is retried on the next change */
    }
  }
}
