/** Account destinations and sign-out shared by the desktop account dropdown and the mobile menu. */
export function useAccountLinks() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const localePath = useLocalePath()
  const { hasAdminAccess } = usePermissions()

  const links = computed(() => [
    { key: 'profile', to: '/profile', icon: 'user', label: t('nav.profile') },
    { key: 'tasks', to: '/tasks', icon: 'tasks', label: t('nav.tasks') },
    { key: 'security', to: '/settings/security', icon: 'lock', label: t('nav.security') },
    { key: 'twoFactor', to: '/settings/two-factor', icon: 'shield', label: t('nav.twoFactor') },
    { key: 'billing', to: '/settings/billing', icon: 'euro', label: t('nav.billing') },
    ...(hasAdminAccess.value ? [{ key: 'admin', to: '/admin', icon: 'building', label: t('nav.admin') }] : []),
  ])
  const displayName = computed(() => auth.user?.name?.trim() || t('nav.account'))

  async function signOut() {
    await auth.logout()
    await navigateTo(localePath('/'))
  }
  return { links, displayName, signOut }
}
