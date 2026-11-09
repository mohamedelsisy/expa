import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$6 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$a } from './JobCard-D1b5_h6j.mjs';
import { _ as _sfc_main$b } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
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
import './money-CRo_itTF.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    useSeo(() => ({ title: t("jobs.title"), description: t("jobs.subtitle") }));
    const q = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const get = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const city = computed(() => get("city"));
    const remote = computed(() => get("remote"));
    const type = computed(() => get("type"));
    const category = computed(() => get("category"));
    const italianMax = computed(() => get("italian_max"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: lookups, error: lookupError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("jobs-lookups", async () => {
      const [meta2, cities] = await Promise.all([request("jobs/meta"), request("cities")]);
      return { meta: meta2.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"];
    const levelOptions = computed(() => LEVELS.map((l) => ({ value: l, label: t(`learn.levels.${l}`) })));
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("jobs", () => request("jobs", {
      query: { q: q.value, city: city.value, remote: remote.value, type: type.value, category: category.value, italian_max: italianMax.value, page: page.value, per_page: 12 }
    }), { watch: [q, city, remote, type, category, italianMax, page, locale] })), __temp = await __temp, __restore(), __temp);
    const jobs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || city.value || remote.value || type.value || category.value || italianMax.value));
    function setQuery(patch) {
      const merged = { q: q.value, city: city.value, remote: remote.value, type: type.value, category: category.value, italian_max: italianMax.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0 && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiSelect = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$9;
      const _component_JobsJobCard = _sfc_main$a;
      const _component_UiPagination = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 flex flex-wrap items-end justify-between gap-3"><div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("jobs.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("jobs.subtitle"))}</p></div>`);
      if (unref(auth).isAuthenticated) {
        _push(`<div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/jobs/recommended",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("jobs.recommended"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("jobs.recommended")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/jobs/saved",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "bookmark",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("jobs.saved"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "bookmark",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("jobs.saved")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/jobs/preferences",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("jobs.preferences"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("jobs.preferences")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(`${ssrInterpolate((_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.apply_notice) != null ? _b2 : unref(t)("jobs.applyNoticeFallback"))}`);
          } else {
            return [
              createTextVNode(toDisplayString((_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.apply_notice) != null ? _d2 : unref(t)("jobs.applyNoticeFallback")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.search"),
        class: "sm:col-span-2 lg:col-span-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(search),
              "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
              type: "search",
              inputmode: "search",
              maxlength: 100,
              placeholder: unref(t)("jobs.searchPlaceholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("jobs.searchPlaceholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
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
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("jobs.remote")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(remote),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.remote_modes) != null ? _b2 : [],
              placeholder: unref(t)("jobs.any"),
              "onUpdate:modelValue": ($event) => setQuery({ remote: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(remote),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.remote_modes) != null ? _d2 : [],
                placeholder: unref(t)("jobs.any"),
                "onUpdate:modelValue": ($event) => setQuery({ remote: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("jobs.employmentType")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(type),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.employment_types) != null ? _b2 : [],
              placeholder: unref(t)("jobs.any"),
              "onUpdate:modelValue": ($event) => setQuery({ type: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(type),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.employment_types) != null ? _d2 : [],
                placeholder: unref(t)("jobs.any"),
                "onUpdate:modelValue": ($event) => setQuery({ type: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("jobs.category")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(category),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.categories) != null ? _b2 : [],
              placeholder: unref(t)("jobs.any"),
              "onUpdate:modelValue": ($event) => setQuery({ category: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(category),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.categories) != null ? _d2 : [],
                placeholder: unref(t)("jobs.any"),
                "onUpdate:modelValue": ($event) => setQuery({ category: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("jobs.italianMax"),
        hint: unref(t)("jobs.italianMaxHint")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(italianMax),
              options: unref(levelOptions),
              placeholder: unref(t)("jobs.any"),
              "onUpdate:modelValue": ($event) => setQuery({ italian_max: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(italianMax),
                options: unref(levelOptions),
                placeholder: unref(t)("jobs.any"),
                "onUpdate:modelValue": ($event) => setQuery({ italian_max: $event })
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
      _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("jobs.resultsCount", { count: (_a = unref(meta).total) != null ? _a : unref(jobs).length }) : "")}</div>`);
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
      } else if (!unref(jobs).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("jobs.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("jobs.empty"),
          icon: "briefcase"
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
        _push(`<!--[--><p class="mb-4 text-sm text-muted">${ssrInterpolate(unref(t)("jobs.resultsCount", { count: (_c = (_b = unref(meta)) == null ? void 0 : _b.total) != null ? _c : unref(jobs).length }))}</p><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(jobs), (j) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_JobsJobCard, { job: j }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_e = (_d = unref(meta)) == null ? void 0 : _d.page) != null ? _e : 1,
          "last-page": (_g = (_f = unref(meta)) == null ? void 0 : _f.last_page) != null ? _g : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/jobs/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DoEnD5q4.mjs.map
