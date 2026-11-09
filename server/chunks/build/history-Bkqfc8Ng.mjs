import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, i as _sfc_main$2, j as isApiError, _ as _sfc_main$3$1, h as formatDateTime, e as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$6 } from './Pagination-DA28GIFv.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
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
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "history",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("patente.history"), description: t("patente.mockNotice"), noindex: true }));
    const page = computed(() => Math.max(1, Number(route.query.page) || 1));
    const { data, error, refresh, status } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("patente-history", () => request("patente/exams", { query: { page: page.value } }), { watch: [page] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiCard = _sfc_main$4;
      const _component_UiBadge = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiPagination = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-6 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.history"))}</h1>`);
      if (unref(status) === "pending" && !unref(data)) {
        _push(`<ul aria-busy="true"><li>`);
        _push(ssrRenderComponent(_component_UiSkeleton, { block: "" }, null, _parent));
        _push(`</li></ul>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("patente.historyEmptyTitle"),
          description: unref(t)("patente.historyEmpty"),
          icon: "clock"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, { to: "/patente/exam" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.startExam"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.startExam")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, { to: "/patente/exam" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("patente.startExam")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[--><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(rows), (e) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "relative flex flex-wrap items-center justify-between gap-3 hover:shadow-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="space-y-1"${_scopeId}><p class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("patente.simulation"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("patente.simulation")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UiBadge, null, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(e.mode === "exam" ? unref(t)("patente.modeExam") : unref(t)("patente.modePractice"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(e.mode === "exam" ? unref(t)("patente.modeExam") : unref(t)("patente.modePractice")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                if (e.mode === "exam") {
                  _push2(ssrRenderComponent(_component_UiBadge, {
                    tone: e.timed_out ? "warning" : e.passed ? "success" : "danger"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(e.timed_out ? unref(t)("patente.timedOutShort") : e.passed ? unref(t)("patente.passedShort") : unref(t)("patente.failedShort"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(e.timed_out ? unref(t)("patente.timedOutShort") : e.passed ? unref(t)("patente.passedShort") : unref(t)("patente.failedShort")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</p><p class="text-sm text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("patente.scoreLine", { correct: e.correct, errors: e.errors, total: e.total }))} \xB7 ${ssrInterpolate(unref(formatDateTime)(e.finished_at, unref(locale)))}</p></div>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: unref(localePath)(`/patente/results/${e.id}`),
                  class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4 after:absolute after:inset-0 after:content-['']"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("patente.review"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("patente.review")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode("div", { class: "space-y-1" }, [
                    createVNode("p", { class: "flex flex-wrap items-center gap-2" }, [
                      createVNode(_component_UiBadge, { tone: "warning" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(t)("patente.simulation")), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UiBadge, null, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(e.mode === "exam" ? unref(t)("patente.modeExam") : unref(t)("patente.modePractice")), 1)
                        ]),
                        _: 2
                      }, 1024),
                      e.mode === "exam" ? (openBlock(), createBlock(_component_UiBadge, {
                        key: 0,
                        tone: e.timed_out ? "warning" : e.passed ? "success" : "danger"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(e.timed_out ? unref(t)("patente.timedOutShort") : e.passed ? unref(t)("patente.passedShort") : unref(t)("patente.failedShort")), 1)
                        ]),
                        _: 2
                      }, 1032, ["tone"])) : createCommentVNode("", true)
                    ]),
                    createVNode("p", { class: "text-sm text-ink-soft" }, toDisplayString(unref(t)("patente.scoreLine", { correct: e.correct, errors: e.errors, total: e.total })) + " \xB7 " + toDisplayString(unref(formatDateTime)(e.finished_at, unref(locale))), 1)
                  ]),
                  createVNode(_component_NuxtLink, {
                    to: unref(localePath)(`/patente/results/${e.id}`),
                    class: "inline-flex min-h-touch items-center font-medium text-primary-strong underline underline-offset-4 after:absolute after:inset-0 after:content-['']"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("patente.review")), 1)
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mt-8">`);
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_b = (_a = unref(data)) == null ? void 0 : _a.meta.page) != null ? _b : 1,
          "last-page": (_d = (_c = unref(data)) == null ? void 0 : _c.meta.last_page) != null ? _d : 1,
          onChange: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))({ path: unref(route).path, query: { page: $event } })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/history.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=history-Bkqfc8Ng.mjs.map
