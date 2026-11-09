import { _ as _sfc_main$1 } from './Disclaimer-ByrpdAjg.mjs';
import { u as useI18n, f as useRoute, g as useApi, c as useLocalePath, i as _sfc_main$2, j as isApiError, _ as _sfc_main$3$1 } from './server.mjs';
import { _ as _sfc_main$3 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$6 } from './AutoItalian-BD4PyQ-n.mjs';
import { _ as _sfc_main$7 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$8 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$9 } from './Alert-D-zfMDy5.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, isRef, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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
import './useToast-BX2bodPv.mjs';
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "practice",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const route = useRoute();
    const { request } = useApi();
    useLocalePath();
    useSeo(() => ({ title: t("patente.practiceTitle"), description: t("patente.mockNotice"), noindex: true }));
    const { data: topics, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("practice-topics", async () => (await request("patente/topics")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const selected = ref(typeof route.query.topic === "string" ? [route.query.topic] : []);
    const size = ref("20");
    const starting = ref(false);
    const problem = ref(null);
    const needsVerify = ref(false);
    const noQuestions = ref(false);
    const toggle = (slug, on) => {
      selected.value = on ? [.../* @__PURE__ */ new Set([...selected.value, slug])] : selected.value.filter((s) => s !== slug);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_PatenteDisclaimer = _sfc_main$1;
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiEmptyState = _sfc_main$3;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiCheckbox = _sfc_main$5;
      const _component_UiAutoItalian = _sfc_main$6;
      const _component_UiTextInput = _sfc_main$7;
      const _component_AuthVerifyNeeded = _sfc_main$8;
      const _component_UiAlert = _sfc_main$9;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("patente.practiceTitle"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("patente.practiceIntro"))}</p>`);
      _push(ssrRenderComponent(_component_PatenteDisclaimer, { class: "mb-6" }, null, _parent));
      if (unref(error) || !unref(topics)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(topics).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("patente.noTopicsTitle"),
          description: unref(t)("patente.noTopics"),
          icon: "car"
        }, null, _parent));
      } else {
        _push(`<form class="space-y-5" novalidate>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("patente.chooseTopics"),
          group: "",
          error: (_a = unref(problem)) != null ? _a : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(unref(topics), (tp) => {
                _push2(ssrRenderComponent(_component_UiCheckbox, {
                  key: tp.slug,
                  "model-value": unref(selected).includes(tp.slug),
                  description: unref(t)("patente.questionCount", { count: tp.question_count }),
                  "onUpdate:modelValue": ($event) => toggle(tp.slug, $event)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UiAutoItalian, {
                        text: tp.title
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UiAutoItalian, {
                          text: tp.title
                        }, null, 8, ["text"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(topics), (tp) => {
                  return openBlock(), createBlock(_component_UiCheckbox, {
                    key: tp.slug,
                    "model-value": unref(selected).includes(tp.slug),
                    description: unref(t)("patente.questionCount", { count: tp.question_count }),
                    "onUpdate:modelValue": ($event) => toggle(tp.slug, $event)
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiAutoItalian, {
                        text: tp.title
                      }, null, 8, ["text"])
                    ]),
                    _: 2
                  }, 1032, ["model-value", "description", "onUpdate:modelValue"]);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("patente.practiceSize"),
          hint: unref(t)("patente.practiceSizeHint"),
          class: "max-w-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(size),
                "onUpdate:modelValue": ($event) => isRef(size) ? size.value = $event : null,
                type: "number",
                inputmode: "numeric",
                ltr: ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(size),
                  "onUpdate:modelValue": ($event) => isRef(size) ? size.value = $event : null,
                  type: "number",
                  inputmode: "numeric",
                  ltr: ""
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(needsVerify)) {
          _push(ssrRenderComponent(_component_AuthVerifyNeeded, null, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(noQuestions)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "warning",
            "data-testid": "not-enough"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("patente.notEnoughPractice"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("patente.notEnoughPractice")), 1)
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
          loading: unref(starting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("patente.beginPractice"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("patente.beginPractice")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/patente/practice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=practice-Dh8WZ-QJ.mjs.map
