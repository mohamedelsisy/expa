import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, z as formatDay, _ as _sfc_main$3$1, d as _sfc_main$5 } from './server.mjs';
import { _ as _sfc_main$3 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$4 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$6 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as safeHttpsUrl } from './safe-B2eSdAXJ.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import './SourceBadge-4_eAChkr.mjs';
import './Badge-PdKIsny2.mjs';
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
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `study-scholarship-${slug.value}`, async () => (await request(`study/scholarships/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    const s = computed(() => data.value);
    useSeo(() => {
      var _a, _b, _c, _d, _e;
      return { title: (_b = (_a = s.value) == null ? void 0 : _a.name) != null ? _b : t("study.scholarships.title"), description: (_d = (_c = s.value) == null ? void 0 : _c.summary) != null ? _d : t("study.scholarships.subtitle"), fallback: !!((_e = s.value) == null ? void 0 : _e.fallback) };
    });
    const apply = computed(() => {
      var _a;
      return safeHttpsUrl((_a = s.value) == null ? void 0 : _a.apply_url);
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.scholarships.title"), to: "/study/scholarships" }, { label: (_b = (_a = s.value) == null ? void 0 : _a.name) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_GuideFallbackNotice = _sfc_main$3;
      const _component_StudyVerifyNotice = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_GuideSource = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(s)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("study.scholarships.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(s)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(s)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-3"><h1 class="text-3xl font-bold">${ssrInterpolate(unref(s).name)}</h1>`);
        if (unref(s).summary) {
          _push(`<p class="max-w-prose text-lg text-ink-soft">${ssrInterpolate(unref(s).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("study.deadline"))}: <span class="font-medium text-ink">${ssrInterpolate(unref(s).deadline.date ? unref(formatDay)(unref(s).deadline.date, unref(locale)) : unref(t)("study.notStated"))}</span>`);
        if (unref(s).deadline.status === "passed") {
          _push(`<span class="text-danger"> \xB7 ${ssrInterpolate(unref(t)("study.passed"))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(s).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(s).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        _push(ssrRenderComponent(_component_StudyVerifyNotice, {
          text: unref(s).verify_notice
        }, null, _parent));
        if (unref(s).eligibility) {
          _push(`<section aria-labelledby="el-h"><h2 id="el-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("study.eligibility"))}</h2><p class="prose-plain">${ssrInterpolate(unref(s).eligibility)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(s).how_to_apply) {
          _push(`<section aria-labelledby="ha-h"><h2 id="ha-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("study.howToApply"))}</h2><p class="prose-plain">${ssrInterpolate(unref(s).how_to_apply)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(apply)) {
          _push(ssrRenderComponent(_component_UiButton, {
            href: unref(apply),
            "new-tab": "",
            variant: "secondary"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("study.officialPage"))}`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "external",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("study.officialPage")), 1),
                  createVNode(_component_UiIcon, {
                    name: "external",
                    size: 16
                  }),
                  createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("a11y.opensNewTab")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(s).source
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/scholarships/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-iXPmlpeb.mjs.map
