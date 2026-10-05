export interface RoleInfo { key: string, label: string, privileged: boolean, permissions: string[] }

/** Roles and their permissions (`GET /admin/roles`, needs roles.view). A failure is reported, never thrown. */
export function useRoles() {
  const { request } = useApi()
  const roles = useState<RoleInfo[] | null>('admin-roles', () => null)
  const failed = ref(false)
  const pending = ref(false)
  async function load(force = false) {
    if (roles.value && !force) return
    pending.value = true
    failed.value = false
    try { roles.value = (await request<RoleInfo[]>('admin/roles')).data ?? [] } catch { failed.value = true } finally { pending.value = false }
  }
  return { roles, failed, pending, load }
}
