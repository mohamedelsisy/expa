import { _ as _sfc_main$2 } from './Breadcrumbs-C7SaJcTR.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, _ as _sfc_main$3, d as _sfc_main$5$1, i as _sfc_main$2$1, j as isApiError, n as navigateTo, c as useLocalePath, e as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$5 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$6 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$9 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$a } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$b } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$d } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$e } from './Rating-BFS29wss.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, isRef, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { S as SERVICE_LANGUAGES, l as languageName } from './services-h_WXKmjh.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Card",
  __ssrInlineRender: true,
  props: {
    provider: {}
  },
  setup(__props) {
    const { t, locale } = useI18n();
    const localePath = useLocalePath();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiCard = _sfc_main$9;
      const _component_UiBadge = _sfc_main$d;
      const _component_ServicesVerification = _sfc_main$1$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ServicesRating = _sfc_main$e;
      const _component_UiIcon = _sfc_main$5$1;
      _push(ssrRenderComponent(_component_UiCard, mergeProps({
        as: "article",
        class: "relative flex h-full flex-col gap-3 transition-shadow focus-within:shadow-3 hover:shadow-2"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f;
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.provider.category_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.provider.category_label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_ServicesVerification, {
              verification: __props.provider.verification
            }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)(`/services/${__props.provider.slug}`),
              class: "after:absolute after:inset-0 after:content-['']",
              dir: "auto"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.provider.display_name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.provider.display_name), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2>`);
            if (__props.provider.headline) {
              _push2(`<p class="line-clamp-3 text-ink-soft" dir="auto"${_scopeId}>${ssrInterpolate(__props.provider.headline)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_ServicesRating, {
              average: __props.provider.rating.average,
              count: __props.provider.rating.count
            }, null, _parent2, _scopeId));
            _push2(`<div class="mt-auto space-y-1 pt-2 text-sm text-muted"${_scopeId}>`);
            if (__props.provider.city || __props.provider.region) {
              _push2(`<p class="flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "map",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate((_c = (_a = __props.provider.city) == null ? void 0 : _a.name) != null ? _c : (_b = __props.provider.region) == null ? void 0 : _b.name)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.provider.serves_online) {
              _push2(`<p class="flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "globe",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("services.online"))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.provider.languages.length) {
              _push2(`<p${_scopeId}><bdi${_scopeId}>${ssrInterpolate(__props.provider.languages.map((l) => unref(languageName)(l, unref(locale))).join(" \xB7 "))}</bdi></p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="font-medium text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("services.thirdParty"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                createVNode(_component_UiBadge, { tone: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.provider.category_label), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_ServicesVerification, {
                  verification: __props.provider.verification
                }, null, 8, ["verification"])
              ]),
              createVNode("h2", { class: "text-lg font-bold" }, [
                createVNode(_component_NuxtLink, {
                  to: unref(localePath)(`/services/${__props.provider.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']",
                  dir: "auto"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.provider.display_name), 1)
                  ]),
                  _: 1
                }, 8, ["to"])
              ]),
              __props.provider.headline ? (openBlock(), createBlock("p", {
                key: 0,
                class: "line-clamp-3 text-ink-soft",
                dir: "auto"
              }, toDisplayString(__props.provider.headline), 1)) : createCommentVNode("", true),
              createVNode(_component_ServicesRating, {
                average: __props.provider.rating.average,
                count: __props.provider.rating.count
              }, null, 8, ["average", "count"]),
              createVNode("div", { class: "mt-auto space-y-1 pt-2 text-sm text-muted" }, [
                __props.provider.city || __props.provider.region ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "flex items-center gap-1.5"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "map",
                    size: 16
                  }),
                  createTextVNode(toDisplayString((_f = (_d = __props.provider.city) == null ? void 0 : _d.name) != null ? _f : (_e = __props.provider.region) == null ? void 0 : _e.name), 1)
                ])) : createCommentVNode("", true),
                __props.provider.serves_online ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "flex items-center gap-1.5"
                }, [
                  createVNode(_component_UiIcon, {
                    name: "globe",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("services.online")), 1)
                ])) : createCommentVNode("", true),
                __props.provider.languages.length ? (openBlock(), createBlock("p", { key: 2 }, [
                  createVNode("bdi", null, toDisplayString(__props.provider.languages.map((l) => unref(languageName)(l, unref(locale))).join(" \xB7 ")), 1)
                ])) : createCommentVNode("", true),
                createVNode("p", { class: "font-medium text-ink-soft" }, toDisplayString(unref(t)("services.thirdParty")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/services/Card.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    useSeo(() => ({ title: t("services.seo.title"), description: t("services.seo.description") }));
    const get = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const q = computed(() => get("q"));
    const category = computed(() => get("category"));
    const city = computed(() => get("city"));
    const language = computed(() => get("language"));
    const verified = computed(() => get("verified"));
    const online = computed(() => get("online"));
    const sort = computed(() => get("sort"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const { data: lookups, error: lookupError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("services-lookups", async () => {
      const [meta2, cities] = await Promise.all([request("providers/meta"), request("cities")]);
      return { meta: meta2.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: c.slug, label: c.name }));
    });
    const langOptions = computed(() => SERVICE_LANGUAGES.map((l) => ({ value: l, label: languageName(l, locale.value) })));
    const sortOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = lookups.value) == null ? void 0 : _a.meta.sorts) != null ? _b : []).map((v) => ({ value: v, label: t(`services.sort.${v}`) }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("providers", () => request("providers", {
      query: { q: q.value, category: category.value, city: city.value, language: language.value, verified: verified.value, online: online.value, sort: sort.value, page: page.value, per_page: 12 }
    }), { watch: [q, category, city, language, verified, online, sort, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(q.value || category.value || city.value || language.value || verified.value || online.value || sort.value));
    function setQuery(patch) {
      const merged = { q: q.value, category: category.value, city: city.value, language: language.value, verified: verified.value, online: online.value, sort: sort.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0 && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("services.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiBreadcrumbs = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiFormField = _sfc_main$5;
      const _component_UiTextInput = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiCheckbox = _sfc_main$8;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiCard = _sfc_main$9;
      const _component_UiSkeleton = _sfc_main$a;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$b;
      const _component_ServicesCard = _sfc_main$1;
      const _component_UiPagination = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 flex flex-wrap items-end justify-between gap-3"><div class="max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("services.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("services.subtitle"))}</p></div>`);
      if (unref(auth).isAuthenticated) {
        _push(`<div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/my-requests",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("services.myRequests"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("services.myRequests")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/provider",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.entry"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.entry")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/provider",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.entry"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.entry")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</header>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-6",
        "data-testid": "services-notice"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(`${ssrInterpolate((_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.notice) != null ? _b2 : unref(t)("services.noticeFallback"))}`);
          } else {
            return [
              createTextVNode(toDisplayString((_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.notice) != null ? _d2 : unref(t)("services.noticeFallback")), 1)
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
              placeholder: unref(t)("services.searchPlaceholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("services.searchPlaceholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("services.category")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(category),
              options: (_b2 = (_a2 = unref(lookups)) == null ? void 0 : _a2.meta.categories) != null ? _b2 : [],
              placeholder: unref(t)("services.allCategories"),
              "onUpdate:modelValue": ($event) => setQuery({ category: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(category),
                options: (_d2 = (_c2 = unref(lookups)) == null ? void 0 : _c2.meta.categories) != null ? _d2 : [],
                placeholder: unref(t)("services.allCategories"),
                "onUpdate:modelValue": ($event) => setQuery({ category: $event })
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
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("services.language")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(language),
              options: unref(langOptions),
              placeholder: unref(t)("services.anyLanguage"),
              "onUpdate:modelValue": ($event) => setQuery({ language: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(language),
                options: unref(langOptions),
                placeholder: unref(t)("services.anyLanguage"),
                "onUpdate:modelValue": ($event) => setQuery({ language: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("articles.sortBy")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(sort),
              options: unref(sortOptions),
              placeholder: unref(t)("services.sort.default"),
              "onUpdate:modelValue": ($event) => setQuery({ sort: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(sort),
                options: unref(sortOptions),
                placeholder: unref(t)("services.sort.default"),
                "onUpdate:modelValue": ($event) => setQuery({ sort: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-col justify-end">`);
      _push(ssrRenderComponent(_component_UiCheckbox, {
        "model-value": unref(verified) === "1",
        label: unref(t)("services.onlyVerified"),
        "onUpdate:modelValue": ($event) => setQuery({ verified: $event ? "1" : "" })
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        "model-value": unref(online) === "1",
        label: unref(t)("services.onlyOnline"),
        "onUpdate:modelValue": ($event) => setQuery({ online: $event ? "1" : "" })
      }, null, _parent));
      _push(`</div><div class="flex items-end gap-2">`);
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
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("services.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("services.empty"),
          icon: "user"
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
        _push(`<!--[--><p class="mb-4 text-sm text-muted">${ssrInterpolate(unref(t)("services.resultsCount", { count: (_b = (_a = unref(meta)) == null ? void 0 : _a.total) != null ? _b : unref(items).length }))}</p><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (p) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_ServicesCard, { provider: p }, null, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_d = (_c = unref(meta)) == null ? void 0 : _c.page) != null ? _d : 1,
          "last-page": (_f = (_e = unref(meta)) == null ? void 0 : _e.last_page) != null ? _f : 1,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/services/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B4oNY3Rr.mjs.map
