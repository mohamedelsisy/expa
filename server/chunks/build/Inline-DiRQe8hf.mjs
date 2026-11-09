import { defineComponent, unref, useSSRContext } from 'vue';
import { ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { p as parseInline } from './legal-vAxOkaZS.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Inline",
  __ssrInlineRender: true,
  props: {
    text: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderList(unref(parseInline)(__props.text), (n, i) => {
        _push(`<!--[-->`);
        if (n.t === "strong") {
          _push(`<strong>${ssrInterpolate(n.v)}</strong>`);
        } else if (n.t === "em") {
          _push(`<em>${ssrInterpolate(n.v)}</em>`);
        } else if (n.t === "link") {
          _push(`<a${ssrRenderAttr("href", n.href)} rel="noopener noreferrer" class="text-primary-strong underline underline-offset-4">${ssrInterpolate(n.v)}</a>`);
        } else {
          _push(`<!--[-->${ssrInterpolate(n.v)}<!--]-->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/legal/Inline.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Inline-DiRQe8hf.mjs.map
