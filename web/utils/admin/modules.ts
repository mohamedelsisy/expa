/**
 * Schema for every lifecycle content module. ONE generic workspace (list, form, workflow) renders all of them.
 * Labels are i18n keys: attribute `admin.fields.<key>`, help `admin.help.<key>`, enum option `admin.enums.<enum>.<value>`,
 * module `admin.modules.<key>`. Max lengths mirror backend/app/Http/Requests/*Request.php (tests compare them).
 */
export type Loc = 'ar' | 'en' | 'it'
export const LOCALE_CODES: readonly Loc[] = ['ar', 'en', 'it'] as const

export const ENUMS: Record<string, readonly string[]> = {
  sourceType: ['official', 'institutional', 'verified_partner', 'third_party'],
  guideCategory: ['immigration', 'documents', 'work', 'study', 'housing', 'healthcare', 'money', 'business', 'family', 'daily_life', 'driving', 'travel', 'legal', 'language'],
  serviceDomain: ['immigration', 'tax', 'health', 'civil_registry', 'social_security', 'identity', 'transport', 'postal', 'education', 'labor', 'other'],
  officeType: ['questura', 'prefettura', 'comune', 'anagrafe', 'asl', 'inps', 'agenzia_entrate', 'poste', 'motorizzazione', 'university', 'other'],
  bookingMethod: ['online', 'phone', 'email', 'in_person', 'unknown'],
  lessonLevel: ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'],
  cefr: ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
  lessonType: ['vocabulary', 'grammar', 'conversation', 'pronunciation', 'mission'],
  scenario: ['comune', 'doctor', 'pharmacy', 'bank', 'work', 'job_interview', 'landlord', 'restaurant', 'supermarket', 'police', 'post_office', 'immigration_office', 'everyday'],
  degreeLevel: ['bachelor', 'master', 'phd', 'short', 'language_course'],
  studyField: ['engineering', 'computer_science', 'medicine', 'economics', 'law', 'humanities', 'arts_design', 'sciences', 'architecture', 'education', 'languages', 'other'],
  universityKind: ['public', 'private', 'other'],
  instructionLanguage: ['en', 'it', 'both'],
  contentStatus: ['draft', 'review', 'approved', 'published', 'archived'],
  freshness: ['fresh', 'stale', 'outdated', 'unverified'],
  articleCategory: ['news', 'immigration', 'work', 'study', 'housing', 'healthcare', 'money', 'daily_life', 'culture', 'city_life', 'tips'],
  cityBlockKey: ['overview', 'transport', 'housing', 'healthcare', 'work', 'study', 'bureaucracy', 'daily_life', 'costs'],
  infoType: ['official_info', 'general_guidance'],
  legalSlug: ['privacy', 'terms', 'cookies'],
  providerCategory: ['translator', 'interpreter', 'caf', 'patronato', 'commercialista', 'lawyer', 'moving', 'cleaning', 'babysitter', 'relocation', 'driving_school'],
  housingKind: ['red_flag', 'question'],
  housingSignal: ['deposit_mentioned', 'utilities_included', 'utilities_excluded', 'utilities_stated', 'agency_fee_mentioned', 'registration_mentioned', 'unregistered_mentioned', 'cedolare_secca_mentioned', 'notice_period_mentioned', 'cash_payment_mentioned', 'no_contract_mentioned', 'written_contract_mentioned', 'advance_payment_mentioned', 'pressure_language', 'contract_type_4_4', 'contract_type_3_2', 'contract_type_transitory', 'contract_type_student', 'rent_monthly', 'deposit_amount', 'deposit_months', 'expenses_monthly', 'agency_fee_amount', 'notice_period_months'],
  housingCondition: ['present', 'absent', 'gt', 'lt'],
  housingSeverity: ['info', 'caution', 'warning'],
  housingBasis: ['general_guidance', 'sourced'],
  partOfSpeech: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'other'],
  vocabCategory: ['comune', 'doctor', 'pharmacy', 'bank', 'work', 'job_interview', 'landlord', 'restaurant', 'supermarket', 'police', 'post_office', 'immigration_office', 'everyday', 'patente', 'general'],
  exerciseType: ['multiple_choice', 'fill_blank', 'match', 'listening'],
  licenseType: ['original_work', 'licensed', 'official_permission', 'creative_commons', 'public_domain'],
}

