import { u as useI18n, f as useRoute, c as useLocalePath, e as __nuxt_component_0 } from './server.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Nav",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const items = [
      { to: "/provider", key: "overview" },
      { to: "/provider/profile", key: "profile" },
      { to: "/provider/verification", key: "verification" },
      { to: "/provider/leads", key: "leads" },
      { to: "/provider/reviews", key: "reviews" }
    ];
    const active = (to) => route.path === localePath(to) || route.path === `${localePath(to)}/`;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        "aria-label": unref(t)("provider.nav.label"),
        class: "mb-6"
      }, _attrs))}><ul class="flex flex-wrap gap-1"><!--[-->`);
      ssrRenderList(items, (i) => {
        _push(`<li>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(i.to),
          class: ["inline-flex min-h-touch items-center rounded-md px-3 font-medium", active(i.to) ? "bg-primary-soft text-primary-strong" : "text-ink-soft hover:bg-sunken"],
          "aria-current": active(i.to) ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(`provider.nav.${i.key}`))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(`provider.nav.${i.key}`)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/provider/Nav.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Nav-CnBbBeUx.mjs.map
