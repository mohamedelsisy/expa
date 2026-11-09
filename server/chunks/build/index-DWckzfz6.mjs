import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$a } from './SourceBadge-4_eAChkr.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    useSeo(() => ({ title: t("study.universities.title"), description: t("study.universities.subtitle") }));
    const q = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const city = computed(() => typeof route.query.city === "string" ? route.query.city : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: cities } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("study-uni-cities", async () => (await request("cities")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a;
      return ((_a = cities.value) != null ? _a : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("study-universities", () => request("study/universities", { query: { q: q.value, city: city.value, page: page.value, per_page: 12 } }), { watch: [q, city, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || city.value));
    function setQuery(patch) {
      const merged = { q: q.value, city: city.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== void 0 && v !== "" && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.universities.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiTextInput = _sfc_main$3;
      const _component_UiSelect = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiCard = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_UiBadge = _sfc_main$9;
      const _component_UiSourceBadge = _sfc_main$a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiPagination = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("study.universities.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("study.universities.subtitle"))}</p></header><form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] lg:items-end">`);
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
      _push(`<div class="flex gap-2">`);
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
      _push(`</div></form><div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("guides.resultsCount", { count: (_a = unref(meta).total) != null ? _a : unref(items).length }) : "")}</div>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true"><!--[-->`);
        ssrRenderList(6, (n) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSkeleton, { lines: 3 })
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
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("study.universities.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("study.universities.empty"),
          icon: "building"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (u) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(u.kind_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(u.kind_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiSourceBadge, {
                  type: u.source.type
                }, null, _parent2, _scopeId));
                _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/study/universities/${u.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(u.name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(u.name), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h2>`);
                if (u.city) {
                  _push2(`<p class="flex items-center gap-1.5 text-ink-soft"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiIcon, {
                    name: "map",
                    size: 16
                  }, null, _parent2, _scopeId));
                  _push2(`${ssrInterpolate(u.city.name)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (u.summary) {
                  _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(u.summary)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap gap-2" }, [
                    createVNode(_component_UiBadge, { tone: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(u.kind_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiSourceBadge, {
                      type: u.source.type
                    }, null, 8, ["type"])
                  ]),
                  createVNode("h2", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/study/universities/${u.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(u.name), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  u.city ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "flex items-center gap-1.5 text-ink-soft"
                  }, [
                    createVNode(_component_UiIcon, {
                      name: "map",
                      size: 16
                    }),
                    createTextVNode(toDisplayString(u.city.name), 1)
                  ])) : createCommentVNode("", true),
                  u.summary ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "line-clamp-3 text-ink-soft"
                  }, toDisplayString(u.summary), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_c = (_b = unref(meta)) == null ? void 0 : _b.page) != null ? _c : 1,
          "last-page": (_e = (_d = unref(meta)) == null ? void 0 : _d.last_page) != null ? _e : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/universities/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DWckzfz6.mjs.map
