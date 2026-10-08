import { readRawBody, createError } from 'h3'
import { twoFactorChallenge, errorResult, MAX_AUTH_BODY } from '../../utils/bff'
import { baseOptions, getChallengeToken, respond, sameOrigin } from '../../utils/handle'

/** Second login step: exchanges the parked challenge token + code for a session cookie. */
export default defineEventHandler(async (event) => {
  if (!sameOrigin(event)) throw createError({ statusCode: 403 })
  const body = (await readRawBody(event)) ?? ''
  if (body.length > MAX_AUTH_BODY) return respond(event, errorResult(413, 'payload_too_large', 'Payload too large.'))
  return respond(event, await twoFactorChallenge({ ...baseOptions(event), method: 'POST', path: 'auth/2fa/challenge', body, challengeToken: getChallengeToken(event) }))
})
