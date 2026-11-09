import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './GuideCard-DdNhOq5I.mjs';
import { _ as _sfc_main$a } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './SourceBadge-4_eAChkr.mjs';
import './AutoItalian-BD4PyQ-n.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const PER_PAGE = 12;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    useLocalePath();
    const { request } = useApi();
    useSeo(() => ({ title: t("guides.seo.title"), description: t("guides.seo.description") }));
    const q = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const category = computed(() => typeof route.query.category === "string" ? route.query.category : "");
    const region = computed(() => typeof route.query.region === "string" ? route.query.region : "");
    const city = computed(() => typeof route.query.city === "string" ? route.query.city : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: lookups, error: lookupError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("guide-lookups", async () => {
      const [cats, cities] = await Promise.all([request("guides/categories"), request("cities")]);
      return { categories: cats.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const regions = computed(() => {
      var _a, _b;
      const m = /* @__PURE__ */ new Map();
      for (const c of (_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []) m.set(c.region.slug, c.region.name);
      return [...m.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, locale.value));
    });
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).filter((c) => !region.value || c.region.slug === region.value).map((c) => ({ value: c.slug, label: c.name }));
    });
    const categoryOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.categories) != null ? _b : []).map((c) => ({ value: c.value, label: c.label }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("guides", () => request("guides", {
      query: { q: q.value, category: category.value, region: city.value ? "" : region.value, city: city.value, page: page.value, per_page: PER_PAGE }
    }), { watch: [q, category, region, city, page, locale] })), __temp = await __temp, __restore(), __temp);
    const guides = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || category.value || region.value || city.value));
    function setQuery(patch) {
      const next = {};
      const merged = { q: q.value, category: category.value, region: region.value, city: city.value, ...patch };
      for (const [k, v] of Object.entries(merged)) if (v !== void 0 && v !== "" && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const onRegion = (v) => setQuery({ region: v, city: "" });
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const changePage = (p) => setQuery({ page: p });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiTextInput = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiCard = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_GuideCard = _sfc_main$9;
      const _component_UiPagination = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("guides.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("guides.subtitle"))}</p></header><form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">`);
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
              placeholder: unref(t)("guides.searchPlaceholder"),
              maxlength: 100
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                placeholder: unref(t)("guides.searchPlaceholder"),
                maxlength: 100
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.category")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(category),
              options: unref(categoryOptions),
              placeholder: unref(t)("guides.allCategories"),
              "onUpdate:modelValue": ($event) => setQuery({ category: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(category),
                options: unref(categoryOptions),
                placeholder: unref(t)("guides.allCategories"),
                "onUpdate:modelValue": ($event) => setQuery({ category: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.region")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(region),
              options: unref(regions),
              placeholder: unref(t)("guides.allRegions"),
              "onUpdate:modelValue": onRegion
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(region),
                options: unref(regions),
                placeholder: unref(t)("guides.allRegions"),
                "onUpdate:modelValue": onRegion
              }, null, 8, ["model-value", "options", "placeholder"])
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
      _push(`<div class="flex gap-2 sm:col-span-2 lg:col-span-1">`);
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
      _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("guides.resultsCount", { count: (_a = unref(meta).total) != null ? _a : unref(guides).length }) : "")}</div>`);
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
      } else if (!unref(guides).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("guides.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("guides.empty"),
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
        _push(`<!--[--><p class="mb-4 text-sm text-muted">${ssrInterpolate(unref(t)("guides.resultsCount", { count: (_c = (_b = unref(meta)) == null ? void 0 : _b.total) != null ? _c : unref(guides).length }))}</p><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(guides), (g) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_GuideCard, { guide: g }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_e = (_d = unref(meta)) == null ? void 0 : _d.page) != null ? _e : 1,
          "last-page": (_g = (_f = unref(meta)) == null ? void 0 : _f.last_page) != null ? _g : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guides/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-5RuPCNqL.mjs.map
