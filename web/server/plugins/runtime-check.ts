import { runtimeConfigProblems } from '../utils/runtimeCheck'

/** Fails fast in production when the runtime origins are missing or point at localhost (WEB-1). */
export default defineNitroPlugin(() => {
  const cfg = useRuntimeConfig()
  const problems = runtimeConfigProblems({
    apiBaseUrl: String(cfg.apiBaseUrl ?? ''),
    siteUrl: String(cfg.public.siteUrl ?? ''),
    production: process.env.NODE_ENV === 'production',
    allowLocal: process.env.EXPA_ALLOW_LOCAL === '1',
  })
  if (problems.length) throw new Error(`Invalid EXPA web configuration:\n - ${problems.join('\n - ')}`)
})
