import { defineComponent, h, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
import { u as useI18n } from './server.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ItalianTerm",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        lang: "it",
        dir: "ltr",
        class: "italian-term"
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ItalianTerm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const PAREN_LATIN = /(\([^()]*[A-Za-zÀ-ÿ][^()]*\))/g;
const ACRONYM = /^\([A-Z0-9]{2,6}\)$/;
function splitItalian(text) {
  return text.split(PAREN_LATIN).filter(Boolean).map((part) => ({ text: part, term: /^\([^()]*[A-Za-zÀ-ÿ][^()]*\)$/.test(part) && !ACRONYM.test(part) }));
}
const _sfc_main = defineComponent({
  name: "AutoItalian",
  props: { text: { type: String, required: true }, force: { type: Boolean, default: false } },
  setup(props) {
    const { locale } = useI18n();
    return () => {
      if (locale.value !== "ar" && !props.force) return h("span", props.text);
      return h("span", splitItalian(props.text).map((p) => p.term ? h(_sfc_main$1, null, () => p.text) : p.text));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AutoItalian.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _, _sfc_main$1 as a };
//# sourceMappingURL=AutoItalian-BD4PyQ-n.mjs.map
