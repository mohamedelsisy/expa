export class ApiError extends Error {
  status: number
  code: string
  details: Record<string, unknown>
  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    // Nuxt's useAsyncData re-wraps thrown errors as NuxtError (statusCode + data); keep our fields in there.
    ;(this as unknown as Record<string, unknown>).statusCode = status
    ;(this as unknown as Record<string, unknown>).data = { code, details }
  }
}

export function isApiError(e: unknown): e is ApiError {
  if (e instanceof ApiError) return true
  if (typeof e !== 'object' || e === null) return false
  const o = e as Record<string, unknown> & { data?: { code?: unknown, details?: unknown } }
  if (o.name === 'ApiError') return true
  // NuxtError produced from an ApiError by useAsyncData: restore the ApiError fields.
  if (typeof o.statusCode === 'number' && typeof o.data?.code === 'string') {
    o.status ??= o.statusCode
    o.code ??= o.data.code
    o.details ??= o.data.details ?? {}
    return true
  }
  return false
}

/** Maps API `error.details` (field => string[]) to field => first message. Keys like `consents.terms` stay as is. */
export function fieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!isApiError(err) || err.status !== 422) return out
  for (const [k, v] of Object.entries(err.details ?? {})) {
    const first = Array.isArray(v) ? v[0] : v
    if (typeof first === 'string') out[k] = first
  }
  return out
}

/** Normalizes a failed $fetch (ofetch FetchError) into ApiError. Pure so it can be unit-tested. */
export function toApiError(e: unknown, messages: { network: string, timeout: string, generic: string }): ApiError {
  if (isApiError(e)) return e
  const fe = e as { response?: { status?: number }, status?: number, statusCode?: number, data?: unknown, name?: string, cause?: { name?: string } }
  const status = fe?.response?.status ?? fe?.status ?? fe?.statusCode ?? 0
  const body = fe?.data as { error?: { code?: string, message?: string, details?: Record<string, unknown> } } | undefined
  if (status && body?.error?.code === 'upstream_timeout') return new ApiError(0, 'timeout', messages.timeout)
  if (status && body?.error?.code === 'upstream_unavailable') return new ApiError(0, 'network', messages.network)
  if (status && body?.error) {
    return new ApiError(status, body.error.code ?? 'error', body.error.message ?? messages.generic, body.error.details ?? {})
  }
  if (status) return new ApiError(status, 'http_error', messages.generic)
  const name = fe?.name ?? fe?.cause?.name
  if (name === 'TimeoutError' || name === 'AbortError') return new ApiError(0, 'timeout', messages.timeout)
  return new ApiError(0, 'network', messages.network)
}

/** 403 `consent_required` (optionally for one purpose, e.g. `document_storage`). */
export function isConsentRequired(e: unknown, purpose?: string): boolean {
  if (!isApiError(e) || e.status !== 403 || e.code !== 'consent_required') return false
  if (!purpose) return true
  const p = (e.details as { purpose?: unknown })?.purpose
  const first = Array.isArray(p) ? p[0] : p
  return first === undefined || first === purpose
}
