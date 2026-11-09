import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './VerifyNotice-j4MOQa_K.mjs';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$5 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, c as useLocalePath, g as useApi, i as _sfc_main$2$1, j as isApiError, e as __nuxt_component_0, z as formatDay, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$8 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$9 } from './SourceBadge-4_eAChkr.mjs';
import { _ as _sfc_main$a } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
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
    useSeo(() => ({ title: t("study.scholarships.title"), description: t("study.scholarships.subtitle") }));
    const degree = computed(() => typeof route.query.degree === "string" ? route.query.degree : "");
    const openOnly = computed(() => route.query.open_only === "1");
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const { data: meta0 } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("study-sch-meta", async () => (await request("study/meta")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("study-scholarships", () => request("study/scholarships", { query: { degree: degree.value, open_only: openOnly.value ? 1 : void 0, page: page.value, per_page: 12 } }), { watch: [degree, openOnly, page, locale] })), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    function setQuery(patch) {
      const merged = { degree: degree.value, open_only: openOnly.value ? "1" : "", ...patch };
      const next = {};
      for (const [k, v] of Object.entries(merged)) if (v !== void 0 && v !== "" && v !== null) next[k] = String(v);
      if (!("page" in patch)) delete next.page;
      return navigateTo({ path: route.path, query: next });
    }
    const crumbs = computed(() => [{ label: t("nav.home"), to: "/" }, { label: t("study.title"), to: "/study" }, { label: t("study.scholarships.title") }]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_StudyVerifyNotice = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiSelect = _sfc_main$4;
      const _component_UiCheckbox = _sfc_main$5;
      const _component_UiCard = _sfc_main$6;
      const _component_UiSkeleton = _sfc_main$7;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$8;
      const _component_UiSourceBadge = _sfc_main$9;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiPagination = _sfc_main$a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<header class="mb-6 max-w-2xl"><h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("study.scholarships.title"))}</h1><p class="mt-1 text-ink-soft">${ssrInterpolate(unref(t)("study.scholarships.subtitle"))}</p></header>`);
      _push(ssrRenderComponent(_component_StudyVerifyNotice, {
        text: (_c = (_a = unref(items)[0]) == null ? void 0 : _a.verify_notice) != null ? _c : (_b = unref(meta0)) == null ? void 0 : _b.verify_notice,
        class: "mb-6"
      }, null, _parent));
      _push(`<form role="search" class="mb-8 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("study.degree")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              "model-value": unref(degree),
              options: (_b2 = (_a2 = unref(meta0)) == null ? void 0 : _a2.degree_levels) != null ? _b2 : [],
              placeholder: unref(t)("study.any"),
              "onUpdate:modelValue": ($event) => setQuery({ degree: $event })
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                "model-value": unref(degree),
                options: (_d2 = (_c2 = unref(meta0)) == null ? void 0 : _c2.degree_levels) != null ? _d2 : [],
                placeholder: unref(t)("study.any"),
                "onUpdate:modelValue": ($event) => setQuery({ degree: $event })
              }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        "model-value": unref(openOnly),
        "onUpdate:modelValue": ($event) => setQuery({ open_only: $event ? "1" : "" })
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("study.openOnly"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("study.openOnly")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form><div aria-live="polite" class="sr-only">${ssrInterpolate(unref(meta) ? unref(t)("guides.resultsCount", { count: (_d = unref(meta).total) != null ? _d : unref(items).length }) : "")}</div>`);
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
          title: unref(t)("study.scholarships.emptyTitle"),
          description: unref(t)("study.scholarships.empty"),
          icon: "euro"
        }, null, _parent));
      } else {
        _push(`<!--[--><ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(unref(items), (s) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex h-full flex-col gap-2 transition-shadow focus-within:shadow-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex flex-wrap gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiSourceBadge, {
                  type: s.source.type
                }, null, _parent2, _scopeId));
                _push2(`</div><h2 class="text-lg font-bold"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/study/scholarships/${s.slug}`),
                  class: "after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(s.name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(s.name), 1)
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
                _push2(`<p class="mt-auto pt-2 text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("study.deadline"))}: <span class="font-medium text-ink"${_scopeId}>${ssrInterpolate(s.deadline.date ? unref(formatDay)(s.deadline.date, unref(locale)) : unref(t)("study.notStated"))}</span>`);
                if (s.deadline.status === "passed") {
                  _push2(`<span class="text-danger"${_scopeId}> \xB7 ${ssrInterpolate(unref(t)("study.passed"))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p>`);
              } else {
                return [
                  createVNode("div", { class: "flex flex-wrap gap-2" }, [
                    createVNode(_component_UiSourceBadge, {
                      type: s.source.type
                    }, null, 8, ["type"])
                  ]),
                  createVNode("h2", { class: "text-lg font-bold" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)(`/study/scholarships/${s.slug}`),
                      class: "after:absolute after:inset-0 after:content-['']"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(s.name), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]),
                  s.summary ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "line-clamp-3 text-ink-soft"
                  }, toDisplayString(s.summary), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "mt-auto pt-2 text-sm text-muted" }, [
                    createTextVNode(toDisplayString(unref(t)("study.deadline")) + ": ", 1),
                    createVNode("span", { class: "font-medium text-ink" }, toDisplayString(s.deadline.date ? unref(formatDay)(s.deadline.date, unref(locale)) : unref(t)("study.notStated")), 1),
                    s.deadline.status === "passed" ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-danger"
                    }, " \xB7 " + toDisplayString(unref(t)("study.passed")), 1)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study/scholarships/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C-SZ1KGs.mjs.map
