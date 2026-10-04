import type { ApiEnvelope } from '~/types/api'
import { ApiError, toApiError } from '~/utils/errors'
import { safeRedirect } from '~/utils/safe'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, string | number | undefined | null>
  /** Treat 401 as "session expired": clear auth state and go to login. Default true. */
  handle401?: boolean
}

const TIMEOUT_MS = 15000

/** Thin client for the BFF. Browser code never sees the API token or the API origin. */
export function useApi() {
  // Usable from components, middleware and store actions (no dependency on a component setup context).
  const i18n = useNuxtApp().$i18n
  const t = (k: string) => i18n.t(k)
  const localePath = useLocalePath()
  const router = useRouter()
  const fetcher = import.meta.server ? useRequestFetch() : $fetch

  const messages = () => ({ network: t('errors.network'), timeout: t('errors.timeout'), generic: t('errors.generic') })

  async function call<T>(url: string, opts: RequestOptions, is401Session: boolean): Promise<ApiEnvelope<T>> {
    try {
      const query = opts.query ? Object.fromEntries(Object.entries(opts.query).filter(([, v]) => v !== undefined && v !== null && v !== '')) : undefined
      const res = await (fetcher as typeof $fetch)(url, {
        method: opts.method ?? 'GET',
        body: opts.body,
        query,
        headers: { 'Accept-Language': i18n.locale.value },
        timeout: TIMEOUT_MS,
      })
      return (res || { data: null, meta: {} }) as ApiEnvelope<T>
    } catch (e) {
      const err = toApiError(e, messages())
      if (err.status === 401 && is401Session && opts.handle401 !== false) {
        const auth = useAuthStore()
        auth.reset()
        if (import.meta.client) {
          await navigateTo(`${localePath('/login')}?redirect=${encodeURIComponent(safeRedirect(router.currentRoute.value.fullPath, ''))}`)
        }
      }
      throw err
    }
  }

  /** Authenticated/public API call through the catch-all proxy. */
  const request = <T>(path: string, opts: RequestOptions = {}) => call<T>(`/api/proxy/${path.replace(/^\/+/, '')}`, opts, true)
  /** Dedicated BFF routes that manage the session cookie (login, register, logout, verify-email). */
  const bff = <T>(path: string, opts: RequestOptions = {}) => call<T>(`/api/auth/${path}`, { method: 'POST', ...opts }, false)

  return { request, bff, ApiError }
}
