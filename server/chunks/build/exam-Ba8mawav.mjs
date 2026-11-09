import { _ as _sfc_main$1 } from './Disclaimer-ByrpdAjg.mjs';
import { _ as _sfc_main$2 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$3 } from './Alert-D-zfMDy5.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, _ as _sfc_main$3$1, d as _sfc_main$5, n as navigateTo, j as isApiError } from './server.mjs';
import { _ as _sfc_main$4 } from './VerifyNeeded-mxk-8UjC.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
import './useToast-BX2bodPv.mjs';
import './safe-B2eSdAXJ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "exam",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const { request } = useApi();
    const localePath = useLocalePath();
    useSeo(() => ({ title: t("patente.examTitle"), description: t("patente.mockNotice"), noindex: true }));
    const rules = ref(null);
    const starting = ref(false);
    const problem = ref(null);
    async function start() {
      var _a, _b;
      starting.value = true;
      problem.value = null;
      try {
        const res = await request("patente/exams", { method: "POST", body: { mode: "exam" } });
        await navigateTo(localePath(`/patente/run/${res.data.id}`));
      } catch (e) {
        if (isApiError(e)) {
          const d = e.details;
          problem.value = { code: e.code, message: e.message, available: (_a = d == null ? void 0 : d.available) == null ? void 0 : _a[0], required: (_b = d == null ? void 0 : d.required) == null ? void 0 : _b[0] };
        } else problem.value = { code: "error", message: t("errors.generic") };
      } finally {
        starting.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_PatenteDisclaimer = _sfc_main$1;
      const _component_UiCard = _sfc_main$2;
      const _component_UiAlert = _sfc_main$3;
      const _component_UiButton = _sfc_main$3$1;
      const _component_AuthVerifyNeeded = _sfc_main$4;
      const _component_UiIcon = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.examTitle"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("patente.examIntro"))}</p>`);
      _push(ssrRenderComponent(_component_PatenteDisclaimer, { class: "mb-6" }, null, _parent));
      if (unref(rules)) {
        _push(ssrRenderComponent(_component_UiCard, { class: "mb-6" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<dl class="grid grid-cols-3 gap-3 text-center"${_scopeId}><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.rules.questions"))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(rules).questions)}</dd></div><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.rules.maxErrors"))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(rules).max_errors)}</dd></div><div${_scopeId}><dt class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("patente.rules.minutes"))}</dt><dd class="text-2xl font-bold tabular-nums"${_scopeId}>${ssrInterpolate(unref(rules).minutes)}</dd></div></dl>`);
            } else {
              return [
                createVNode("dl", { class: "grid grid-cols-3 gap-3 text-center" }, [
                  createVNode("div", null, [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.rules.questions")), 1),
                    createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString(unref(rules).questions), 1)
                  ]),
                  createVNode("div", null, [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.rules.maxErrors")), 1),
                    createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString(unref(rules).max_errors), 1)
                  ]),
                  createVNode("div", null, [
                    createVNode("dt", { class: "text-sm text-muted" }, toDisplayString(unref(t)("patente.rules.minutes")), 1),
                    createVNode("dd", { class: "text-2xl font-bold tabular-nums" }, toDisplayString(unref(rules).minutes), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (((_a = unref(problem)) == null ? void 0 : _a.code) === "not_enough_questions") {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          title: unref(t)("patente.notEnoughTitle"),
          class: "mb-6",
          "data-testid": "not-enough"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p${_scopeId}>${ssrInterpolate(unref(t)("patente.notEnough"))}</p>`);
              if (unref(problem).available && unref(problem).required) {
                _push2(`<p class="mt-1 text-sm"${_scopeId}>${ssrInterpolate(unref(t)("patente.notEnoughCount", { available: unref(problem).available, required: unref(problem).required }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UiButton, {
                to: "/patente/practice",
                variant: "secondary",
                class: "mt-3"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("patente.tryPractice"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("patente.tryPractice")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("p", null, toDisplayString(unref(t)("patente.notEnough")), 1),
                unref(problem).available && unref(problem).required ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 text-sm"
                }, toDisplayString(unref(t)("patente.notEnoughCount", { available: unref(problem).available, required: unref(problem).required })), 1)) : createCommentVNode("", true),
                createVNode(_component_UiButton, {
                  to: "/patente/practice",
                  variant: "secondary",
                  class: "mt-3"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("patente.tryPractice")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (((_b = unref(problem)) == null ? void 0 : _b.code) === "email_not_verified") {
        _push(ssrRenderComponent(_component_AuthVerifyNeeded, { class: "mb-6" }, null, _parent));
      } else if (unref(problem)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          class: "mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(problem).message)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(problem).message), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiButton, {
        size: "lg",
        loading: unref(starting),
        onClick: start
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "clock",
              size: 20
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("patente.beginExam"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "clock",
                size: 20
              }),
              createTextVNode(toDisplayString(unref(t)("patente.beginExam")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/exam.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=exam-Ba8mawav.mjs.map
