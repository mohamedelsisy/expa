import { _ as _sfc_main$1 } from './Breadcrumbs-C7SaJcTR.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './VerifyNeeded-mxk-8UjC.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$6 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { u as useI18n, g as useApi, c as useLocalePath, o as createError, _ as _sfc_main$3$1 } from './server.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useCommunityMeta } from './useCommunity-pk23xdcX.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './safe-B2eSdAXJ.mjs';
import './useToast-BX2bodPv.mjs';
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
import 'perfect-debounce';

const titleMax = 500;
const bodyMax = 2e4;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ask",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    useLocalePath();
    const community = useCommunityMeta();
    const meta = ([__temp, __restore] = withAsyncContext(() => community.load()), __temp = await __temp, __restore(), __temp);
    if (!meta) throw createError({ statusCode: 404, statusMessage: "Not Found", fatal: true });
    useSeo(() => ({ title: t("community.askTitle"), description: t("community.askIntro"), noindex: true }));
    const { data: cities } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("community-ask-cities", async () => (await request("cities")).data, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const cityOptions = computed(() => {
      var _a;
      return ((_a = cities.value) != null ? _a : []).map((c) => ({ value: String(c.id), label: c.name }));
    });
    const topicOptions = computed(() => meta.topics.map((x) => ({ value: x.value, label: x.label })));
    const form = reactive({ title: "", body: "", topic: "", city_id: "", tags: "" });
    const errors = ref({});
    const notice = ref(null);
    const needVerify = ref(false);
    const submitting = ref(false);
    const sensitive = computed(() => {
      var _a;
      return ((_a = meta.topics.find((x) => x.value === form.topic)) == null ? void 0 : _a.sensitive) === true;
    });
    const crumbs = computed(() => [{ label: t("community.title"), to: "/community" }, { label: t("community.askTitle") }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBreadcrumbs = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_AuthVerifyNeeded = _sfc_main$3;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextInput = _sfc_main$5;
      const _component_UiTextarea = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBreadcrumbs, {
        items: unref(crumbs),
        class: "mb-6"
      }, null, _parent));
      _push(`<h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("community.askTitle"))}</h1><p class="mb-4 text-ink-soft">${ssrInterpolate(unref(t)("community.askIntro"))}</p>`);
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "warning",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(meta).notice)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(meta).notice), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(needVerify)) {
        _push(ssrRenderComponent(_component_AuthVerifyNeeded, { class: "mb-6" }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<form class="space-y-5" novalidate>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("community.fields.title"),
        error: unref(errors).title,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).title,
              "onUpdate:modelValue": ($event) => unref(form).title = $event,
              maxlength: titleMax
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).title,
                "onUpdate:modelValue": ($event) => unref(form).title = $event,
                maxlength: titleMax
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("community.fields.body"),
        hint: unref(t)("community.fields.bodyHint"),
        error: unref(errors).body,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextarea, {
              modelValue: unref(form).body,
              "onUpdate:modelValue": ($event) => unref(form).body = $event,
              rows: 8,
              maxlength: bodyMax
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextarea, {
                modelValue: unref(form).body,
                "onUpdate:modelValue": ($event) => unref(form).body = $event,
                rows: 8,
                maxlength: bodyMax
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid gap-4 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("community.topic"),
        error: unref(errors).topic,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).topic,
              "onUpdate:modelValue": ($event) => unref(form).topic = $event,
              options: unref(topicOptions),
              placeholder: unref(t)("community.noTopic")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).topic,
                "onUpdate:modelValue": ($event) => unref(form).topic = $event,
                options: unref(topicOptions),
                placeholder: unref(t)("community.noTopic")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("guides.city"),
        error: unref(errors).city_id,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).city_id,
              "onUpdate:modelValue": ($event) => unref(form).city_id = $event,
              options: unref(cityOptions),
              placeholder: unref(t)("cityInfo.none")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).city_id,
                "onUpdate:modelValue": ($event) => unref(form).city_id = $event,
                options: unref(cityOptions),
                placeholder: unref(t)("cityInfo.none")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(sensitive)) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("community.sensitiveHint"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("community.sensitiveHint")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("community.fields.tags"),
        hint: unref(t)("community.fields.tagsHint"),
        error: unref(errors).tags,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).tags,
              "onUpdate:modelValue": ($event) => unref(form).tags = $event,
              ltr: "",
              maxlength: 200
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).tags,
                "onUpdate:modelValue": ($event) => unref(form).tags = $event,
                ltr: "",
                maxlength: 200
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("community.moderationNote"))}</p>`);
      if (unref(notice)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          "data-testid": "community-error"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(notice))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(notice)), 1)
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
            _push2(`${ssrInterpolate(unref(t)("community.post"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("community.post")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/community/ask.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ask-C59idlOj.mjs.map
