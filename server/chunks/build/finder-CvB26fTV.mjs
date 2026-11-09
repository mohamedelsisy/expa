import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$5 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$6 } from './Checkbox-PDAPbGXG.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$7 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$8 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$9 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$a } from './ProgramCard-C1FRZnZv.mjs';
import { _ as _sfc_main$b } from './MatchReasons-CqNfUzGS.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './safe-B2eSdAXJ.mjs';
import './Alert-D-zfMDy5.mjs';
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
import './Badge-PdKIsny2.mjs';
import './money-CRo_itTF.mjs';
import './ScoreRing-D5NDFTYF.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "finder",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    useSeo(() => ({ title: t("study.finder.title"), description: t("study.finder.subtitle"), noindex: true }));
    const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"];
    const levelOptions = LEVELS.map((l) => ({ value: l, label: l.toUpperCase() }));
    const KEYS = ["field", "degree", "language", "budget", "city", "italian_level", "english_level"];
    const fromQuery = () => Object.fromEntries(KEYS.map((k) => [k, typeof route.query[k] === "string" ? route.query[k] : ""]));
    const form = reactive({ ...fromQuery(), use_profile: route.query.use_profile === "1" });
    const budgetError = ref("");
    const { data: lookups } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("study-finder-lookups", async () => {
      const [meta2, cities] = await Promise.all([request("study/meta"), request("cities")]);
      return { meta: meta2.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const languageOptions = computed(() => {
      var _a, _b;
      return [...((_b = (_a = lookups.value) == null ? void 0 : _a.meta.languages) != null ? _b : []).filter((l) => l.value !== "both"), { value: "any", label: t("study.finder.anyLanguage") }];
    });
    const searched = computed(() => KEYS.some((k) => typeof route.query[k] === "string") || route.query.use_profile === "1");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("study-finder", async () => {
      if (!searched.value) return null;
      const query = { page: page.value };
      for (const k of KEYS) {
        const v = route.query[k];
        if (typeof v === "string" && v) query[k] = v;
      }
      if (route.query.use_profile === "1") query.use_profile = 1;
      return request("study/finder", { query });
    }, { watch: [() => route.fullPath, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const changePage = (p) => navigateTo({ path: route.path, query: { ...route.query, page: String(p) } });
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.finder.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_StudyVerifyNotice = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiSelect = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$5;
      const _component_UiCheckbox = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiEmptyState = _sfc_main$7;
      const _component_UiCard = _sfc_main$8;
      const _component_UiSkeleton = _sfc_main$9;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_StudyProgramCard = _sfc_main$a;
      const _component_JobsMatchReasons = _sfc_main$b;
      const _component_UiPagination = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("study.finder.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("study.finder.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_StudyVerifyNotice, {
        text: (_c = (_a = unref(meta)) == null ? void 0 : _a.verify_notice) != null ? _c : (_b = unref(lookups)) == null ? void 0 : _b.meta.verify_notice,
        class: "mb-6"
      }, null, _parent));
      _push(`<form class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" novalidate>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.field"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).field,
              "onUpdate:modelValue": ($event) => unref(form).field = $event,
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.fields) != null ? _b2 : [],
              placeholder: unref(t)("study.any")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).field,
                "onUpdate:modelValue": ($event) => unref(form).field = $event,
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.fields) != null ? _d2 : [],
                placeholder: unref(t)("study.any")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.degree"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).degree,
              "onUpdate:modelValue": ($event) => unref(form).degree = $event,
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.degree_levels) != null ? _b2 : [],
              placeholder: unref(t)("study.any")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).degree,
                "onUpdate:modelValue": ($event) => unref(form).degree = $event,
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.degree_levels) != null ? _d2 : [],
                placeholder: unref(t)("study.any")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.language"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).language,
              "onUpdate:modelValue": ($event) => unref(form).language = $event,
              options: unref(languageOptions),
              placeholder: unref(t)("study.any")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).language,
                "onUpdate:modelValue": ($event) => unref(form).language = $event,
                options: unref(languageOptions),
                placeholder: unref(t)("study.any")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.finder.budget"),
        hint: unref(t)("study.finder.budgetHint"),
        error: unref(budgetError),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).budget,
              "onUpdate:modelValue": ($event) => unref(form).budget = $event,
              inputmode: "numeric",
              maxlength: 6,
              ltr: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).budget,
                "onUpdate:modelValue": ($event) => unref(form).budget = $event,
                inputmode: "numeric",
                maxlength: 6,
                ltr: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.city"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).city,
              "onUpdate:modelValue": ($event) => unref(form).city = $event,
              options: unref(cityOptions),
              placeholder: unref(t)("guides.allCities")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).city,
                "onUpdate:modelValue": ($event) => unref(form).city = $event,
                options: unref(cityOptions),
                placeholder: unref(t)("guides.allCities")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.italianLevel"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).italian_level,
              "onUpdate:modelValue": ($event) => unref(form).italian_level = $event,
              options: unref(levelOptions),
              placeholder: unref(t)("study.any")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).italian_level,
                "onUpdate:modelValue": ($event) => unref(form).italian_level = $event,
                options: unref(levelOptions),
                placeholder: unref(t)("study.any")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.englishLevel"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).english_level,
              "onUpdate:modelValue": ($event) => unref(form).english_level = $event,
              options: unref(levelOptions),
              placeholder: unref(t)("study.any")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).english_level,
                "onUpdate:modelValue": ($event) => unref(form).english_level = $event,
                options: unref(levelOptions),
                placeholder: unref(t)("study.any")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(auth).isAuthenticated) {
        _push(ssrRenderComponent(_component_UiCheckbox, {
          modelValue: unref(form).use_profile,
          "onUpdate:modelValue": ($event) => unref(form).use_profile = $event,
          description: unref(t)("study.finder.useProfileHint")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("study.finder.useProfile"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("study.finder.useProfile")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-end sm:col-span-2 lg:col-span-3">`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: unref(status) === "pending"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("study.finder.submit"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("study.finder.submit")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form><div aria-live="polite" class="sr-only">${ssrInterpolate(unref(searched) && unref(meta) ? unref(t)("guides.resultsCount", { count: (_d = unref(meta).total) != null ? _d : unref(items).length }) : "")}</div>`);
      if (!unref(searched)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("study.finder.startTitle"),
          description: unref(t)("study.finder.start"),
          icon: "sparkle"
        }, null, _parent));
      } else if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><!--[-->`);
        ssrRenderList(3, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 4 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 4 })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(items).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("study.finder.noResultsTitle"),
          description: unref(t)("study.finder.noResults"),
          icon: "book"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (p) => {
          _push(`<li class="space-y-3">`);
          _push(ssrRenderComponent(_component_StudyProgramCard, {
            program: p,
            "show-match": ""
          }, null, _parent));
          if (p.match) {
            _push(`<details class="rounded-md border border-line bg-surface p-3 text-sm"><summary class="inline-flex min-h-touch cursor-pointer items-center font-medium text-primary-strong">${ssrInterpolate(unref(t)("study.finder.why"))}</summary>`);
            _push(ssrRenderComponent(_component_JobsMatchReasons, {
              match: p.match,
              compact: "",
              heading: unref(t)("study.finder.why"),
              class: "mt-2"
            }, null, _parent));
            _push(`</details>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_f = (_e = unref(meta)) == null ? void 0 : _e.page) != null ? _f : 1,
          "last-page": (_h = (_g = unref(meta)) == null ? void 0 : _g.last_page) != null ? _h : 1,
          onChange: changePage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/finder.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=finder-CvB26fTV.mjs.map
