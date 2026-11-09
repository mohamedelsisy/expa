import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, f as useRoute, a as useAuthStore, g as useApi, j as isApiError, o as createError, i as _sfc_main$2$1, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$4 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$5 } from './ReviewedNotice-RpV3jHT3.mjs';
import { _ as _sfc_main$6 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$7 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$8 } from './ListenButton-BzYdaHKB.mjs';
import { _ as _sfc_main$9 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$a } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$b } from './Select-BjjHKxeN.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, isRef, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { a as splitSentence, c as correctAnswerText } from './practice-BYRJH4K6.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import './useToast-BX2bodPv.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const auth = useAuthStore();
    const { request } = useApi();
    const slug = computed(() => String(route.params.slug));
    const { data: ex, error, refresh, status } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(() => `exercise-${slug.value}`, async () => (await request(`italian/exercises/${encodeURIComponent(slug.value)}`)).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    if (isApiError(error.value) && error.value.status === 404) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => {
      var _a;
      return { title: ((_a = ex.value) == null ? void 0 : _a.prompt) ? `${ex.value.prompt} | EXPA` : t("practice.title"), description: t("practice.seo.description"), noindex: true };
    });
    const crumbs = computed(() => {
      var _a, _b;
      return [{ label: t("learn.title"), to: "/learn-italian" }, { label: t("practice.title"), to: "/learn-italian/practice" }, { label: (_b = (_a = ex.value) == null ? void 0 : _a.type_label) != null ? _b : "" }];
    });
    const choice = ref(null);
    const text = ref("");
    const picks = ref([]);
    watch(ex, (e) => {
      var _a;
      picks.value = ((_a = e == null ? void 0 : e.form.left) != null ? _a : []).map(() => null);
    }, { immediate: true });
    const result = ref(null);
    const submitting = ref(false);
    const problem = ref(null);
    const needVerify = ref(false);
    const sentence = computed(() => {
      var _a;
      return ((_a = ex.value) == null ? void 0 : _a.form.sentence) ? splitSentence(ex.value.form.sentence) : null;
    });
    const rightOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = ex.value) == null ? void 0 : _a.form.right) != null ? _b : []).map((r) => ({ value: String(r.id), label: r.text }));
    });
    function retry() {
      var _a, _b;
      result.value = null;
      choice.value = null;
      text.value = "";
      picks.value = ((_b = (_a = ex.value) == null ? void 0 : _a.form.left) != null ? _b : []).map(() => null);
    }
    const correctText = computed(() => ex.value && result.value ? correctAnswerText(ex.value, result.value.correct_answer) : null);
    const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiSkeleton = _sfc_main$2;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiBadge = _sfc_main$3;
      const _component_UiAutoItalian = _sfc_main$4;
      const _component_LearnReviewedNotice = _sfc_main$5;
      const _component_UiAlert = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AuthVerifyNeeded = _sfc_main$7;
      const _component_LearnListenButton = _sfc_main$8;
      const _component_UiFormField = _sfc_main$9;
      const _component_UiTextInput = _sfc_main$a;
      const _component_UiSelect = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      if (!unref(ex)) {
        _push(`<h1 class="sr-only">${ssrInterpolate(unref(t)("practice.title"))}</h1>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(status) === "pending" && !unref(ex)) {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 5
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || !unref(ex)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(`<div class="space-y-5"><header class="space-y-2"><div class="flex flex-wrap items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiBadge, { tone: "primary" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ex).level_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ex).level_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiBadge, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ex).type_label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ex).type_label), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(ex).scenario_label) {
          _push(ssrRenderComponent(_component_UiBadge, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(ex).scenario_label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(ex).scenario_label), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="text-2xl font-bold sm:text-3xl">`);
        _push(ssrRenderComponent(_component_UiAutoItalian, {
          text: (_a = unref(ex).prompt) != null ? _a : unref(ex).type_label
        }, null, _parent));
        _push(`</h1></header>`);
        _push(ssrRenderComponent(_component_LearnReviewedNotice, { item: unref(ex) }, null, _parent));
        if (!unref(auth).isAuthenticated) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("practice.loginForExercise"))}</p>`);
                _push2(ssrRenderComponent(_component_UiButton, {
                  to: unref(loginTo),
                  variant: "secondary",
                  class: "mt-2"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)("auth.login"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode("p", null, toDisplayString(unref(t)("practice.loginForExercise")), 1),
                  createVNode(_component_UiButton, {
                    to: unref(loginTo),
                    variant: "secondary",
                    class: "mt-2"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("auth.login")), 1)
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (!unref(result)) {
          _push(`<form class="space-y-5" novalidate>`);
          if (unref(needVerify)) {
            _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
          } else {
            _push(`<!---->`);
          }
          if (unref(ex).type === "multiple_choice" || unref(ex).type === "listening") {
            _push(`<!--[-->`);
            if (unref(ex).type === "listening") {
              _push(`<p class="flex items-center gap-2">`);
              if ((_b = unref(ex).form.stem) != null ? _b : unref(ex).prompt) {
                _push(ssrRenderComponent(_component_LearnListenButton, {
                  text: (_c = unref(ex).form.stem) != null ? _c : unref(ex).prompt
                }, null, _parent));
              } else {
                _push(`<!---->`);
              }
              _push(`<span class="text-sm text-muted">${ssrInterpolate(unref(t)("practice.listeningNote"))}</span></p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<fieldset class="space-y-2"><legend class="mb-1 text-lg font-semibold" lang="it" dir="auto">${ssrInterpolate((_d = unref(ex).form.stem) != null ? _d : unref(ex).prompt)}</legend><!--[-->`);
            ssrRenderList(unref(ex).form.choices, (c) => {
              _push(`<label class="${ssrRenderClass([unref(choice) === c.index ? "border-primary bg-primary-soft" : "border-line-strong bg-surface", "flex min-h-touch cursor-pointer items-center gap-3 rounded-md border px-3 py-2"])}"><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(choice), c.index)) ? " checked" : ""} type="radio" name="choice"${ssrRenderAttr("value", c.index)} class="size-5 accent-primary"><span dir="auto">${ssrInterpolate(c.text)}</span></label>`);
            });
            _push(`<!--]--></fieldset><!--]-->`);
          } else if (unref(ex).type === "fill_blank") {
            _push(`<!--[--><p class="text-lg" lang="it" dir="ltr">`);
            if (unref(sentence)) {
              _push(`<!--[-->${ssrInterpolate(unref(sentence).before)} <span class="font-bold" aria-hidden="true">_____</span> ${ssrInterpolate(unref(sentence).after)}<!--]-->`);
            } else {
              _push(`<!--[-->${ssrInterpolate(unref(ex).form.sentence)}<!--]-->`);
            }
            _push(`</p>`);
            _push(ssrRenderComponent(_component_UiFormField, {
              label: unref(t)("practice.yourAnswer"),
              error: (_e = unref(problem)) != null ? _e : void 0
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UiTextInput, {
                    modelValue: unref(text),
                    "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                    ltr: "",
                    maxlength: 200,
                    autocomplete: "off"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UiTextInput, {
                      modelValue: unref(text),
                      "onUpdate:modelValue": ($event) => isRef(text) ? text.value = $event : null,
                      ltr: "",
                      maxlength: 200,
                      autocomplete: "off"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`<!--]-->`);
          } else {
            _push(`<!--[--><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("practice.matchHow"))}</p><ul class="space-y-3"><!--[-->`);
            ssrRenderList(unref(ex).form.left, (l, i) => {
              _push(`<li class="grid gap-2 sm:grid-cols-2 sm:items-center"><span class="font-medium" lang="it" dir="auto">${ssrInterpolate(l.text)}</span>`);
              _push(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("practice.matchWith", { item: l.text })
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UiSelect, {
                      "model-value": unref(picks)[i] === null || unref(picks)[i] === void 0 ? "" : String(unref(picks)[i]),
                      options: unref(rightOptions),
                      placeholder: unref(t)("common.choose"),
                      "onUpdate:modelValue": ($event) => unref(picks)[i] = $event === "" ? null : Number($event)
                    }, null, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        "model-value": unref(picks)[i] === null || unref(picks)[i] === void 0 ? "" : String(unref(picks)[i]),
                        options: unref(rightOptions),
                        placeholder: unref(t)("common.choose"),
                        "onUpdate:modelValue": ($event) => unref(picks)[i] = $event === "" ? null : Number($event)
                      }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</li>`);
            });
            _push(`<!--]--></ul><!--]-->`);
          }
          if (unref(problem) && unref(ex).type !== "fill_blank") {
            _push(ssrRenderComponent(_component_UiAlert, {
              tone: "warning",
              "data-testid": "exercise-problem"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(problem))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(problem)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_UiButton, {
            type: "submit",
            size: "lg",
            loading: unref(submitting)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("practice.check"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("practice.check")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</form>`);
        } else {
          _push(`<section class="space-y-4" aria-live="polite" data-testid="exercise-result">`);
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: unref(result).correct ? "success" : "warning",
            title: unref(result).correct ? unref(t)("practice.correct") : unref(t)("practice.notQuite")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (!unref(result).correct && unref(correctText)) {
                  _push2(`<p data-testid="correct-answer"${_scopeId}>${ssrInterpolate(unref(t)("practice.correctAnswer", { answer: unref(correctText) }))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(result).explanation) {
                  _push2(`<p class="mt-1" dir="auto"${_scopeId}>${ssrInterpolate(unref(result).explanation)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  !unref(result).correct && unref(correctText) ? (openBlock(), createBlock("p", {
                    key: 0,
                    "data-testid": "correct-answer"
                  }, toDisplayString(unref(t)("practice.correctAnswer", { answer: unref(correctText) })), 1)) : createCommentVNode("", true),
                  unref(result).explanation ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "mt-1",
                    dir: "auto"
                  }, toDisplayString(unref(result).explanation), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 1
          }, _parent));
          if (unref(result).vocabulary) {
            _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("practice.vocabUpdated"))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex flex-wrap gap-2">`);
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "secondary",
            onClick: retry
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("practice.tryAgain"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("practice.tryAgain")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UiButton, { to: "/learn-italian/practice" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("practice.moreExercises"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("practice.moreExercises")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></section>`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/learn-italian/exercises/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-CilV6Ovc.mjs.map
