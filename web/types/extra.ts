/** Shapes for the T-060..T-074 endpoints (housing, explainer, articles, cities, marketplace, community, practice). */
import type { GuideSource, LocaleCode, Option, Place, SourceType } from './api'

// ---------------------------------------------------------------------- Housing checker
export interface HousingFlag { id: string, severity: 'info' | 'caution' | 'warning', title: string, explanation: string | null, basis: 'general_guidance' | 'sourced', source?: GuideSource | null }
export interface HousingQuestion extends HousingFlag { question: string | null }
export interface HousingCost {
  currency: string
  monthly_total: number | null
  components: { key: string, amount: number, source: 'text' | 'user' }[]
  one_time: { key: string, amount: number, source?: string, derived?: boolean }[]
  assumptions: { code: string, text: string }[]
}
export interface HousingResult {
  language: string | null
  facts: Record<string, unknown>
  evidence?: unknown
  red_flags: HousingFlag[]
  questions: HousingQuestion[]
  could_not_detect: { key: string, label: string }[]
  cost: HousingCost
  confidence: 'low' | 'medium' | 'high'
  notes?: { code: string, text: string }[]
  explanation: { text: string, label: string } | null
  explanation_status?: string | null
  disclaimer: string
  persisted: boolean
  saved_id: number | null
  usage?: { remaining: number | null }
}
export interface HousingSaved { id: number, label: string | null, created_at: string | null, confidence?: string, expires_at?: string | null }
export interface HousingUsage { limit: number | null, remaining: number | null }

// ---------------------------------------------------------------------- Document explainer
export interface ExplainResult {
  classification: { type: string, type_label: string, confidence: number | string | null }
  summary: string | null
  label: string
  label_text: string
  key_dates: { label: string, label_key?: string, date: string | null, text?: string | null, year_missing?: boolean, past?: boolean }[]
  suggested_actions: { type: 'reminder' | 'guide' | 'appointment', label: string, target: string, date?: string | null }[]
  language: string | null
  disclaimer: string
  sources: { title: string, url: string | null, name: string | null, type: SourceType | null, last_verified_at: string | null, ref?: string | null }[]
  degraded: boolean
  persisted: false
  usage?: { remaining: number | null }
}
export interface ExplainUsage { limit: number | null, remaining: number | null, ocr_available: boolean, max_file_kb: number, max_text_chars: number }

// ---------------------------------------------------------------------- Articles / cities
export interface ArticleSummary {
  id: number, slug: string, category: string, category_label: string, title: string, excerpt: string | null
  author_name: string | null, cover_image_url: string | null, reading_minutes: number | null
  city: Place | null, region: Place | null, locale: LocaleCode, fallback: boolean, available_locales: LocaleCode[]
  published_at: string | null, updated_at: string | null, content_type: 'editorial', source: GuideSource | null
}
export interface ArticleFull extends ArticleSummary {
  body: string | null
  tags: string[]
  seo: { title: string | null, description: string | null, canonical_path: string, alternates: LocaleCode[] }
  related_guides?: { slug: string, title: string }[]
  related_articles?: ArticleSummary[]
  disclaimer: string
}
export interface CityBlock {
  key: string, label: string, title: string, body: string | null, locale: LocaleCode, fallback: boolean
  info_type: 'official_info' | 'general_guidance', info_label: string, source: GuideSource | null
}
export interface CitySummary {
  slug: string, name: string, region: { slug: string, name: string }, headline: string | null, summary: string | null
  seo_description: string | null, locale: LocaleCode, fallback: boolean, available_locales: LocaleCode[], updated_at: string | null
}
export interface CityProfile extends CitySummary {
  blocks: CityBlock[]
  guides: { slug: string, title: string, summary: string | null, category_label: string }[]
  articles: ArticleSummary[]
  offices_count: number
  disclaimer: string
}
export interface LocalInfo { guide: string, city: string, block: CityBlock | null }

