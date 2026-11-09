import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './TextInput-BI4efS3_.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './Chips-BU8ln322.mjs';
import { _ as _sfc_main$7 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$8 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$9 } from './Badge-PdKIsny2.mjs';
import { a as _sfc_main$1$1, _ as _sfc_main$a } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$b } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, ref, watch, withAsyncContext, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { m as mapApiRoute } from './routes-BNQ9Jhms.mjs';
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
  __name: "search",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const localePath = useLocalePath();
    const { request } = useApi();
    const q = computed(() => typeof route.query.q === "string" ? route.query.q.trim() : "");
    const type = computed(() => typeof route.query.type === "string" ? route.query.type : "");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    useSeo(() => ({ title: q.value ? `${q.value} | ${t("search.title")}` : t("search.title"), description: t("search.subtitle"), noindex: true }));
    const input = ref(q.value);
    watch(q, (v) => {
      input.value = v;
    });
    const tooShort = computed(() => q.value.length > 0 && q.value.length < 2);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("search", async () => {
      if (q.value.length < 2) return null;
      return request("search", { query: { q: q.value, "types[]": type.value, page: page.value, per_page: 20 }, handle401: false });
    }, { watch: [q, type, page, locale] })), __temp = await __temp, __restore(), __temp);
    const results = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const facets = computed(() => {
      var _a, _b;
      return (_b = (_a = meta.value) == null ? void 0 : _a.facets) != null ? _b : [];
    });
    const chips = computed(() => [{ value: "", label: t("search.allTypes"), count: facets.value.reduce((n, f) => n + f.count, 0) }, ...facets.value.map((f) => ({ value: f.type, label: f.label, count: f.count }))]);
    function go(patch) {
      const merged = { q: q.value, type: type.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const pathFor = (r) => mapApiRoute(r.route);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiTextInput = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_UiChips = _sfc_main$6;
      const _component_UiCard = _sfc_main$7;
      const _component_UiSkeleton = _sfc_main$8;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$9;
      const _component_UiItalianTerm = _sfc_main$1$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiAutoItalian = _sfc_main$a;
      const _component_UiPagination = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-4xl py-8 sm:py-12" }, _attrs))}><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("search.title"))}</h1><form role="search" class="my-6 flex flex-wrap items-end gap-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("search.label"),
        class: "min-w-0 flex-1 basis-64",
        error: unref(tooShort) ? unref(t)("search.tooShort") : void 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(input),
              "onUpdate:modelValue": ($event) => isRef(input) ? input.value = $event : null,
              type: "search",
              inputmode: "search",
              maxlength: 100,
              placeholder: unref(t)("search.placeholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(input),
                "onUpdate:modelValue": ($event) => isRef(input) ? input.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("search.placeholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
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
      _push(`</form>`);
      if (!unref(q)) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("search.startTitle"),
          description: unref(t)("search.start"),
          icon: "search"
        }, null, _parent));
      } else if (!unref(tooShort)) {
        _push(`<!--[-->`);
        if (unref(facets).length) {
          _push(ssrRenderComponent(_component_UiChips, {
            "model-value": unref(type),
            options: unref(chips),
            label: unref(t)("search.filterByType"),
            class: "mb-5",
            "onUpdate:modelValue": ($event) => go({ type: $event })
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("search.resultsCount", { count: (_a = unref(meta).total) != null ? _a : unref(results).length }) : "")}</div>`);
        if (unref(status) === "pending" && !unref(data)) {
          _push(`<ul aria-busy="true" class="space-y-3"><!--[-->`);
          ssrRenderList(4, (n) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiSkeleton, { lines: 2 }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiSkeleton, { lines: 2 })
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
        } else if (!unref(results).length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("search.noResultsTitle"),
            description: unref(t)("search.noResults", { q: unref(q) }),
            icon: "search"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: "/guides",
                  variant: "secondary"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("landing.cta.explore"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("landing.cta.explore")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiButton, {
                    to: "/guides",
                    variant: "secondary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("landing.cta.explore")), 1)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!--[--><p class="mb-4 text-sm text-muted">${ssrInterpolate(unref(t)("search.resultsCount", { count: (_c = (_b = unref(meta)) == null ? void 0 : _b.total) != null ? _c : unref(results).length }))}</p><ul class="space-y-3"><!--[-->`);
          ssrRenderList(unref(results), (r) => {
            _push(`<li>`);
            _push(ssrRenderComponent(_component_UiCard, {
              as: "article",
              class: "relative space-y-1.5 hover:shadow-2",
              "data-testid": "search-result"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2;
                if (_push2) {
                  _push2(`<div class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(r.type_label)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(r.type_label), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  if ((_a2 = r.meta) == null ? void 0 : _a2.italian_term) {
                    _push2(ssrRenderComponent(_component_UiItalianTerm, null, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`${ssrInterpolate(r.meta.italian_term)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(r.meta.italian_term), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
                  if (pathFor(r)) {
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: unref(localePath)(pathFor(r)),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UiAutoItalian, {
                            text: r.title
                          }, null, _parent3, _scopeId2));
                        } else {
                          return [
                            createVNode(_component_UiAutoItalian, {
                              text: r.title
                            }, null, 8, ["text"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(ssrRenderComponent(_component_UiAutoItalian, {
                      text: r.title
                    }, null, _parent2, _scopeId));
                  }
                  _push2(`</h2>`);
                  if (r.snippet) {
                    _push2(`<p class="line-clamp-2 text-ink-soft" dir="auto"${_scopeId}>${ssrInterpolate(r.snippet)}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (r.locale && r.locale !== unref(locale)) {
                    _push2(`<p class="text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("guides.shownIn", { language: unref(t)(`languages.${r.locale}`) }))}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                      createVNode(_component_UiBadge, { tone: "primary" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(r.type_label), 1)
                        ]),
                        _: 2
                      }, 1024),
                      ((_b2 = r.meta) == null ? void 0 : _b2.italian_term) ? (openBlock(), createBlock(_component_UiItalianTerm, { key: 0 }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(r.meta.italian_term), 1)
                        ]),
                        _: 2
                      }, 1024)) : createCommentVNode("", true)
                    ]),
                    createVNode("h2", { class: "text-lg font-bold" }, [
                      pathFor(r) ? (openBlock(), createBlock(_component_NuxtLink, {
                        key: 0,
                        to: unref(localePath)(pathFor(r)),
                        class: "after:absolute after:inset-0 after:content-['']"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UiAutoItalian, {
                            text: r.title
                          }, null, 8, ["text"])
                        ]),
                        _: 2
                      }, 1032, ["to"])) : (openBlock(), createBlock(_component_UiAutoItalian, {
                        key: 1,
                        text: r.title
                      }, null, 8, ["text"]))
                    ]),
                    r.snippet ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "line-clamp-2 text-ink-soft",
                      dir: "auto"
                    }, toDisplayString(r.snippet), 1)) : createCommentVNode("", true),
                    r.locale && r.locale !== unref(locale) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-xs text-muted"
                    }, toDisplayString(unref(t)("guides.shownIn", { language: unref(t)(`languages.${r.locale}`) })), 1)) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ul><div class="mt-8">`);
          _push(ssrRenderComponent(_component_UiPagination, {
            page: (_e = (_d = unref(meta)) == null ? void 0 : _d.page) != null ? _e : 1,
            "last-page": (_g = (_f = unref(meta)) == null ? void 0 : _f.last_page) != null ? _g : 1,
            onChange: ($event) => go({ page: $event })
          }, null, _parent));
          _push(`</div><!--]-->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=search-BklSqMZz.mjs.map
