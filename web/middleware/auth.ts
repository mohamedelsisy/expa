import { safeRedirect } from '~/utils/safe'

/** Protected routes: guests go to /{locale}/login?redirect=... */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.ensureLoaded()
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo(`${localePath('/login')}?redirect=${encodeURIComponent(safeRedirect(to.fullPath, ''))}`)
  }
})
