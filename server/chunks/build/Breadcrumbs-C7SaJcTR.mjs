import { u as useI18n, c as useLocalePath, f as useRoute, b as useRuntimeConfig, p as useHead, e as __nuxt_component_0, d as _sfc_main$5 } from './server.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { b as breadcrumbLd } from './useSeo-BU4sLOnV.mjs';
import { j as jsonLd } from './safe-B2eSdAXJ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Breadcrumbs",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    var _a;
    const props = __props;
    const { t } = useI18n();
    const localePath = useLocalePath();
    const route = useRoute();
    const siteUrl = String((_a = useRuntimeConfig().public.siteUrl) != null ? _a : "").replace(/\/$/, "");
    useHead(() => ({
      script: [{
        type: "application/ld+json",
        innerHTML: jsonLd(breadcrumbLd(
          props.items.filter((c) => c.label).map((c) => ({ name: c.label, url: c.to ? siteUrl + localePath(c.to) : void 0 })),
          siteUrl + route.path
        ))
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        "aria-label": unref(t)("nav.breadcrumbs"),
        class: "text-sm"
      }, _attrs))}><ol class="flex flex-wrap items-center gap-x-1.5"><!--[-->`);
      ssrRenderList(__props.items, (c, i) => {
        _push(`<li class="flex items-center gap-1.5">`);
        if (c.to) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(c.to),
            class: "inline-flex min-h-touch items-center text-primary-strong underline underline-offset-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(c.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(c.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<span aria-current="page" class="text-ink-soft">${ssrInterpolate(c.label)}</span>`);
        }
        if (i < __props.items.length - 1) {
          _push(ssrRenderComponent(_sfc_main$5, {
            name: "chevron-end",
            size: 14,
            class: "text-muted"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ol></nav>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Breadcrumbs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Breadcrumbs-C7SaJcTR.mjs.map
