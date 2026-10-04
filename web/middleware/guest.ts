/** Login/register: signed-in users are sent to the dashboard. */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  await auth.ensureLoaded()
  if (auth.isAuthenticated) return navigateTo(useLocalePath()('/dashboard'))
})
