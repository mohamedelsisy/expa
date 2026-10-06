import { getHeader, getMethod, getRequestURL, getRouterParam, readRawBody, createError } from 'h3'
import { forwardRequest, errorResult, MAX_UPLOAD } from '../../utils/bff'
import { baseOptions, respond, sameOrigin } from '../../utils/handle'

/** Catch-all BFF proxy: forwards to the Laravel API with the bearer token from the httpOnly cookie. */
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && !sameOrigin(event)) {
    throw createError({ statusCode: 403 })
  }
  const contentType = getHeader(event, 'content-type') ?? ''
  const base = { ...baseOptions(event), method, path: getRouterParam(event, 'path') ?? '', search: getRequestURL(event).search }
  if (/^multipart\//i.test(contentType)) {
    // Uploads are forwarded byte for byte (the boundary lives in the content type); the BFF only allows this on one route.
    if (Number(getHeader(event, 'content-length') ?? 0) > MAX_UPLOAD) return respond(event, errorResult(413, 'payload_too_large', 'Payload too large.'))
    const raw = await readRawBody(event, false)
    return respond(event, await forwardRequest({ ...base, rawBody: raw ? new Uint8Array(raw) : new Uint8Array(), contentType }))
  }
  const body = method === 'GET' || method === 'DELETE' && !getHeader(event, 'content-length') ? null : await readRawBody(event)
  return respond(event, await forwardRequest({ ...base, body }))
})
