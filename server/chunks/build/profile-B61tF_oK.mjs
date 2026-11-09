import { _ as _sfc_main$2 } from './Nav-CnBbBeUx.mjs';
import { _ as _sfc_main$3 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, _ as _sfc_main$3$1, d as _sfc_main$5$1 } from './server.mjs';
import { _ as _sfc_main$4 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$5 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$6 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$7 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$8 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$9 } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$a } from './Textarea-C8QsGxT0.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, reactive, computed, openBlock, createBlock, Fragment, renderList, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { S as SERVICE_LANGUAGES, l as languageName } from './services-h_WXKmjh.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as useSeo } from './useSeo-BU4sLOnV.mjs';
import { u as useProviderPortal } from './useProviderPortal-BfW_CYQw.mjs';
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
import './safe-B2eSdAXJ.mjs';
import 'perfect-debounce';

const PORTAL_LOCALES = ["ar", "en", "it"];
const emptyT = () => ({ headline: "", description: "", availability_note: "" });
const emptyS = () => ({ name: "", description: "" });
const newServiceRow = () => ({ price: "", translations: { ar: emptyS(), en: emptyS(), it: emptyS() } });
function profileToForm(p) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const tr = (l) => {
    var _a2, _b2;
    return { ...emptyT(), ...Object.fromEntries(Object.entries((_b2 = (_a2 = p == null ? void 0 : p.translations) == null ? void 0 : _a2[l]) != null ? _b2 : {}).map(([k, v]) => [k, v != null ? v : ""])) };
  };
  const services = ((_a = p == null ? void 0 : p.services) != null ? _a : []).map((s) => {
    var _a2, _b2, _c2, _d2, _e2, _f2;
    const row = newServiceRow();
    row.price = s.price_from_eur === null || s.price_from_eur === void 0 ? "" : String(s.price_from_eur);
    for (const l of PORTAL_LOCALES) row.translations[l] = { name: (_c2 = (_b2 = (_a2 = s.translations) == null ? void 0 : _a2[l]) == null ? void 0 : _b2.name) != null ? _c2 : "", description: (_f2 = (_e2 = (_d2 = s.translations) == null ? void 0 : _d2[l]) == null ? void 0 : _e2.description) != null ? _f2 : "" };
    return row;
  });
  return {
    category: (_b = p == null ? void 0 : p.category) != null ? _b : "",
    display_name: (_c = p == null ? void 0 : p.display_name) != null ? _c : "",
    city_id: (p == null ? void 0 : p.city_id) ? String(p.city_id) : "",
    serves_online: (_d = p == null ? void 0 : p.serves_online) != null ? _d : false,
    languages: [...(_e = p == null ? void 0 : p.languages) != null ? _e : []],
    contact_email: (_f = p == null ? void 0 : p.contact_email) != null ? _f : "",
    contact_phone: (_g = p == null ? void 0 : p.contact_phone) != null ? _g : "",
    website: (_h = p == null ? void 0 : p.website) != null ? _h : "",
    show_email: (_i = p == null ? void 0 : p.show_email) != null ? _i : false,
    show_phone: (_j = p == null ? void 0 : p.show_phone) != null ? _j : false,
    show_website: (_k = p == null ? void 0 : p.show_website) != null ? _k : false,
    translations: { ar: tr("ar"), en: tr("en"), it: tr("it") },
    services
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProfileForm",
  __ssrInlineRender: true,
  props: {
    profile: {},
    categories: {},
    cities: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t, locale } = useI18n();
    useApi();
    useToast();
    const form = reactive(profileToForm(props.profile));
    const editLoc = ref(PORTAL_LOCALES.includes(locale.value) ? locale.value : "ar");
    const errors = ref({});
    const saving = ref(false);
    const cityOptions = computed(() => props.cities.map((c) => ({ value: String(c.id), label: c.name })));
    const locOptions = computed(() => PORTAL_LOCALES.map((l) => ({ value: l, label: t(`languages.${l}`) })));
    const tr = computed(() => form.translations[editLoc.value]);
    const toggleLang = (code, on) => {
      form.languages = on ? [.../* @__PURE__ */ new Set([...form.languages, code])] : form.languages.filter((l) => l !== code);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiAlert = _sfc_main$5;
      const _component_UiFormField = _sfc_main$6;
      const _component_UiTextInput = _sfc_main$7;
      const _component_UiSelect = _sfc_main$8;
      const _component_UiCheckbox = _sfc_main$9;
      const _component_UiTextarea = _sfc_main$a;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "space-y-8",
        novalidate: ""
      }, _attrs))}>`);
      if (__props.profile.status === "published") {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "info",
          "data-testid": "live-edit-note"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("provider.profile.liveNote"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("provider.profile.liveNote")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<fieldset class="space-y-4 rounded-lg border border-line p-4"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("provider.profile.basics"))}</legend>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.display_name"),
        error: unref(errors).display_name,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).display_name,
              "onUpdate:modelValue": ($event) => unref(form).display_name = $event,
              maxlength: 160
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).display_name,
                "onUpdate:modelValue": ($event) => unref(form).display_name = $event,
                maxlength: 160
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.category"),
        error: unref(errors).category,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).category,
              "onUpdate:modelValue": ($event) => unref(form).category = $event,
              options: __props.categories,
              placeholder: unref(t)("common.choose")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).category,
                "onUpdate:modelValue": ($event) => unref(form).category = $event,
                options: __props.categories,
                placeholder: unref(t)("common.choose")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.city"),
        error: unref(errors).city_id,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(form).city_id,
              "onUpdate:modelValue": ($event) => unref(form).city_id = $event,
              options: unref(cityOptions),
              placeholder: unref(t)("provider.fields.noCity")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(form).city_id,
                "onUpdate:modelValue": ($event) => unref(form).city_id = $event,
                options: unref(cityOptions),
                placeholder: unref(t)("provider.fields.noCity")
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: unref(form).serves_online,
        "onUpdate:modelValue": ($event) => unref(form).serves_online = $event,
        label: unref(t)("provider.fields.serves_online")
      }, null, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.languages"),
        group: "",
        error: unref(errors).languages
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid gap-x-4 sm:grid-cols-2"${_scopeId}><!--[-->`);
            ssrRenderList(unref(SERVICE_LANGUAGES), (l) => {
              _push2(ssrRenderComponent(_component_UiCheckbox, {
                key: l,
                "model-value": unref(form).languages.includes(l),
                label: unref(languageName)(l, unref(locale)),
                "onUpdate:modelValue": ($event) => toggleLang(l, $event)
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "grid gap-x-4 sm:grid-cols-2" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(SERVICE_LANGUAGES), (l) => {
                  return openBlock(), createBlock(_component_UiCheckbox, {
                    key: l,
                    "model-value": unref(form).languages.includes(l),
                    label: unref(languageName)(l, unref(locale)),
                    "onUpdate:modelValue": ($event) => toggleLang(l, $event)
                  }, null, 8, ["model-value", "label", "onUpdate:modelValue"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</fieldset><fieldset class="space-y-4 rounded-lg border border-line p-4"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("provider.profile.contact"))}</legend><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("provider.profile.contactNote"))}</p><div class="grid gap-4 sm:grid-cols-2"><div>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.contact_email"),
        error: unref(errors).contact_email,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).contact_email,
              "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
              type: "email",
              ltr: "",
              maxlength: 190
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).contact_email,
                "onUpdate:modelValue": ($event) => unref(form).contact_email = $event,
                type: "email",
                ltr: "",
                maxlength: 190
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: unref(form).show_email,
        "onUpdate:modelValue": ($event) => unref(form).show_email = $event,
        label: unref(t)("provider.fields.show")
      }, null, _parent));
      _push(`</div><div>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.contact_phone"),
        error: unref(errors).contact_phone,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).contact_phone,
              "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
              type: "tel",
              ltr: "",
              maxlength: 25
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).contact_phone,
                "onUpdate:modelValue": ($event) => unref(form).contact_phone = $event,
                type: "tel",
                ltr: "",
                maxlength: 25
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: unref(form).show_phone,
        "onUpdate:modelValue": ($event) => unref(form).show_phone = $event,
        label: unref(t)("provider.fields.show")
      }, null, _parent));
      _push(`</div><div class="sm:col-span-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.website"),
        hint: unref(t)("provider.fields.websiteHint"),
        error: unref(errors).website,
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(form).website,
              "onUpdate:modelValue": ($event) => unref(form).website = $event,
              type: "url",
              ltr: "",
              maxlength: 2048
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(form).website,
                "onUpdate:modelValue": ($event) => unref(form).website = $event,
                type: "url",
                ltr: "",
                maxlength: 2048
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: unref(form).show_website,
        "onUpdate:modelValue": ($event) => unref(form).show_website = $event,
        label: unref(t)("provider.fields.show")
      }, null, _parent));
      _push(`</div></div></fieldset><fieldset class="space-y-4 rounded-lg border border-line p-4"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("provider.profile.texts"))}</legend>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.profile.editLang"),
        hint: unref(t)("provider.profile.editLangHint"),
        class: "max-w-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(editLoc),
              "onUpdate:modelValue": ($event) => isRef(editLoc) ? editLoc.value = $event : null,
              options: unref(locOptions)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(editLoc),
                "onUpdate:modelValue": ($event) => isRef(editLoc) ? editLoc.value = $event : null,
                options: unref(locOptions)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(errors).translations) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(errors).translations)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(errors).translations), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.headline"),
        error: unref(errors)[`translations.${unref(editLoc)}.headline`]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(tr).headline,
              "onUpdate:modelValue": ($event) => unref(tr).headline = $event,
              maxlength: 200,
              dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(tr).headline,
                "onUpdate:modelValue": ($event) => unref(tr).headline = $event,
                maxlength: 200,
                dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.description"),
        error: unref(errors)[`translations.${unref(editLoc)}.description`],
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextarea, {
              modelValue: unref(tr).description,
              "onUpdate:modelValue": ($event) => unref(tr).description = $event,
              rows: 5,
              maxlength: 5e3,
              dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextarea, {
                modelValue: unref(tr).description,
                "onUpdate:modelValue": ($event) => unref(tr).description = $event,
                rows: 5,
                maxlength: 5e3,
                dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("provider.fields.availability_note"),
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: unref(tr).availability_note,
              "onUpdate:modelValue": ($event) => unref(tr).availability_note = $event,
              maxlength: 500,
              dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: unref(tr).availability_note,
                "onUpdate:modelValue": ($event) => unref(tr).availability_note = $event,
                maxlength: 500,
                dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</fieldset><fieldset class="space-y-4 rounded-lg border border-line p-4"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("provider.profile.services"))}</legend><p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("provider.profile.servicesNote"))}</p>`);
      if (unref(errors).services) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(errors).services)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(errors).services), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<ul class="space-y-4"><!--[-->`);
      ssrRenderList(unref(form).services, (s, i) => {
        _push(`<li class="space-y-3 rounded-md border border-line bg-surface p-3">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("provider.fields.service_name")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: s.translations[unref(editLoc)].name,
                "onUpdate:modelValue": ($event) => s.translations[unref(editLoc)].name = $event,
                maxlength: 160,
                dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: s.translations[unref(editLoc)].name,
                  "onUpdate:modelValue": ($event) => s.translations[unref(editLoc)].name = $event,
                  maxlength: 160,
                  dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("provider.fields.service_description"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: s.translations[unref(editLoc)].description,
                "onUpdate:modelValue": ($event) => s.translations[unref(editLoc)].description = $event,
                maxlength: 1e3,
                dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: s.translations[unref(editLoc)].description,
                  "onUpdate:modelValue": ($event) => s.translations[unref(editLoc)].description = $event,
                  maxlength: 1e3,
                  dir: unref(editLoc) === "ar" ? "rtl" : "ltr"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("provider.fields.price_from"),
          hint: unref(t)("provider.fields.price_hint"),
          optional: "",
          class: "max-w-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: s.price,
                "onUpdate:modelValue": ($event) => s.price = $event,
                inputmode: "numeric",
                ltr: "",
                maxlength: 7
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: s.price,
                  "onUpdate:modelValue": ($event) => s.price = $event,
                  inputmode: "numeric",
                  ltr: "",
                  maxlength: 7
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          onClick: ($event) => unref(form).services.splice(i, 1)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "trash",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("provider.profile.removeService"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "trash",
                  size: 16
                }),
                createTextVNode(toDisplayString(unref(t)("provider.profile.removeService")), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul>`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        onClick: ($event) => unref(form).services.push(unref(newServiceRow)())
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "plus",
              size: 16
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("provider.profile.addService"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "plus",
                size: 16
              }),
              createTextVNode(toDisplayString(unref(t)("provider.profile.addService")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</fieldset>`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        size: "lg",
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/provider/ProfileForm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    const { request } = useApi();
    useSeo(() => ({ title: t("provider.profile.title"), description: t("provider.subtitle"), noindex: true }));
    const portal = useProviderPortal();
    const { data, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("provider-profile-page", async () => {
      await portal.load();
      const [meta, cities] = await Promise.all([request("providers/meta"), request("cities")]);
      return { categories: meta.data.categories, cities: cities.data };
    })), __temp = await __temp, __restore(), __temp);
    const pending = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_ProviderNav = _sfc_main$2;
      const _component_UiSkeleton = _sfc_main$3;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiAlert = _sfc_main$5;
      const _component_ProviderProfileForm = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-page max-w-3xl py-8 sm:py-12" }, _attrs))}><h1 class="mb-6 text-2xl font-bold sm:text-3xl">${ssrInterpolate(unref(t)("provider.profile.title"))}</h1>`);
      _push(ssrRenderComponent(_component_ProviderNav, null, null, _parent));
      if (unref(portal).state.value === "loading") {
        _push(`<div aria-busy="true">`);
        _push(ssrRenderComponent(_component_UiSkeleton, {
          block: "",
          lines: 6
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error) || unref(portal).state.value === "error" || !unref(data)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: ("isApiError" in _ctx ? _ctx.isApiError : unref(isApiError))(unref(error)) ? unref(error).message : (_a = unref(portal).error.value) != null ? _a : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (unref(portal).state.value === "none" || !unref(portal).profile.value) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("provider.noListingTitle"),
          description: unref(t)("provider.noListing"),
          icon: "user"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiButton, { to: "/provider" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(t)("provider.apply.title"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiButton, { to: "/provider" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(t)("provider.apply.title")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!--[-->`);
        if (unref(pending)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "info",
            class: "mb-6",
            "data-testid": "pending-approval"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("provider.overview.pendingChanges"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("provider.overview.pendingChanges")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_ProviderProfileForm, {
          profile: unref(portal).profile.value,
          categories: unref(data).categories,
          cities: unref(data).cities,
          onSaved: (p, pend) => {
            unref(portal).set(p);
            pending.value = pend;
          }
        }, null, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/provider/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-B61tF_oK.mjs.map
