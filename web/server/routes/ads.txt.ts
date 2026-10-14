import { setResponseHeader, createError } from 'h3'
import { adsConfigured, adsTxt } from '../../utils/ads'

/** Authorised-sellers file AdSense checks for. 404 until ads are enabled with a valid publisher id. */
export default defineEventHandler((event) => {
  const ads = useRuntimeConfig(event).public.ads as { enabled?: boolean | string, clientId?: string }
  const clientId = String(ads?.clientId ?? '')
  const body = adsConfigured({ enabled: ads?.enabled === true || String(ads?.enabled) === 'true', clientId }) ? adsTxt(clientId) : null
  if (!body) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return body
})
