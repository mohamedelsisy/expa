import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NuxtLinkStub } from './stubs/nuxt-link'
import { testLocale } from './stubs/imports'
import LanguageSwitcher from '../components/ui/LanguageSwitcher.vue'
import { EXPLORE_GROUPS } from '../composables/useExploreModules'
import en from '../i18n/locales/en.json'
import ar from '../i18n/locales/ar.json'
import it_ from '../i18n/locales/it.json'

const global = { stubs: { NuxtLink: NuxtLinkStub } }
beforeEach(() => { testLocale.value = 'en' })

describe('header Explore menu data', () => {
  const grouped = EXPLORE_GROUPS.flatMap(g => [...g.modules])

  it('puts every module in exactly one group', () => {
    expect(new Set(grouped).size).toBe(grouped.length)
  })
  it('covers every module that has Explore copy (a new module must be assigned a group)', () => {
    expect([...grouped].sort()).toEqual(Object.keys(en.explore.modules).sort())
  })
  it('has a title for every group in ar, en and it', () => {
    for (const dict of [ar, en, it_]) {
      for (const g of EXPLORE_GROUPS) expect((dict.explore.groups as Record<string, string>)[g.key], g.key).toBeTruthy()
    }
  })
})

describe('LanguageSwitcher menu variant', () => {
  it('is closed by default, toggles with aria-expanded and keeps real locale links', async () => {
    const w = mount(LanguageSwitcher, { props: { variant: 'menu' }, global, attachTo: document.body })
    const trigger = w.get('button[data-dropdown-trigger]')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(w.findAll('a').map(a => a.attributes('lang'))).toEqual(['ar', 'en', 'it'])
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(w.get('nav').isVisible()).toBe(true)
    w.unmount()
  })
  it('closes on Escape and returns focus to the trigger', async () => {
    const w = mount(LanguageSwitcher, { props: { variant: 'menu' }, global, attachTo: document.body })
    const trigger = w.get('button[data-dropdown-trigger]')
    await trigger.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    w.unmount()
  })
  it('closes on an outside pointer press and after picking a language, and emits switch', async () => {
    const w = mount(LanguageSwitcher, { props: { variant: 'menu' }, global, attachTo: document.body })
    const trigger = w.get('button[data-dropdown-trigger]')
    await trigger.trigger('click')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    await w.findAll('a')[2].trigger('click')
    expect(w.emitted('switch')![0]).toEqual(['it'])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    w.unmount()
  })
  it('the default variant is still the inline list (other layouts rely on it)', () => {
    const w = mount(LanguageSwitcher, { global })
    expect(w.find('button[data-dropdown-trigger]').exists()).toBe(false)
    expect(w.findAll('a')).toHaveLength(3)
  })
})
