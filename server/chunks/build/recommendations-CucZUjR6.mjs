import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError } from './server.mjs';
import { _ as _sfc_main$3 } from './List-fxeFRg0m.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './safe-B2eSdAXJ.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import './routes-BNQ9Jhms.mjs';
import './Badge-PdKIsny2.mjs';
import './Alert-D-zfMDy5.mjs';
import './EmptyState-N2xvHts8.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "recommendations",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useSeo(() => ({ title: t("recs.seoTitle"), description: t("recs.subtitle"), noindex: true }));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("recommendations", async () => (await request("recommendations")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/dashboard" }, { label: t("recs.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_RecsList = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl space-y-2"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("recs.title"))}</h1><p class="text-ink-soft">${ssrInterpolate(unref(t)("recs.subtitle"))}</p></header>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 2,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_RecsList, { recs: unref(data) }, null, _parent));
      }
      _push(`<p class="mt-8 max-w-2xl text-sm text-muted">${ssrInterpolate(unref(t)("recs.footnote"))}</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/recommendations.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=recommendations-CucZUjR6.mjs.map
