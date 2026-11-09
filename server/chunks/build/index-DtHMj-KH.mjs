import { u as useAdminSeo, _ as _sfc_main$2 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useI18n, g as useApi, f as useRoute, _ as _sfc_main$3, d as _sfc_main$5, i as _sfc_main$2$1, j as isApiError, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { _ as _sfc_main$6 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$7 } from './DataTable--nNCrVdv.mjs';
import { _ as _sfc_main$8 } from './Badge-PdKIsny2.mjs';
import { u as useAdminList, _ as _sfc_main$9 } from './useAdminList-mIj2O5_R.mjs';
import { _ as _sfc_main$a } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$b } from './Pagination-DA28GIFv.mjs';
import { _ as _sfc_main$c } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$d } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$e } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$f } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$g } from './Textarea-C8QsGxT0.mjs';
import { _ as _sfc_main$h } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$i } from './IconButton-f7KcV3ty.mjs';
import { defineComponent, computed, withAsyncContext, ref, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, reactive, mergeProps, Fragment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
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
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "JobSourceForm",
  __ssrInlineRender: true,
  props: {
    source: {}
  },
  emits: ["saved", "close"],
  setup(__props, { emit: __emit }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const props = __props;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const { can } = usePermissions();
    const creating = !props.source;
    const s = props.source;
    const mapObj = s && !Array.isArray(s.config_summary.map) ? s.config_summary.map : {};
    const f = reactive({
      key: (_a = s == null ? void 0 : s.key) != null ? _a : "",
      name: (_b = s == null ? void 0 : s.name) != null ? _b : "",
      driver: (_c = s == null ? void 0 : s.driver) != null ? _c : "json_feed",
      schedule_hours: String((_d = s == null ? void 0 : s.schedule_hours) != null ? _d : 6),
      active: (_e = s == null ? void 0 : s.active) != null ? _e : false,
      legal_basis: (_f = s == null ? void 0 : s.legal_basis) != null ? _f : "",
      url: "",
      items_path: (_g = s == null ? void 0 : s.config_summary.items_path) != null ? _g : "",
      company_default: "",
      headers: [],
      map: Object.entries(mapObj).map(([k, v]) => ({ k, v }))
    });
    const touchedHeaders = ref(false);
    const errors = ref({});
    const formError = ref("");
    const busy = ref(false);
    const legalOk = computed(() => f.legal_basis.trim().length >= 20);
    const canWrite = computed(() => creating ? can("job_sources.create") : can("job_sources.update"));
    const runs = ref(null);
    const runsError = ref("");
    async function loadRuns() {
      if (!s || !can("job_sources.view")) return;
      try {
        runs.value = (await request(`admin/job-sources/${s.id}/runs`)).data;
      } catch (e) {
        runsError.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    const sample = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => (typeof x === "string" ? x : JSON.stringify(x)).slice(0, 240));
    async function runNow() {
      busy.value = true;
      try {
        await request(`admin/job-sources/${s.id}/run`, { method: "POST" });
        toast.success(t("admin.jobs.runQueued"));
        setTimeout(loadRuns, 1500);
      } catch (e) {
        formError.value = isApiError(e) ? e.message : t("errors.generic");
      } finally {
        busy.value = false;
      }
    }
    const addPair = (list) => list.push({ k: "", v: "" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2, _c2;
      const _component_UiAlert = _sfc_main$a;
      const _component_UiFormField = _sfc_main$d;
      const _component_UiTextInput = _sfc_main$e;
      const _component_UiSelect = _sfc_main$f;
      const _component_UiTextarea = _sfc_main$g;
      const _component_UiCheckbox = _sfc_main$h;
      const _component_UiIconButton = _sfc_main$i;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiBadge = _sfc_main$8;
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "space-y-5",
        novalidate: ""
      }, _attrs))}><div aria-live="polite">`);
      if (formError.value) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(formError.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(formError.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!canWrite.value) {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.content.readonly"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.content.readonly")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid gap-4 sm:grid-cols-2">`);
      if (creating) {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.jobs.key"),
          hint: unref(t)("admin.jobs.keyHelp"),
          error: errors.value.key,
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: f.key,
                "onUpdate:modelValue": ($event) => f.key = $event,
                ltr: "",
                disabled: !canWrite.value
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: f.key,
                  "onUpdate:modelValue": ($event) => f.key = $event,
                  ltr: "",
                  disabled: !canWrite.value
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.fields.name"),
        error: errors.value.name,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: f.name,
              "onUpdate:modelValue": ($event) => f.name = $event,
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: f.name,
                "onUpdate:modelValue": ($event) => f.name = $event,
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.jobs.driver"),
        error: errors.value.driver,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: f.driver,
              "onUpdate:modelValue": ($event) => f.driver = $event,
              options: [{ value: "json_feed", label: "JSON feed" }, { value: "rss", label: "RSS" }],
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: f.driver,
                "onUpdate:modelValue": ($event) => f.driver = $event,
                options: [{ value: "json_feed", label: "JSON feed" }, { value: "rss", label: "RSS" }],
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.jobs.scheduleHours"),
        hint: unref(t)("admin.jobs.scheduleHelp"),
        error: errors.value.schedule_hours,
        required: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: f.schedule_hours,
              "onUpdate:modelValue": ($event) => f.schedule_hours = $event,
              type: "number",
              inputmode: "numeric",
              ltr: "",
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: f.schedule_hours,
                "onUpdate:modelValue": ($event) => f.schedule_hours = $event,
                type: "number",
                inputmode: "numeric",
                ltr: "",
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.jobs.legalBasis"),
        hint: unref(t)("admin.jobs.legalHelp"),
        error: errors.value.legal_basis,
        required: f.active,
        optional: !f.active
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextarea, {
              modelValue: f.legal_basis,
              "onUpdate:modelValue": ($event) => f.legal_basis = $event,
              rows: 3,
              maxlength: 2e3,
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextarea, {
                modelValue: f.legal_basis,
                "onUpdate:modelValue": ($event) => f.legal_basis = $event,
                rows: 3,
                maxlength: 2e3,
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div>`);
      _push(ssrRenderComponent(_component_UiCheckbox, {
        modelValue: f.active,
        "onUpdate:modelValue": ($event) => f.active = $event,
        label: unref(t)("admin.jobs.active"),
        description: legalOk.value ? unref(t)("admin.jobs.activeHelp") : unref(t)("admin.jobs.activeBlocked"),
        disabled: !canWrite.value || !legalOk.value && !f.active
      }, null, _parent));
      if (!legalOk.value) {
        _push(ssrRenderComponent(_component_UiAlert, {
          tone: "warning",
          class: "mt-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.jobs.legalWarning"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.jobs.legalWarning")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><fieldset class="space-y-3 rounded-md border border-line p-4"><legend class="px-1 font-bold">${ssrInterpolate(unref(t)("admin.jobs.config"))}</legend>`);
      _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a3, _b3, _c3, _d2, _e2, _f2;
          if (_push2) {
            if (!creating) {
              _push2(`<!--[-->${ssrInterpolate(unref(t)("admin.jobs.configNeverShown", { host: (_b3 = (_a3 = unref(s)) == null ? void 0 : _a3.config_summary.host) != null ? _b3 : "\u2014", headers: ((_c3 = unref(s)) == null ? void 0 : _c3.config_summary.has_headers) ? unref(t)("admin.common.true") : unref(t)("admin.common.false") }))}<!--]-->`);
            } else {
              _push2(`<!--[-->${ssrInterpolate(unref(t)("admin.jobs.configCreate"))}<!--]-->`);
            }
          } else {
            return [
              !creating ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createTextVNode(toDisplayString(unref(t)("admin.jobs.configNeverShown", { host: (_e2 = (_d2 = unref(s)) == null ? void 0 : _d2.config_summary.host) != null ? _e2 : "\u2014", headers: ((_f2 = unref(s)) == null ? void 0 : _f2.config_summary.has_headers) ? unref(t)("admin.common.true") : unref(t)("admin.common.false") })), 1)
              ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                createTextVNode(toDisplayString(unref(t)("admin.jobs.configCreate")), 1)
              ], 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: creating ? unref(t)("admin.jobs.url") : unref(t)("admin.jobs.urlNew"),
        hint: unref(t)("admin.jobs.urlHelp"),
        error: errors.value["config.url"],
        required: creating,
        optional: !creating
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: f.url,
              "onUpdate:modelValue": ($event) => f.url = $event,
              type: "url",
              ltr: "",
              autocomplete: "off",
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: f.url,
                "onUpdate:modelValue": ($event) => f.url = $event,
                type: "url",
                ltr: "",
                autocomplete: "off",
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid gap-4 sm:grid-cols-2">`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.jobs.itemsPath"),
        error: errors.value["config.items_path"],
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: f.items_path,
              "onUpdate:modelValue": ($event) => f.items_path = $event,
              ltr: "",
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: f.items_path,
                "onUpdate:modelValue": ($event) => f.items_path = $event,
                ltr: "",
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.jobs.companyDefault"),
        error: errors.value["config.company_default"],
        optional: ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiTextInput, {
              modelValue: f.company_default,
              "onUpdate:modelValue": ($event) => f.company_default = $event,
              disabled: !canWrite.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiTextInput, {
                modelValue: f.company_default,
                "onUpdate:modelValue": ($event) => f.company_default = $event,
                disabled: !canWrite.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-2"><p class="font-medium">${ssrInterpolate(unref(t)("admin.jobs.headers"))}</p><p class="text-sm text-muted">${ssrInterpolate(!creating ? unref(t)("admin.jobs.headersReplace") : unref(t)("admin.jobs.headersHelp"))}</p><!--[-->`);
      ssrRenderList(f.headers, (p, i) => {
        _push(`<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.jobs.headerName")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: p.k,
                "onUpdate:modelValue": ($event) => p.k = $event,
                ltr: "",
                autocomplete: "off",
                disabled: !canWrite.value
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: p.k,
                  "onUpdate:modelValue": ($event) => p.k = $event,
                  ltr: "",
                  autocomplete: "off",
                  disabled: !canWrite.value
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.jobs.headerValue")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: p.v,
                "onUpdate:modelValue": ($event) => p.v = $event,
                type: "password",
                ltr: "",
                autocomplete: "off",
                disabled: !canWrite.value
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: p.v,
                  "onUpdate:modelValue": ($event) => p.v = $event,
                  type: "password",
                  ltr: "",
                  autocomplete: "off",
                  disabled: !canWrite.value
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiIconButton, {
          icon: "trash",
          label: unref(t)("admin.editor.remove", { n: i + 1 }),
          onClick: ($event) => f.headers.splice(i, 1)
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        disabled: !canWrite.value || f.headers.length >= 10,
        onClick: ($event) => {
          touchedHeaders.value = true;
          addPair(f.headers);
        }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "plus",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("admin.jobs.addHeader"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "plus",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("admin.jobs.addHeader")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!creating && !touchedHeaders.value && ((_a2 = unref(s)) == null ? void 0 : _a2.config_summary.has_headers)) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          disabled: !canWrite.value,
          onClick: ($event) => touchedHeaders.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.jobs.clearHeaders"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.jobs.clearHeaders")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-2"><p class="font-medium">${ssrInterpolate(unref(t)("admin.jobs.map"))}</p><p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.jobs.mapHelp"))}</p><!--[-->`);
      ssrRenderList(f.map, (p, i) => {
        _push(`<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.jobs.mapTarget")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: p.k,
                "onUpdate:modelValue": ($event) => p.k = $event,
                ltr: "",
                disabled: !canWrite.value
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: p.k,
                  "onUpdate:modelValue": ($event) => p.k = $event,
                  ltr: "",
                  disabled: !canWrite.value
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.jobs.mapSource")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: p.v,
                "onUpdate:modelValue": ($event) => p.v = $event,
                ltr: "",
                disabled: !canWrite.value
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: p.v,
                  "onUpdate:modelValue": ($event) => p.v = $event,
                  ltr: "",
                  disabled: !canWrite.value
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiIconButton, {
          icon: "trash",
          label: unref(t)("admin.editor.remove", { n: i + 1 }),
          onClick: ($event) => f.map.splice(i, 1)
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        disabled: !canWrite.value || f.map.length >= 30,
        onClick: ($event) => addPair(f.map)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiIcon, {
              name: "plus",
              size: 18
            }, null, _parent2, _scopeId));
            _push2(`${ssrInterpolate(unref(t)("admin.jobs.addMap"))}`);
          } else {
            return [
              createVNode(_component_UiIcon, {
                name: "plus",
                size: 18
              }),
              createTextVNode(toDisplayString(unref(t)("admin.jobs.addMap")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></fieldset><div class="flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: busy.value,
        disabled: !canWrite.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(creating ? unref(t)("admin.content.create") : unref(t)("admin.content.saveChanges"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(creating ? unref(t)("admin.content.create") : unref(t)("admin.content.saveChanges")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!creating && unref(can)("job_sources.update")) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          disabled: busy.value || !((_b2 = unref(s)) == null ? void 0 : _b2.active),
          onClick: runNow
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "refresh",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("admin.jobs.runNow"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "refresh",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("admin.jobs.runNow")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!creating && !((_c2 = unref(s)) == null ? void 0 : _c2.active)) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.jobs.runInactive"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (!creating && unref(can)("job_sources.view")) {
        _push(`<section aria-labelledby="runs-h" class="space-y-2"><h3 id="runs-h" class="font-bold">${ssrInterpolate(unref(t)("admin.jobs.runs"))}</h3>`);
        if (runsError.value) {
          _push(ssrRenderComponent(_component_UiAlert, { tone: "danger" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(runsError.value)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(runsError.value), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (!runs.value) {
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 3 }, null, _parent));
        } else if (!runs.value.length) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.jobs.noRuns"))}</p>`);
        } else {
          _push(`<div class="relative overflow-x-auto rounded-md border border-line" role="region"${ssrRenderAttr("aria-label", unref(t)("admin.jobs.runs"))} tabindex="0"><table class="w-full min-w-[34rem] border-collapse text-start text-sm"><caption class="sr-only">${ssrInterpolate(unref(t)("admin.jobs.runs"))}</caption><thead class="bg-sunken"><tr><th scope="col" class="px-2 py-1.5 text-start">${ssrInterpolate(unref(t)("admin.jobs.runStarted"))}</th><th scope="col" class="px-2 py-1.5 text-start">${ssrInterpolate(unref(t)("admin.fields.status"))}</th><th scope="col" class="px-2 py-1.5 text-end">${ssrInterpolate(unref(t)("admin.jobs.fetched"))}</th><th scope="col" class="px-2 py-1.5 text-end">${ssrInterpolate(unref(t)("admin.jobs.created"))}</th><th scope="col" class="px-2 py-1.5 text-end">${ssrInterpolate(unref(t)("admin.jobs.updated"))}</th><th scope="col" class="px-2 py-1.5 text-end">${ssrInterpolate(unref(t)("admin.jobs.duplicates"))}</th><th scope="col" class="px-2 py-1.5 text-end">${ssrInterpolate(unref(t)("admin.jobs.invalid"))}</th></tr></thead><tbody class="divide-y divide-line"><!--[-->`);
          ssrRenderList(runs.value, (r) => {
            _push(`<!--[--><tr><th scope="row" class="px-2 py-1.5 text-start font-normal">${ssrInterpolate(unref(formatDateTime)(r.started_at, unref(locale)))}</th><td class="px-2 py-1.5">`);
            _push(ssrRenderComponent(_component_UiBadge, {
              tone: r.status === "failed" ? "danger" : r.status === "success" || r.status === "completed" ? "success" : "neutral"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(r.status)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(r.status), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</td><td class="px-2 py-1.5 text-end tabular-nums">${ssrInterpolate(r.fetched)}</td><td class="px-2 py-1.5 text-end tabular-nums">${ssrInterpolate(r.created)}</td><td class="px-2 py-1.5 text-end tabular-nums">${ssrInterpolate(r.updated)}</td><td class="px-2 py-1.5 text-end tabular-nums">${ssrInterpolate(r.duplicates)}</td><td class="px-2 py-1.5 text-end tabular-nums">${ssrInterpolate(r.invalid)}</td></tr>`);
            if (r.error_message || sample(r.error_samples).length) {
              _push(`<tr><td colspan="7" class="bg-danger-soft px-2 py-1.5 text-danger">`);
              if (r.error_message) {
                _push(`<p dir="auto">${ssrInterpolate(r.error_message)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<ul class="list-disc ps-5"><!--[-->`);
              ssrRenderList(sample(r.error_samples), (x, i) => {
                _push(`<li dir="auto">${ssrInterpolate(x)}</li>`);
              });
              _push(`<!--]--></ul></td></tr>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/JobSourceForm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const route = useRoute();
    const { can } = usePermissions();
    useAdminSeo(() => t("admin.jobs.title"));
    const tabs = computed(() => [can("job_sources.view") && "sources", can("jobs.view") && "listings"].filter(Boolean));
    const tab = computed(() => {
      var _a;
      return typeof route.query.tab === "string" && tabs.value.includes(route.query.tab) ? route.query.tab : (_a = tabs.value[0]) != null ? _a : "sources";
    });
    const sources = can("job_sources.view") ? ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-job-sources", () => request("admin/job-sources"))), __temp = await __temp, __restore(), __temp) : null;
    const editing = ref(null);
    const creating = ref(false);
    const failing = (s) => s.last_status === "failed" || s.consecutive_failures > 0;
    const srcCols = computed(() => [{ key: "name", label: t("admin.fields.name") }, { key: "driver", label: t("admin.jobs.driver") }, { key: "active", label: t("admin.jobs.active") }, { key: "health", label: t("admin.jobs.health") }, { key: "last_run_at", label: t("admin.jobs.lastRun") }, { key: "actions", label: t("admin.common.actions") }]);
    const sourceList = computed(() => {
      var _a, _b;
      return (_b = (_a = sources == null ? void 0 : sources.data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    function closeForm(reload) {
      editing.value = null;
      creating.value = false;
      if (reload) sources == null ? void 0 : sources.refresh();
    }
    const list = useAdminList({ filterKeys: ["q", "status", "source_id"], defaultSort: "-id", defaultPerPage: 25 });
    const jobs = can("jobs.view") ? ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-jobs", () => request("admin/jobs", { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== "sort")) }), { watch: [list.apiQuery] })), __temp = await __temp, __restore(), __temp) : null;
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = jobs == null ? void 0 : jobs.data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = jobs == null ? void 0 : jobs.data.value) == null ? void 0 : _a.meta;
    });
    const jobFields = computed(() => [
      { key: "q", type: "search", label: t("admin.common.search") },
      { key: "status", type: "select", label: t("admin.fields.status"), options: ["published", "expired", "hidden"].map((v) => ({ value: v, label: t(`admin.jobs.jobStatus.${v}`) })) },
      { key: "source_id", type: "select", label: t("admin.jobs.source"), options: sourceList.value.map((s) => ({ value: String(s.id), label: s.name })) }
    ]);
    const jobCols = computed(() => [{ key: "title", label: t("admin.jobs.jobTitle") }, { key: "company", label: t("admin.jobs.company") }, { key: "status", label: t("admin.fields.status") }, { key: "source", label: t("admin.jobs.source") }, { key: "published_at", label: t("admin.jobs.published") }, { key: "apply_clicks", label: t("admin.jobs.clicks") }, { key: "actions", label: t("admin.common.actions") }]);
    const jobErr = ref("");
    async function setJob(j, status) {
      jobErr.value = "";
      try {
        await request(`admin/jobs/${j.id}`, { method: "PATCH", body: { status } });
        toast.success(t("admin.jobs.jobUpdated"));
        jobs == null ? void 0 : jobs.refresh();
      } catch (e) {
        jobErr.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_AdminPageHeader = _sfc_main$2;
      const _component_UiButton = _sfc_main$3;
      const _component_UiIcon = _sfc_main$5;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$6;
      const _component_AdminDataTable = _sfc_main$7;
      const _component_UiBadge = _sfc_main$8;
      const _component_AdminFilters = _sfc_main$9;
      const _component_UiAlert = _sfc_main$a;
      const _component_UiPagination = _sfc_main$b;
      const _component_AdminDialog = _sfc_main$c;
      const _component_AdminJobSourceForm = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.jobs.title"),
        description: unref(t)("admin.jobs.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.jobs.title") }]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(tab) === "sources" && unref(can)("job_sources.create")) {
              _push2(ssrRenderComponent(_component_UiButton, {
                onClick: ($event) => creating.value = true
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiIcon, {
                      name: "plus",
                      size: 18
                    }, null, _parent3, _scopeId2));
                    _push3(`${ssrInterpolate(unref(t)("admin.jobs.newSource"))}`);
                  } else {
                    return [
                      createVNode(_component_UiIcon, {
                        name: "plus",
                        size: 18
                      }),
                      createTextVNode(toDisplayString(unref(t)("admin.jobs.newSource")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(tab) === "sources" && unref(can)("job_sources.create") ? (openBlock(), createBlock(_component_UiButton, {
                key: 0,
                onClick: ($event) => creating.value = true
              }, {
                default: withCtx(() => [
                  createVNode(_component_UiIcon, {
                    name: "plus",
                    size: 18
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.jobs.newSource")), 1)
                ]),
                _: 1
              }, 8, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div role="tablist"${ssrRenderAttr("aria-label", unref(t)("admin.jobs.title"))} class="mb-4 flex gap-1 border-b border-line"><!--[-->`);
      ssrRenderList(unref(tabs), (x) => {
        _push(`<button type="button" role="tab"${ssrRenderAttr("aria-selected", unref(tab) === x)} class="${ssrRenderClass([unref(tab) === x ? "border-line bg-surface text-primary-strong" : "border-transparent text-ink-soft hover:bg-sunken", "inline-flex min-h-touch items-center rounded-t-md border border-b-0 px-4 font-medium"])}">${ssrInterpolate(unref(t)(`admin.jobs.tab.${x}`))}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(tab) === "sources" && unref(sources)) {
        _push(`<section role="tabpanel">`);
        if (unref(sources).status.value === "pending" && !unref(sources).data.value) {
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent));
        } else if (unref(sources).error.value) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: unref(isApiError)(unref(sources).error.value) ? unref(sources).error.value.message : void 0,
            retry: "",
            onRetry: ($event) => unref(sources).refresh()
          }, null, _parent));
        } else if (!unref(sourceList).length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("admin.jobs.noSources"),
            description: unref(t)("admin.jobs.noSourcesHelp"),
            icon: "briefcase"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent(_component_AdminDataTable, {
            columns: unref(srcCols),
            rows: unref(sourceList),
            "row-key": "id",
            caption: unref(t)("admin.jobs.tab.sources")
          }, {
            "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(row.name)}</span><span class="block text-xs text-muted" dir="ltr"${_scopeId}>${ssrInterpolate(row.key)} \xB7 ${ssrInterpolate((_a2 = row.config_summary.host) != null ? _a2 : "\u2014")}</span>`);
              } else {
                return [
                  createVNode("span", { dir: "auto" }, toDisplayString(row.name), 1),
                  createVNode("span", {
                    class: "block text-xs text-muted",
                    dir: "ltr"
                  }, toDisplayString(row.key) + " \xB7 " + toDisplayString((_b2 = row.config_summary.host) != null ? _b2 : "\u2014"), 1)
                ];
              }
            }),
            "cell-active": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: row.active ? "success" : "neutral"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)(row.active ? "admin.jobs.activeOn" : "admin.jobs.activeOff"))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)(row.active ? "admin.jobs.activeOn" : "admin.jobs.activeOff")), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiBadge, {
                    tone: row.active ? "success" : "neutral"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(row.active ? "admin.jobs.activeOn" : "admin.jobs.activeOff")), 1)
                    ]),
                    _: 2
                  }, 1032, ["tone"])
                ];
              }
            }),
            "cell-health": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (failing(row)) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "danger" }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.jobs.failing", { n: row.consecutive_failures }))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.jobs.failing", { n: row.consecutive_failures })), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else if (row.last_status) {
                  _push2(ssrRenderComponent(_component_UiBadge, { tone: "success" }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.jobs.healthy"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.jobs.healthy")), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<span class="text-muted"${_scopeId}>\u2014</span>`);
                }
              } else {
                return [
                  failing(row) ? (openBlock(), createBlock(_component_UiBadge, {
                    key: 0,
                    tone: "danger"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.jobs.failing", { n: row.consecutive_failures })), 1)
                    ]),
                    _: 2
                  }, 1024)) : row.last_status ? (openBlock(), createBlock(_component_UiBadge, {
                    key: 1,
                    tone: "success"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.jobs.healthy")), 1)
                    ]),
                    _: 1
                  })) : (openBlock(), createBlock("span", {
                    key: 2,
                    class: "text-muted"
                  }, "\u2014"))
                ];
              }
            }),
            "cell-last_run_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.last_run_at ? unref(formatDateTime)(row.last_run_at, unref(locale)) : unref(t)("admin.jobs.never"))}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-sm" }, toDisplayString(row.last_run_at ? unref(formatDateTime)(row.last_run_at, unref(locale)) : unref(t)("admin.jobs.never")), 1)
                ];
              }
            }),
            "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiButton, {
                  variant: "secondary",
                  onClick: ($event) => editing.value = row
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(can)("job_sources.update") ? unref(t)("admin.common.edit") : unref(t)("admin.common.details"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(row.name)}</span>`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(can)("job_sources.update") ? unref(t)("admin.common.edit") : unref(t)("admin.common.details")), 1),
                        createVNode("span", { class: "sr-only" }, toDisplayString(row.name), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => editing.value = row
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(can)("job_sources.update") ? unref(t)("admin.common.edit") : unref(t)("admin.common.details")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(row.name), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`</section>`);
      } else if (unref(tab) === "listings" && unref(jobs)) {
        _push(`<section role="tabpanel">`);
        _push(ssrRenderComponent(_component_AdminFilters, {
          fields: unref(jobFields),
          filters: unref(list).state.value.filters,
          onSet: unref(list).setFilter,
          onClear: unref(list).clear
        }, null, _parent));
        _push(`<div aria-live="polite">`);
        if (unref(jobErr)) {
          _push(ssrRenderComponent(_component_UiAlert, {
            tone: "danger",
            class: "mb-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(jobErr))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(jobErr)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(jobs).status.value === "pending" && !unref(jobs).data.value) {
          _push(ssrRenderComponent(_component_UiSkeleton, { lines: 5 }, null, _parent));
        } else if (unref(jobs).error.value) {
          _push(ssrRenderComponent(_component_UiErrorState, {
            message: unref(isApiError)(unref(jobs).error.value) ? unref(jobs).error.value.message : void 0,
            retry: "",
            onRetry: ($event) => unref(jobs).refresh()
          }, null, _parent));
        } else if (!unref(rows).length) {
          _push(ssrRenderComponent(_component_UiEmptyState, {
            title: unref(t)("admin.common.noResults"),
            description: unref(t)("admin.common.noResultsHelp"),
            icon: "briefcase"
          }, null, _parent));
        } else {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_AdminDataTable, {
            columns: unref(jobCols),
            rows: unref(rows),
            "row-key": "id",
            caption: unref(t)("admin.jobs.tab.listings")
          }, {
            "cell-title": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate(row.title)}</span>`);
              } else {
                return [
                  createVNode("span", { dir: "auto" }, toDisplayString(row.title), 1)
                ];
              }
            }),
            "cell-company": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              var _a2, _b2;
              if (_push2) {
                _push2(`<span dir="auto"${_scopeId}>${ssrInterpolate((_a2 = row.company) != null ? _a2 : "\u2014")}</span>`);
              } else {
                return [
                  createVNode("span", { dir: "auto" }, toDisplayString((_b2 = row.company) != null ? _b2 : "\u2014"), 1)
                ];
              }
            }),
            "cell-status": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiBadge, {
                  tone: row.status === "published" ? "success" : row.status === "hidden" ? "warning" : "neutral"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(unref(t)(`admin.jobs.jobStatus.${row.status}`))}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(unref(t)(`admin.jobs.jobStatus.${row.status}`)), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiBadge, {
                    tone: row.status === "published" ? "success" : row.status === "hidden" ? "warning" : "neutral"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)(`admin.jobs.jobStatus.${row.status}`)), 1)
                    ]),
                    _: 2
                  }, 1032, ["tone"])
                ];
              }
            }),
            "cell-published_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-sm"${_scopeId}>${ssrInterpolate(row.published_at ? unref(formatDateTime)(row.published_at, unref(locale)) : "\u2014")}</span>`);
              } else {
                return [
                  createVNode("span", { class: "text-sm" }, toDisplayString(row.published_at ? unref(formatDateTime)(row.published_at, unref(locale)) : "\u2014"), 1)
                ];
              }
            }),
            "cell-actions": withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (unref(can)("jobs.publish") && row.status === "published") {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => setJob(row, "hidden")
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.jobs.hide"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(row.title)}</span>`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.jobs.hide")), 1),
                          createVNode("span", { class: "sr-only" }, toDisplayString(row.title), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else if (unref(can)("jobs.publish") && row.status === "hidden") {
                  _push2(ssrRenderComponent(_component_UiButton, {
                    variant: "secondary",
                    onClick: ($event) => setJob(row, "published")
                  }, {
                    default: withCtx((_, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(unref(t)("admin.jobs.unhide"))}<span class="sr-only"${_scopeId2}>${ssrInterpolate(row.title)}</span>`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(t)("admin.jobs.unhide")), 1),
                          createVNode("span", { class: "sr-only" }, toDisplayString(row.title), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<span class="text-muted"${_scopeId}>\u2014</span>`);
                }
              } else {
                return [
                  unref(can)("jobs.publish") && row.status === "published" ? (openBlock(), createBlock(_component_UiButton, {
                    key: 0,
                    variant: "secondary",
                    onClick: ($event) => setJob(row, "hidden")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.jobs.hide")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(row.title), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : unref(can)("jobs.publish") && row.status === "hidden" ? (openBlock(), createBlock(_component_UiButton, {
                    key: 1,
                    variant: "secondary",
                    onClick: ($event) => setJob(row, "published")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(t)("admin.jobs.unhide")), 1),
                      createVNode("span", { class: "sr-only" }, toDisplayString(row.title), 1)
                    ]),
                    _: 2
                  }, 1032, ["onClick"])) : (openBlock(), createBlock("span", {
                    key: 2,
                    class: "text-muted"
                  }, "\u2014"))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="mt-4 text-center">`);
          _push(ssrRenderComponent(_component_UiPagination, {
            page: (_b = (_a = unref(meta)) == null ? void 0 : _a.page) != null ? _b : 1,
            "last-page": (_d = (_c = unref(meta)) == null ? void 0 : _c.last_page) != null ? _d : 1,
            onChange: unref(list).setPage
          }, null, _parent));
          _push(`</div><!--]-->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AdminDialog, {
        open: unref(creating) || !!unref(editing),
        variant: "drawer",
        title: unref(creating) ? unref(t)("admin.jobs.newSource") : (_f = (_e = unref(editing)) == null ? void 0 : _e.name) != null ? _f : "",
        onClose: ($event) => closeForm(false)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2;
          if (_push2) {
            if (unref(creating) || unref(editing)) {
              _push2(ssrRenderComponent(_component_AdminJobSourceForm, {
                key: (_b2 = (_a2 = unref(editing)) == null ? void 0 : _a2.id) != null ? _b2 : "new",
                source: unref(editing),
                onSaved: ($event) => closeForm(true)
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(creating) || unref(editing) ? (openBlock(), createBlock(_component_AdminJobSourceForm, {
                key: (_d2 = (_c2 = unref(editing)) == null ? void 0 : _c2.id) != null ? _d2 : "new",
                source: unref(editing),
                onSaved: ($event) => closeForm(true)
              }, null, 8, ["source", "onSaved"])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/jobs/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DtHMj-KH.mjs.map
