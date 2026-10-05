import { ApiError } from '~/utils/errors'
import { extractProblems, type PublishProblem } from './problems'

export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'
export const STATUSES: readonly ContentStatus[] = ['draft', 'review', 'approved', 'published', 'archived']

/** Permission needed for a transition: mirrors backend ContentPolicy::transition. */
export function neededPermission(prefix: string, from: ContentStatus, to: ContentStatus): string {
  if (from === 'draft' && to === 'review') return `${prefix}.update`
  if (to === 'published' || to === 'archived' || from === 'published') return `${prefix}.publish`
  return `${prefix}.review`
}

export interface WorkflowAction {
  to: ContentStatus
  /** i18n key `admin.workflow.action.<from>_<to>` */
  labelKey: string
  permission: string
  tone: 'primary' | 'secondary' | 'danger'
}

const TONE: Record<string, WorkflowAction['tone']> = {
  draft_review: 'primary', review_approved: 'primary', approved_published: 'primary',
  review_draft: 'secondary', approved_review: 'secondary', published_approved: 'secondary', archived_draft: 'secondary',
  published_archived: 'danger',
}

export interface WorkflowInput {
  status: ContentStatus
  allowedTransitions: readonly string[]
  prefix: string
  can: (permission: string) => boolean
}

/** Buttons to show: transitions the API allows from this status AND the user may perform. */
export function workflowActions(i: WorkflowInput): WorkflowAction[] {
  return i.allowedTransitions
    .filter((to): to is ContentStatus => (STATUSES as readonly string[]).includes(to))
    .map((to) => {
      const permission = neededPermission(i.prefix, i.status, to)
      return { to, permission, labelKey: `admin.workflow.action.${i.status}_${to}`, tone: TONE[`${i.status}_${to}`] ?? 'secondary' }
    })
    .filter(a => i.can(a.permission))
}

/** Scheduling needs an approved item and the publish permission. */
export const canSchedule = (i: Pick<WorkflowInput, 'status' | 'prefix' | 'can'>): boolean => i.status === 'approved' && i.can(`${i.prefix}.publish`)

/** Editing is possible with `.update`, unless the item is live (approved/published) and the user may not publish. */
export function editState(status: ContentStatus, prefix: string, can: (p: string) => boolean): 'editable' | 'readonly' | 'locked' {
  if (!can(`${prefix}.update`)) return 'readonly'
  if ((status === 'approved' || status === 'published') && !can(`${prefix}.publish`)) return 'locked'
  return 'editable'
}

/** Server behaviours worth warning about before saving. */
export function editWarning(status: ContentStatus, canPublish: boolean): 'review_reset' | 'live_revalidate' | null {
  if (status === 'review') return 'review_reset'
  if ((status === 'approved' || status === 'published') && canPublish) return 'live_revalidate'
  return null
}

export type TransitionFailure =
  | { kind: 'problems', problems: PublishProblem[], message: string }
  | { kind: 'four_eyes', message: string }
  | { kind: 'forbidden', message: string }
  | { kind: 'locked', message: string }
  | { kind: 'invalid_transition', message: string }
  | { kind: 'other', message: string }

/**
 * Classifies a failed workflow call. The API answers every 403 with the generic `forbidden` code, so a refused
 * approval by someone who DOES hold the review permission is the four-eyes rule (author/last editor cannot approve).
 */
export function classifyTransitionError(err: unknown, ctx: { to: ContentStatus, prefix: string, can: (p: string) => boolean }): TransitionFailure {
  const e = err as Partial<ApiError>
  const message = typeof e?.message === 'string' ? e.message : ''
  if (e?.code === 'content_not_publishable') return { kind: 'problems', problems: extractProblems(err), message }
  if (e?.code === 'content_locked') return { kind: 'locked', message }
  if (e?.code === 'invalid_status_transition' || e?.code === 'invalid_schedule') return { kind: 'invalid_transition', message }
  if (e?.status === 403) {
    return ctx.to === 'approved' && ctx.can(`${ctx.prefix}.review`)
      ? { kind: 'four_eyes', message }
      : { kind: 'forbidden', message }
  }
  return { kind: 'other', message }
}
