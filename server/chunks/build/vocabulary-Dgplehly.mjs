import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, f as useRoute, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './ListenButton-BzYdaHKB.mjs';
import { _ as _sfc_main$a } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$b } from './ReviewedNotice-RpV3jHT3.mjs';
import { _ as _sfc_main$c } from './Pagination-DA28GIFv.mjs';
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
import './Alert-D-zfMDy5.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "vocabulary",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    useSeo(() => ({ title: t("vocab.seo.title"), description: t("vocab.seo.description") }));
    const get = (k) => typeof route.query[k] === "string" ? route.query[k] : "";
    const level = computed(() => get("level"));
    const category = computed(() => get("category"));
    const q = computed(() => get("q"));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const search = ref(q.value);
    watch(q, (v) => {
      search.value = v;
    });
    const LEVELS = ["a0", "a1", "a2", "b1", "b2", "c1"];
    const levelOptions = computed(() => LEVELS.map((l) => ({ value: l, label: t(`learn.levels.${l}`) })));
    const { data: scenarios } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("vocab-scenarios", async () => (await request("italian/scenarios")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const categoryOptions = computed(() => {
      var _a;
      return ((_a = scenarios.value) != null ? _a : []).filter((s) => s.vocabulary > 0).map((s) => ({ value: s.value, label: s.label }));
    });
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("vocabulary", () => request("italian/vocabulary", { query: { level: level.value, category: category.value, q: q.value, page: page.value, per_page: 30 } }), { watch: [level, category, q, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const hasFilters = computed(() => !!(level.value || category.value || q.value));
    function setQuery(patch) {
      const merged = { level: level.value, category: category.value, q: q.value, ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== "" && v !== void 0) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const clear = () => {
      search.value = "";
      return navigateTo({ path: route.path });
    };
    const crumbs = computed(() => [{ label: t("learn.title"), to: "/learn-italian" }, { label: t("practice.title"), to: "/learn-italian/practice" }, { label: t("vocab.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
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
      const _component_LearnListenButton = _sfc_main$9;
      const _component_UiBadge = _sfc_main$a;
      const _component_LearnReviewedNotice = _sfc_main$b;
      const _component_UiPagination = _sfc_main$c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("vocab.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("vocab.subtitle"))}</p></header><form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.search"),
        class: "sm:col-span-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(search),
              "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
              type: "search",
              inputmode: "search",
              maxlength: 100,
              placeholder: unref(t)("vocab.searchPlaceholder")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(search),
                "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                type: "search",
                inputmode: "search",
                maxlength: 100,
                placeholder: unref(t)("vocab.searchPlaceholder")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("learn.level")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(level),
              options: unref(levelOptions),
              placeholder: unref(t)("learn.allLevels"),
              "onUpdate:modelValue": ($event) => setQuery({ level: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(level),
                options: unref(levelOptions),
                placeholder: unref(t)("learn.allLevels"),
                "onUpdate:modelValue": ($event) => setQuery({ level: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("vocab.category")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(category),
              options: unref(categoryOptions),
              placeholder: unref(t)("vocab.allCategories"),
              "onUpdate:modelValue": ($event) => setQuery({ category: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(category),
                options: unref(categoryOptions),
                placeholder: unref(t)("vocab.allCategories"),
                "onUpdate:modelValue": ($event) => setQuery({ category: $event })
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
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul class="space-y-3" aria-busy="true"><!--[-->`);
        ssrRenderList(5, (n) => {
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
      } else if (!unref(items).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(hasFilters) ? unref(t)("guides.noResultsTitle") : unref(t)("vocab.emptyTitle"),
          description: unref(hasFilters) ? unref(t)("guides.noResults") : unref(t)("vocab.empty"),
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
        _push(`<!--[--><p class="mb-3 text-sm text-muted">${ssrInterpolate(unref(t)("vocab.resultsCount", { count: (_b = (_a = unref(meta)) == null ? void 0 : _a.total) != null ? _b : unref(items).length }))}</p><ul class="divide-y divide-line rounded-lg border border-line bg-surface" data-testid="vocab-list"><!--[-->`);
        ssrRenderList(unref(items), (v) => {
          _push(`<li class="space-y-1 p-4"><div class="flex flex-wrap items-center gap-2"><span class="text-lg font-bold" lang="it" dir="ltr">${ssrInterpolate(v.lemma)}</span>`);
          _push(ssrRenderComponent(_component_LearnListenButton, {
            text: v.lemma
          }, null, _parent));
          _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(v.level_label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(v.level_label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          if (v.category_label) {
            _push(ssrRenderComponent(_component_UiBadge, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(v.category_label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(v.category_label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_LearnReviewedNotice, {
            item: v,
            compact: ""
          }, null, _parent));
          _push(`</div>`);
          if (v.gloss) {
            _push(`<p class="text-ink" dir="auto">${ssrInterpolate(v.gloss)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (v.example_it) {
            _push(`<p class="text-sm text-ink-soft"><span lang="it" dir="ltr">${ssrInterpolate(v.example_it)}</span>`);
            if (v.example_gloss) {
              _push(`<!--[--> \u2014 <span dir="auto">${ssrInterpolate(v.example_gloss)}</span><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p>`);
          } else {
            _push(`<!---->`);
          }
          if (v.fallback) {
            _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("guides.shownIn", { language: unref(t)(`languages.${v.locale}`) }))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-6">`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/vocabulary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=vocabulary-Dgplehly.mjs.map
