import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TranslationEditor from '../components/admin/TranslationEditor.vue'
import { moduleByKey } from '../utils/admin/modules'
import { emptyForm } from '../utils/admin/form'

const guides = moduleByKey('guides')!
const form = () => emptyForm(guides)
const mountEd = (over: Record<string, unknown> = {}) => mount(TranslationEditor, {
  props: { modelValue: form().translations, fields: guides.translatable, primary: 'title', requiredLocales: ['ar'], missingLocales: ['ar', 'en', 'it'], active: 'ar', ...over },
})

describe('TranslationEditor', () => {
  it('has a tab per locale and marks Arabic as required to publish', () => {
    const w = mountEd()
    const tabs = w.findAll('[role=tab]')
    expect(tabs.map(t => t.attributes('data-locale'))).toEqual(['ar', 'en', 'it'])
    expect(tabs[0]!.find('[data-testid=required-marker]').exists()).toBe(true)
    expect(tabs[1]!.find('[data-testid=required-marker]').exists()).toBe(false)
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')
  })
  it('shows missing indicators from the API list and clears them when the primary field is filled', () => {
    const w = mountEd({ missingLocales: ['en', 'it'] })
    const tabs = w.findAll('[role=tab]')
    expect(tabs[0]!.find('[data-testid=missing-marker]').exists()).toBe(false)
    expect(tabs[1]!.find('[data-testid=missing-marker]').exists()).toBe(true)
    const f = form()
    f.translations.en.title = 'Hello'
    const w2 = mountEd({ modelValue: f.translations, missingLocales: ['en', 'it'] })
    expect(w2.findAll('[role=tab]')[1]!.find('[data-testid=missing-marker]').exists()).toBe(false)
    expect(w2.findAll('[role=tab]')[2]!.find('[data-testid=missing-marker]').exists()).toBe(true)
  })
  it('sets dir per panel: rtl for Arabic, ltr for English and Italian (whatever the UI language)', () => {
    const w = mountEd()
    const panels = w.findAll('[role=tabpanel]')
    expect(panels.map(p => p.attributes('dir'))).toEqual(['rtl', 'ltr', 'ltr'])
    expect(panels.map(p => p.attributes('lang'))).toEqual(['ar', 'en', 'it'])
    expect(panels[0]!.find('input').attributes('dir')).toBe('rtl')
    expect(panels[1]!.find('textarea').attributes('dir')).toBe('ltr')
  })
  it('shows only the active panel and emits tab changes (also by keyboard)', async () => {
    const w = mountEd()
    const panels = w.findAll('[role=tabpanel]')
    expect(panels[0]!.attributes('style') ?? '').not.toContain('display: none')
    expect(panels[1]!.attributes('style')).toContain('display: none')
    await w.findAll('[role=tab]')[1]!.trigger('click')
    expect(w.emitted('update:active')![0]).toEqual(['en'])
    await w.findAll('[role=tab]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:active')!.length).toBe(2)
  })
  it('character counters follow the backend max length', async () => {
    const f = form()
    f.translations.ar.title = 'abc'
    const w = mountEd({ modelValue: f.translations })
    expect(w.find('[data-counter="ar:title"]').text()).toBe('3/255')
    expect(w.find('[data-counter="ar:summary"]').text()).toBe('0/5000')
    expect(w.find('input').attributes('maxlength')).toBe('255')
  })
  it('emits an updated model when typing and surfaces field errors with the tab flagged', async () => {
    const w = mountEd({ errors: { en: { summary: 'Too long' } } })
    expect(w.text()).toContain('Too long')
    expect(w.findAll('[role=tab]')[1]!.text()).toContain('Has errors')
    await w.find('input').setValue('Titolo')
    const ev = w.emitted('update:modelValue')![0]![0] as any
    expect(ev.ar.title).toBe('Titolo')
  })
  it('renders list editors for documents and steps', () => {
    const w = mountEd()
    expect(w.find('[data-list="required_documents"]').exists()).toBe(true)
    expect(w.find('[data-list="steps"]').exists()).toBe(true)
  })
})
