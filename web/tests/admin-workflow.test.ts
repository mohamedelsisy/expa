import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { canSchedule, classifyTransitionError, editState, editWarning, neededPermission, workflowActions, type ContentStatus } from '../utils/admin/workflow'
import { ApiError } from '../utils/errors'
import WorkflowBar from '../components/admin/WorkflowBar.vue'

const ALLOWED: Record<ContentStatus, string[]> = { draft: ['review'], review: ['draft', 'approved'], approved: ['review', 'published'], published: ['approved', 'archived'], archived: ['draft'] }
const set = (...p: string[]) => (x: string) => p.includes(x)
const editor = set('guides.view', 'guides.create', 'guides.update')
const manager = set('guides.view', 'guides.create', 'guides.update', 'guides.delete', 'guides.review', 'guides.publish')
const reviewer = set('guides.view', 'guides.review')
const readOnly = set('guides.view')
const btns = (status: ContentStatus, can: (p: string) => boolean) => workflowActions({ status, allowedTransitions: ALLOWED[status], prefix: 'guides', can }).map(a => a.to)

describe('workflow button logic', () => {
  it('maps transitions to the permission the API policy needs', () => {
    expect(neededPermission('guides', 'draft', 'review')).toBe('guides.update')
    expect(neededPermission('guides', 'review', 'approved')).toBe('guides.review')
    expect(neededPermission('guides', 'review', 'draft')).toBe('guides.review')
    expect(neededPermission('guides', 'approved', 'published')).toBe('guides.publish')
    expect(neededPermission('guides', 'published', 'approved')).toBe('guides.publish')
    expect(neededPermission('guides', 'published', 'archived')).toBe('guides.publish')
    expect(neededPermission('guides', 'archived', 'draft')).toBe('guides.review')
  })
  it('editor can only submit drafts for review', () => {
    expect(btns('draft', editor)).toEqual(['review'])
    expect(btns('review', editor)).toEqual([])
    expect(btns('approved', editor)).toEqual([])
    expect(btns('published', editor)).toEqual([])
  })
  it('reviewer approves/rejects but never publishes', () => {
    expect(btns('review', reviewer)).toEqual(['draft', 'approved'])
    expect(btns('approved', reviewer)).toEqual(['review'])
    expect(btns('published', reviewer)).toEqual([])
  })
  it('content manager gets everything the API allows', () => {
    expect(btns('draft', manager)).toEqual(['review'])
    expect(btns('review', manager)).toEqual(['draft', 'approved'])
    expect(btns('approved', manager)).toEqual(['review', 'published'])
    expect(btns('published', manager)).toEqual(['approved', 'archived'])
    expect(btns('archived', manager)).toEqual(['draft'])
  })
  it('read-only users see no buttons', () => {
    for (const s of Object.keys(ALLOWED) as ContentStatus[]) expect(btns(s, readOnly)).toEqual([])
  })
  it('ignores transitions the API did not list and unknown targets', () => {
    expect(workflowActions({ status: 'draft', allowedTransitions: ['published', 'bogus'], prefix: 'guides', can: manager }).map(a => a.to)).toEqual(['published'])
  })
  it('scheduling needs approved status and publish permission', () => {
    expect(canSchedule({ status: 'approved', prefix: 'guides', can: manager })).toBe(true)
    expect(canSchedule({ status: 'approved', prefix: 'guides', can: reviewer })).toBe(false)
    expect(canSchedule({ status: 'draft', prefix: 'guides', can: manager })).toBe(false)
  })
  it('edit state: read-only, locked (live content without publish), editable', () => {
    expect(editState('draft', 'guides', readOnly)).toBe('readonly')
    expect(editState('published', 'guides', editor)).toBe('locked')
    expect(editState('approved', 'guides', editor)).toBe('locked')
    expect(editState('published', 'guides', manager)).toBe('editable')
    expect(editState('review', 'guides', editor)).toBe('editable')
  })
  it('warns about server behaviours when editing', () => {
    expect(editWarning('review', false)).toBe('review_reset')
    expect(editWarning('published', true)).toBe('live_revalidate')
    expect(editWarning('published', false)).toBeNull()
    expect(editWarning('draft', true)).toBeNull()
  })
})

