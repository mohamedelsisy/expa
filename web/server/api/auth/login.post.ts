import { readRawBody, createError } from 'h3'
import { login, errorResult, MAX_AUTH_BODY } from '../../utils/bff'
import { baseOptions, respond, sameOrigin } from '../../utils/handle'

export default defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 })
  const body = (await readRawBody(event)) ?? ''
  if (body.length > MAX_AUTH_BODY) return respond(event, errorResult(413, 'payload_too_large', 'Payload too large.'))
  return respond(event, await login({ ...baseOptions(event), method: 'POST', path: 'auth/login', body }))
})
