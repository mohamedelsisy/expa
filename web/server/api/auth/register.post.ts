import { readRawBody, getHeader, createError } from 'h3'
import { register, originAllowed } from '../../utils/bff'
import { baseOptions, respond } from '../../utils/handle'

export default defineEventHandler(async (event) => {
  if (!originAllowed(getHeader(event, 'origin'), getHeader(event, 'host'))) throw createError({ statusCode: 403 })
  return respond(event, await register({ ...baseOptions(event), method: 'POST', path: 'auth/register', body: await readRawBody(event) }))
})
