import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, e as __nuxt_component_0, z as formatDay, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './FallbackNotice-CwHuyozE.mjs';
import { _ as _sfc_main$5 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$6 } from './GuideSource-B-ek0Kys.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { f as formatMoney } from './money-CRo_itTF.mjs';
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
import './FreshnessIndicator-B5-_pVo1.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `study-program-${slug.value}`, async () => (await request(`study/programs/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    const p = computed(() => data.value);
    useSeo(() => {
      var _a, _b, _c, _d, _e;
      return { title: (_b = (_a = p.value) == null ? void 0 : _a.title) != null ? _b : t("study.programs.title"), description: (_d = (_c = p.value) == null ? void 0 : _c.summary) != null ? _d : t("study.programs.subtitle"), fallback: !!((_e = p.value) == null ? void 0 : _e.fallback) };
    });
    const tuition = computed(() => {
      var _a, _b;
      const x = (_a = p.value) == null ? void 0 : _a.tuition;
      if (!x || x.min == null && x.max == null) return null;
      const f = (n) => formatMoney(n, x.currency, locale.value);
      return `${x.min != null && x.max != null && x.min !== x.max ? `${f(x.min)}\u2013${f(x.max)}` : f((_b = x.min) != null ? _b : x.max)} / ${t("study.perYear")}`;
    });
    const url = computed(() => {
      var _a;
      return safeHttpsUrl((_a = p.value) == null ? void 0 : _a.program_url);
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.programs.title"), to: "/study/programs" }, { label: (_b = (_a = p.value) == null ? void 0 : _a.title) != null ? _b : "" }];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_GuideFallbackNotice = _sfc_main$4;
      const _component_StudyVerifyNotice = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_GuideSource = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(p)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("study.programs.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(p)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(p)) {
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
              _push2(`${ssrInterpolate(unref(p).degree_level_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).degree_level_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(p).field_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).field_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(p).instruction_language_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).instruction_language_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><h1 class="text-3xl font-bold">${ssrInterpolate(unref(p).title)}</h1><p class="text-lg text-ink-soft">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(`/study/universities/${unref(p).university.slug}`),
          class: "text-primary-strong underline underline-offset-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(p).university.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(p).university.name), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(p).university.city) {
          _push(`<!--[--> \xB7 ${ssrInterpolate(unref(p).university.city.name)}<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(p).summary) {
          _push(`<p class="max-w-prose text-ink-soft">${ssrInterpolate(unref(p).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).fallback) {
          _push(ssrRenderComponent(_component_GuideFallbackNotice, {
            locale: unref(p).locale
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</header>`);
        _push(ssrRenderComponent(_component_StudyVerifyNotice, {
          text: unref(p).verify_notice
        }, null, _parent));
        _push(`<dl class="grid gap-3 sm:grid-cols-2"><div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("study.tuition"))}</dt><dd class="font-semibold tabular-nums"><bdi>${ssrInterpolate((_a = unref(tuition)) != null ? _a : unref(t)("study.notStated"))}</bdi></dd></div><div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("study.deadline"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(p).deadline.date ? unref(formatDay)(unref(p).deadline.date, unref(locale)) : unref(t)("study.notStated"))}`);
        if (unref(p).deadline.status === "passed") {
          _push(`<span class="text-danger"> \xB7 ${ssrInterpolate(unref(t)("study.passed"))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</dd></div>`);
        if (unref(p).duration_years) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("study.duration"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(t)("study.years", { count: unref(p).duration_years }))}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).required_italian_level) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("study.italianLevel"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(p).required_italian_level.toUpperCase())}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).required_english_level) {
          _push(`<div><dt class="text-sm text-muted">${ssrInterpolate(unref(t)("study.englishLevel"))}</dt><dd class="font-semibold">${ssrInterpolate(unref(p).required_english_level.toUpperCase())}</dd></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</dl>`);
        if (unref(p).admission_requirements) {
          _push(`<section aria-labelledby="adm-h"><h2 id="adm-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("study.admission"))}</h2><p class="prose-plain">${ssrInterpolate(unref(p).admission_requirements)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).notes) {
          _push(`<section aria-labelledby="notes-h"><h2 id="notes-h" class="mb-2 text-xl font-bold">${ssrInterpolate(unref(t)("study.notes"))}</h2><p class="prose-plain">${ssrInterpolate(unref(p).notes)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(url)) {
          _push(ssrRenderComponent(_component_UiButton, {
            href: unref(url),
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
          source: unref(p).source
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/programs/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-CIt8dNZQ.mjs.map
