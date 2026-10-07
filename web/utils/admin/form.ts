import { COMMON_FIELDS, LOCALE_CODES, PLACE_FIELDS, SOURCE_FIELDS, type AttrField, type ContentModule, type Loc, type TranslatableField } from './modules'

export type TrValue = string | string[] | { title: string, text: string }[] | Record<string, string>[]
export type TrFields = Record<string, TrValue>
export interface FormState {
  /** Every attribute as an input value: strings (numbers, ids, booleans as 'true'/'false'), arrays for multi-selects. */
  attrs: Record<string, string | string[]>
  translations: Record<Loc, TrFields>
}

/** Attribute fields in form order: common, module-specific, place, source. */
export function allAttrFields(m: ContentModule): AttrField[] {
  return [...COMMON_FIELDS.filter(f => !(m.hideSlug && f.key === 'slug')), ...m.attributes, ...(m.place ? PLACE_FIELDS : []), ...SOURCE_FIELDS]
}

export const emptyTr = (f: TranslatableField): TrValue => (f.type === 'text' || f.type === 'textarea' ? '' : [])

export function emptyForm(m: ContentModule): FormState {
  const attrs: FormState['attrs'] = {}
  for (const f of allAttrFields(m)) attrs[f.key] = f.type === 'multiselect' || f.relation === 'offices' ? [] : ''
  const translations = Object.fromEntries(LOCALE_CODES.map(l => [l, Object.fromEntries(m.translatable.map(f => [f.key, emptyTr(f)]))])) as FormState['translations']
  return { attrs, translations }
}

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v))

export interface BlockForm {
  key: string, info_type: string, sort_order: string
  source_name: string, source_url: string, source_type: string, last_verified_at: string
  translations: Record<Loc, { title: string, body: string }>
}
export const newBlock = (): BlockForm => ({ key: '', info_type: 'general_guidance', sort_order: '0', source_name: '', source_url: '', source_type: '', last_verified_at: '', translations: { ar: { title: '', body: '' }, en: { title: '', body: '' }, it: { title: '', body: '' } } })
/** API blocks -> editable blocks (flat source fields). */
export function blocksFromApi(v: unknown): BlockForm[] {
  if (!Array.isArray(v)) return []
  return v.map((b: Record<string, any>) => {
    const out = newBlock()
    out.key = str(b.key); out.info_type = str(b.info_type) || 'general_guidance'; out.sort_order = str(b.sort_order ?? 0)
    out.source_name = str(b.source?.name); out.source_url = str(b.source?.url); out.source_type = str(b.source?.type); out.last_verified_at = str(b.source?.last_verified_at).slice(0, 10)
    for (const l of LOCALE_CODES) out.translations[l] = { title: str(b.translations?.[l]?.title), body: str(b.translations?.[l]?.body) }
    return out
  })
}
export function parseBlocks(json: string | string[] | undefined): BlockForm[] {
  try { const v = JSON.parse(String(json ?? '[]')); return Array.isArray(v) ? v : [] } catch { return [] }
}
/** Editable blocks -> API payload: empty optional fields are omitted, empty locales dropped. */
export function blocksPayload(blocks: BlockForm[]): Record<string, unknown>[] {
  return blocks.map((b) => {
    const translations: Record<string, { title: string, body: string | null }> = {}
    for (const l of LOCALE_CODES) if (b.translations[l].title.trim()) translations[l] = { title: b.translations[l].title.trim(), body: b.translations[l].body.trim() || null }
    return {
      key: b.key, info_type: b.info_type, sort_order: Number(b.sort_order) || 0,
      source_name: b.source_name.trim() || null, source_url: b.source_url.trim() || null, source_type: b.source_type || null, last_verified_at: b.last_verified_at || null,
      translations,
    }
  })
}
export const splitTags = (v: string): string[] => [...new Set(v.split(/[,\n]+/).map(x => x.trim()).filter(Boolean))]

