import type { ApiEnvelope } from '~/types/api'

export interface RelOption { value: string, label: string }
export type RelKind = 'university' | 'topic' | 'guide' | 'offices' | 'city'
const ENDPOINT: Record<Exclude<RelKind, 'city'>, string> = {
  university: 'admin/study/universities',
  topic: 'admin/patente/topics',
  guide: 'admin/guides',
  offices: 'admin/government/offices',
}
interface RelItem { id: number, slug: string, titles?: Record<string, string | null> }

/** Lazily loads options for relation selects from the admin lists (first 100 by slug). Failures (e.g. no permission) are reported, not thrown. */
export function useRelationOptions(kind: RelKind) {
  const { request } = useApi()
  const { locale } = useI18n()
  const options = useState<RelOption[] | null>(`admin-rel-${kind}`, () => null)
  const failed = useState<boolean>(`admin-rel-${kind}-failed`, () => false)
  const pending = ref(false)

  async function load(force = false) {
    if (options.value && !force) return
    pending.value = true
    failed.value = false
    try {
      if (kind === 'city') {
        // Public lookup (id + localized name): needs no admin permission.
        const cities = await request<{ id: number, slug: string, name: string }[]>('cities')
        options.value = (cities.data ?? []).map(c => ({ value: String(c.id), label: `${c.name} (${c.slug})` }))
        return
      }
      const res: ApiEnvelope<RelItem[]> = await request<RelItem[]>(ENDPOINT[kind as Exclude<RelKind, 'city'>], { query: { per_page: 100, sort: 'slug' } })
      options.value = (res.data ?? []).map((i) => {
        const titles = i.titles ?? {}
        const title = titles[locale.value] || titles.ar || titles.en || titles.it || ''
        return { value: String(i.id), label: title ? `${title} (${i.slug})` : i.slug }
      })
    } catch {
      failed.value = true
    } finally {
      pending.value = false
    }
  }
  return { options: computed(() => options.value ?? []), failed, pending, load }
}

export interface Region { id: number, slug: string, name: string }
export interface CityOpt { id: number, slug: string, name: string, region: Region }

/** Regions and cities for the place selects (public endpoints). */
export function usePlaces() {
  const { request } = useApi()
  const regions = useState<Region[]>('admin-regions', () => [])
  const cities = useState<CityOpt[]>('admin-cities', () => [])
  const failed = ref(false)
  async function load() {
    if (regions.value.length && cities.value.length) return
    try {
      const [r, c] = await Promise.all([request<Region[]>('regions'), request<CityOpt[]>('cities')])
      regions.value = r.data ?? []
      cities.value = c.data ?? []
    } catch {
      failed.value = true
    }
  }
  return { regions, cities, failed, load }
}
