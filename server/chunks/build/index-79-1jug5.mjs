import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$5 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, f as useRoute, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$a } from './ProgramCard-C1FRZnZv.mjs';
import { _ as _sfc_main$b } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './Badge-PdKIsny2.mjs';
import './money-CRo_itTF.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    useSeo(() => ({ title: t("study.programs.title"), description: t("study.programs.subtitle") }));
    const str = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const q = computed(() => str("q"));
    const field = computed(() => str("field"));
    const degree = computed(() => str("degree"));
    const language = computed(() => str("language"));
    const city = computed(() => str("city"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: lookups, error: lookupError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("study-lookups", async () => {
      const [meta2, cities] = await Promise.all([request("study/meta"), request("cities")]);
      return { meta: meta2.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const languageOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.meta.languages) != null ? _b : []).filter((l) => l.value !== "both");
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("study-programs", () => request("study/programs", {
      query: { q: q.value, field: field.value, degree: degree.value, language: language.value, city: city.value, page: page.value, per_page: 12 }
    }), { watch: [q, field, degree, language, city, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || field.value || degree.value || language.value || city.value));
    function setQuery(patch) {
      const merged = { q: q.value, field: field.value, degree: degree.value, language: language.value, city: city.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== void 0 && v !== "" && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.programs.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_StudyVerifyNotice = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiSelect = _sfc_main$5;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiAlert = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$9;
      const _component_StudyProgramCard = _sfc_main$a;
      const _component_UiPagination = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("study.programs.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("study.programs.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_StudyVerifyNotice, {
        text: (_c = (_a = unref(items)[0]) == null ? void 0 : _a.verify_notice) != null ? _c : (_b = unref(lookups)) == null ? void 0 : _b.meta.verify_notice,
        class: "mb-6"
      }, null, _parent));
      _push(`<form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.search")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(search),
              "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
              type: "search",
              inputmode: "search",
              maxlength: 100
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.field")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(field),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.fields) != null ? _b2 : [],
              placeholder: unref(t)("study.any"),
              "onUpdate:modelValue": ($event) => setQuery({ field: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(field),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.fields) != null ? _d2 : [],
                placeholder: unref(t)("study.any"),
                "onUpdate:modelValue": ($event) => setQuery({ field: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.degree")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(degree),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.degree_levels) != null ? _b2 : [],
              placeholder: unref(t)("study.any"),
              "onUpdate:modelValue": ($event) => setQuery({ degree: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(degree),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.degree_levels) != null ? _d2 : [],
                placeholder: unref(t)("study.any"),
                "onUpdate:modelValue": ($event) => setQuery({ degree: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.language")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(language),
              options: unref(languageOptions),
              placeholder: unref(t)("study.any"),
              "onUpdate:modelValue": ($event) => setQuery({ language: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(language),
                options: unref(languageOptions),
                placeholder: unref(t)("study.any"),
                "onUpdate:modelValue": ($event) => setQuery({ language: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.city")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(city),
              options: unref(cityOptions),
              placeholder: unref(t)("guides.allCities"),
              "onUpdate:modelValue": ($event) => setQuery({ city: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(city),
                options: unref(cityOptions),
                placeholder: unref(t)("guides.allCities"),
                "onUpdate:modelValue": ($event) => setQuery({ city: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-end gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, { type: "submit" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "search",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("guides.searchButton"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "search",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("guides.searchButton")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(hasFilters)) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: clear
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("guides.clear"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form>`);
      if (unref(lookupError)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          class: "mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("guides.filtersUnavailable"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("guides.filtersUnavailable")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("guides.resultsCount", { count: (_d = unref(meta).total) != null ? _d : unref(items).length }) : "")}</div>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><!--[-->`);
        ssrRenderList(6, (n) => {
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
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("study.programs.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("study.programs.empty"),
          icon: "book"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(hasFilters)) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: clear
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("guides.clear"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(hasFilters) ? (openBlock(), createBlock(_component_UiButton, {
                  key: 0,
                  variant: "secondary",
                  onClick: clear
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("guides.clear")), 1)
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (p) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_StudyProgramCard, { program: p }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_f = (_e = unref(meta)) == null ? void 0 : _e.page) != null ? _f : 1,
          "last-page": (_h = (_g = unref(meta)) == null ? void 0 : _g.last_page) != null ? _h : 1,
          onChange: ($event) => setQuery({ page: $event })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/programs/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-79-1jug5.mjs.map