/** `tags`: comma-separated text <-> array of strings. `json`: JSON text <-> object. `blocks`: city blocks editor (JSON text <-> array). */
export type AttrType = 'text' | 'textarea' | 'number' | 'select' | 'bool' | 'date' | 'url' | 'email' | 'multiselect' | 'relation' | 'tags' | 'json' | 'blocks' | 'brackets'
export type RelationKind = 'university' | 'topic' | 'guide' | 'offices' | 'city'

export interface AttrField {
  key: string
  type: AttrType
  /** Required when creating (API `required`). */
  required?: boolean
  /** With `required`: not needed when this other attribute is filled (API `required_without`). */
  requiredWithout?: string
  /** The API accepts `null`: an emptied field is sent as null. Otherwise an empty field is omitted. */
  nullable?: boolean
  enum?: string
  relation?: RelationKind
  maxLength?: number
  min?: number
  max?: number
  /** Latin-only values (urls, emails, codes) stay LTR inside RTL pages. */
  ltr?: boolean
  help?: boolean
  rows?: number
  pattern?: string
  /** Value is upper-cased before sending (ISO country codes). */
  upper?: boolean
}

export type TranslatableType = 'text' | 'textarea' | 'list' | 'steps' | 'items'
export interface ItemField { key: string, max: number, required?: boolean, italian?: boolean }
export interface TranslatableField {
  key: string
  type: TranslatableType
  /** text/textarea: max characters. list: max characters per entry. steps: max characters of a step's text. */
  max: number
  /** steps only: max characters of a step's title. */
  titleMax?: number
  /** list/steps/items: max number of entries. */
  maxItems?: number
  /** items only. */
  itemFields?: ItemField[]
  rows?: number
  /** Part of the API's "required to publish" set (PublishGuard). */
  requiredToPublish?: boolean
}

export interface FilterDef {
  key: string
  /** enum options are `admin.enums.<enum>.<value>`; relation loads options from the API. */
  type: 'enum' | 'relation'
  enum?: string
  relation?: RelationKind
}

export interface ContentModule {
  /** URL segment: /admin/content/<key> */
  key: string
  /** API path below the API base, e.g. admin/guides */
  endpoint: string
  /** Policy permission prefix: `<p>.view|create|update|delete|review|publish`. */
  permission: string
  icon: string
  /** Translated field that identifies an item (and is required in every filled locale). */
  primary: string
  primaryMax: number
  attributes: AttrField[]
  translatable: TranslatableField[]
  /** Shows region/city selects. */
  place: boolean
  /** Source metadata required before publishing (PublishGuard). */
  sourceRequired: boolean
  /** Locales that must be filled before publishing. */
  requiredLocales: readonly Loc[]
  filters: FilterDef[]
  sortable: string[]
  /** Attribute columns shown in the list (after the title). */
  columns: string[]
  /** The slug is derived by the API (city profiles mirror the city slug): no slug input. */
  hideSlug?: boolean
  /** Teacher review actions (`POST|DELETE {endpoint}/{id}/teacher-review`). */
  teacherReview?: boolean
  /** Provider listings: approve/reject edits waiting on a live listing. */
  pendingChanges?: boolean
  /** The backend model has no source columns (third-party providers): the source card is not shown. */
  noSource?: boolean
}

const t = (key: string, max: number, extra: Partial<TranslatableField> = {}): TranslatableField => ({ key, type: 'text', max, ...extra })
const ta = (key: string, max: number, rows = 4, extra: Partial<TranslatableField> = {}): TranslatableField => ({ key, type: 'textarea', max, rows, ...extra })
const stepsField: TranslatableField = { key: 'steps', type: 'steps', max: 1500, titleMax: 200, maxItems: 50 }
const docsField: TranslatableField = { key: 'required_documents', type: 'list', max: 300, maxItems: 50 }
const BASE_SORTABLE = ['id', 'slug', 'status', 'updated_at', 'last_verified_at']
const typeFilter = (key: string, en: string): FilterDef => ({ key, type: 'enum', enum: en })