/** API item (full) -> form state. */
export function fromItem(m: ContentModule, item: Record<string, unknown>): FormState {
  const s = emptyForm(m)
  const source = (item.source ?? {}) as Record<string, unknown>
  const sourceMap: Record<string, unknown> = { source_name: source.name, source_url: source.url, source_type: source.type, last_verified_at: source.last_verified_at }
  for (const f of allAttrFields(m)) {
    const v = f.key in sourceMap ? sourceMap[f.key] : item[f.key]
    if (f.type === 'multiselect' || f.relation === 'offices') s.attrs[f.key] = Array.isArray(v) ? v.map(String) : []
    else if (f.type === 'bool') s.attrs[f.key] = v === true ? 'true' : v === false ? 'false' : ''
    else if (f.type === 'tags') s.attrs[f.key] = Array.isArray(v) ? v.map(String).join(', ') : ''
    else if (f.type === 'json') s.attrs[f.key] = v && typeof v === 'object' ? JSON.stringify(v, null, 2) : ''
    else if (f.type === 'blocks') s.attrs[f.key] = JSON.stringify(blocksFromApi(v))
    else s.attrs[f.key] = str(v)
  }
  const tr = (Array.isArray(item.translations) ? {} : (item.translations ?? {})) as Record<string, Record<string, unknown>>
  for (const loc of LOCALE_CODES) {
    const src = tr[loc]
    if (!src) continue
    for (const f of m.translatable) {
      const v = src[f.key]
      if (f.type === 'text' || f.type === 'textarea') s.translations[loc][f.key] = str(v)
      else if (f.type === 'list') s.translations[loc][f.key] = Array.isArray(v) ? v.map(str) : []
      else if (f.type === 'steps') s.translations[loc][f.key] = Array.isArray(v) ? v.map((x: Record<string, unknown>) => ({ title: str(x?.title), text: str(x?.text) })) : []
      else s.translations[loc][f.key] = Array.isArray(v) ? v.map((x: Record<string, unknown>) => Object.fromEntries((f.itemFields ?? []).map(i => [i.key, str(x?.[i.key])]))) : []
    }
  }
  return s
}

const blank = (s: unknown): boolean => typeof s !== 'string' || s.trim() === ''

/** True when a locale holds no content at all (nothing to send, nothing to count as present). */
export function isLocaleBlank(m: ContentModule, fields: TrFields): boolean {
  return m.translatable.every((f) => {
    const v = fields[f.key]
    if (typeof v === 'string' || v === undefined) return blank(v)
    if (f.type === 'list') return (v as string[]).every(blank)
    if (f.type === 'steps') return (v as { title: string, text: string }[]).every(x => blank(x.title) && blank(x.text))
    return (v as Record<string, string>[]).every(x => Object.values(x).every(blank))
  })
}

/** Locale tabs with content in the primary field (what the API counts as "present"). */
export const hasPrimary = (m: ContentModule, fields: TrFields): boolean => !blank(fields[m.primary])

function trPayload(m: ContentModule, fields: TrFields): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of m.translatable) {
    const v = fields[f.key]
    if (f.type === 'text' || f.type === 'textarea') out[f.key] = blank(v) ? null : String(v).trim()
    else if (f.type === 'list') {
      const list = (v as string[]).map(x => x.trim()).filter(Boolean)
      out[f.key] = list.length ? list : null
    } else if (f.type === 'steps') {
      const list = (v as { title: string, text: string }[]).filter(x => !blank(x.title)).map(x => ({ title: x.title.trim(), text: blank(x.text) ? null : x.text.trim() }))
      out[f.key] = list.length ? list : null
    } else {
      const list = (v as Record<string, string>[]).filter(x => !blank(x.it)).map(x => Object.fromEntries(Object.entries(x).filter(([, val]) => !blank(val)).map(([k, val]) => [k, val.trim()])))
      out[f.key] = list.length ? list : null
    }
  }
  return out
}

