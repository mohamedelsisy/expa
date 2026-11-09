import { _ as _sfc_main$1 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, i as _sfc_main$2, d as _sfc_main$5$1, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$5 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$6 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$7 } from './Explain-DdXwtg6y.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
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
import './VerifyNeeded-mxk-8UjC.mjs';
import './useToast-BX2bodPv.mjs';
import './patenteExplain-CPOOCBVz.mjs';
import './routes-BNQ9Jhms.mjs';
import './safe-B2eSdAXJ.mjs';
import './SourceBadge-4_eAChkr.mjs';
import './FreshnessIndicator-B5-_pVo1.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    useApi();
    computed(() => String(route.params.id));
    useSeo(() => ({ title: t("patente.resultTitle"), description: t("patente.mockNotice"), noindex: true }));
    const r = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const onlyWrong = ref(false);
    const verdict = computed(() => {
      if (!r.value || r.value.mode !== "exam") return null;
      if (r.value.timed_out) return { tone: "warning", text: t("patente.timedOut"), icon: "clock" };
      return r.value.passed ? { tone: "success", text: t("patente.passedMock"), icon: "check-circle" } : { tone: "danger", text: t("patente.failedMock"), icon: "x-circle" };
    });
    const rows = computed(() => {
      var _a, _b;
      return ((_b = (_a = r.value) == null ? void 0 : _a.review) != null ? _b : []).filter((x) => !onlyWrong.value || !x.correct);
    });
    const answerText = (v) => v === null ? t("patente.noAnswer") : v ? t("patente.true") : t("patente.false");
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiSkeleton = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiCard = _sfc_main$5;
      const _component_UiCheckbox = _sfc_main$6;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_PatenteExplain = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}>`);
      if (unref(loading)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(r)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          "heading-level": 1,
          message: (_a = unref(error)) != null ? _a : void 0
        }, null, _parent));
      } else {
        _push(`<div class="space-y-6"><header class="space-y-3">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.simulation"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.simulation")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h1 class="text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(r).mode === "exam" ? unref(t)("patente.resultTitle") : unref(t)("patente.practiceResultTitle"))}</h1>`);
        if (unref(verdict)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(verdict).tone,
            title: unref(verdict).text,
            "data-testid": "verdict"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("patente.verdictNote"))}</p>`);
              } else {
                return [
                  createVNode("p", null, toDisplayString(unref(t)("patente.verdictNote")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<dl class="grid grid-cols-3 gap-3 text-center">`);
        _push(ssrRenderComponent(_component_UiCard, { class: "!p-4" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.correct"))}</dt><dd class="text-2xl font-bold tabular-nums text-success"${_scopeId}>${ssrInterpolate(unref(r).correct)}</dd>`);
            } else {
              return [
                createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.correct")), 1),
                createVNode("dd", { class: "text-2xl font-bold tabular-nums text-success" }, toDisplayString(unref(r).correct), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, { class: "!p-4" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.errors"))}</dt><dd class="text-2xl font-bold tabular-nums text-danger"${_scopeId}>${ssrInterpolate(unref(r).errors)}</dd>`);
            } else {
              return [
                createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.errors")), 1),
                createVNode("dd", { class: "text-2xl font-bold tabular-nums text-danger" }, toDisplayString(unref(r).errors), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiCard, { class: "!p-4" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b;
            if (_push2) {
              _push2(`<dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(r).max_errors !== null ? unref(t)("patente.maxErrors") : unref(t)("patente.total"))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate((_a2 = unref(r).max_errors) != null ? _a2 : unref(r).total)}</dd>`);
            } else {
              return [
                createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(r).max_errors !== null ? unref(t)("patente.maxErrors") : unref(t)("patente.total")), 1),
                createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString((_b = unref(r).max_errors) != null ? _b : unref(r).total), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</dl></header>`);
        _push(ssrRenderComponent(_component_UiCheckbox, {
          modelValue: unref(onlyWrong),
          "onUpdate:modelValue": ($event) => isRef(onlyWrong) ? onlyWrong.value = $event : null,
          label: unref(t)("patente.onlyWrong")
        }, null, _parent));
        _push(`<ol class="space-y-4"><!--[-->`);
        ssrRenderList(unref(rows), (x, i) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_UiCard, {
            as: "article",
            class: "space-y-3",
            "data-correct": x.correct ? "true" : "false"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b;
              if (_push2) {
                _push2(`<p class="flex flex-wrap items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: x.correct ? "success" : "danger"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: x.correct ? "check" : "x",
                        size: 14
                      }, null, _parent3, _scopeId2));
                      _push3(`${ssrInterpolate(x.correct ? unref(t)("patente.correctBadge") : unref(t)("patente.incorrectBadge"))}`);
                    } else {
                      return [
                        createVNode(_component_UiIcon, {
                          name: x.correct ? "check" : "x",
                          size: 14
                        }, null, 8, ["name"]),
                        createTextVNode(toDisplayString(x.correct ? unref(t)("patente.correctBadge") : unref(t)("patente.incorrectBadge")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</p>`);
                if (x.statement_it) {
                  _push2(`<p class="text-lg font-semibold" lang="it" dir="ltr"${_scopeId}>${ssrInterpolate(x.statement_it)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (x.statement && x.statement !== x.statement_it) {
                  _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(x.statement)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<p class="text-sm"${_scopeId}><span class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("patente.yourAnswer"))}:</span> ${ssrInterpolate(answerText(x.your_answer))} \xB7 <span class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("patente.correctAnswer"))}:</span> ${ssrInterpolate(answerText(x.correct_answer))}</p>`);
                if (x.explanation) {
                  _push2(`<p class="prose-plain rounded-md bg-sunken p-3 text-sm"${_scopeId}><span class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("patente.explanation"))}:</span> ${ssrInterpolate(x.explanation)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (x.slug) {
                  _push2(ssrRenderComponent(_component_PatenteExplain, {
                    level: 3,
                    kind: "question",
                    slug: x.slug,
                    title: (_a2 = x.statement_it) != null ? _a2 : x.statement
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("p", { class: "flex flex-wrap items-center gap-2" }, [
                    createVNode(_component_UiBadge, {
                      tone: x.correct ? "success" : "danger"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiIcon, {
                          name: x.correct ? "check" : "x",
                          size: 14
                        }, null, 8, ["name"]),
                        createTextVNode(toDisplayString(x.correct ? unref(t)("patente.correctBadge") : unref(t)("patente.incorrectBadge")), 1)
                      ]),
                      _: 2
                    }, 1032, ["tone"])
                  ]),
                  x.statement_it ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-lg font-semibold",
                    lang: "it",
                    dir: "ltr"
                  }, toDisplayString(x.statement_it), 1)) : createCommentVNode("", true),
                  x.statement && x.statement !== x.statement_it ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-ink-soft"
                  }, toDisplayString(x.statement), 1)) : createCommentVNode("", true),
                  createVNode("p", { class: "text-sm" }, [
                    createVNode("span", { class: "font-semibold" }, toDisplayString(unref(t)("patente.yourAnswer")) + ":", 1),
                    createTextVNode(" " + toDisplayString(answerText(x.your_answer)) + " \xB7 ", 1),
                    createVNode("span", { class: "font-semibold" }, toDisplayString(unref(t)("patente.correctAnswer")) + ":", 1),
                    createTextVNode(" " + toDisplayString(answerText(x.correct_answer)), 1)
                  ]),
                  x.explanation ? (openBlock(), createBlock("p", {
                    key: 2,
                    class: "prose-plain rounded-md bg-sunken p-3 text-sm"
                  }, [
                    createVNode("span", { class: "font-semibold" }, toDisplayString(unref(t)("patente.explanation")) + ":", 1),
                    createTextVNode(" " + toDisplayString(x.explanation), 1)
                  ])) : createCommentVNode("", true),
                  x.slug ? (openBlock(), createBlock(_component_PatenteExplain, {
                    key: 3,
                    level: 3,
                    kind: "question",
                    slug: x.slug,
                    title: (_b = x.statement_it) != null ? _b : x.statement
                  }, null, 8, ["slug", "title"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ol><div class="flex flex-wrap gap-3">`);
        _push(ssrRenderComponent(_component_UiButton, { to: "/patente/exam" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.tryAgain"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.tryAgain")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/patente/practice",
          variant: "secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.practice"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.practice")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          to: "/patente/history",
          variant: "ghost"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.history"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.history")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/results/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DtmNDSNo.mjs.map