const guides: ContentModule = {
  key: 'guides', endpoint: 'admin/guides', permission: 'guides', icon: 'book', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'category', type: 'select', enum: 'guideCategory', required: true },
    { key: 'italian_term', type: 'text', maxLength: 255, nullable: true, ltr: true, help: true },
  ],
  translatable: [
    t('title', 255, { requiredToPublish: true }),
    ta('summary', 5000, 3, { requiredToPublish: true }),
    ta('what_is', 5000, 5, { requiredToPublish: true }),
    ta('who_needs', 5000, 4),
    docsField, stepsField,
    ta('where_to_apply', 5000, 4), ta('how_to_book', 5000, 4), ta('costs', 5000, 3),
    t('processing_time', 255),
    ta('body', 50000, 10),
  ],
  place: true, sourceRequired: true, requiredLocales: ['ar'],
  filters: [typeFilter('category', 'guideCategory')],
  sortable: [...BASE_SORTABLE, 'category'], columns: ['category'],
}

const services: ContentModule = {
  key: 'government-services', endpoint: 'admin/government/services', permission: 'government_services', icon: 'building', primary: 'name', primaryMax: 255,
  attributes: [
    { key: 'domain', type: 'select', enum: 'serviceDomain', required: true },
    { key: 'italian_term', type: 'text', maxLength: 255, nullable: true, ltr: true, help: true },
    { key: 'guide_id', type: 'relation', relation: 'guide', nullable: true },
    { key: 'office_ids', type: 'relation', relation: 'offices' },
  ],
  translatable: [
    t('name', 255, { requiredToPublish: true }),
    ta('summary', 5000, 3, { requiredToPublish: true }),
    ta('how_to_apply', 10000, 6, { requiredToPublish: true }),
    ta('notes', 5000, 3),
    docsField,
  ],
  place: true, sourceRequired: true, requiredLocales: ['ar'],
  filters: [typeFilter('domain', 'serviceDomain')],
  sortable: BASE_SORTABLE, columns: ['domain'],
}

const offices: ContentModule = {
  key: 'government-offices', endpoint: 'admin/government/offices', permission: 'government_offices', icon: 'map', primary: 'name', primaryMax: 255,
  attributes: [
    { key: 'office_type', type: 'select', enum: 'officeType', required: true },
    { key: 'booking_method', type: 'select', enum: 'bookingMethod' },
    { key: 'address', type: 'text', maxLength: 255, nullable: true },
    { key: 'postal_code', type: 'text', maxLength: 5, nullable: true, ltr: true, pattern: '\\d{5}' },
    { key: 'phone', type: 'text', maxLength: 40, nullable: true, ltr: true, pattern: '[+0-9 ().\\/\\-]+' },
    { key: 'email', type: 'email', maxLength: 255, nullable: true, ltr: true },
    { key: 'official_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
    { key: 'booking_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
  ],
  translatable: [t('name', 255, { requiredToPublish: true }), ta('opening_hours', 2000, 3), ta('notes', 5000, 3)],
  place: true, sourceRequired: true, requiredLocales: ['ar'],
  filters: [typeFilter('office_type', 'officeType')],
  sortable: BASE_SORTABLE, columns: ['office_type'],
}

const appointments: ContentModule = {
  key: 'appointment-guides', endpoint: 'admin/appointments/guides', permission: 'appointment_guides', icon: 'calendar', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'office_type', type: 'select', enum: 'officeType', required: true },
    { key: 'booking_method', type: 'select', enum: 'bookingMethod' },
    { key: 'booking_portal_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
  ],
  translatable: [
    t('title', 255, { requiredToPublish: true }),
    ta('summary', 5000, 3, { requiredToPublish: true }),
    ta('tips', 5000, 3), ta('cautions', 5000, 3),
    stepsField,
  ],
  place: false, sourceRequired: true, requiredLocales: ['ar'],
  filters: [typeFilter('office_type', 'officeType')],
  sortable: BASE_SORTABLE, columns: ['office_type'],
}

const lessons: ContentModule = {
  key: 'italian-lessons', endpoint: 'admin/italian/lessons', permission: 'italian_lessons', icon: 'sparkle', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'level', type: 'select', enum: 'lessonLevel', required: true },
    { key: 'type', type: 'select', enum: 'lessonType', required: true },
    { key: 'scenario', type: 'select', enum: 'scenario', nullable: true },
    { key: 'duration_minutes', type: 'number', min: 1, max: 30 },
  ],
  translatable: [
    t('title', 255, { requiredToPublish: true }),
    ta('summary', 2000, 3),
    ta('body', 20000, 8),
    {
      key: 'items', type: 'items', max: 500, maxItems: 100,
      itemFields: [
        { key: 'it', max: 500, required: true, italian: true },
        { key: 'gloss', max: 500 },
        { key: 'example_it', max: 500, italian: true },
        { key: 'example_gloss', max: 500 },
        { key: 'speaker', max: 50 },
        { key: 'tip', max: 500 },
        { key: 'phonetic', max: 200, italian: true },
      ],
    },
  ],
  place: false, sourceRequired: false, requiredLocales: ['ar'],
  filters: [typeFilter('level', 'lessonLevel'), typeFilter('type', 'lessonType')],
  sortable: [...BASE_SORTABLE, 'level', 'type', 'sort_order'], columns: ['level', 'type'],
}

