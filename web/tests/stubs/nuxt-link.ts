import { defineComponent, h } from 'vue'
export const NuxtLinkStub = defineComponent({
  props: { to: { type: String, default: '' } },
  setup: (p, { slots, attrs }) => () => h('a', { href: p.to, ...attrs }, slots.default?.()),
})
