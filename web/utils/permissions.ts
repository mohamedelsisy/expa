/**
 * Permission helpers for the admin UI. They only decide what to SHOW: the API enforces every permission,
 * and 403 responses are still handled everywhere.
 */
export interface PermissionSubject {
  is_super_admin?: boolean
  permissions?: readonly string[] | null
  roles?: readonly string[] | null
}

export function can(user: PermissionSubject | null | undefined, permission: string): boolean {
  if (!user) return false
  if (user.is_super_admin === true) return true
  return !!user.permissions?.includes(permission)
}

export function canAny(user: PermissionSubject | null | undefined, permissions: readonly string[]): boolean {
  return permissions.some(p => can(user, p))
}

/** Any one of these grants access to some part of /admin (resource `*.view` for the modules plus the system areas). */
export const ADMIN_AREA_PERMISSIONS: readonly string[] = [
  'guides.view', 'government_services.view', 'government_offices.view', 'appointment_guides.view',
  'italian_lessons.view', 'patente.view', 'universities.view',
  'users.view', 'roles.view', 'subscriptions.view', 'job_sources.view', 'jobs.view', 'audit_logs.view', 'reports.view',
]

export function hasAdminAccess(user: PermissionSubject | null | undefined): boolean {
  return canAny(user, ADMIN_AREA_PERMISSIONS)
}
