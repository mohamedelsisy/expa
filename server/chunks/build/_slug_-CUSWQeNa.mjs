import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, c as useLocalePath, i as _sfc_main$2$1, _ as _sfc_main$3$1, d as _sfc_main$5 } from './server.mjs';
import { _ as _sfc_main$3 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$4 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$6 } from './Explain-DdXwtg6y.mjs';
import { _ as _sfc_main$7 } from './GuideSource-B-ek0Kys.mjs';
import { _ as _sfc_main$8 } from './Disclaimer-ByrpdAjg.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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
import './VerifyNeeded-mxk-8UjC.mjs';
import './useToast-BX2bodPv.mjs';
import './patenteExplain-CPOOCBVz.mjs';
import './routes-BNQ9Jhms.mjs';
import './Badge-PdKIsny2.mjs';
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
    const { data: tp, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `patente-topic-${slug.value}`, async () => (await request(`patente/topics/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a, _b;
      return { title: tp.value ? `${tp.value.title} | EXPA` : t("patente.title"), description: (_b = (_a = tp.value) == null ? void 0 : _a.summary) != null ? _b : t("patente.subtitle"), type: "article" };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("patente.title"), to: "/patente" }, { label: (_b = (_a = tp.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiAutoItalian = _sfc_main$3;
      const _component_GuideFallbackNotice = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_PatenteExplain = _sfc_main$6;
      const _component_GuideSource = _sfc_main$7;
      const _component_PatenteDisclaimer = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (unref(status) === "pending" && !unref(tp)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(tp)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-2"><h1 class="text-3xl font-bold">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: unref(tp).title
        }, null, _parent));
        _push(`</h1>`);
        if (unref(tp).summary) {
          _push(`<p class="text-lg text-ink-soft">${ssrInterpolate(unref(tp).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        if (unref(tp).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(tp).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(tp).body) {
          _push(`<p class="prose-plain text-lg">`);
          _push(ssrRenderComponent(_component_UiAutoItalian, {
            text: unref(tp).body
          }, null, _parent));
          _push(`</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiButton, {
          to: `/patente/practice?topic=${encodeURIComponent(unref(tp).slug)}`,
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "list",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("patente.practiceThis"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "list",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("patente.practiceThis")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_PatenteExplain, {
          kind: "topic",
          slug: unref(tp).slug,
          title: unref(tp).title
        }, null, _parent));
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(tp).source
        }, null, _parent));
        _push(ssrRenderComponent(_component_PatenteDisclaimer, null, null, _parent));
        _push(`</article>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/topics/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-CUSWQeNa.mjs.map
