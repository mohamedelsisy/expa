import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { initialsOf } from '../utils/initials'
import { useScrolled } from '../composables/useScrolled'
import { activeModuleKey, type ExploreModule } from '../composables/useExploreModules'
import en from '../i18n/locales/en.json'
import ar from '../i18n/locales/ar.json'
import it_ from '../i18n/locales/it.json'

describe('initialsOf', () => {
  it('uses the first and last word', () => {
    expect(initialsOf('Demo User')).toBe('DU')
    expect(initialsOf('mohamed ali el sisy')).toBe('MS')
  })
  it('handles a single word, extra spaces and Arabic names', () => {
    expect(initialsOf('  Sara ')).toBe('S')
    expect(initialsOf('محمد السيسي')).toBe('م\u200cا')
  })
  it('falls back to the email, then to an empty string', () => {
    expect(initialsOf('', 'demo@expa.test')).toBe('D')
    expect(initialsOf(null)).toBe('')
    expect(initialsOf(undefined, '')).toBe('')
  })
})

describe('useScrolled', () => {
  const Probe = defineComponent({ setup() { const s = useScrolled(8); return () => h('i', { 'data-s': String(s.value) }) } })
  const set = (y: number) => { Object.defineProperty(window, 'scrollY', { value: y, configurable: true }); window.dispatchEvent(new Event('scroll')) }

  it('is false at the top, true past the threshold and false again when back', async () => {
    set(0)
    const w = mount(Probe)
    await nextTick()
    expect(w.attributes('data-s')).toBe('false')
    set(9)
    await nextTick()
    expect(w.attributes('data-s')).toBe('true')
    set(8)
    await nextTick()
    expect(w.attributes('data-s')).toBe('false')
    w.unmount()
  })
  it('starts scrolled when the page is restored scrolled, and stops listening after unmount', async () => {
    set(200)
    const w = mount(Probe)
    await nextTick()
    expect(w.attributes('data-s')).toBe('true')
    w.unmount()
    set(0) // no error and no listener left to update the unmounted component
  })
})

describe('activeModuleKey', () => {
  const mods: ExploreModule[] = [
    { key: 'money', to: '/money', icon: 'euro' },
    { key: 'netSalary', to: '/money/net-salary', icon: 'euro' },
    { key: 'jobs', to: '/jobs', icon: 'briefcase' },
  ]
  const resolve = (p: string) => `/ar${p}`
  it('picks the longest matching section', () => {
    expect(activeModuleKey('/ar/money', mods, resolve)).toBe('money')
    expect(activeModuleKey('/ar/money/net-salary', mods, resolve)).toBe('netSalary')
    expect(activeModuleKey('/ar/jobs/123', mods, resolve)).toBe('jobs')
  })
  it('returns null outside every module and does not match on a shared string prefix', () => {
    expect(activeModuleKey('/ar/dashboard', mods, resolve)).toBeNull()
    expect(activeModuleKey('/ar/jobsearch', mods, resolve)).toBeNull()
  })
})

describe('header navigation copy', () => {
  it('has every new nav key in ar, en and it', () => {
    for (const dict of [ar, en, it_]) {
      for (const k of ['myItaly', 'menu', 'openMenu', 'closeMenu', 'exploreTitle', 'aiTag']) expect((dict.nav as Record<string, string>)[k], k).toBeTruthy()
    }
  })
})
