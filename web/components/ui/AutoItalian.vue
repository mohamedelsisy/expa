<script lang="ts">
import { defineComponent, h } from 'vue'
import { useI18n } from '#imports'
import ItalianTerm from './ItalianTerm.vue'

/**
 * Renders API text like "الرقم الضريبي (Codice Fiscale)": in Arabic, the Latin parenthetical is wrapped in
 * ItalianTerm. In en/it text is rendered as is. Plain text nodes only.
 */
const PAREN_LATIN = /(\([^()]*[A-Za-zÀ-ÿ][^()]*\))/g
/** "(PDF)", "(IBAN)": short all-caps tokens are acronyms, not Italian terms, so they are not switched to lang="it". */
const ACRONYM = /^\([A-Z0-9]{2,6}\)$/
export function splitItalian(text: string): { text: string, term: boolean }[] {
  return text.split(PAREN_LATIN).filter(Boolean).map(part => ({ text: part, term: /^\([^()]*[A-Za-zÀ-ÿ][^()]*\)$/.test(part) && !ACRONYM.test(part) }))
}

export default defineComponent({
  name: 'AutoItalian',
  props: { text: { type: String, required: true }, force: { type: Boolean, default: false } },
  setup(props) {
    const { locale } = useI18n()
    return () => {
      if (locale.value !== 'ar' && !props.force) return h('span', props.text)
      return h('span', splitItalian(props.text).map(p => (p.term ? h(ItalianTerm, null, () => p.text) : p.text)))
    }
  },
})
</script>
