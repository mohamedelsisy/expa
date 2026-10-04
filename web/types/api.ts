/** Shapes returned by the EXPA Laravel API (v1). Envelope: `{ data, meta }` / `{ error }`. */
export type LocaleCode = 'ar' | 'en' | 'it'

export interface ApiMeta {
  locale: LocaleCode
  page?: number
  per_page?: number
  total?: number
  last_page?: number
}
export interface ApiEnvelope<T> { data: T, meta: ApiMeta }
export interface ApiErrorBody {
  error: { code: string, message: string, details?: Record<string, string[] | string[][]> }
}

export interface User {
  id: number
  name: string
  email: string
  locale: LocaleCode
  email_verified: boolean
  created_at: string | null
}

export interface Option { value: string, label: string }
export interface OnboardingStepDef { key: OnboardingStepKey, required: boolean, title: string, why: string }
export type OnboardingStepKey = 'status' | 'nationality' | 'city' | 'residence' | 'language' | 'goals' | 'age'
export interface ProfileOptions {
  segment: Option[]
  residence_type: Option[]
  age_range: Option[]
  cefr_level: Option[]
  goals: Option[]
  onboarding_steps: OnboardingStepDef[]
}

export interface OnboardingState {
  steps: { key: OnboardingStepKey, required: boolean, status: 'answered' | 'skipped' | 'pending' }[]
  required_complete: boolean
  completed: boolean
  progress_percent: number
}
export interface Profile {
  user: User
  city: { id: number, slug: string, name: string } | null
  segment: string | null
  nationality: string | null
  residence_type: string | null
  age_range: string | null
  italian_level: string | null
  english_level: string | null
  goals: string[]
  onboarding: OnboardingState
}

export interface City {
  id: number
  slug: string
  name: string
  region: { id: number, slug: string, name: string }
}

export interface ConsentPurposeInfo {
  key: string
  required: boolean
  legal_basis: string
  title: string
  why: string
  data: string
}
export interface PurposesPayload { policy_version: string, purposes: ConsentPurposeInfo[] }
export interface ConsentState {
  granted: boolean
  decided: boolean
  policy_version: string | null
  outdated: boolean
  updated_at: string | null
}
export interface ConsentsPayload { policy_version: string, consents: Record<string, ConsentState> }

export type SourceType = 'official' | 'institutional' | 'verified_partner' | 'third_party'
export type Freshness = 'fresh' | 'stale' | 'outdated' | 'unverified'
export interface GuideSource {
  name: string | null
  url: string | null
  type: SourceType | null
  last_verified_at: string | null
  freshness: Freshness
}
export interface Place { id: number, slug: string, name: string }
export interface GuideStep { title: string, text?: string | null }
export interface Guide {
  id: number
  slug: string
  category: string
  category_label: string
  italian_term: string | null
  applies_to: 'national' | 'region' | 'city'
  region: Place | null
  city: Place | null
  title: string
  summary: string | null
  locale: LocaleCode
  fallback: boolean
  available_locales: LocaleCode[]
  source: GuideSource
  updated_at: string | null
}
export interface GuideFull extends Guide {
  what_is: string | null
  who_needs: string | null
  required_documents: string[] | null
  steps: GuideStep[] | null
  where_to_apply: string | null
  how_to_book: string | null
  costs: string | null
  processing_time: string | null
  body: string | null
  published_at: string | null
}
export interface GuideCategory { value: string, label: string }

export interface ScoreCategory { key: string, label: string, done: number, total: number, percent: number | null }
export interface Score {
  overall: number | null
  applicable_tasks: number
  done_tasks: number
  categories: ScoreCategory[]
  how_calculated: string
  note: string | null
}
export interface NextAction {
  key: string
  type: string
  priority: number
  title: string
  description: string | null
  cta: { type: 'guide' | 'route' | 'task' | string, target: string }
}
export interface Dashboard {
  greeting: { name: string }
  personalization: { enabled: boolean }
  onboarding: { completed: boolean, required_complete: boolean, progress_percent: number }
  score: Score
  next_actions: NextAction[]
}
export type TaskStatus = 'todo' | 'done' | 'dismissed'
export interface SetupTask {
  key: string
  category: string
  category_label: string
  title: string
  hint: string
  status: TaskStatus
  applicable: boolean
  guide: { slug: string, title: string } | null
  route: string | null
}