// ---------------------------------------------------------------------- Marketplace
export interface ProviderVerification { status: 'verified' | 'unverified' | 'pending' | 'expired', label: string, verified_at: string | null, valid_until: string | null }
export interface ProviderSummary {
  id: number, slug: string, category: string, category_label: string, display_name: string, headline: string | null
  city: Place | null, region: Place | null, serves_online: boolean, languages: string[]
  verification: ProviderVerification
  rating: { average: number | null, count: number }
  locale: LocaleCode, fallback: boolean, source_type: 'third_party', official: false, notice: string
}
export interface ProviderFull extends ProviderSummary {
  description: string | null, availability_note: string | null
  areas: { region: Place | null, city: Place | null }[]
  services: { name: string, description: string | null, price_from_eur: number | null }[]
  contact: { email?: string, phone?: string, website?: string }
  can_request_contact: boolean
  updated_at: string | null
}
export interface ProvidersMeta { categories: Option[], notice: string, list_unverified: boolean, sorts: string[] }
export interface ProviderReview { id: number, rating: number, body: string | null, locale: string | null, created_at: string | null, reply: { body: string, at: string | null } | null, label: string }
export interface MyReview { id: number, rating: number, body: string | null, status: 'pending' | 'approved' | 'rejected', created_at: string | null, moderation_reason: string | null, provider: { slug: string, display_name: string } }
export interface MyLead { id: number, status: string, request_type: string | null, created_at: string | null, message: string, provider: { slug: string, display_name: string }, notice?: string }
export interface PortalLead { id: number, status: 'new' | 'seen' | 'closed', request_type: string | null, message: string, contact: { name: string | null, email: string | null, phone: string | null }, preferred_language: string | null, consent_given_at: string | null, created_at: string | null }
export interface PortalReview { id: number, rating: number, body: string | null, created_at: string | null, reply: string | null, reply_status: string | null }
export interface EvidenceDoc { id: number, original_name: string, mime: string, size: number, created_at: string | null }
export interface PortalProfile {
  id?: number, slug?: string, status?: string, category: string, display_name: string
  region_id?: number | null, city_id?: number | null, serves_online?: boolean, languages?: string[]
  contact_email?: string | null, contact_phone?: string | null, website?: string | null
  show_email?: boolean, show_phone?: boolean, show_website?: boolean
  translations?: Record<string, { headline?: string | null, description?: string | null, availability_note?: string | null } | undefined>
  verification_status?: string | null
  effective_verification?: string | null
  verification_expires_at?: string | null
  has_pending_changes?: boolean
  evidence_count?: number
  publish_problems?: { code: string, field?: string }[]
  pending_changes?: unknown
  [k: string]: unknown
}

// ---------------------------------------------------------------------- Community
export interface CommunityMeta { topics: { value: string, label: string, sensitive: boolean }[], notice: string, limits: Record<string, number>, sorts: string[] }
export interface CommunityPost { id: number, mine: boolean, status: 'pending' | 'approved' | 'hidden' | null, locale: string | null, created_at: string | null, source_type: 'third_party', verified: false }
export interface CommunityComment extends CommunityPost { body: string }
export interface CommunityAnswer extends CommunityPost { body: string, votes: number, accepted: boolean, voted: boolean, label: string, comments: CommunityComment[] }
export interface CommunityQuestion extends CommunityPost {
  title: string, topic: string | null, topic_label: string | null, city: { slug: string, name: string } | null, tags: string[]
  votes: number, answers_count: number, answered: boolean, sensitive: boolean, label: string, notice?: string
  official_guide: { slug: string, title: string, path: string } | null
  excerpt?: string, body?: string
  voted?: boolean, comments?: CommunityComment[], answers?: CommunityAnswer[]
}

