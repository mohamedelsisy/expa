import { _ as _sfc_main$2 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, i as _sfc_main$2$1, n as navigateTo, j as isApiError, d as _sfc_main$5, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$4 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$7 } from './Explain-DdXwtg6y.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, reactive, watch, nextTick, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Runner",
  __ssrInlineRender: true,
  props: {
    exam: {}
  },
  emits: ["finished"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const { request } = useApi();
    const answers = reactive({});
    const feedback = reactive({});
    const checking = ref(false);
    const checkError = ref(null);
    const index = ref(0);
    const submitting = ref(false);
    const submitError = ref(null);
    const confirming = ref(false);
    const remaining = ref(null);
    const announce = ref("");
    const timedOut = ref(false);
    const qs = computed(() => props.exam.questions);
    const q = computed(() => qs.value[index.value]);
    const answered = computed(() => qs.value.filter((x) => answers[x.id] === true || answers[x.id] === false).length);
    const unanswered = computed(() => qs.value.length - answered.value);
    const isExam = computed(() => props.exam.mode === "exam");
    const sameText = computed(() => !!q.value && (!q.value.statement_it || q.value.statement_it === q.value.statement));
    let clock = null;
    let finished = false;
    async function submit(auto = false) {
      if (finished || submitting.value) return;
      submitting.value = true;
      submitError.value = null;
      confirming.value = false;
      try {
        const body = { answers: qs.value.map((x) => {
          var _a;
          return { question_id: x.id, answer: (_a = answers[x.id]) != null ? _a : null };
        }) };
        const res = await request(`patente/exams/${props.exam.id}/answers`, { method: "POST", body, timeoutMs: 3e4 });
        finished = true;
        clock == null ? void 0 : clock.stop();
        emit("finished", res.data);
      } catch (e) {
        if (isApiError(e) && e.code === "exam_already_finished") {
          finished = true;
          emit("finished", void 0);
          return;
        }
        submitError.value = isApiError(e) ? e.message : t("errors.generic");
        if (auto) timedOut.value = true;
      } finally {
        submitting.value = false;
      }
    }
    const lowTime = computed(() => remaining.value !== null && remaining.value <= 60);
    function pick(v) {
      if (q.value) {
        answers[q.value.id] = v;
        feedback[q.value.id] = void 0;
      }
    }
    async function check() {
      const cur = q.value;
      if (!cur || answers[cur.id] !== true && answers[cur.id] !== false) return;
      checking.value = true;
      checkError.value = null;
      try {
        feedback[cur.id] = (await request(`patente/exams/${props.exam.id}/check`, { method: "POST", body: { question_id: cur.id, answer: answers[cur.id] } })).data;
      } catch (e) {
        checkError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        checking.value = false;
      }
    }
    const fb = computed(() => q.value ? feedback[q.value.id] : void 0);
    const hasAnswer = computed(() => !!q.value && (answers[q.value.id] === true || answers[q.value.id] === false));
    function go(i) {
      index.value = Math.max(0, Math.min(qs.value.length - 1, i));
    }
    const optionEls = ref([]);
    function onRadioKey(e) {
      if (e.altKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      const at = optionEls.value.indexOf((void 0).activeElement);
      const cur = at === 0 ? true : at === 1 ? false : q.value ? answers[q.value.id] : void 0;
      const next = e.key === "Home" ? true : e.key === "End" ? false : cur === true ? false : true;
      pick(next);
      nextTick(() => {
        var _a;
        return (_a = optionEls.value[next ? 0 : 1]) == null ? void 0 : _a.focus();
      });
    }
    const tabbable = (opt) => {
      const cur = q.value ? answers[q.value.id] : void 0;
      return cur === void 0 ? opt === true : cur === opt;
    };
    const confirmEl = ref(null);
    watch(confirming, async (v) => {
      var _a, _b;
      if (v) {
        await nextTick();
        (_b = (_a = confirmEl.value) == null ? void 0 : _a.$el.querySelector("button")) == null ? void 0 : _b.focus();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiIcon = _sfc_main$5;
      const _component_UiAlert = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiCard = _sfc_main$6;
      const _component_PatenteExplain = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div class="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border"><p class="font-semibold">${ssrInterpolate(unref(t)("patente.questionOf", { n: unref(index) + 1, total: unref(qs).length }))} \xB7 <span class="text-ink-soft">${ssrInterpolate(unref(t)("patente.answeredCount", { count: unref(answered) }))}</span></p>`);
      if (unref(isExam) && unref(remaining) !== null) {
        _push(`<p role="timer" class="${ssrRenderClass([unref(lowTime) ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-strong", "flex items-center gap-2 rounded-full px-3 py-1 text-lg font-bold tabular-nums"])}"${ssrRenderAttr("aria-label", unref(t)("patente.timeLeftLabel"))} data-testid="exam-clock" dir="ltr">`);
        _push(ssrRenderComponent(_component_UiIcon, {
          name: "clock",
          size: 18
        }, null, _parent));
        _push(`${ssrInterpolate(unref(formatClock)(unref(remaining)))}</p>`);
      } else if (!unref(isExam)) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("patente.noTimeLimit"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><p class="sr-only" role="status" aria-live="polite" data-testid="exam-announce">${ssrInterpolate(unref(announce))}</p>`);
      if (unref(timedOut) && !unref(submitError)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.timeUp"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.timeUp")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(submitError)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          title: unref(t)("patente.submitFailed"),
          "data-testid": "submit-error"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(submitError))}</p>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                class: "mt-3",
                loading: unref(submitting),
                onClick: ($event) => submit(unref(timedOut))
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.retry"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(submitError)), 1),
                createVNode(_component_UiButton, {
                  variant: "secondary",
                  class: "mt-3",
                  loading: unref(submitting),
                  onClick: ($event) => submit(unref(timedOut))
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("common.retry")), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(q)) {
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-label": unref(t)("patente.questionOf", { n: unref(index) + 1, total: unref(qs).length }),
          class: "space-y-5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`<div class="space-y-3"${_scopeId}>`);
              if (unref(q).statement_it) {
                _push2(`<p class="text-xl font-semibold leading-snug" lang="it" dir="ltr" data-testid="statement-it"${_scopeId}>${ssrInterpolate(unref(q).statement_it)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (!unref(sameText)) {
                _push2(`<p class="rounded-md bg-sunken p-3 text-lg text-ink-soft"${ssrRenderAttr("lang", unref(q).locale)} data-testid="statement-local"${_scopeId}><span class="block text-xs font-bold text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.translation"))}</span>${ssrInterpolate(unref(q).statement)}</p>`);
              } else if (!unref(q).statement_it) {
                _push2(`<p class="text-xl font-semibold"${_scopeId}>${ssrInterpolate(unref(q).statement)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div role="radiogroup"${ssrRenderAttr("aria-label", unref(t)("patente.yourAnswer"))} class="grid grid-cols-2 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList([true, false], (opt) => {
                _push2(`<button type="button" role="radio"${ssrRenderAttr("aria-checked", unref(answers)[unref(q).id] === opt)}${ssrRenderAttr("tabindex", tabbable(opt) ? 0 : -1)} class="${ssrRenderClass([unref(answers)[unref(q).id] === opt ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface text-ink hover:bg-sunken", "inline-flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 text-lg font-bold"])}"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: opt ? "check" : "x",
                  size: 20
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(opt ? unref(t)("patente.true") : unref(t)("patente.false"))}</button>`);
              });
              _push2(`<!--]--></div>`);
              if (!unref(isExam)) {
                _push2(`<div class="space-y-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  loading: unref(checking),
                  disabled: !unref(hasAnswer),
                  "data-testid": "check-answer",
                  onClick: check
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("patente.checkAnswer"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("patente.checkAnswer")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                if (unref(checkError)) {
                  _push2(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(checkError))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(checkError)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (unref(fb)) {
                  _push2(`<div role="status" class="space-y-2" data-testid="practice-feedback"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UiAlert, {
                    tone: unref(fb).correct ? "success" : "warning",
                    title: unref(fb).correct ? unref(t)("patente.feedback.correct") : unref(t)("patente.feedback.wrong")
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`<p${_scopeId2}>${ssrInterpolate(unref(t)("patente.feedback.answerWas", { answer: unref(fb).correct_answer ? unref(t)("patente.true") : unref(t)("patente.false") }))}</p>`);
                        if (unref(fb).explanation) {
                          _push3(`<p class="mt-1"${_scopeId2}>${ssrInterpolate(unref(fb).explanation)}</p>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode("p", null, toDisplayString(unref(t)("patente.feedback.answerWas", { answer: unref(fb).correct_answer ? unref(t)("patente.true") : unref(t)("patente.false") })), 1),
                          unref(fb).explanation ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "mt-1"
                          }, toDisplayString(unref(fb).explanation), 1)) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                  if (Object.keys(unref(fb).explanations).length > 1) {
                    _push2(`<ul class="space-y-1 rounded-md bg-sunken p-3 text-sm"${_scopeId}><!--[-->`);
                    ssrRenderList(unref(fb).explanations, (txt, loc) => {
                      _push2(`<li${ssrRenderAttr("lang", loc)}${ssrRenderAttr("dir", loc === "ar" ? "rtl" : "ltr")}${_scopeId}><span class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)(`languages.${loc}`))}:</span> ${ssrInterpolate(txt)}</li>`);
                    });
                    _push2(`<!--]--></ul>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (unref(q).slug) {
                    _push2(ssrRenderComponent(_component_PatenteExplain, {
                      level: 3,
                      kind: "question",
                      slug: unref(q).slug,
                      title: (_a = unref(q).statement_it) != null ? _a : unref(q).statement
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex justify-between gap-3"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                disabled: unref(index) === 0,
                onClick: ($event) => go(unref(index) - 1)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "chevron-start",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("common.previous"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "chevron-start",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("common.previous")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(index) < unref(qs).length - 1) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  onClick: ($event) => go(unref(index) + 1)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("common.next"))}`);
                      _push3(ssrRenderComponent(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("common.next")), 1),
                        createVNode(_component_UiIcon, {
                          name: "chevron-end",
                          size: 18
                        })
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "accent",
                  loading: unref(submitting),
                  onClick: ($event) => confirming.value = true
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("patente.finish"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("patente.finish")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              }
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "space-y-3" }, [
                  unref(q).statement_it ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-xl font-semibold leading-snug",
                    lang: "it",
                    dir: "ltr",
                    "data-testid": "statement-it"
                  }, toDisplayString(unref(q).statement_it), 1)) : createCommentVNode("", true),
                  !unref(sameText) ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "rounded-md bg-sunken p-3 text-lg text-ink-soft",
                    lang: unref(q).locale,
                    "data-testid": "statement-local"
                  }, [
                    createVNode("span", { class: "block text-xs font-bold text-muted" }, toDisplayString(unref(t)("patente.translation")), 1),
                    createTextVNode(toDisplayString(unref(q).statement), 1)
                  ], 8, ["lang"])) : !unref(q).statement_it ? (openBlock(), createBlock("p", {
                    key: 2,
                    class: "text-xl font-semibold"
                  }, toDisplayString(unref(q).statement), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", {
                  role: "radiogroup",
                  "aria-label": unref(t)("patente.yourAnswer"),
                  class: "grid grid-cols-2 gap-3",
                  onKeydown: onRadioKey
                }, [
                  (openBlock(), createBlock(Fragment, null, renderList([true, false], (opt) => {
                    return createVNode("button", {
                      key: String(opt),
                      ref_for: true,
                      ref_key: "optionEls",
                      ref: optionEls,
                      type: "button",
                      role: "radio",
                      "aria-checked": unref(answers)[unref(q).id] === opt,
                      tabindex: tabbable(opt) ? 0 : -1,
                      class: ["inline-flex min-h-[56px] items-center justify-center gap-2 rounded-md border-2 text-lg font-bold", unref(answers)[unref(q).id] === opt ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface text-ink hover:bg-sunken"],
                      onClick: ($event) => pick(opt)
                    }, [
                      createVNode(_component_UiIcon, {
                        name: opt ? "check" : "x",
                        size: 20
                      }, null, 8, ["name"]),
                      createTextVNode(toDisplayString(opt ? unref(t)("patente.true") : unref(t)("patente.false")), 1)
                    ], 10, ["aria-checked", "tabindex", "onClick"]);
                  }), 64))
                ], 40, ["aria-label"]),
                !unref(isExam) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-3"
                }, [
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    loading: unref(checking),
                    disabled: !unref(hasAnswer),
                    "data-testid": "check-answer",
                    onClick: check
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("patente.checkAnswer")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"]),
                  unref(checkError) ? (openBlock(), createBlock(_component_UiAlert, {
                    key: 0,
                    tone: "warning"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(checkError)), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  unref(fb) ? (openBlock(), createBlock("div", {
                    key: 1,
                    role: "status",
                    class: "space-y-2",
                    "data-testid": "practice-feedback"
                  }, [
                    createVNode(_component_UiAlert, {
                      tone: unref(fb).correct ? "success" : "warning",
                      title: unref(fb).correct ? unref(t)("patente.feedback.correct") : unref(t)("patente.feedback.wrong")
                    }, {
                      default: withCtx(() => [
                        createVNode("p", null, toDisplayString(unref(t)("patente.feedback.answerWas", { answer: unref(fb).correct_answer ? unref(t)("patente.true") : unref(t)("patente.false") })), 1),
                        unref(fb).explanation ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "mt-1"
                        }, toDisplayString(unref(fb).explanation), 1)) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }, 8, ["tone", "title"]),
                    Object.keys(unref(fb).explanations).length > 1 ? (openBlock(), createBlock("ul", {
                      key: 0,
                      class: "space-y-1 rounded-md bg-sunken p-3 text-sm"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(fb).explanations, (txt, loc) => {
                        return openBlock(), createBlock("li", {
                          key: loc,
                          lang: loc,
                          dir: loc === "ar" ? "rtl" : "ltr"
                        }, [
                          createVNode("span", { class: "font-semibold" }, toDisplayString(unref(t)(`languages.${loc}`)) + ":", 1),
                          createTextVNode(" " + toDisplayString(txt), 1)
                        ], 8, ["lang", "dir"]);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    unref(q).slug ? (openBlock(), createBlock(_component_PatenteExplain, {
                      key: 1,
                      level: 3,
                      kind: "question",
                      slug: unref(q).slug,
                      title: (_b = unref(q).statement_it) != null ? _b : unref(q).statement
                    }, null, 8, ["slug", "title"])) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-between gap-3" }, [
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    disabled: unref(index) === 0,
                    onClick: ($event) => go(unref(index) - 1)
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiIcon, {
                        name: "chevron-start",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("common.previous")), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]),
                  unref(index) < unref(qs).length - 1 ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    onClick: ($event) => go(unref(index) + 1)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.next")), 1),
                      createVNode(_component_UiIcon, {
                        name: "chevron-end",
                        size: 18
                      })
                    ]),
                    _: 1
                  }, 8, ["onClick"])) : (openBlock(), createBlock(_component_UiButton, {
                    key: 1,
                    variant: "accent",
                    loading: unref(submitting),
                    onClick: ($event) => confirming.value = true
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("patente.finish")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "onClick"]))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("patente.keyHint"))}</p><nav${ssrRenderAttr("aria-label", unref(t)("patente.navigator"))}><ol class="grid grid-cols-6 gap-2 sm:grid-cols-10"><!--[-->`);
      ssrRenderList(unref(qs), (x, i) => {
        _push(`<li><button type="button" class="${ssrRenderClass([[i === unref(index) ? "ring-2 ring-primary" : "", unref(answers)[x.id] === true || unref(answers)[x.id] === false ? "border-primary bg-primary-soft text-primary-strong" : "border-line-strong bg-surface"], "min-h-touch w-full rounded-md border text-sm font-semibold tabular-nums"])}"${ssrRenderAttr("aria-current", i === unref(index) ? "step" : void 0)}${ssrRenderAttr("aria-label", `${unref(t)("patente.goToQuestion", { n: i + 1 })}${unref(answers)[x.id] === true || unref(answers)[x.id] === false ? ` (${unref(t)("patente.answered")})` : ""}`)}>${ssrInterpolate(i + 1)}</button></li>`);
      });
      _push(`<!--]--></ol></nav>`);
      if (unref(confirming)) {
        _push(ssrRenderComponent(_component_UiCard, {
          ref_key: "confirmEl",
          ref: confirmEl,
          role: "alertdialog",
          "aria-label": unref(t)("patente.finishConfirmTitle"),
          class: "space-y-3"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="font-semibold"${_scopeId}>${ssrInterpolate(unref(t)("patente.finishConfirmTitle"))}</p>`);
              if (unref(unanswered)) {
                _push2(`<p class="text-warning"${_scopeId}>${ssrInterpolate(unref(t)("patente.unansweredWarning", { count: unref(unanswered) }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("patente.finishConfirmBody"))}</p><div class="flex flex-wrap gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiButton, {
                variant: "secondary",
                onClick: ($event) => confirming.value = false
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.keepGoing"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.keepGoing")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                loading: unref(submitting),
                onClick: ($event) => submit()
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.submitNow"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.submitNow")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("p", { class: "font-semibold" }, toDisplayString(unref(t)("patente.finishConfirmTitle")), 1),
                unref(unanswered) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-warning"
                }, toDisplayString(unref(t)("patente.unansweredWarning", { count: unref(unanswered) })), 1)) : createCommentVNode("", true),
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("patente.finishConfirmBody")), 1),
                createVNode("div", { class: "flex flex-wrap gap-2" }, [
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => confirming.value = false
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("patente.keepGoing")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_UiButton, {
                    loading: unref(submitting),
                    onClick: ($event) => submit()
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("patente.submitNow")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "onClick"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<div class="flex justify-end">`);
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          loading: unref(submitting),
          onClick: ($event) => confirming.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.finish"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.finish")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/patente/Runner.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    const localePath = useLocalePath();
    const id = computed(() => String(route.params.id));
    useSeo(() => ({ title: t("patente.examRunning"), description: t("patente.mockNotice"), noindex: true }));
    const exam = ref(null);
    const error = ref(null);
    const loading = ref(true);
    async function load() {
      loading.value = true;
      error.value = null;
      try {
        const res = await request(`patente/exams/${encodeURIComponent(id.value)}`);
        if (res.data.finished) {
          await navigateTo(localePath(`/patente/results/${id.value}`));
          return;
        }
        exam.value = res.data;
      } catch (e) {
        error.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        loading.value = false;
      }
    }
    const done = () => navigateTo(localePath(`/patente/results/${id.value}`));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiBadge = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_PatenteRunner = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-6 sm:py-10" }, _attrs))}><div class="mb-4 flex flex-wrap items-center justify-between gap-2"><h1 class="text-xl font-bold sm:text-2xl">${ssrInterpolate(((_a = unref(exam)) == null ? void 0 : _a.mode) === "practice" ? unref(t)("patente.practiceTitle") : unref(t)("patente.examTitle"))}</h1>`);
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
      _push(`</div>`);
      if (unref(loading)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 4
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(exam)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: (_b = unref(error)) != null ? _b : void 0,
          retry: "",
          onRetry: load
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_PatenteRunner, {
          exam: unref(exam),
          onFinished: done
        }, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/run/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DC6zLYz9.mjs.map
