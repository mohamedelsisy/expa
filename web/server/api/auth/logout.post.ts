import { createError } from 'h3'
import { logout } from '../../utils/bff'
import { baseOptions, respond, sameOrigin } from '../../utils/handle'

export default defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 })
  return respond(event, await logout(baseOptions(event)))
})
