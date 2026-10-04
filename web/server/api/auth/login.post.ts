import { readRawBody, getHeader, createError } from 'h3'
import { login, originAllowed } from '../../utils/bff'
import { baseOptions, respond } from '../../utils/handle'

export default defineEventHandler(async (event) => {
  if (!originAllowed(getHeader(event, 'origin'), getHeader(event, 'host'))) throw createError({ statusCode: 403 })
  return respond(event, await login({ ...baseOptions(event), method: 'POST', path: 'auth/login', body: await readRawBody(event) }))
})
