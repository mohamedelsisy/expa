import { buildCsp } from '../utils/security'

/** Adds a hash-based CSP to rendered HTML and drops the framework banner. Skipped in dev (HMR needs eval/inline). */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', (response, { event }) => {
    if (typeof response.body !== 'string') return
    const cfg = useRuntimeConfig(event)
    const hsts = cfg.security.hsts === true || String(cfg.security.hsts) === 'true'
    if (process.env.NODE_ENV === 'production') {
      response.headers = { ...response.headers, 'content-security-policy': buildCsp(response.body, hsts) }
    }
    if (response.headers) delete response.headers['x-powered-by']
  })
  nitro.hooks.hook('beforeResponse', (event) => {
    event.node.res.removeHeader?.('x-powered-by')
  })
})