// ---------------------------------------------------------------------- Italian practice
export interface ReviewMeta { reviewed: boolean, reviewed_at: string | null, review_notice: string | null }
export interface Vocabulary extends ReviewMeta {
  slug: string, lemma: string, part_of_speech: string | null, level: string, level_label: string, category: string | null, category_label: string | null
  gloss: string | null, example_it: string | null, example_gloss: string | null, locale: LocaleCode, fallback: boolean
  audio: { url: string, rights_note: string | null } | null
  progress: { box: number, due_at: string } | null
}
export interface ReviewCard extends Vocabulary { box: number, new: boolean }
export interface LeitnerStats { boxes: { box: number, cards: number }[], cards_learning: number, mastered: number, due_now: number, accuracy: number | null }
export interface ReviewQueue { cards: ReviewCard[], stats: LeitnerStats }
export interface Scenario { value: string, label: string, lessons: number, vocabulary: number, exercises: number }
export type ExerciseKind = 'multiple_choice' | 'fill_blank' | 'match' | 'listening'
export interface Exercise extends ReviewMeta {
  slug: string, type: ExerciseKind, type_label: string, level: string, level_label: string, scenario: string | null, scenario_label: string | null
  vocabulary: string | null, prompt: string | null, locale: LocaleCode, fallback: boolean
  audio: { url: string, rights_note: string | null } | null
  form: {
    stem?: string | null
    choices?: { index: number, text: string }[]
    sentence?: string
    left?: { index: number, text: string }[]
    right?: { id: number, text: string }[]
  }
}
export interface AttemptResult { correct: boolean, correct_answer: unknown, explanation: string | null, vocabulary: { slug: string, box: number, due_at: string } | null }
export interface PracticeProgress { vocabulary: LeitnerStats, exercises: { attempts: number, correct: number, accuracy: number | null } }

// ---------------------------------------------------------------------- Patente learning
export interface WeakTopicRow { topic: { slug: string, title: string }, answered: number, correct: number, accuracy: number | null, weak: boolean, available_questions: number }
export interface WeakTopics { threshold: number, min_answers: number, weak: WeakTopicRow[], untouched: WeakTopicRow[], recommended: string | null }
export interface PracticeCheck { question_id: number, correct: boolean, correct_answer: boolean, explanation: string | null, explanations: Partial<Record<LocaleCode, string>> }

export type { SourceType }

// ------------------------------------------------ recommendations / money / travel (RA pass)
export interface RecReason { code: string, text: string }
export interface RecGuide { type: 'guide', slug: string, title: string, route: string, reason: RecReason }
export interface RecLesson { type: 'lesson', slug: string, title: string, route: string, reason: RecReason }
export interface RecService { type: 'service', slug: string, title: string, route: string, label: 'third_party', verification: 'verified' | 'unverified' | 'pending' | 'expired', reason: RecReason }
export interface RecReminder { type: 'reminder', document_id: number, title: string, route: string, reason: RecReason }
export interface Recommendations {
  personalization: { enabled: boolean }
  guides: RecGuide[]
  lessons: RecLesson[]
  services: RecService[]
  reminders: RecReminder[]
}

export interface NetBracket { from: number, to: number | null, rate: number, taxable: number, tax: number }
export interface NetEstimate {
  gross_annual: number
  contributions: number
  deduction: number
  taxable_income: number
  income_tax: number
  brackets: NetBracket[]
  net_annual: number
  months: number
  net_monthly: number
}
export interface NetSalaryUnavailable { available: false, reason: string, message: string }
export interface NetSalaryResult { available: true, tax_year: number, estimate: NetEstimate, table: { name: string | null, source: GuideSource }, disclaimer: string }
export type NetSalaryResponse = NetSalaryUnavailable | NetSalaryResult

export interface TravelItem { slug: string, nationality: string, residence_status: string, title: string | null, summary: string | null, requirements: string | null, notes: string | null, source: GuideSource }
export interface TravelResponse { available: boolean, nationality: string, destination: string, residence_status: string | null, message: string | null, disclaimer: string, items: TravelItem[] }
export interface CountryOption { code: string, name: string }
