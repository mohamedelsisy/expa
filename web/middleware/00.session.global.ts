/** Loads the session once per app load so the header (bell, search, account state) is right on public pages too. */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  try {
    await auth.ensureLoaded()
  } catch {
    auth.reset() // an unexpected API error must never block public pages
  }
})