/** Form state -> API body. Empty nullable fields become null; empty non-nullable ones are left out. */
export function buildPayload(m: ContentModule, s: FormState, opts: { creating: boolean }): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const f of allAttrFields(m)) {
    const v = s.attrs[f.key]
    if (f.relation === 'offices') { body[f.key] = (v as string[]).map(Number); continue }
    if (f.type === 'multiselect') { const a = v as string[]; if (a.length) body[f.key] = a; else if (f.nullable) body[f.key] = null; continue }
    if (f.type === 'blocks') { body[f.key] = blocksPayload(parseBlocks(v)); continue }
    const raw = String(v ?? '').trim()
    if (f.type === 'tags') { const list = splitTags(raw); if (list.length || !opts.creating) body[f.key] = list; continue }
    if (f.type === 'json') { if (raw) { try { body[f.key] = JSON.parse(raw) } catch { /* reported by validateForm */ } } continue }
    if (raw === '') {
      if (f.nullable && !opts.creating) body[f.key] = null
      continue
    }
    if (f.type === 'number' || f.type === 'relation') body[f.key] = Number(raw)
    else if (f.type === 'bool') body[f.key] = raw === 'true'
    else body[f.key] = raw
  }
  const translations: Record<string, unknown> = {}
  for (const loc of LOCALE_CODES) {
    if (!isLocaleBlank(m, s.translations[loc])) translations[loc] = trPayload(m, s.translations[loc])
  }
  body.translations = translations
  return body
}

/** Client-side checks that mirror the API's `required` rules so people get instant feedback (the API still validates). */
export function validateForm(m: ContentModule, s: FormState, opts: { creating: boolean }): Record<string, string> {
  const errors: Record<string, string> = {}
  if (opts.creating) {
    for (const f of allAttrFields(m)) {
      if (!f.required) continue
      if (f.requiredWithout && String(s.attrs[f.requiredWithout] ?? '').trim() !== '') continue
      const v = s.attrs[f.key]
      if (Array.isArray(v) ? v.length === 0 : String(v ?? '').trim() === '') errors[f.key] = 'admin.validation.required'
    }
  }
  const slug = String(s.attrs.slug ?? '').trim()
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = 'admin.validation.slug'
  for (const f of SOURCE_FIELDS) {
    if (f.type === 'url') {
      const v = String(s.attrs[f.key] ?? '').trim()
      if (v && !/^https:\/\/\S+$/i.test(v)) errors[f.key] = 'admin.validation.https'
    }
  }
  for (const f of m.attributes) {
    if (f.type === 'json' && String(s.attrs[f.key] ?? '').trim()) {
      try { const parsed = JSON.parse(String(s.attrs[f.key])); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) errors[f.key] = 'admin.validation.json' } catch { errors[f.key] = 'admin.validation.json' }
    }
    if (f.type === 'url') {
      const v = String(s.attrs[f.key] ?? '').trim()
      if (v && !/^https:\/\/\S+$/i.test(v)) errors[f.key] = 'admin.validation.https'
    }
    if (f.type === 'blocks') {
      const bl = parseBlocks(s.attrs[f.key])
      if (bl.some(b => !b.key || !LOCALE_CODES.some(l => b.translations[l].title.trim()))) errors[f.key] = 'admin.validation.blocks'
      else if (new Set(bl.map(b => b.key)).size !== bl.length) errors[f.key] = 'admin.validation.blocksDistinct'
    }
  }
  let anyPrimary = false
  for (const loc of LOCALE_CODES) {
    const fields = s.translations[loc]
    if (isLocaleBlank(m, fields)) continue
    if (hasPrimary(m, fields)) anyPrimary = true
    else errors[`translations.${loc}.${m.primary}`] = 'admin.validation.required'
  }
  if (!anyPrimary && !Object.keys(errors).some(k => k.startsWith('translations.'))) errors.translations = 'admin.validation.needTranslation'
  return errors
}

/** `translations.ar.steps.0.title` -> { locale: 'ar', field: 'steps' } (nested list errors surface on the list field). */
export function parseTranslationErrorKey(key: string): { locale: string, field: string } | null {
  const m = /^translations\.(ar|en|it)\.([^.]+)/.exec(key)
  return m ? { locale: m[1]!, field: m[2]! } : null
}
export function translationErrors(errors: Record<string, string>): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  for (const [k, v] of Object.entries(errors)) {
    const p = parseTranslationErrorKey(k)
    if (p) (out[p.locale] ??= {})[p.field] ??= v
  }
  return out
}
