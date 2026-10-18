import { describe, expect, it } from 'vitest'
import { OWNER_NAME, WHATSAPP_DISPLAY, WHATSAPP_E164, whatsappUrl } from '../utils/contact'
import ar from '../i18n/locales/ar.json'
import en from '../i18n/locales/en.json'
import it_ from '../i18n/locales/it.json'

describe('footer owner contact', () => {
  it('turns the 00-prefixed number 00393290869818 into a wa.me link (no 00, no +, no spaces)', () => {
    expect(WHATSAPP_E164).toBe('393290869818')
    expect(whatsappUrl()).toBe('https://wa.me/393290869818')
    expect(WHATSAPP_DISPLAY.replace(/\D/g, '')).toBe(WHATSAPP_E164)
  })
  it('names the owner', () => {
    expect(OWNER_NAME).toBe('Mohamed Elsisy')
  })
  it('has the copyright and WhatsApp copy in ar, en and it with the placeholders the footer passes', () => {
    for (const d of [ar, en, it_]) {
      expect(d.footer.copyright).toContain('{year}')
      expect(d.footer.copyright).toContain('{name}')
      expect(d.footer.whatsapp.length).toBeGreaterThan(5)
      expect(d.footer.whatsappLabel).toContain('{number}')
    }
  })
})
