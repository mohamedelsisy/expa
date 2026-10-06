/** Boot-time validation of the runtime configuration (framework-free so it can be unit-tested). */
export interface RuntimeCheckInput {
  apiBaseUrl: string
  siteUrl: string
  production: boolean
  /** EXPA_ALLOW_LOCAL=1: permit localhost/loopback origins (local docker, e2e) in a production build. */
  allowLocal: boolean
}

const LOCAL = /^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?|0\.0\.0\.0)$/i

function parse(value: string): URL | null {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u : null
  } catch {
    return null
  }
}

/** Returns a list of problems; empty means the configuration is usable. */
export function runtimeConfigProblems(i: RuntimeCheckInput): string[] {
  if (!i.production) return []
  const problems: string[] = []
  const check = (name: string, env: string, value: string) => {
    if (!value) return problems.push(`${name} is empty: set ${env} at container start (it cannot be baked in at build time).`)
    const u = parse(value)
    if (!u) return problems.push(`${name} is not a valid http(s) URL: "${value}" (${env}).`)
    if (!i.allowLocal && LOCAL.test(u.hostname)) problems.push(`${name} points at "${u.hostname}" (${env}). Set the real origin, or EXPA_ALLOW_LOCAL=1 for local runs.`)
  }
  check('apiBaseUrl', 'NUXT_API_BASE_URL', i.apiBaseUrl)
  check('siteUrl', 'NUXT_PUBLIC_SITE_URL', i.siteUrl)
  return problems
}
