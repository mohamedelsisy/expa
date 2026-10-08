import { hasAdminAccess, canAny } from '~/utils/permissions'
import { permsForPath } from '~/utils/admin/nav'
import { moduleByKey } from '~/utils/admin/modules'
import { safeRedirect } from '~/utils/safe'

/** /admin/**: signed in, at least one admin-area permission, and the permission the page needs. The API still enforces everything. */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.ensureLoaded()
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo(`${localePath('/login')}?redirect=${encodeURIComponent(safeRedirect(to.fullPath, ''))}`)
  }
  const u = auth.user
  // Known from /auth/me: show the setup gate straight away instead of a page of 403 errors.
  useTwoFactorGate().value = u?.two_factor_setup_required === true
  if (!hasAdminAccess(u)) throw createError({ statusCode: 403, fatal: true })
  const key = to.params.module
  const mod = moduleByKey(Array.isArray(key) ? key[0] : key)
  if (to.path.includes('/admin/content/') && !mod) throw createError({ statusCode: 404, fatal: true })
  const needed = mod ? [`${mod.permission}.view`] : permsForPath(to.path)
  if (needed.length && !canAny(u, needed)) throw createError({ statusCode: 403, fatal: true })
})
