import { CONTENT_MODULES } from './modules'

export interface AdminNavItem { key: string, to: string, icon: string, label: string, perms: readonly string[], exact?: boolean }
export interface AdminNavGroup { key: string, label: string, items: AdminNavItem[] }

export const ADMIN_NAV: readonly AdminNavGroup[] = [
  { key: 'overview', label: 'admin.nav.overview', items: [{ key: 'dashboard', to: '/admin', icon: 'home', label: 'admin.nav.dashboard', perms: [], exact: true }] },
  {
    key: 'content', label: 'admin.nav.content',
    items: CONTENT_MODULES.map(m => ({ key: m.key, to: `/admin/content/${m.key}`, icon: m.icon, label: `admin.modules.${m.key}`, perms: [`${m.permission}.view`] })),
  },
  {
    key: 'people', label: 'admin.nav.people',
    items: [
      { key: 'users', to: '/admin/users', icon: 'user', label: 'admin.nav.users', perms: ['users.view'] },
      { key: 'roles', to: '/admin/users/roles', icon: 'shield', label: 'admin.nav.roles', perms: ['roles.view'] },
      { key: 'subscriptions', to: '/admin/subscriptions', icon: 'euro', label: 'admin.nav.subscriptions', perms: ['subscriptions.view'] },
    ],
  },
  {
    key: 'moderation', label: 'admin.nav.moderation',
    items: [
      { key: 'market-verification', to: '/admin/marketplace/verification', icon: 'shield', label: 'admin.market.verification', perms: ['providers.verify'] },
      { key: 'market-reviews', to: '/admin/marketplace/reviews', icon: 'list', label: 'admin.market.reviews', perms: ['provider_reviews.moderate'] },
      { key: 'market-reports', to: '/admin/marketplace/reports', icon: 'alert', label: 'admin.market.reports', perms: ['provider_reviews.moderate'] },
      { key: 'community', to: '/admin/community', icon: 'help', label: 'admin.community.title', perms: ['community.moderate'] },
    ],
  },
  {
    key: 'operations', label: 'admin.nav.operations',
    items: [
      { key: 'jobs', to: '/admin/jobs', icon: 'briefcase', label: 'admin.nav.jobs', perms: ['job_sources.view', 'jobs.view'] },
      { key: 'ai-knowledge', to: '/admin/ai/knowledge', icon: 'book', label: 'admin.ai.knowledge.title', perms: ['ai.manage_knowledge'] },
      { key: 'ai-conversations', to: '/admin/ai/conversations', icon: 'sparkle', label: 'admin.ai.conversations.title', perms: ['ai.view_conversations'] },
      { key: 'geography', to: '/admin/geography', icon: 'map', label: 'admin.geo.title', perms: ['cities.view'] },
      { key: 'broadcast', to: '/admin/notifications/broadcast', icon: 'bell', label: 'admin.broadcast.title', perms: ['notifications.send'] },
      { key: 'settings', to: '/admin/settings', icon: 'tasks', label: 'admin.settings.title', perms: ['settings.view'] },
      { key: 'audit', to: '/admin/audit-logs', icon: 'list', label: 'admin.nav.audit', perms: ['audit_logs.view'] },
    ],
  },
]

/** Navigation filtered by what the user may see (items with no perms are always visible; empty groups disappear). */
export function visibleNav(canAny: (perms: readonly string[]) => boolean): AdminNavGroup[] {
  return ADMIN_NAV
    .map(g => ({ ...g, items: g.items.filter(i => i.perms.length === 0 || canAny(i.perms)) }))
    .filter(g => g.items.length > 0)
}

/** Which permission a route needs (middleware). Returns [] for the dashboard. */
export function permsForPath(path: string): readonly string[] {
  const p = path.replace(/^\/(ar|en|it)(?=\/|$)/, '')
  const item = [...ADMIN_NAV.flatMap(g => g.items)].filter(i => !i.exact && (p === i.to || p.startsWith(`${i.to}/`))).sort((a, b) => b.to.length - a.to.length)[0]
  return item?.perms ?? []
}
