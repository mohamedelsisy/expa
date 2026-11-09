import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, d as _sfc_main$5, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$6 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$7 } from './ProgramCard-C1FRZnZv.mjs';
import { _ as _sfc_main$8 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './Card-BxvVO_-_.mjs';
import './money-CRo_itTF.mjs';
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
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `study-university-${slug.value}`, async () => (await request(`study/universities/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    const u = computed(() => data.value);
    useSeo(() => {
      var _a, _b, _c, _d, _e;
      return { title: (_b = (_a = u.value) == null ? void 0 : _a.name) != null ? _b : t("study.universities.title"), description: (_d = (_c = u.value) == null ? void 0 : _c.summary) != null ? _d : t("study.universities.subtitle"), fallback: !!((_e = u.value) == null ? void 0 : _e.fallback) };
    });
    const site = computed(() => {
      var _a;
      return safeHttpsUrl((_a = u.value) == null ? void 0 : _a.website);
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.universities.title"), to: "/study/universities" }, { label: (_b = (_a = u.value) == null ? void 0 : _a.name) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_GuideFallbackNotice = _sfc_main$4;
      const _component_StudyVerifyNotice = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_StudyProgramCard = _sfc_main$7;
      const _component_GuideSource = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-5xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(u)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("study.universities.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(u)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(u)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<article class="space-y-6"><header class="space-y-3"><div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(u).kind_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(u).kind_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(u).city) {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "map",
                  size: 14
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(u).city.name)}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 14
                  }),
                  createTextVNode(toDisplayString(unref(u).city.name), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="text-3xl font-bold">${ssrInterpolate(unref(u).name)}</h1>`);
        if (unref(u).summary) {
          _push(`<p class="max-w-prose text-lg text-ink-soft">${ssrInterpolate(unref(u).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(u).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(u).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        _push(ssrRenderComponent(_component_StudyVerifyNotice, {
          text: (_b = (_a = unref(u).programs) == null ? void 0 : _a[0]) == null ? void 0 : _b.verify_notice
        }, null, _parent));
        if (unref(u).notes) {
          _push(`<p class="prose-plain">${ssrInterpolate(unref(u).notes)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(site)) {
          _push(ssrRenderComponent(_component_UiButton, {
            href: unref(site),
            "new-tab": "",
            variant: "secondary"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("study.officialSite"))}`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "external",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`<span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("a11y.opensNewTab"))}</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("study.officialSite")), 1),
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
        _push(`<section aria-labelledby="progs-h"><h2 id="progs-h" class="mb-3 text-xl font-bold">${ssrInterpolate(unref(t)("study.programs.title"))}</h2>`);
        if (!((_c = unref(u).programs) == null ? void 0 : _c.length)) {
          _push(`<p class="text-muted">${ssrInterpolate(unref(t)("study.universities.noPrograms"))}</p>`);
        } else {
          _push(`<ul class="grid gap-4 sm:grid-cols-2"><!--[-->`);
          ssrRenderList(unref(u).programs, (p) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_StudyProgramCard, { program: p }, null, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul>`);
        }
        _push(`</section>`);
        _push(ssrRenderComponent(_component_GuideSource, {
          source: unref(u).source
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/universities/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-BGQzn3p6.mjs.map
