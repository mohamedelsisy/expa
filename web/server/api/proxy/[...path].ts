import { getHeader, getMethod, getRequestURL, getRouterParam, readRawBody, createError } from 'h3'
import { originAllowed, proxyRequest } from '../../utils/bff'
import { baseOptions, respond } from '../../utils/handle'

/** Catch-all BFF proxy: forwards to the Laravel API with the bearer token from the httpOnly cookie. */
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && !originAllowed(getHeader(event, 'origin'), getHeader(event, 'host'))) {
    throw createError({ statusCode: 403 })
  }
  const body = method === 'GET' || method === 'DELETE' && !getHeader(event, 'content-length') ? null : await readRawBody(event)
  return respond(event, await proxyRequest({
    ...baseOptions(event),
    method,
    path: getRouterParam(event, 'path') ?? '',
    search: getRequestURL(event).search,
    body,
  }))
})