const pCategories: ContentModule = {
  key: 'patente-categories', endpoint: 'admin/patente/categories', permission: 'patente', icon: 'car', primary: 'title', primaryMax: 255,
  attributes: [],
  translatable: [t('title', 255, { requiredToPublish: true }), ta('summary', 3000, 3, { requiredToPublish: true }), ta('body', 50000, 8)],
  place: false, sourceRequired: true, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: [],
}

const pTopics: ContentModule = { ...pCategories, key: 'patente-topics', endpoint: 'admin/patente/topics' }

const pQuestions: ContentModule = {
  key: 'patente-questions', endpoint: 'admin/patente/questions', permission: 'patente', icon: 'help', primary: 'statement', primaryMax: 1000,
  attributes: [
    { key: 'patente_topic_id', type: 'relation', relation: 'topic', required: true },
    { key: 'is_true', type: 'bool', required: true },
    { key: 'rights_note', type: 'textarea', required: true, requiredWithout: 'license_type', maxLength: 500, rows: 2, help: true, nullable: true },
    { key: 'license_type', type: 'select', enum: 'licenseType', nullable: true, help: true },
    { key: 'rights_holder', type: 'text', maxLength: 255, nullable: true },
    { key: 'license_proof_ref', type: 'text', maxLength: 500, nullable: true, help: true },
  ],
  translatable: [t('statement', 1000, { requiredToPublish: true }), ta('explanation', 3000, 3)],
  place: false, sourceRequired: true, requiredLocales: ['it', 'ar'],
  filters: [{ key: 'topic_id', type: 'relation', relation: 'topic' }],
  sortable: BASE_SORTABLE, columns: ['is_true'],
}

const universities: ContentModule = {
  key: 'study-universities', endpoint: 'admin/study/universities', permission: 'universities', icon: 'building', primary: 'name', primaryMax: 255,
  attributes: [
    { key: 'kind', type: 'select', enum: 'universityKind' },
    { key: 'website', type: 'url', maxLength: 2048, nullable: true, ltr: true },
  ],
  translatable: [t('name', 255, { requiredToPublish: true }), ta('summary', 5000, 3, { requiredToPublish: true }), ta('notes', 5000, 3)],
  place: true, sourceRequired: true, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: ['kind'],
}

const programs: ContentModule = {
  key: 'study-programs', endpoint: 'admin/study/programs', permission: 'universities', icon: 'book', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'university_id', type: 'relation', relation: 'university', required: true },
    { key: 'degree_level', type: 'select', enum: 'degreeLevel', required: true },
    { key: 'field', type: 'select', enum: 'studyField', required: true },
    { key: 'instruction_language', type: 'select', enum: 'instructionLanguage', required: true },
    { key: 'duration_years', type: 'number', nullable: true, min: 1, max: 10 },
    { key: 'tuition_min_year', type: 'number', nullable: true, min: 0, max: 200000 },
    { key: 'tuition_max_year', type: 'number', nullable: true, min: 0, max: 200000 },
    { key: 'required_italian_level', type: 'select', enum: 'cefr', nullable: true },
    { key: 'required_english_level', type: 'select', enum: 'cefr', nullable: true },
    { key: 'application_deadline', type: 'date', nullable: true },
    { key: 'program_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
  ],
  translatable: [
    t('title', 255, { requiredToPublish: true }),
    ta('summary', 5000, 3, { requiredToPublish: true }),
    ta('admission_requirements', 10000, 5),
    ta('notes', 5000, 3),
  ],
  place: false, sourceRequired: true, requiredLocales: ['ar'],
  filters: [{ key: 'university_id', type: 'relation', relation: 'university' }, typeFilter('degree_level', 'degreeLevel')],
  sortable: BASE_SORTABLE, columns: ['degree_level'],
}

