import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$3 } from './Checkbox-PDAPbGXG.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { c as countryOptions } from './countries-e88Gbu9b.mjs';
import { u as useI18n } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StepFields",
  __ssrInlineRender: true,
  props: {
    step: {},
    form: {},
    options: {},
    cities: {},
    errors: {},
    label: {}
  },
  setup(__props) {
    const props = __props;
    const { t, locale } = useI18n();
    const countries = computed(() => countryOptions(locale.value));
    const cityOptions = computed(() => props.cities.map((c) => ({ value: String(c.id), label: `${c.name} (${c.region.name})` })));
    const cefr = computed(() => props.options.cefr_level);
    const italianLevels = computed(() => cefr.value.filter((o) => ["A0", "A1", "A2", "B1", "B2", "C1"].includes(o.value)));
    function toggleGoal(value, on) {
      const set = new Set(props.form.goals);
      if (on) set.add(value);
      else set.delete(value);
      props.form.goals = [...set];
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiSelect = _sfc_main$2;
      const _component_UiCheckbox = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      if (__props.step === "status") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_a = __props.label) != null ? _a : unref(t)("profile.fields.segment"),
          error: __props.errors.segment,
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.segment,
                "onUpdate:modelValue": ($event) => __props.form.segment = $event,
                options: __props.options.segment,
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.segment,
                  "onUpdate:modelValue": ($event) => __props.form.segment = $event,
                  options: __props.options.segment,
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.step === "nationality") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_b = __props.label) != null ? _b : unref(t)("profile.fields.nationality"),
          error: __props.errors.nationality,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.nationality,
                "onUpdate:modelValue": ($event) => __props.form.nationality = $event,
                options: unref(countries),
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.nationality,
                  "onUpdate:modelValue": ($event) => __props.form.nationality = $event,
                  options: unref(countries),
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.step === "city") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_c = __props.label) != null ? _c : unref(t)("profile.fields.city"),
          error: __props.errors.city_id,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.city_id,
                "onUpdate:modelValue": ($event) => __props.form.city_id = $event,
                options: unref(cityOptions),
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.city_id,
                  "onUpdate:modelValue": ($event) => __props.form.city_id = $event,
                  options: unref(cityOptions),
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.step === "residence") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_d = __props.label) != null ? _d : unref(t)("profile.fields.residence"),
          error: __props.errors.residence_type,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.residence_type,
                "onUpdate:modelValue": ($event) => __props.form.residence_type = $event,
                options: __props.options.residence_type,
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.residence_type,
                  "onUpdate:modelValue": ($event) => __props.form.residence_type = $event,
                  options: __props.options.residence_type,
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.step === "language") {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("profile.fields.italianLevel"),
          error: __props.errors.italian_level,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.italian_level,
                "onUpdate:modelValue": ($event) => __props.form.italian_level = $event,
                options: unref(italianLevels),
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.italian_level,
                  "onUpdate:modelValue": ($event) => __props.form.italian_level = $event,
                  options: unref(italianLevels),
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("profile.fields.englishLevel"),
          error: __props.errors.english_level,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.english_level,
                "onUpdate:modelValue": ($event) => __props.form.english_level = $event,
                options: unref(cefr),
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.english_level,
                  "onUpdate:modelValue": ($event) => __props.form.english_level = $event,
                  options: unref(cefr),
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else if (__props.step === "goals") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_e = __props.label) != null ? _e : unref(t)("profile.fields.goals"),
          error: __props.errors.goals,
          group: "",
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="grid gap-x-4 sm:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.options.goals, (g) => {
                _push2(ssrRenderComponent(_component_UiCheckbox, {
                  key: g.value,
                  "model-value": __props.form.goals.includes(g.value),
                  label: g.label,
                  "onUpdate:modelValue": ($event) => toggleGoal(g.value, $event)
                }, null, _parent2, _scopeId));
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "grid gap-x-4 sm:grid-cols-2" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.options.goals, (g) => {
                    return openBlock(), createBlock(_component_UiCheckbox, {
                      key: g.value,
                      "model-value": __props.form.goals.includes(g.value),
                      label: g.label,
                      "onUpdate:modelValue": ($event) => toggleGoal(g.value, $event)
                    }, null, 8, ["model-value", "label", "onUpdate:modelValue"]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.step === "age") {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: (_f = __props.label) != null ? _f : unref(t)("profile.fields.ageRange"),
          error: __props.errors.age_range,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: __props.form.age_range,
                "onUpdate:modelValue": ($event) => __props.form.age_range = $event,
                options: __props.options.age_range,
                placeholder: unref(t)("common.choose")
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: __props.form.age_range,
                  "onUpdate:modelValue": ($event) => __props.form.age_range = $event,
                  options: __props.options.age_range,
                  placeholder: unref(t)("common.choose")
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
              ];
            }
          }),
          _: 1
        }, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/profile/StepFields.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const STEP_FIELDS = {
  status: ["segment"],
  nationality: ["nationality"],
  city: ["city_id"],
  residence: ["residence_type"],
  language: ["italian_level", "english_level"],
  goals: ["goals"],
  age: ["age_range"]
};
function emptyProfileForm() {
  return { segment: "", nationality: "", city_id: "", residence_type: "", italian_level: "", english_level: "", goals: [], age_range: "" };
}
function formFromProfile(p) {
  var _a, _b, _c, _d, _e, _f, _g;
  return {
    segment: (_a = p.segment) != null ? _a : "",
    nationality: (_b = p.nationality) != null ? _b : "",
    city_id: p.city ? String(p.city.id) : "",
    residence_type: (_c = p.residence_type) != null ? _c : "",
    italian_level: (_d = p.italian_level) != null ? _d : "",
    english_level: (_e = p.english_level) != null ? _e : "",
    goals: [...(_f = p.goals) != null ? _f : []],
    age_range: (_g = p.age_range) != null ? _g : ""
  };
}
function patchBody(form, fields) {
  const body = {};
  for (const f of fields) {
    const v = form[f];
    if (f === "goals") body.goals = v.length ? v : null;
    else if (f === "city_id") body.city_id = v ? Number(v) : null;
    else body[f] = v || null;
  }
  return body;
}

export { STEP_FIELDS as S, _sfc_main as _, emptyProfileForm as e, formFromProfile as f, patchBody as p };
//# sourceMappingURL=useProfileForm-B3Xk-pQq.mjs.map
