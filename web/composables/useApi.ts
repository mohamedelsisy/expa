import type { ApiEnvelope } from '~/types/api'
import { ApiError, isTwoFactorSetupRequired, toApiError } from '~/utils/errors'
import { safeRedirect } from '~/utils/safe'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown> | FormData
  query?: Record<string, string | number | undefined | null>
  /** Treat 401 as "session expired": clear auth state and go to login. Default true. */
  handle401?: boolean
  /** Per-call timeout (uploads need longer than the 15 s default). */
  timeoutMs?: number
  responseType?: 'json' | 'blob'
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
        timeout: opts.timeoutMs ?? TIMEOUT_MS,
        ...(opts.responseType === 'blob' ? { responseType: 'blob' as const } : {}),
      })
      return (res || { data: null, meta: {} }) as ApiEnvelope<T>
    } catch (e) {
      // A failed blob request carries the JSON error envelope as a Blob: unwrap it so the message/code survive.
      const fe = e as { data?: unknown }
      if (opts.responseType === 'blob' && typeof Blob !== 'undefined' && fe?.data instanceof Blob) {
        try { fe.data = JSON.parse(await fe.data.text()) } catch { fe.data = undefined }
      }
      const err = toApiError(e, messages())
      // SSR: an upstream outage must not be served as an indexable 200 error shell (see app.vue for noindex).
      if (import.meta.server && (opts.method ?? 'GET') === 'GET' && (err.status === 0 || err.status >= 500 || err.status === 429)) {
        useState('upstream-failed', () => false).value = true
        const event = useRequestEvent()
        if (event) setResponseStatus(event, 503)
      }
      // Staff without 2FA: every /admin call is refused until setup is done. The admin layout swaps its content for the gate.
      if (isTwoFactorSetupRequired(err)) useTwoFactorGate().value = true
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
  /** Authenticated binary download (attachments) as a Blob; errors are normalised like any other call. */
  const download = async (path: string): Promise<Blob> => (await call<Blob>(`/api/proxy/${path.replace(/^\/+/, '')}`, { responseType: 'blob' }, true)) as unknown as Blob
  /** Dedicated BFF routes that manage the session cookie (login, register, logout, verify-email). */
  const bff = <T>(path: string, opts: RequestOptions = {}) => call<T>(`/api/auth/${path}`, { method: 'POST', ...opts }, false)

  return { request, bff, download, ApiError }
}
