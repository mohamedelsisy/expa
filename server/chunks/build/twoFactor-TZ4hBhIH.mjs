import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './TextInput-BI4efS3_.mjs';
import { defineComponent, useModel, ref, mergeProps, unref, withCtx, openBlock, createBlock, mergeModels, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useI18n, j as isApiError } from './server.mjs';
import { encode } from 'uqr';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CodeOrRecovery",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    error: {},
    hint: {},
    autofocus: { type: Boolean }
  }, {
    "mode": { default: "code" },
    "modeModifiers": {},
    "modelValue": { default: "" },
    "modelModifiers": {}
  }),
  emits: ["update:mode", "update:modelValue"],
  setup(__props, { expose: __expose }) {
    const mode = useModel(__props, "mode");
    const value = useModel(__props, "modelValue");
    const { t } = useI18n();
    const root = ref(null);
    function focus() {
      var _a, _b;
      (_b = (_a = root.value) == null ? void 0 : _a.querySelector("input")) == null ? void 0 : _b.focus();
    }
    __expose({ focus });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiTextInput = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "space-y-3"
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: mode.value === "code" ? unref(t)("twoFactor.login.codeLabel") : unref(t)("twoFactor.login.recoveryLabel"),
        hint: (_a = __props.hint) != null ? _a : mode.value === "code" ? unref(t)("twoFactor.login.codeHint") : unref(t)("twoFactor.login.recoveryHint"),
        error: __props.error,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              key: mode.value,
              modelValue: value.value,
              "onUpdate:modelValue": ($event) => value.value = $event,
              autocomplete: mode.value === "code" ? "one-time-code" : "off",
              inputmode: mode.value === "code" ? "numeric" : "text",
              maxlength: mode.value === "code" ? 8 : 12,
              ltr: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              (openBlock(), createBlock(_component_UiTextInput, {
                key: mode.value,
                modelValue: value.value,
                "onUpdate:modelValue": ($event) => value.value = $event,
                autocomplete: mode.value === "code" ? "one-time-code" : "off",
                inputmode: mode.value === "code" ? "numeric" : "text",
                maxlength: mode.value === "code" ? 8 : 12,
                ltr: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue", "autocomplete", "inputmode", "maxlength"]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="button" class="inline-flex min-h-touch items-center text-sm font-medium text-primary-strong underline underline-offset-4">${ssrInterpolate(mode.value === "code" ? unref(t)("twoFactor.login.useRecovery") : unref(t)("twoFactor.login.useCode"))}</button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/auth/CodeOrRecovery.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const formatCountdown = (seconds) => {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
function retryAfterOf(e) {
  var _a;
  if (!isApiError(e)) return null;
  const v = Number((_a = e.details) == null ? void 0 : _a.retry_after);
  return Number.isFinite(v) && v > 0 ? Math.min(Math.ceil(v), 3600) : null;
}
const groupSecret = (s) => s.replace(/\s/g, "").replace(/(.{4})(?=.)/g, "$1 ");
function qrPath(text) {
  try {
    const { data, size } = encode(text, { ecc: "M", border: 0 });
    let d = "";
    data.forEach((row, y) => row.forEach((on, x) => {
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }));
    return { path: d, size };
  } catch {
    return null;
  }
}
const recoveryFileText = (header, codes) => `${header}

${codes.join("\n")}
`;

export { _sfc_main as _, retryAfterOf as a, formatCountdown as f, groupSecret as g, qrPath as q, recoveryFileText as r };
//# sourceMappingURL=twoFactor-TZ4hBhIH.mjs.map
