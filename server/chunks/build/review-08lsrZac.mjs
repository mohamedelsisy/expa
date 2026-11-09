import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, _ as _sfc_main$3$1, d as _sfc_main$5$1, j as isApiError } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$5 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$6 } from './ReviewedNotice-RpV3jHT3.mjs';
import { _ as _sfc_main$7 } from './ListenButton-BzYdaHKB.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { s as sessionSummary } from './practice-BYRJH4K6.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "review",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("practice.reviewTitle"), description: t("practice.reviewExplain"), noindex: true }));
    const queue = ref([]);
    const loading = ref(true);
    const loadError = ref(null);
    const index = ref(0);
    const revealed = ref(false);
    const results = ref([]);
    const saving = ref(false);
    const stats = ref(null);
    async function load() {
      loading.value = true;
      loadError.value = null;
      try {
        const res = await request("italian/practice/review", { query: { limit: 10 } });
        queue.value = res.data.cards;
        stats.value = res.data.stats;
        index.value = 0;
        revealed.value = false;
        results.value = [];
      } catch (e) {
        loadError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        loading.value = false;
      }
    }
    const card = computed(() => queue.value[index.value]);
    const finished = computed(() => !loading.value && !loadError.value && queue.value.length > 0 && index.value >= queue.value.length);
    const summary = computed(() => sessionSummary(results.value));
    async function answer(correct) {
      if (!card.value) return;
      saving.value = true;
      try {
        await request(`italian/vocabulary/${encodeURIComponent(card.value.slug)}/review`, { method: "POST", body: { correct } });
        results.value.push(correct);
        index.value += 1;
        revealed.value = false;
      } catch (e) {
        toast.error(isApiError(e) ? e.message : t("errors.generic"));
      } finally {
        saving.value = false;
      }
    }
    const crumbs = computed(() => [{ label: t("learn.title"), to: "/learn-italian" }, { label: t("practice.title"), to: "/learn-italian/practice" }, { label: t("practice.reviewTitle") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiCard = _sfc_main$4;
      const _component_UiBadge = _sfc_main$5;
      const _component_LearnReviewedNotice = _sfc_main$6;
      const _component_LearnListenButton = _sfc_main$7;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("practice.reviewTitle"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("practice.reviewHow"))}</p>`);
      if (unref(loading)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(loadError)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(loadError),
          retry: "",
          onRetry: load
        }, null, _parent));
      } else if (!unref(queue).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("practice.nothingDueTitle"),
          description: unref(t)("practice.nothingDue"),
          icon: "check"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/learn-italian/practice",
                variant: "secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("practice.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("practice.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, {
                  to: "/learn-italian/practice",
                  variant: "secondary"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("practice.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(finished)) {
        _push(ssrRenderComponent(_component_UiCard, {
          class: "space-y-4",
          "data-testid": "review-summary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(unref(t)("practice.sessionDone"))}</h2><p class="text-lg"${_scopeId}>${ssrInterpolate(unref(t)("practice.sessionResult", { correct: unref(summary).correct, total: unref(summary).total }))}</p><p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("practice.spacedNote"))}</p><div class="flex flex-wrap gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiButton, { onClick: load }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("practice.again"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("practice.again")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/learn-italian/practice",
                variant: "secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("practice.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("practice.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("h2", { class: "text-xl font-bold" }, toDisplayString(unref(t)("practice.sessionDone")), 1),
                createVNode("p", { class: "text-lg" }, toDisplayString(unref(t)("practice.sessionResult", { correct: unref(summary).correct, total: unref(summary).total })), 1),
                createVNode("p", { class: "text-sm text-muted" }, toDisplayString(unref(t)("practice.spacedNote")), 1),
                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                  createVNode(_component_UiButton, { onClick: load }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("practice.again")), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UiButton, {
                    to: "/learn-italian/practice",
                    variant: "secondary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("practice.title")), 1)
                    ]),
                    _: 1
                  })
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (unref(card)) {
        _push(`<section class="space-y-4"${ssrRenderAttr("aria-label", unref(t)("practice.cardOf", { n: unref(index) + 1, total: unref(queue).length }))}><p class="text-sm text-muted" aria-live="polite">${ssrInterpolate(unref(t)("practice.cardOf", { n: unref(index) + 1, total: unref(queue).length }))}`);
        if (unref(card).new) {
          _push(`<!--[--> \xB7 `);
          _push(ssrRenderComponent(_component_UiBadge, { tone: "info" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("practice.newCard"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("practice.newCard")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        _push(ssrRenderComponent(_component_LearnReviewedNotice, { item: unref(card) }, null, _parent));
        _push(ssrRenderComponent(_component_UiCard, {
          class: "space-y-4 text-center",
          "data-testid": "flashcard"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`<p class="flex items-center justify-center gap-2 text-3xl font-bold" lang="it" dir="ltr"${_scopeId}>${ssrInterpolate(unref(card).lemma)}`);
              _push2(ssrRenderComponent(_component_LearnListenButton, {
                text: unref(card).lemma
              }, null, _parent2, _scopeId));
              _push2(`</p>`);
              if (unref(revealed)) {
                _push2(`<!--[--><p class="text-xl" dir="auto" data-testid="card-gloss"${_scopeId}>${ssrInterpolate((_a = unref(card).gloss) != null ? _a : unref(t)("practice.noGloss"))}</p>`);
                if (unref(card).example_it) {
                  _push2(`<p class="text-ink-soft"${_scopeId}><span lang="it" dir="ltr"${_scopeId}>${ssrInterpolate(unref(card).example_it)}</span>`);
                  if (unref(card).example_gloss) {
                    _push2(`<!--[--><br${_scopeId}><span dir="auto"${_scopeId}>${ssrInterpolate(unref(card).example_gloss)}</span><!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("p", {
                  class: "flex items-center justify-center gap-2 text-3xl font-bold",
                  lang: "it",
                  dir: "ltr"
                }, [
                  createTextVNode(toDisplayString(unref(card).lemma), 1),
                  createVNode(_component_LearnListenButton, {
                    text: unref(card).lemma
                  }, null, 8, ["text"])
                ]),
                unref(revealed) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createVNode("p", {
                    class: "text-xl",
                    dir: "auto",
                    "data-testid": "card-gloss"
                  }, toDisplayString((_b = unref(card).gloss) != null ? _b : unref(t)("practice.noGloss")), 1),
                  unref(card).example_it ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-ink-soft"
                  }, [
                    createVNode("span", {
                      lang: "it",
                      dir: "ltr"
                    }, toDisplayString(unref(card).example_it), 1),
                    unref(card).example_gloss ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createVNode("br"),
                      createVNode("span", { dir: "auto" }, toDisplayString(unref(card).example_gloss), 1)
                    ], 64)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ], 64)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (!unref(revealed)) {
          _push(`<div class="flex justify-center">`);
          _push(ssrRenderComponent(_component_UiButton, {
            size: "lg",
            "data-testid": "reveal",
            onClick: ($event) => revealed.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("practice.reveal"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("practice.reveal")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="grid grid-cols-2 gap-3">`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            size: "lg",
            loading: unref(saving),
            "data-testid": "wrong",
            onClick: ($event) => answer(false)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "x",
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("practice.didntKnow"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "x",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("practice.didntKnow")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, {
            size: "lg",
            loading: unref(saving),
            "data-testid": "right",
            onClick: ($event) => answer(true)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "check",
                  size: 18
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("practice.knewIt"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "check",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("practice.knewIt")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        }
        _push(`</section>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/practice/review.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=review-08lsrZac.mjs.map
