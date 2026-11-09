import { u as useI18n, c as useLocalePath, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { L as LEGAL_SLUGS } from './legal-vAxOkaZS.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Links",
  __ssrInlineRender: true,
  props: {
    version: {}
  },
  setup(__props) {
    const { t } = useI18n();
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<p${ssrRenderAttrs(mergeProps({
        class: "text-sm text-ink-soft",
        "data-testid": "legal-links"
      }, _attrs))}>${ssrInterpolate(unref(t)("legal.readBefore"))} <!--[-->`);
      ssrRenderList(unref(LEGAL_SLUGS), (s, i) => {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(`/${s}`),
          target: "_blank",
          rel: "noopener",
          class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`legal.${s}.title`))}<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`legal.${s}.title`)), 1),
                createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("a11y.opensNewTab")), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        if (i < unref(LEGAL_SLUGS).length - 1) {
          _push(`<span aria-hidden="true">, </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]-->`);
      if (__props.version) {
        _push(`<span> (${ssrInterpolate(unref(t)("legal.policyVersion", { version: __props.version }))})</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`. </p>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/legal/Links.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Links-BHP4RLan.mjs.map
