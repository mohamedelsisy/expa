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
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError || (typeof e === 'object' && e !== null && (e as { name?: string }).name === 'ApiError')
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
