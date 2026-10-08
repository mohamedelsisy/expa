import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import './stubs/nuxt-globals'
import { can, canAny, hasAdminAccess } from '../utils/permissions'
import { usePermissions } from '../composables/usePermissions'
import { permsForPath, visibleNav } from '../utils/admin/nav'

// Mirrors backend/config/permissions.php for the roles we exercise.
const CONTENT = ['guides', 'government_services', 'government_offices', 'appointment_guides', 'italian_lessons', 'patente', 'jobs', 'universities']
const only = (actions: string[]) => CONTENT.flatMap(r => actions.map(a => `${r}.${a}`))
const editor = { roles: ['editor'], permissions: only(['view', 'create', 'update']) }
const manager = { roles: ['content_manager'], permissions: [...only(['view', 'create', 'update', 'delete', 'review', 'publish']), 'reports.view', 'job_sources.view'] }
const translator = { roles: ['translator'], permissions: [...only(['view']), 'translations.update'] }
const support = { roles: ['support_agent'], permissions: ['users.view', 'subscriptions.view', 'ai.view_conversations'] }
const plain = { roles: ['user'], permissions: [] as string[] }
const superAdmin = { roles: ['super_admin'], is_super_admin: true, permissions: [] as string[] }

describe('permission helpers', () => {
  it('super admin can do anything', () => {
    expect(can(superAdmin, 'anything.at_all')).toBe(true)
    expect(hasAdminAccess(superAdmin)).toBe(true)
  })
  it('guests and users without roles have no admin access', () => {
    expect(can(null, 'guides.view')).toBe(false)
    expect(hasAdminAccess(plain)).toBe(false)
    expect(hasAdminAccess(null)).toBe(false)
  })
  it('editor vs content manager', () => {
    expect(can(editor, 'guides.update')).toBe(true)
    expect(can(editor, 'guides.publish')).toBe(false)
    expect(can(editor, 'guides.review')).toBe(false)
    expect(can(manager, 'guides.publish')).toBe(true)
    expect(canAny(editor, ['guides.publish', 'guides.review'])).toBe(false)
    expect(canAny(manager, ['guides.publish', 'x.y'])).toBe(true)
  })
  it('support agent reaches users, subscriptions and AI conversation metadata only', () => {
    const labels = visibleNav(p => canAny(support, p)).flatMap(g => g.items.map(i => i.key))
    expect(labels).toEqual(['dashboard', 'users', 'subscriptions', 'ai-conversations'])
  })
  it('translator sees content lists but cannot update/create/publish', () => {
    expect(can(translator, 'guides.view')).toBe(true)
    expect(can(translator, 'guides.update')).toBe(false)
    expect(hasAdminAccess(translator)).toBe(true)
  })
  it('maps routes to the permission they need', () => {
    expect(permsForPath('/ar/admin/users/roles')).toEqual(['roles.view'])
    expect(permsForPath('/en/admin/users')).toEqual(['users.view'])
    expect(permsForPath('/ar/admin/jobs')).toEqual(['job_sources.view', 'jobs.view'])
    expect(permsForPath('/ar/admin')).toEqual([])
  })
})

describe('usePermissions composable', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('is fed by the supplied subject and hides actions the user lacks', () => {
    const p = usePermissions(() => editor)
    expect(p.can('guides.create')).toBe(true)
    expect(p.can('guides.publish')).toBe(false)
    expect(p.isSuperAdmin.value).toBe(false)
    expect(p.hasAdminAccess.value).toBe(true)
    expect(p.roles.value).toEqual(['editor'])
  })
  it('super admin through the composable', () => {
    const p = usePermissions(() => superAdmin)
    expect(p.can('users.update')).toBe(true)
    expect(p.isSuperAdmin.value).toBe(true)
  })
  it('reads the auth store by default', async () => {
    const { useAuthStore } = await import('../stores/auth')
    const auth = useAuthStore()
    auth.setUser({ id: 1, name: 'x', email: 'x@y.z', locale: 'ar', email_verified: true, created_at: null, ...manager })
    const p = usePermissions()
    expect(p.can('guides.review')).toBe(true)
    auth.reset()
    expect(p.can('guides.review')).toBe(false)
  })
})

describe('RA-3 admin pages for existing endpoints', () => {
  it('each page is gated by the backend permission of its endpoint', () => {
    expect(permsForPath('/en/admin/ai/knowledge')).toEqual(['ai.manage_knowledge'])
    expect(permsForPath('/ar/admin/ai/conversations')).toEqual(['ai.view_conversations'])
    expect(permsForPath('/it/admin/settings')).toEqual(['settings.view'])
    expect(permsForPath('/en/admin/notifications/broadcast')).toEqual(['notifications.send'])
    expect(permsForPath('/en/admin/geography')).toEqual(['cities.view'])
  })
  it('a plain content manager does not see AI knowledge, settings or broadcast', () => {
    const keys = visibleNav(p => canAny(manager, p)).flatMap(g => g.items.map(i => i.key))
    for (const k of ['ai-knowledge', 'ai-conversations', 'settings', 'broadcast', 'geography']) expect(keys).not.toContain(k)
  })
  it('a knowledge manager sees knowledge but not conversations', () => {
    const keys = visibleNav(p => canAny({ roles: ['x'], permissions: ['ai.manage_knowledge'] }, p)).flatMap(g => g.items.map(i => i.key))
    expect(keys).toContain('ai-knowledge')
    expect(keys).not.toContain('ai-conversations')
  })
})
