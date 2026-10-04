/** Shapes returned by the EXPA Laravel API (v1). Envelope: `{ data, meta }` / `{ error }`. */
export type LocaleCode = 'ar' | 'en' | 'it'

export interface ApiMeta {
  locale: LocaleCode
  page?: number
  per_page?: number
  total?: number
  last_page?: number
  /** Notifications: unread count. AI: degraded answer. Search: facets. */
  unread?: number
  degraded?: boolean
  personalized?: boolean
  facets?: SearchFacet[]
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

// ---------------------------------------------------------------- documents
export interface DocumentType { key: string, name: string }
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired' | 'no_expiry'
export interface Attachment { id: number, name: string, mime: string, size: number, created_at: string | null }
export interface UpcomingReminder { on: string, kind: string, offset_days: number | null }
export interface UserDocument {
  id: number
  type: { key: string, name: string }
  label: string | null
  display_name: string
  issue_date: string | null
  expiry_date: string | null
  days_remaining: number | null
  status: DocumentStatus
  status_label: string
  notes: string | null
  reminders_enabled: boolean
  reminder_offsets: number[]
  upcoming_reminders: UpcomingReminder[]
  attachments: Attachment[]
  created_at: string | null
}

// ------------------------------------------------------------ notifications
export interface AppNotification {
  id: string
  type: string
  title: string
  body: string | null
  cta: { type: string, target: string } | null
  read: boolean
  created_at: string | null
}

// ---------------------------------------------------------------------- AI
export type AiLabel = 'official' | 'general_guidance' | 'ai_explanation' | 'third_party'
export interface AiSource {
  n: number
  title: string
  ref: { type: string, slug?: string, route?: string }
  source: { name: string | null, url: string | null, type: SourceType | null, last_verified_at: string | null, freshness: Freshness }
}
export interface AiAction { type: string, target: string, label: string }
export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  label: AiLabel | null
  label_text: string | null
  sources: AiSource[]
  actions: AiAction[]
  degraded: boolean
  created_at: string | null
}
export interface AiAskResponse { conversation_id: number, message: AiMessage, usage: { remaining: number | null } }
export interface AiConversationSummary { id: number, title: string | null, updated_at: string | null }
export interface AiConversation { id: number, title: string | null, messages: AiMessage[] }
export interface AiUsage { limit: number | null, remaining: number | null }

// -------------------------------------------------- government / appointments
export interface Booking { method: string, method_label: string, url: string | null, booked_by_expa: false, notice: string }
export interface GovService {
  id: number
  slug: string
  domain: string
  domain_label: string
  italian_term: string | null
  applies_to: 'national' | 'region' | 'city'
  region: Place | null
  city: Place | null
  name: string
  summary: string | null
  locale: LocaleCode
  fallback: boolean
  available_locales: LocaleCode[]
  source: GuideSource
  updated_at: string | null
}
export interface GovOffice {
  id: number
  slug: string
  office_type: string
  office_type_label: string
  name: string
  opening_hours: string | null
  notes: string | null
  region: Place | null
  city: Place | null
  address: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  official_url: string | null
  booking: Booking
  locale: LocaleCode
  fallback: boolean
  source: GuideSource
  updated_at: string | null
}
export interface GovServiceFull extends GovService {
  how_to_apply: string | null
  required_documents: string[] | null
  notes: string | null
  guide: { slug: string, title: string } | null
  offices: GovOffice[]
}
export interface AppointmentGuide {
  id: number
  slug: string
  office_type: string
  office_type_label: string
  title: string
  summary: string | null
  booking: Booking
  locale: LocaleCode
  fallback: boolean
  source: GuideSource
  updated_at: string | null
  steps?: GuideStep[] | null
  tips?: string | null
  cautions?: string | null
}
export interface AppointmentHub {
  city: { slug: string, name: string }
  office_type: string
  office_type_label: string
  guide: AppointmentGuide | null
  offices: GovOffice[]
  notice: string
}

