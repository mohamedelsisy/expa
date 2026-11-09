import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$5 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$6 } from './BookingBlock-DOKLO1aP.mjs';
import { _ as _sfc_main$7 } from './GuideSteps-CUJ1XeBp.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import './Alert-D-zfMDy5.mjs';
import './useAnalytics-Dh-8IvGy.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data: g, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `appt-${slug.value}`, async () => (await request(`appointments/guides/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: g.value ? `${g.value.title} | EXPA` : t("appt.title"), description: (_b = (_a = g.value) == null ? void 0 : _a.summary) != null ? _b : t("appt.subtitle"), type: "article" };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("appt.title"), to: "/appointments" }, { label: (_b = (_a = g.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_GuideFallbackNotice = _sfc_main$5;
      const _component_GovBookingBlock = _sfc_main$6;
      const _component_GovGuideSteps = _sfc_main$7;
      const _component_GuideSource = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(g)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(g)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-3">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(g).office_type_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(g).office_type_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h1 class="text-3xl font-bold">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(g).title
        }, null, _parent));
        _push(`</h1>`);
        if (unref(g).summary) {
          _push(`<p class="text-lg text-ink-soft">${ssrInterpolate(unref(g).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(g).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(g).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_GovBookingBlock, {
          booking: unref(g).booking,
          subject: unref(g).slug
        }, null, _parent));
        _push(ssrRenderComponent(_component_GovGuideSteps, { guide: unref(g) }, null, _parent));
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(g).source
        }, null, _parent));
        _push(`</article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/appointments/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-CnAKyyFW.mjs.map