const scholarships: ContentModule = {
  key: 'study-scholarships', endpoint: 'admin/study/scholarships', permission: 'universities', icon: 'euro', primary: 'name', primaryMax: 255,
  attributes: [
    { key: 'degree_levels', type: 'multiselect', enum: 'degreeLevel', nullable: true, max: 5 },
    { key: 'deadline', type: 'date', nullable: true },
    { key: 'apply_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
  ],
  translatable: [t('name', 255, { requiredToPublish: true }), ta('summary', 5000, 3, { requiredToPublish: true }), ta('eligibility', 5000, 3), ta('how_to_apply', 5000, 3)],
  place: false, sourceRequired: true, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: [],
}


const legal: ContentModule = {
  key: 'legal-documents', endpoint: 'admin/legal', permission: 'legal', icon: 'file', primary: 'title', primaryMax: 255,
  attributes: [{ key: 'version', type: 'text', required: true, maxLength: 20, ltr: true, pattern: '[A-Za-z0-9][A-Za-z0-9._-]*', help: true }],
  translatable: [t('title', 255, { requiredToPublish: true }), ta('body', 200000, 16, { requiredToPublish: true })],
  place: false, sourceRequired: false, requiredLocales: ['ar'], filters: [], sortable: [...BASE_SORTABLE, 'version'], columns: ['version'],
}

const articles: ContentModule = {
  key: 'articles', endpoint: 'admin/articles', permission: 'articles', icon: 'list', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'category', type: 'select', enum: 'articleCategory', required: true },
    { key: 'author_name', type: 'text', maxLength: 120, nullable: true },
    { key: 'cover_image_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
    { key: 'reading_minutes', type: 'number', nullable: true, min: 1, max: 240 },
    { key: 'tags', type: 'tags', help: true },
    { key: 'related_guides', type: 'tags', help: true },
  ],
  translatable: [t('title', 255, { requiredToPublish: true }), ta('excerpt', 500, 3, { requiredToPublish: true }), ta('body', 60000, 14, { requiredToPublish: true }), t('seo_title', 70), t('seo_description', 200)],
  place: true, sourceRequired: false, requiredLocales: ['ar'],
  filters: [typeFilter('category', 'articleCategory')], sortable: [...BASE_SORTABLE, 'category'], columns: ['category'],
}

const cityProfiles: ContentModule = {
  key: 'city-profiles', endpoint: 'admin/city-profiles', permission: 'cities', icon: 'map', primary: 'headline', primaryMax: 255, hideSlug: true,
  attributes: [
    { key: 'city_id', type: 'relation', relation: 'city', required: true },
    { key: 'blocks', type: 'blocks', help: true },
  ],
  translatable: [t('headline', 255, { requiredToPublish: true }), ta('summary', 2000, 3, { requiredToPublish: true }), t('seo_description', 200)],
  place: false, sourceRequired: false, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: [],
}

const providers: ContentModule = {
  key: 'marketplace-providers', endpoint: 'admin/marketplace/providers', permission: 'providers', icon: 'user', primary: 'headline', primaryMax: 255, pendingChanges: true,
  attributes: [
    { key: 'category', type: 'select', enum: 'providerCategory', required: true },
    { key: 'display_name', type: 'text', required: true, maxLength: 160 },
    { key: 'owner_user_id', type: 'number', min: 1 },
    { key: 'serves_online', type: 'bool' },
    { key: 'languages', type: 'tags', help: true },
    { key: 'contact_email', type: 'email', maxLength: 190, nullable: true, ltr: true },
    { key: 'contact_phone', type: 'text', maxLength: 25, nullable: true, ltr: true },
    { key: 'website', type: 'url', maxLength: 2048, nullable: true, ltr: true },
    { key: 'show_email', type: 'bool' }, { key: 'show_phone', type: 'bool' }, { key: 'show_website', type: 'bool' },
    { key: 'commission_percent', type: 'number', nullable: true, min: 0, max: 100, help: true },
    { key: 'commission_note', type: 'text', maxLength: 255, nullable: true },
  ],
  translatable: [t('headline', 255, { requiredToPublish: true }), ta('description', 5000, 5), t('availability_note', 500)],
  place: true, noSource: true, sourceRequired: false, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: ['category'],
}