// ------------------------------------------------------------------ Italian
export interface LessonItem { it: string, gloss?: string | null, example_it?: string | null, example_gloss?: string | null, speaker?: string | null, tip?: string | null, phonetic?: string | null }
export interface LessonSummary {
  id: number
  slug: string
  level: string
  level_label: string
  type: string
  type_label: string
  scenario: string | null
  scenario_label: string | null
  duration_minutes: number
  title: string
  summary: string | null
  locale: LocaleCode
  fallback: boolean
  progress: { status: string, score: number | null } | null
}
export interface LessonFull extends LessonSummary { body: string | null, items: LessonItem[] }
export interface DailySlot {
  slot: number
  type: string
  type_label: string
  lesson: { slug: string, level: string, title: string, duration_minutes: number } | null
  done_today: boolean
}
export interface DailyPlan { level: string, level_label: string, slots: DailySlot[], minutes: number, done_today: number, total: number, streak: number }
export interface LevelProgress { level: string, label: string, total: number, completed: number, percent: number }
export interface ItalianProgress { levels: LevelProgress[], streak: number, completed_today: boolean }
export interface ItalianMeta { types: Option[], scenarios: Option[] }

// ------------------------------------------------------------------ Patente
export interface PatenteItem { slug: string, title: string, summary: string | null, locale: LocaleCode, fallback: boolean, source: GuideSource, body?: string | null }
export interface PatenteTopic extends PatenteItem { question_count: number }
export interface PatenteRules { questions: number, max_errors: number, minutes: number, late_grace_seconds: number, practice_max_questions: number }
export interface TopicProgress { topic: { slug: string, title: string }, answered: number, correct: number, accuracy: number | null, weak: boolean }
export interface PatenteProgress {
  summary: { exams_taken: number, exams_passed: number, average_errors: number | null, recent_pass_rate: number | null, practice_sessions: number }
  topics: TopicProgress[]
  rules: Omit<PatenteRules, 'practice_max_questions'>
}
export interface ExamQuestion { id: number, statement: string, statement_it: string | null, locale: LocaleCode }
export interface ExamRun { id: number, mode: 'exam' | 'practice', finished: false, max_errors: number | null, deadline_at: string | null, questions: ExamQuestion[] }
export interface ExamSummary { id: number, mode: 'exam' | 'practice', correct: number, errors: number, total: number, passed: boolean | null, timed_out: boolean, finished_at: string | null }
export interface ReviewItem { question_id: number, statement: string, statement_it: string | null, your_answer: boolean | null, correct_answer: boolean, correct: boolean, explanation: string | null }
export interface ExamResult extends ExamSummary { max_errors: number | null, finished: true, review: ReviewItem[] }

// --------------------------------------------------------------------- Jobs
export type MatchStatus = 'match' | 'partial' | 'mismatch' | 'unknown'
export interface MatchReason { key: string, status: MatchStatus, label: string, detail: unknown }
export interface JobMatch { score: number | null, confidence: number, reasons: MatchReason[] }
export interface Job {
  id: number
  title: string
  company: string | null
  location: string | null
  city: { slug: string, name: string } | null
  remote_mode: string
  remote_mode_label: string
  employment_type: string
  employment_type_label: string
  category: string
  category_label: string
  salary: { min: number | null, max: number | null, currency: string | null, period: string | null } | null
  italian_level: string | null
  english_level: string | null
  experience_years: number | null
  skills: string[]
  visa_sponsorship: { stated: boolean, label: string }
  source: string | null
  published_at: string | null
  expires_at: string | null
  saved: boolean
  match: JobMatch | null
  description?: string | null
  apply_url?: string | null
  apply_notice?: string
}
export interface JobsMeta { remote_modes: Option[], employment_types: Option[], categories: Option[], apply_notice: string }
export interface JobProfile {
  skills: string[]
  experience_years: number | null
  education: string | null
  remote_preference: string | null
  employment_types: string[]
  salary_min_year: number | null
  city_id: number | null
}

// ------------------------------------------------------------------- Search
export interface SearchResult {
  type: string
  type_label: string
  id: number
  slug: string | null
  title: string
  snippet: string | null
  route: string
  locale: LocaleCode | null
  meta: Record<string, string> | null
}
export interface SearchFacet { type: string, label: string, count: number }
export interface Suggestion { title: string, type: string }
