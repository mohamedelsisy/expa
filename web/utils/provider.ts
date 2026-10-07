import type { PortalProfile } from '~/types/extra'

export type Loc = 'ar' | 'en' | 'it'
export const PORTAL_LOCALES: readonly Loc[] = ['ar', 'en', 'it'] as const

export interface ServiceRow { price: string, translations: Record<Loc, { name: string, description: string }> }
export interface ProfileForm {
  category: string
  display_name: string
  city_id: string
  serves_online: boolean
  languages: string[]
  contact_email: string
  contact_phone: string
  website: string
  show_email: boolean
  show_phone: boolean
  show_website: boolean
  translations: Record<Loc, { headline: string, description: string, availability_note: string }>
  services: ServiceRow[]
}
const emptyT = () => ({ headline: '', description: '', availability_note: '' })
const emptyS = () => ({ name: '', description: '' })
export const newServiceRow = (): ServiceRow => ({ price: '', translations: { ar: emptyS(), en: emptyS(), it: emptyS() } })

/** Portal profile (API) to editable form state. Empty strings stand for "not set". */
export function profileToForm(p: PortalProfile | null): ProfileForm {
  const tr = (l: Loc) => ({ ...emptyT(), ...Object.fromEntries(Object.entries(p?.translations?.[l] ?? {}).map(([k, v]) => [k, v ?? ''])) })
  const services = ((p?.services as { price_from_eur: number | null, translations?: Record<string, { name?: string | null, description?: string | null }> }[] | undefined) ?? []).map((s) => {
    const row = newServiceRow()
    row.price = s.price_from_eur === null || s.price_from_eur === undefined ? '' : String(s.price_from_eur)
    for (const l of PORTAL_LOCALES) row.translations[l] = { name: s.translations?.[l]?.name ?? '', description: s.translations?.[l]?.description ?? '' }
    return row
  })
  return {
    category: p?.category ?? '',
    display_name: p?.display_name ?? '',
    city_id: p?.city_id ? String(p.city_id) : '',
    serves_online: p?.serves_online ?? false,
    languages: [...(p?.languages ?? [])],
    contact_email: p?.contact_email ?? '',
    contact_phone: p?.contact_phone ?? '',
    website: p?.website ?? '',
    show_email: p?.show_email ?? false,
    show_phone: p?.show_phone ?? false,
    show_website: p?.show_website ?? false,
    translations: { ar: tr('ar'), en: tr('en'), it: tr('it') },
    services,
  }
}

const trim = (s: string) => s.trim()
/** Form state to the API body. Only locales with content are sent; services need at least one filled name. */
export function formToBody(f: ProfileForm): Record<string, unknown> {
  const translations: Record<string, Record<string, string>> = {}
  for (const l of PORTAL_LOCALES) {
    const t = f.translations[l]
    if (!trim(t.headline) && !trim(t.description) && !trim(t.availability_note)) continue
    translations[l] = { headline: trim(t.headline), ...(trim(t.description) ? { description: trim(t.description) } : {}), ...(trim(t.availability_note) ? { availability_note: trim(t.availability_note) } : {}) }
  }
  const services = f.services.flatMap((s) => {
    const tr: Record<string, Record<string, string>> = {}
    for (const l of PORTAL_LOCALES) {
      const x = s.translations[l]
      if (trim(x.name)) tr[l] = { name: trim(x.name), ...(trim(x.description) ? { description: trim(x.description) } : {}) }
    }
    if (!Object.keys(tr).length) return []
    const price = s.price.trim() === '' ? null : Math.round(Number(s.price))
    return [{ price_from_eur: price !== null && Number.isFinite(price) && price >= 0 ? price : null, translations: tr }]
  })
  return {
    category: f.category,
    display_name: trim(f.display_name),
    city_id: f.city_id ? Number(f.city_id) : null,
    serves_online: f.serves_online,
    languages: [...new Set(f.languages)],
    contact_email: trim(f.contact_email) || null,
    contact_phone: trim(f.contact_phone) || null,
    website: trim(f.website) || null,
    show_email: f.show_email,
    show_phone: f.show_phone,
    show_website: f.show_website,
    translations,
    services,
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9 ()-]{6,25}$/
export type ProfileProblem = 'display_name_required' | 'category_required' | 'email_invalid' | 'phone_invalid' | 'website_https' | 'price_invalid' | 'headline_required_with_text'
export function validateProfile(f: ProfileForm): Partial<Record<'display_name' | 'category' | 'contact_email' | 'contact_phone' | 'website' | 'services' | 'translations', ProfileProblem>> {
  const out: ReturnType<typeof validateProfile> = {}
  if (!trim(f.display_name)) out.display_name = 'display_name_required'
  if (!f.category) out.category = 'category_required'
  if (trim(f.contact_email) && !EMAIL.test(trim(f.contact_email))) out.contact_email = 'email_invalid'
  if (trim(f.contact_phone) && !PHONE.test(trim(f.contact_phone))) out.contact_phone = 'phone_invalid'
  if (trim(f.website) && !/^https:\/\/[^\s]+$/i.test(trim(f.website))) out.website = 'website_https'
  if (f.services.some(s => s.price.trim() !== '' && !(Number.isFinite(Number(s.price)) && Number(s.price) >= 0 && Number(s.price) <= 1_000_000))) out.services = 'price_invalid'
  if (PORTAL_LOCALES.some((l) => { const t = f.translations[l]; return !trim(t.headline) && (trim(t.description) || trim(t.availability_note)) })) out.translations = 'headline_required_with_text'
  return out
}

/** Status shown to the provider; `published` listings keep edits pending until an admin approves them. */
export const EDITABLE_DIRECTLY = (status: string | undefined) => status !== 'published'
export const isProvider = (roles: readonly string[] | undefined) => !!roles?.includes('provider')