const housingRules: ContentModule = {
  key: 'housing-rules', endpoint: 'admin/housing/rules', permission: 'housing_rules', icon: 'home', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'kind', type: 'select', enum: 'housingKind', required: true },
    { key: 'signal', type: 'select', enum: 'housingSignal', required: true },
    { key: 'condition', type: 'select', enum: 'housingCondition', required: true },
    { key: 'threshold', type: 'number', nullable: true, min: 0, max: 1000000, help: true },
    { key: 'severity', type: 'select', enum: 'housingSeverity' },
    { key: 'basis', type: 'select', enum: 'housingBasis', help: true },
  ],
  translatable: [t('title', 255, { requiredToPublish: true }), ta('explanation', 3000, 4, { requiredToPublish: true }), ta('question', 500, 2)],
  place: false, sourceRequired: false, requiredLocales: ['ar'],
  filters: [typeFilter('kind', 'housingKind')], sortable: BASE_SORTABLE, columns: ['kind', 'severity'],
}

const vocabulary: ContentModule = {
  key: 'italian-vocabulary', endpoint: 'admin/italian/vocabulary', permission: 'italian_lessons', icon: 'book', primary: 'gloss', primaryMax: 255, teacherReview: true,
  attributes: [
    { key: 'lemma', type: 'text', required: true, maxLength: 150, ltr: true },
    { key: 'part_of_speech', type: 'select', enum: 'partOfSpeech', nullable: true },
    { key: 'level', type: 'select', enum: 'lessonLevel', required: true },
    { key: 'category', type: 'select', enum: 'vocabCategory', nullable: true },
    { key: 'example_it', type: 'textarea', maxLength: 500, rows: 2, nullable: true, ltr: true },
    { key: 'audio_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
    { key: 'audio_rights_note', type: 'text', maxLength: 500, nullable: true, help: true },
  ],
  translatable: [t('gloss', 255, { requiredToPublish: true }), ta('example_gloss', 500, 2)],
  place: false, sourceRequired: false, requiredLocales: ['ar'],
  filters: [typeFilter('level', 'lessonLevel')], sortable: [...BASE_SORTABLE, 'level'], columns: ['lemma', 'level'],
}

const exercises: ContentModule = {
  key: 'italian-exercises', endpoint: 'admin/italian/exercises', permission: 'italian_lessons', icon: 'help', primary: 'prompt', primaryMax: 255, teacherReview: true,
  attributes: [
    { key: 'type', type: 'select', enum: 'exerciseType', required: true },
    { key: 'level', type: 'select', enum: 'lessonLevel', required: true },
    { key: 'scenario', type: 'select', enum: 'scenario', nullable: true },
    { key: 'italian_vocabulary_id', type: 'number', nullable: true, min: 1 },
    { key: 'content', type: 'json', required: true, help: true },
    { key: 'audio_url', type: 'url', maxLength: 2048, nullable: true, ltr: true },
    { key: 'audio_rights_note', type: 'text', maxLength: 500, nullable: true, help: true },
  ],
  translatable: [t('prompt', 255, { requiredToPublish: true }), ta('explanation', 2000, 3), { key: 'options', type: 'list', max: 200, maxItems: 10 }],
  place: false, sourceRequired: false, requiredLocales: ['ar'],
  filters: [typeFilter('type', 'exerciseType'), typeFilter('level', 'lessonLevel')], sortable: [...BASE_SORTABLE, 'level', 'type'], columns: ['type', 'level'],
}

const taxTables: ContentModule = {
  key: 'tax-tables', endpoint: 'admin/money/tax-tables', permission: 'tax_tables', icon: 'euro', primary: 'name', primaryMax: 255,
  attributes: [
    { key: 'tax_year', type: 'number', required: true, min: 2000, max: 2100, help: true },
    { key: 'contribution_rate', type: 'number', nullable: true, min: 0, max: 100, help: true },
    { key: 'contribution_ceiling', type: 'number', nullable: true, min: 0, max: 100000000 },
    { key: 'deduction_flat', type: 'number', min: 0, max: 100000000 },
    { key: 'brackets', type: 'brackets', required: true, help: true },
  ],
  translatable: [t('name', 255, { requiredToPublish: true }), ta('notes', 3000, 3)],
  place: false, sourceRequired: true, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: ['tax_year'],
}

const travelRequirements: ContentModule = {
  key: 'travel-requirements', endpoint: 'admin/travel/requirements', permission: 'travel_requirements', icon: 'globe', primary: 'title', primaryMax: 255,
  attributes: [
    { key: 'nationality', type: 'text', required: true, maxLength: 2, ltr: true, upper: true, pattern: '[A-Z]{2}|\\*', help: true },
    { key: 'destination', type: 'text', required: true, maxLength: 2, ltr: true, upper: true, pattern: '[A-Z]{2}' },
    { key: 'residence_status', type: 'text', maxLength: 40, ltr: true, pattern: '[a-z_]{2,40}', help: true },
  ],
  translatable: [t('title', 255, { requiredToPublish: true }), ta('summary', 1000, 3, { requiredToPublish: true }), ta('requirements', 5000, 6), ta('notes', 3000, 3)],
  place: false, sourceRequired: true, requiredLocales: ['ar'], filters: [], sortable: BASE_SORTABLE, columns: ['nationality', 'destination'],
}

export const CONTENT_MODULES: readonly ContentModule[] = [guides, services, offices, appointments, lessons, pCategories, pTopics, pQuestions, universities, programs, scholarships, legal, articles, cityProfiles, providers, housingRules, vocabulary, exercises, taxTables, travelRequirements]

export function moduleByKey(key: unknown): ContentModule | undefined {
  return CONTENT_MODULES.find(m => m.key === key)
}

/** Source metadata shared by every module (the `source_*` columns). */
export const SOURCE_FIELDS: AttrField[] = [
  { key: 'source_name', type: 'text', maxLength: 255, nullable: true },
  { key: 'source_url', type: 'url', maxLength: 2048, nullable: true, ltr: true, help: true },
  { key: 'source_type', type: 'select', enum: 'sourceType', nullable: true, help: true },
  { key: 'last_verified_at', type: 'date', nullable: true, help: true },
]
/** Always-present attributes. */
export const COMMON_FIELDS: AttrField[] = [
  { key: 'slug', type: 'text', required: true, maxLength: 120, ltr: true, pattern: '[a-z0-9]+(?:-[a-z0-9]+)*', help: true },
  { key: 'sort_order', type: 'number', min: 0, max: 100000 },
]
export const PLACE_FIELDS: AttrField[] = [
  { key: 'region_id', type: 'number', nullable: true },
  { key: 'city_id', type: 'number', nullable: true },
]

/** Every i18n key a module needs (labels, help, enum options, module name); used by the integrity test. */
export function moduleLabelKeys(m: ContentModule): string[] {
  const keys = new Set<string>([`admin.modules.${m.key}`, `admin.modules.${m.key}Singular`])
  for (const f of [...COMMON_FIELDS, ...SOURCE_FIELDS, ...(m.place ? PLACE_FIELDS : []), ...m.attributes]) {
    keys.add(`admin.fields.${f.key}`)
    if (f.help) keys.add(`admin.help.${f.key}`)
    if (f.enum) for (const v of ENUMS[f.enum]!) keys.add(`admin.enums.${f.enum}.${v}`)
  }
  for (const f of m.translatable) {
    keys.add(`admin.fields.${f.key}`)
    for (const i of f.itemFields ?? []) keys.add(`admin.fields.item_${i.key}`)
  }
  for (const f of m.filters) {
    keys.add(`admin.fields.${f.key}`)
    if (f.enum) for (const v of ENUMS[f.enum]!) keys.add(`admin.enums.${f.enum}.${v}`)
  }
  return [...keys]
}
