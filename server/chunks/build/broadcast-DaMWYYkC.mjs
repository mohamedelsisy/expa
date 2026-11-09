import { u as useAdminSeo, _ as _sfc_main$1 } from './useAdminSeo-DuRYEU0h.mjs';
import { _ as _sfc_main$2 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$3 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$5 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$6 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$7 } from './ConfirmInline-sG5Cp32P.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3$1, d as _sfc_main$5$1, l as fieldErrors, j as isApiError } from './server.mjs';
import { defineComponent, reactive, ref, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useRoles } from './useRoles-B6Nsc3f-.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
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
import './permissions-CcyNKBx7.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "broadcast",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    usePermissions();
    useAdminSeo(() => t("admin.broadcast.title"));
    const LOCALES = ["ar", "en", "it"];
    const form = reactive({ title: { ar: "", en: "", it: "" }, body: { ar: "", en: "", it: "" }, role: "" });
    const { roles } = useRoles();
    const errors = ref({});
    const failure = ref("");
    const confirming = ref(false);
    const busy = ref(false);
    const sent = ref(null);
    const clean = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    async function send() {
      busy.value = true;
      failure.value = "";
      try {
        const res = await request("admin/notifications/broadcast", { method: "POST", body: { title: clean(form.title), body: clean(form.body), ...form.role ? { role: form.role } : {} } });
        sent.value = { recipients: res.data.recipients };
        toast.success(t("admin.broadcast.queued", { count: res.data.recipients }));
        for (const l of LOCALES) {
          form.title[l] = "";
          form.body[l] = "";
        }
        confirming.value = false;
      } catch (e) {
        errors.value = fieldErrors(e);
        failure.value = isApiError(e) && e.status === 429 ? t("admin.broadcast.rateLimited") : isApiError(e) && e.status === 403 ? t("admin.common.forbidden") : isApiError(e) ? e.message : t("errors.generic");
        confirming.value = false;
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_UiAlert = _sfc_main$2;
      const _component_UiFormField = _sfc_main$3;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiTextarea = _sfc_main$5;
      const _component_UiSelect = _sfc_main$6;
      const _component_UiConfirmInline = _sfc_main$7;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.broadcast.title"),
        description: unref(t)("admin.broadcast.help"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.broadcast.title") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiAlert, {
        tone: "info",
        class: "mb-6"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("admin.broadcast.note"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("admin.broadcast.note")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div aria-live="polite">`);
      if (unref(sent)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "success",
          class: "mb-4",
          "data-testid": "broadcast-sent"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.broadcast.queued", { count: unref(sent).recipients }))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.broadcast.queued", { count: unref(sent).recipients })), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(failure)) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "danger",
          class: "mb-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(failure))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(failure)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><form class="max-w-3xl space-y-6" novalidate><!--[-->`);
      ssrRenderList(LOCALES, (l) => {
        _push(`<fieldset class="space-y-3 rounded-md border border-line p-4"><legend class="px-1 font-bold">${ssrInterpolate(unref(t)(`languages.${l}`))}`);
        if (l === "ar") {
          _push(`<span class="text-danger"> *</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</legend>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.broadcast.subject"),
          required: l === "ar",
          optional: l !== "ar",
          error: l === "ar" ? unref(errors)["title.ar"] || unref(errors).title : unref(errors)[`title.${l}`]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(form).title[l],
                "onUpdate:modelValue": ($event) => unref(form).title[l] = $event,
                maxlength: 120,
                dir: l === "ar" ? "rtl" : "ltr"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(form).title[l],
                  "onUpdate:modelValue": ($event) => unref(form).title[l] = $event,
                  maxlength: 120,
                  dir: l === "ar" ? "rtl" : "ltr"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.broadcast.message"),
          required: l === "ar",
          optional: l !== "ar",
          error: l === "ar" ? unref(errors)["body.ar"] || unref(errors).body : unref(errors)[`body.${l}`]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: unref(form).body[l],
                "onUpdate:modelValue": ($event) => unref(form).body[l] = $event,
                rows: 3,
                maxlength: 1e3,
                dir: l === "ar" ? "rtl" : "ltr"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: unref(form).body[l],
                  "onUpdate:modelValue": ($event) => unref(form).body[l] = $event,
                  rows: 3,
                  maxlength: 1e3,
                  dir: l === "ar" ? "rtl" : "ltr"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</fieldset>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.broadcast.audience"),
        hint: unref(t)("admin.broadcast.audienceHint"),
        optional: "",
        error: unref(errors).role
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b;
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).role,
              "onUpdate:modelValue": ($event) => unref(form).role = $event,
              options: ((_a = unref(roles)) != null ? _a : []).map((r) => ({ value: r.key, label: r.label })),
              placeholder: unref(t)("admin.broadcast.everyone")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).role,
                "onUpdate:modelValue": ($event) => unref(form).role = $event,
                options: ((_b = unref(roles)) != null ? _b : []).map((r) => ({ value: r.key, label: r.label })),
                placeholder: unref(t)("admin.broadcast.everyone")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(confirming)) {
        _push(ssrRenderComponent(_component_UiConfirmInline, {
          message: unref(t)("admin.broadcast.confirm"),
          "confirm-label": unref(t)("admin.broadcast.send"),
          loading: unref(busy),
          onCancel: ($event) => confirming.value = false,
          onConfirm: send
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiButton, { type: "submit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "send",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("admin.broadcast.review"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "send",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("admin.broadcast.review")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/notifications/broadcast.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=broadcast-DaMWYYkC.mjs.map
