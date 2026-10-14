import { runtimeConfigProblems } from '../utils/runtimeCheck'
import { isValidClientId } from '../../utils/ads'

/** Fails fast in production when the runtime origins are missing or point at localhost (WEB-1). */
export default defineNitroPlugin(() => {
  const cfg = useRuntimeConfig()
  const problems = runtimeConfigProblems({
    apiBaseUrl: String(cfg.apiBaseUrl ?? ''),
    siteUrl: String(cfg.public.siteUrl ?? ''),
    production: process.env.NODE_ENV === 'production',
    allowLocal: process.env.EXPA_ALLOW_LOCAL === '1',
  })
  const ads = cfg.public.ads as { enabled?: boolean | string, clientId?: string } | undefined
  if ((ads?.enabled === true || String(ads?.enabled) === 'true') && !isValidClientId(String(ads?.clientId ?? ''))) {
    problems.push('NUXT_PUBLIC_ADS_CLIENT_ID must look like ca-pub-1234567890123456 when NUXT_PUBLIC_ADS_ENABLED=true')
  }
  if (problems.length) throw new Error(`Invalid EXPA web configuration:\n - ${problems.join('\n - ')}`)
})
