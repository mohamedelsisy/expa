import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { can as canFn, canAny as canAnyFn, hasAdminAccess, type PermissionSubject } from '~/utils/permissions'

/** Permission checks fed from the auth state (`GET /auth/me`: roles, is_super_admin, permissions[]). */
export function usePermissions(source?: () => PermissionSubject | null) {
  const auth = useAuthStore()
  const subject = () => (source ? source() : auth.user)
  return {
    can: (permission: string) => canFn(subject(), permission),
    canAny: (permissions: readonly string[]) => canAnyFn(subject(), permissions),
    isSuperAdmin: computed(() => subject()?.is_super_admin === true),
    hasAdminAccess: computed(() => hasAdminAccess(subject())),
    roles: computed(() => [...(subject()?.roles ?? [])]),
  }
}
