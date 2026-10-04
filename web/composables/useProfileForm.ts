import type { Profile } from '~/types/api'

export interface ProfileFormState {
  segment: string
  nationality: string
  city_id: string
  residence_type: string
  italian_level: string
  english_level: string
  goals: string[]
  age_range: string
}

export const STEP_FIELDS: Record<string, (keyof ProfileFormState)[]> = {
  status: ['segment'],
  nationality: ['nationality'],
  city: ['city_id'],
  residence: ['residence_type'],
  language: ['italian_level', 'english_level'],
  goals: ['goals'],
  age: ['age_range'],
}

export function emptyProfileForm(): ProfileFormState {
  return { segment: '', nationality: '', city_id: '', residence_type: '', italian_level: '', english_level: '', goals: [], age_range: '' }
}

export function formFromProfile(p: Profile): ProfileFormState {
  return {
    segment: p.segment ?? '',
    nationality: p.nationality ?? '',
    city_id: p.city ? String(p.city.id) : '',
    residence_type: p.residence_type ?? '',
    italian_level: p.italian_level ?? '',
    english_level: p.english_level ?? '',
    goals: [...(p.goals ?? [])],
    age_range: p.age_range ?? '',
  }
}

/** Builds the PATCH body for the given fields; empty strings become null (clearing is always allowed). */
export function patchBody(form: ProfileFormState, fields: (keyof ProfileFormState)[]): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const f of fields) {
    const v = form[f]
    if (f === 'goals') body.goals = (v as string[]).length ? v : null
    else if (f === 'city_id') body.city_id = v ? Number(v) : null
    else body[f] = v || null
  }
  return body
}
