import { readBody, createError } from 'h3'
import { verifyEmail } from '../../utils/bff'
import { baseOptions, respond, sameOrigin } from '../../utils/handle'

export default defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 })
  const body = await readBody<{ url?: unknown }>(event)
  const o = baseOptions(event)
  return respond(event, await verifyEmail({ fetcher: o.fetcher, base: o.base, timeoutMs: o.timeoutMs, lang: o.lang, url: typeof body?.url === 'string' ? body.url : '' }))
})
