import { _ as _sfc_main$1 } from './Gate-CrfDaJ02.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2, j as isApiError, _ as _sfc_main$3$1, A as isConsentRequired, l as fieldErrors } from './server.mjs';
import { _ as _sfc_main$3 } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$4 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$5 } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$6 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$7 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$8 } from './Checkbox-PDAPbGXG.mjs';
import { defineComponent, withAsyncContext, reactive, watch, ref, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, createTextVNode, toDisplayString, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import { u as useConsent } from './useConsent-mKBmxtRH.mjs';
import './Alert-D-zfMDy5.mjs';
import './Links-BHP4RLan.mjs';
import './legal-vAxOkaZS.mjs';
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
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "preferences",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    useSeo(() => ({ title: t("jobs.preferences"), description: t("jobs.prefsSubtitle"), noindex: true }));
    const { data, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("job-prefs", async () => {
      const [p, meta, cities] = await Promise.all([request("jobs/profile"), request("jobs/meta"), request("cities")]);
      return { profile: p.data, meta: meta.data, cities: cities.data };
    }, { watch: [locale] })), __temp = await __temp, __restore(), __temp);
    const { granted } = useConsent("profile_personalization");
    const form = reactive({ skills: "", experience: "", education: "", remote: "", types: [], salary: "", cityId: "" });
    watch(data, (d) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!d) return;
      const p = d.profile;
      Object.assign(form, { skills: p.skills.join(", "), experience: (_b = (_a = p.experience_years) == null ? void 0 : _a.toString()) != null ? _b : "", education: (_c = p.education) != null ? _c : "", remote: (_d = p.remote_preference) != null ? _d : "", types: [...p.employment_types], salary: (_f = (_e = p.salary_min_year) == null ? void 0 : _e.toString()) != null ? _f : "", cityId: (_h = (_g = p.city_id) == null ? void 0 : _g.toString()) != null ? _h : "" });
    }, { immediate: true });
    const errors = ref({});
    const saving = ref(false);
    const needConsent = computed(() => granted.value === false);
    const EDU = ["none", "school", "vocational", "bachelor", "master", "phd"];
    const eduOptions = computed(() => EDU.map((v) => ({ value: v, label: t(`jobs.education.${v}`) })));
    const remoteOptions = computed(() => ["any", "remote_only", "onsite_only"].map((v) => ({ value: v, label: t(`jobs.remotePref.${v}`) })));
    const cityOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.cities) != null ? _b : []).map((c) => ({ value: String(c.id), label: c.name }));
    });
    const toggleType = (v, on) => {
      form.types = on ? [.../* @__PURE__ */ new Set([...form.types, v])] : form.types.filter((x) => x !== v);
    };
    const num = (s) => s.trim() === "" ? null : Number(s);
    async function save() {
      errors.value = {};
      saving.value = true;
      try {
        const skills = form.skills.split(/[,\n،]+/).map((s) => s.trim()).filter(Boolean).slice(0, 40);
        await request("jobs/profile", { method: "PUT", body: {
          skills,
          experience_years: num(form.experience),
          education: form.education || null,
          remote_preference: form.remote || null,
          employment_types: form.types,
          salary_min_year: num(form.salary),
          city_id: num(form.cityId)
        } });
        toast.success(t("profile.saved"));
        await refresh();
      } catch (e) {
        if (isConsentRequired(e, "profile_personalization")) granted.value = false;
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
      const _component_UiErrorState = _sfc_main$2;
      const _component_UiCard = _sfc_main$3;
      const _component_UiFormField = _sfc_main$4;
      const _component_UiTextarea = _sfc_main$5;
      const _component_UiTextInput = _sfc_main$6;
      const _component_UiSelect = _sfc_main$7;
      const _component_UiCheckbox = _sfc_main$8;
      const _component_UiButton = _sfc_main$3$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-2xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-2 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("jobs.preferences"))}</h1><p class="mb-6 text-ink-soft">${ssrInterpolate(unref(t)("jobs.prefsSubtitle"))}</p>`);
      if (unref(needConsent)) {
        _push(ssrRenderComponent(_component_ConsentGate, {
          purpose: "profile_personalization",
          class: "mb-6",
          onGranted: ($event) => granted.value = true
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(error) || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<form class="space-y-5" novalidate${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.skills"),
                hint: unref(t)("jobs.skillsHint"),
                error: unref(errors).skills
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextarea, {
                      modelValue: unref(form).skills,
                      "onUpdate:modelValue": ($event) => unref(form).skills = $event,
                      rows: 2
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextarea, {
                        modelValue: unref(form).skills,
                        "onUpdate:modelValue": ($event) => unref(form).skills = $event,
                        rows: 2
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<div class="grid gap-5 sm:grid-cols-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.experience"),
                error: unref(errors).experience_years,
                optional: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).experience,
                      "onUpdate:modelValue": ($event) => unref(form).experience = $event,
                      type: "number",
                      inputmode: "numeric",
                      ltr: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).experience,
                        "onUpdate:modelValue": ($event) => unref(form).experience = $event,
                        type: "number",
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.educationLabel"),
                error: unref(errors).education,
                optional: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      modelValue: unref(form).education,
                      "onUpdate:modelValue": ($event) => unref(form).education = $event,
                      options: unref(eduOptions),
                      placeholder: unref(t)("common.choose")
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        modelValue: unref(form).education,
                        "onUpdate:modelValue": ($event) => unref(form).education = $event,
                        options: unref(eduOptions),
                        placeholder: unref(t)("common.choose")
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.remotePrefLabel"),
                error: unref(errors).remote_preference,
                optional: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      modelValue: unref(form).remote,
                      "onUpdate:modelValue": ($event) => unref(form).remote = $event,
                      options: unref(remoteOptions),
                      placeholder: unref(t)("common.choose")
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        modelValue: unref(form).remote,
                        "onUpdate:modelValue": ($event) => unref(form).remote = $event,
                        options: unref(remoteOptions),
                        placeholder: unref(t)("common.choose")
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.salaryMin"),
                error: unref(errors).salary_min_year,
                optional: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiTextInput, {
                      modelValue: unref(form).salary,
                      "onUpdate:modelValue": ($event) => unref(form).salary = $event,
                      type: "number",
                      inputmode: "numeric",
                      ltr: ""
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiTextInput, {
                        modelValue: unref(form).salary,
                        "onUpdate:modelValue": ($event) => unref(form).salary = $event,
                        type: "number",
                        inputmode: "numeric",
                        ltr: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("guides.city"),
                error: unref(errors).city_id,
                optional: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      modelValue: unref(form).cityId,
                      "onUpdate:modelValue": ($event) => unref(form).cityId = $event,
                      options: unref(cityOptions),
                      placeholder: unref(t)("common.choose")
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        modelValue: unref(form).cityId,
                        "onUpdate:modelValue": ($event) => unref(form).cityId = $event,
                        options: unref(cityOptions),
                        placeholder: unref(t)("common.choose")
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: unref(t)("jobs.employmentType"),
                group: "",
                error: unref(errors).employment_types
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<!--[-->`);
                    ssrRenderList(unref(data).meta.employment_types, (o) => {
                      _push3(ssrRenderComponent(_component_UiCheckbox, {
                        key: o.value,
                        "model-value": unref(form).types.includes(o.value),
                        label: o.label,
                        "onUpdate:modelValue": ($event) => toggleType(o.value, $event)
                      }, null, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                  } else {
                    return [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(data).meta.employment_types, (o) => {
                        return openBlock(), createBlock(_component_UiCheckbox, {
                          key: o.value,
                          "model-value": unref(form).types.includes(o.value),
                          label: o.label,
                          "onUpdate:modelValue": ($event) => toggleType(o.value, $event)
                        }, null, 8, ["model-value", "label", "onUpdate:modelValue"]);
                      }), 128))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UiButton, {
                type: "submit",
                loading: unref(saving)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("common.save"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            } else {
              return [
                createVNode("form", {
                  class: "space-y-5",
                  novalidate: "",
                  onSubmit: withModifiers(save, ["prevent"])
                }, [
                  createVNode(_component_UiFormField, {
                    label: unref(t)("jobs.skills"),
                    hint: unref(t)("jobs.skillsHint"),
                    error: unref(errors).skills
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UiTextarea, {
                        modelValue: unref(form).skills,
                        "onUpdate:modelValue": ($event) => unref(form).skills = $event,
                        rows: 2
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["label", "hint", "error"]),
                  createVNode("div", { class: "grid gap-5 sm:grid-cols-2" }, [
                    createVNode(_component_UiFormField, {
                      label: unref(t)("jobs.experience"),
                      error: unref(errors).experience_years,
                      optional: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).experience,
                          "onUpdate:modelValue": ($event) => unref(form).experience = $event,
                          type: "number",
                          inputmode: "numeric",
                          ltr: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("jobs.educationLabel"),
                      error: unref(errors).education,
                      optional: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          modelValue: unref(form).education,
                          "onUpdate:modelValue": ($event) => unref(form).education = $event,
                          options: unref(eduOptions),
                          placeholder: unref(t)("common.choose")
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("jobs.remotePrefLabel"),
                      error: unref(errors).remote_preference,
                      optional: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          modelValue: unref(form).remote,
                          "onUpdate:modelValue": ($event) => unref(form).remote = $event,
                          options: unref(remoteOptions),
                          placeholder: unref(t)("common.choose")
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("jobs.salaryMin"),
                      error: unref(errors).salary_min_year,
                      optional: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiTextInput, {
                          modelValue: unref(form).salary,
                          "onUpdate:modelValue": ($event) => unref(form).salary = $event,
                          type: "number",
                          inputmode: "numeric",
                          ltr: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"]),
                    createVNode(_component_UiFormField, {
                      label: unref(t)("guides.city"),
                      error: unref(errors).city_id,
                      optional: ""
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          modelValue: unref(form).cityId,
                          "onUpdate:modelValue": ($event) => unref(form).cityId = $event,
                          options: unref(cityOptions),
                          placeholder: unref(t)("common.choose")
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"])
                  ]),
                  createVNode(_component_UiFormField, {
                    label: unref(t)("jobs.employmentType"),
                    group: "",
                    error: unref(errors).employment_types
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(data).meta.employment_types, (o) => {
                        return openBlock(), createBlock(_component_UiCheckbox, {
                          key: o.value,
                          "model-value": unref(form).types.includes(o.value),
                          label: o.label,
                          "onUpdate:modelValue": ($event) => toggleType(o.value, $event)
                        }, null, 8, ["model-value", "label", "onUpdate:modelValue"]);
                      }), 128))
                    ]),
                    _: 1
                  }, 8, ["label", "error"]),
                  createVNode(_component_UiButton, {
                    type: "submit",
                    loading: unref(saving)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("common.save")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ], 32)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/jobs/preferences.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=preferences-BqzXIt24.mjs.map
