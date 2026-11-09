import { _ as _sfc_main$1 } from './Gate-CrfDaJ02.mjs';
import { _ as _sfc_main$2 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$4 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$5 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$6 } from './Checkbox-PDAPbGXG.mjs';
import { u as useI18n, g as useApi, _ as _sfc_main$3$1, A as isConsentRequired, l as fieldErrors, j as isApiError } from './server.mjs';
import { defineComponent, reactive, ref, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Form",
  __ssrInlineRender: true,
  props: {
    doc: {},
    types: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const form = reactive({
      type: (_b = (_a = props.doc) == null ? void 0 : _a.type.key) != null ? _b : "",
      label: (_d = (_c = props.doc) == null ? void 0 : _c.label) != null ? _d : "",
      issue_date: (_f = (_e = props.doc) == null ? void 0 : _e.issue_date) != null ? _f : "",
      expiry_date: (_h = (_g = props.doc) == null ? void 0 : _g.expiry_date) != null ? _h : "",
      notes: (_j = (_i = props.doc) == null ? void 0 : _i.notes) != null ? _j : "",
      reminders_enabled: (_l = (_k = props.doc) == null ? void 0 : _k.reminders_enabled) != null ? _l : true,
      offsets: ((_n = (_m = props.doc) == null ? void 0 : _m.reminder_offsets) != null ? _n : [90, 60, 30, 14, 7]).join(", ")
    });
    const errors = ref({});
    const saving = ref(false);
    const needConsent = ref(false);
    const typeOptions = computed(() => props.types.map((x) => ({ value: x.key, label: x.name })));
    function parseOffsets() {
      const parts = form.offsets.split(/[,\s،]+/).filter(Boolean);
      const nums = parts.map(Number);
      return nums.every((n) => Number.isInteger(n) && n >= 0 && n <= 730) ? [...new Set(nums)] : null;
    }
    async function save() {
      errors.value = {};
      needConsent.value = false;
      const offsets = parseOffsets();
      if (offsets === null) {
        errors.value = { reminder_offsets: t("documents.form.offsetsInvalid") };
        return;
      }
      if (!form.type) {
        errors.value = { type: t("documents.form.typeRequired") };
        return;
      }
      saving.value = true;
      const body = {
        type: form.type,
        label: form.label.trim() || null,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
        notes: form.notes.trim() || null,
        reminders_enabled: form.reminders_enabled,
        reminder_offsets: offsets
      };
      try {
        const res = props.doc ? await request(`my-documents/${props.doc.id}`, { method: "PATCH", body }) : await request("my-documents", { method: "POST", body });
        toast.success(t("documents.saved"));
        emit("saved", res.data);
      } catch (e) {
        if (isConsentRequired(e, "document_storage")) needConsent.value = true;
        else {
          errors.value = fieldErrors(e);
          if (!Object.keys(errors.value).length) toast.error(isApiError(e) ? e.message : t("errors.generic"));
        }
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ConsentGate = _sfc_main$1;
      const _component_UiFormField = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiTextInput = _sfc_main$4;
      const _component_UiTextarea = _sfc_main$5;
      const _component_UiCheckbox = _sfc_main$6;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "space-y-5",
        novalidate: ""
      }, _attrs))}>`);
      if (unref(needConsent)) {
        _push(ssrRenderComponent(_component_ConsentGate, {
          purpose: "document_storage",
          onGranted: ($event) => {
            needConsent.value = false;
            save();
          }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.form.type"),
        error: unref(errors).type,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).type,
              "onUpdate:modelValue": ($event) => unref(form).type = $event,
              options: unref(typeOptions),
              placeholder: unref(t)("common.choose")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).type,
                "onUpdate:modelValue": ($event) => unref(form).type = $event,
                options: unref(typeOptions),
                placeholder: unref(t)("common.choose")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.form.label"),
        hint: unref(t)("documents.form.labelHint"),
        error: unref(errors).label,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).label,
              "onUpdate:modelValue": ($event) => unref(form).label = $event,
              maxlength: 100
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).label,
                "onUpdate:modelValue": ($event) => unref(form).label = $event,
                maxlength: 100
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid gap-5 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.form.issue"),
        error: unref(errors).issue_date,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).issue_date,
              "onUpdate:modelValue": ($event) => unref(form).issue_date = $event,
              type: "date",
              ltr: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).issue_date,
                "onUpdate:modelValue": ($event) => unref(form).issue_date = $event,
                type: "date",
                ltr: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.form.expiry"),
        error: unref(errors).expiry_date,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).expiry_date,
              "onUpdate:modelValue": ($event) => unref(form).expiry_date = $event,
              type: "date",
              ltr: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).expiry_date,
                "onUpdate:modelValue": ($event) => unref(form).expiry_date = $event,
                type: "date",
                ltr: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("documents.form.notes"),
        hint: unref(t)("documents.form.notesHint"),
        error: unref(errors).notes,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextarea, {
              modelValue: unref(form).notes,
              "onUpdate:modelValue": ($event) => unref(form).notes = $event,
              rows: 3,
              maxlength: 2e3
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextarea, {
                modelValue: unref(form).notes,
                "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                rows: 3,
                maxlength: 2e3
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<fieldset class="space-y-2">`);
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: unref(form).reminders_enabled,
        "onUpdate:modelValue": ($event) => unref(form).reminders_enabled = $event,
        label: unref(t)("documents.form.reminders"),
        description: unref(t)("documents.form.remindersHint")
      }, null, _parent));
      if (unref(form).reminders_enabled) {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("documents.form.offsets"),
          hint: unref(t)("documents.form.offsetsHint"),
          error: unref(errors).reminder_offsets
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: unref(form).offsets,
                "onUpdate:modelValue": ($event) => unref(form).offsets = $event,
                inputmode: "numeric",
                ltr: ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: unref(form).offsets,
                  "onUpdate:modelValue": ($event) => unref(form).offsets = $event,
                  inputmode: "numeric",
                  ltr: ""
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</fieldset>`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: unref(saving)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("common.save"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("common.save")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/documents/Form.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=Form-BvHcw3NH.mjs.map