describe('classifyTransitionError', () => {
  const ctx = (to: ContentStatus, can = manager) => ({ to, prefix: 'guides', can })
  it('403 on approve by a reviewer is the four-eyes rule', () => {
    expect(classifyTransitionError(new ApiError(403, 'forbidden', 'No'), ctx('approved')).kind).toBe('four_eyes')
  })
  it('403 elsewhere (or without the review permission) is a plain forbidden', () => {
    expect(classifyTransitionError(new ApiError(403, 'forbidden', 'No'), ctx('published')).kind).toBe('forbidden')
    expect(classifyTransitionError(new ApiError(403, 'forbidden', 'No'), ctx('approved', editor)).kind).toBe('forbidden')
  })
  it('publish problems, locked and invalid transitions', () => {
    const p = classifyTransitionError(new ApiError(422, 'content_not_publishable', 'x', { problems: [{ code: 'missing_translation', locale: 'ar' }] }), ctx('published'))
    expect(p).toMatchObject({ kind: 'problems', problems: [{ code: 'missing_translation', locale: 'ar' }] })
    expect(classifyTransitionError(new ApiError(403, 'content_locked', 'Locked'), ctx('draft')).kind).toBe('locked')
    expect(classifyTransitionError(new ApiError(422, 'invalid_status_transition', 'Bad'), ctx('draft')).kind).toBe('invalid_transition')
    expect(classifyTransitionError(new ApiError(500, 'server_error', 'Oops'), ctx('draft')).kind).toBe('other')
  })
})

describe('WorkflowBar', () => {
  const base = { status: 'review' as ContentStatus, allowed: ALLOWED.review, prefix: 'guides', can: manager, schedule: async () => {} }
  it('shows only the permitted buttons', () => {
    const w = mount(WorkflowBar, { props: { ...base, can: reviewer, transition: async () => {} } })
    expect(w.findAll('button[data-action]').map(b => b.attributes('data-action'))).toEqual(['draft', 'approved'])
    const ed = mount(WorkflowBar, { props: { ...base, can: editor, transition: async () => {} } })
    expect(ed.findAll('button[data-action]')).toHaveLength(0)
    expect(ed.text()).toContain('No workflow actions')
  })
  it('explains the four-eyes refusal in plain language', async () => {
    const w = mount(WorkflowBar, { props: { ...base, createdByMe: true, transition: async () => { throw new ApiError(403, 'forbidden', 'You do not have permission to do this.') } } })
    expect(w.text()).toContain('four-eyes')
    await w.find('button[data-action="approved"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('cannot approve it')
  })
  it('renders the publish problems checklist and forwards jump', async () => {
    const w = mount(WorkflowBar, {
      props: { ...base, status: 'approved', allowed: ALLOWED.approved, firstRequiredField: 'title', transition: async () => { throw new ApiError(422, 'content_not_publishable', 'nope', { problems: [{ code: 'missing_source_field', field: 'source_name' }] }) } },
    })
    await w.find('button[data-action="published"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid=problems]').exists()).toBe(true)
    await w.find('[data-testid=problems] button').trigger('click')
    expect(w.emitted('jump')![0]).toEqual([{ kind: 'field', field: 'source_name' }])
  })
  it('offers the schedule dialog only to publishers on approved items', () => {
    const w = mount(WorkflowBar, { props: { ...base, status: 'approved', allowed: ALLOWED.approved, transition: async () => {} } })
    expect(w.find('button[data-action="schedule"]').exists()).toBe(true)
    const r = mount(WorkflowBar, { props: { ...base, status: 'approved', allowed: ALLOWED.approved, can: reviewer, transition: async () => {} } })
    expect(r.find('button[data-action="schedule"]').exists()).toBe(false)
  })
})
