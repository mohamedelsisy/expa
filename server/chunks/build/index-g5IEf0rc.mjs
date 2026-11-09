import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$a } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$b } from './SourceBadge-4_eAChkr.mjs';
import { a as _sfc_main$1$1, _ as _sfc_main$c } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$d } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
import './safe-B2eSdAXJ.mjs';
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
    useSeo(() => ({ title: t("gov.title"), description: t("gov.subtitle") }));
    const q = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const domain = computed(() => typeof route.query.domain === "string" ? route.query.domain : "");
    const region = computed(() => typeof route.query.region === "string" ? route.query.region : "");
    const city = computed(() => typeof route.query.city === "string" ? route.query.city : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const DOMAINS = ["immigration", "tax", "health", "civil_registry", "social_security", "identity", "transport", "postal", "education", "labor", "other"];
    const domainOptions = computed(() => DOMAINS.map((d) => ({ value: d, label: t(`gov.domains.${d}`) })));
    const { data: cities, error: citiesError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("gov-cities", async () => (await request("cities")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const regions = computed(() => {
      var _a;
      const m = /* @__PURE__ */ new Map();
      for (const c of (_a = cities.value) != null ? _a : []) m.set(c.region.slug, c.region.name);
      return [...m.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, locale.value));
    });
    const cityOptions = computed(() => {
      var _a;
      return ((_a = cities.value) != null ? _a : []).filter((c) => !region.value || c.region.slug === region.value).map((c) => ({ value: c.slug, label: c.name }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("gov-services", () => request("government/services", {
      query: { q: q.value, domain: domain.value, region: city.value ? "" : region.value, city: city.value, page: page.value, per_page: 12 }
    }), { watch: [q, domain, region, city, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || domain.value || region.value || city.value));
    function setQuery(patch) {
      const merged = { q: q.value, domain: domain.value, region: region.value, city: city.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== void 0 && v !== "" && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiTextInput = _sfc_main$2;
      const _component_UiSelect = _sfc_main$4;
      const _component_UiAlert = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$9;
      const _component_UiBadge = _sfc_main$a;
      const _component_UiSourceBadge = _sfc_main$b;
      const _component_UiItalianTerm = _sfc_main$1$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAutoItalian = _sfc_main$c;
      const _component_UiPagination = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}><header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("gov.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("gov.subtitle"))}</p></header><div class="mb-6 flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        to: "/appointments",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "calendar",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("gov.toAppointments"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "calendar",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("gov.toAppointments")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">`);
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
              maxlength: 100,
              placeholder: unref(t)("gov.searchPlaceholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("gov.searchPlaceholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("gov.domain")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(domain),
              options: unref(domainOptions),
              placeholder: unref(t)("gov.allDomains"),
              "onUpdate:modelValue": ($event) => setQuery({ domain: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(domain),
                options: unref(domainOptions),
                placeholder: unref(t)("gov.allDomains"),
                "onUpdate:modelValue": ($event) => setQuery({ domain: $event })
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
              "onUpdate:modelValue": ($event) => setQuery({ region: $event, city: "" })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(region),
                options: unref(regions),
                placeholder: unref(t)("guides.allRegions"),
                "onUpdate:modelValue": ($event) => setQuery({ region: $event, city: "" })
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
      if (unref(citiesError)) {
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
      _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("guides.resultsCount", { count: (_a = unref(meta).total) != null ? _a : unref(items).length }) : "")}</div>`);
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
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("gov.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("gov.empty"),
          icon: "building"
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
        ssrRenderList(unref(items), (s) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2, _c2, _d2, _e2, _f, _g, _h;
              if (_push2) {
                _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(s.domain_label)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(s.domain_label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiSourceBadge, {
                  type: s.source.type
                }, null, _parent2, _scopeId));
                if (s.italian_term) {
                  _push2(ssrRenderComponent(_component_UiItalianTerm, null, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(s.italian_term)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(s.italian_term), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/government/services/${s.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiAutoItalian, {
                        text: s.name
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiAutoItalian, {
                          text: s.name
                        }, null, 8, ["text"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h2>`);
                if (s.summary) {
                  _push2(`<p class="line-clamp-3 text-ink-soft"${_scopeId}>${ssrInterpolate(s.summary)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="mt-auto space-y-1 pt-2 text-sm text-muted"${_scopeId}><p class="flex items-center gap-1.5"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "map",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate((_d2 = (_c2 = (_a2 = s.city) == null ? void 0 : _a2.name) != null ? _c2 : (_b2 = s.region) == null ? void 0 : _b2.name) != null ? _d2 : unref(t)("guides.national"))}</p>`);
                if (s.source.freshness !== "fresh") {
                  _push2(`<p class="${ssrRenderClass([s.source.freshness === "stale" ? "text-warning" : "text-danger", "font-medium"])}"${_scopeId}>${ssrInterpolate(unref(t)(`freshness.state.${s.source.freshness}`))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (s.fallback) {
                  _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("guides.shownIn", { language: unref(t)(`languages.${s.locale}`) }))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                    createVNode(_component_UiBadge, { tone: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(s.domain_label), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_UiSourceBadge, {
                      type: s.source.type
                    }, null, 8, ["type"]),
                    s.italian_term ? (openBlock(), createBlock(_component_UiItalianTerm, { key: 0 }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(s.italian_term), 1)
                      ]),
                      _: 2
                    }, 1024)) : createCommentVNode("", true)
                  ]),
                  createVNode("h2", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/government/services/${s.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiAutoItalian, {
                          text: s.name
                        }, null, 8, ["text"])
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  s.summary ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "line-clamp-3 text-ink-soft"
                  }, toDisplayString(s.summary), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "mt-auto space-y-1 pt-2 text-sm text-muted" }, [
                    createVNode("p", { class: "flex items-center gap-1.5" }, [
                      createVNode(_component_UiIcon, {
                        name: "map",
                        size: 16
                      }),
                      createTextVNode(toDisplayString((_h = (_g = (_e2 = s.city) == null ? void 0 : _e2.name) != null ? _g : (_f = s.region) == null ? void 0 : _f.name) != null ? _h : unref(t)("guides.national")), 1)
                    ]),
                    s.source.freshness !== "fresh" ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: ["font-medium", s.source.freshness === "stale" ? "text-warning" : "text-danger"]
                    }, toDisplayString(unref(t)(`freshness.state.${s.source.freshness}`)), 3)) : createCommentVNode("", true),
                    s.fallback ? (openBlock(), createBlock("p", { key: 1 }, toDisplayString(unref(t)("guides.shownIn", { language: unref(t)(`languages.${s.locale}`) })), 1)) : createCommentVNode("", true)
                  ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/government/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-g5IEf0rc.mjs.map
