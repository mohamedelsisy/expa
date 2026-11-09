import { defineComponent, ref, reactive, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, nextTick, useId, watch, withModifiers, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { e as editState, a as editWarning, u as usePlaces, _ as _sfc_main$d, w as workflowActions, c as canSchedule, b as _sfc_main$1$1, d as describeProblem, f as useRelationOptions, g as classifyTransitionError } from './FreshnessBadge-C3EJLnMu.mjs';
import { u as useI18n, g as useApi, a as useAuthStore, h as formatDateTime, _ as _sfc_main$3$1, d as _sfc_main$5$1, q as localeDir, j as isApiError } from './server.mjs';
import { _ as _sfc_main$j } from './Dialog-D35kg5aY.mjs';
import { _ as _sfc_main$b } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$f } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$9 } from './Alert-D-zfMDy5.mjs';
import { _ as _sfc_main$a } from './Card-BxvVO_-_.mjs';
import { _ as _sfc_main$g } from './Checkbox-PDAPbGXG.mjs';
import { _ as _sfc_main$c } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$h } from './Textarea-C8QsGxT0.mjs';
import { a as COMMON_FIELDS, S as SOURCE_FIELDS, L as LOCALE_CODES, E as ENUMS, P as PLACE_FIELDS } from './modules-CgmwLVRo.mjs';
import { _ as _sfc_main$i } from './Badge-PdKIsny2.mjs';
import { _ as _sfc_main$e } from './ConfirmInline-sG5Cp32P.mjs';
import { u as useToast } from './useToast-BX2bodPv.mjs';
import { u as usePermissions } from './usePermissions-C4HCMWJS.mjs';

const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "ProblemsChecklist",
  __ssrInlineRender: true,
  props: {
    problems: {},
    firstRequiredField: {}
  },
  emits: ["jump"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t, te } = useI18n();
    const views = computed(() => props.problems.map((p) => describeProblem(p, t, {
      fieldLabel: (f) => te(`admin.fields.${f}`) ? t(`admin.fields.${f}`) : f,
      localeLabel: (l) => te(`languages.${l}`) ? t(`languages.${l}`) : l,
      firstRequiredField: props.firstRequiredField
    })));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        role: "alert",
        class: "rounded-md border border-danger bg-danger-soft p-4",
        "data-testid": "problems"
      }, _attrs))}><h3 class="font-bold text-danger">${ssrInterpolate(unref(t)("admin.problems.title"))}</h3><ul class="mt-2 space-y-1"><!--[-->`);
      ssrRenderList(views.value, (v, i) => {
        _push(`<li class="flex flex-wrap items-center gap-x-3 gap-y-1"${ssrRenderAttr("data-code", v.code)}><span aria-hidden="true">\u2717</span><span class="text-ink">${ssrInterpolate(v.message)}</span>`);
        if (v.target.kind !== "none") {
          _push(`<button type="button" class="inline-flex min-h-touch items-center text-sm font-medium text-primary-strong underline underline-offset-4">${ssrInterpolate(unref(t)("admin.problems.goTo"))}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ul></section>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ProblemsChecklist.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "ScheduleDialog",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "submit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const value = ref("");
    const local = ref("");
    watch(() => props.open, (o) => {
      if (o) {
        value.value = "";
        local.value = "";
      }
    });
    function submit() {
      const d = new Date(value.value);
      if (!value.value || Number.isNaN(d.getTime())) {
        local.value = t("admin.workflow.scheduleInvalid");
        return;
      }
      if (d.getTime() <= Date.now()) {
        local.value = t("admin.workflow.schedulePast");
        return;
      }
      local.value = "";
      emit("submit", d.toISOString());
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$j, mergeProps({
        open: __props.open,
        title: unref(t)("admin.workflow.scheduleTitle"),
        onClose: ($event) => emit("close")
      }, _attrs), {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$3$1, {
              variant: "secondary",
              onClick: ($event) => emit("close")
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_sfc_main$3$1, {
              type: "submit",
              loading: __props.busy,
              onClick: submit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(t)("admin.workflow.schedule"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(t)("admin.workflow.schedule")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$3$1, {
                variant: "secondary",
                onClick: ($event) => emit("close")
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_sfc_main$3$1, {
                type: "submit",
                loading: __props.busy,
                onClick: submit
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("admin.workflow.schedule")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form id="schedule-form" class="space-y-3"${_scopeId}><p class="text-ink-soft"${_scopeId}>${ssrInterpolate(unref(t)("admin.workflow.scheduleHelp"))}</p>`);
            _push2(ssrRenderComponent(_sfc_main$b, {
              label: unref(t)("admin.workflow.publishAt"),
              error: local.value || __props.error,
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_sfc_main$f, {
                    modelValue: value.value,
                    "onUpdate:modelValue": ($event) => value.value = $event,
                    type: "datetime-local",
                    ltr: "",
                    "data-autofocus": ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_sfc_main$f, {
                      modelValue: value.value,
                      "onUpdate:modelValue": ($event) => value.value = $event,
                      type: "datetime-local",
                      ltr: "",
                      "data-autofocus": ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                id: "schedule-form",
                class: "space-y-3",
                onSubmit: withModifiers(submit, ["prevent"])
              }, [
                createVNode("p", { class: "text-ink-soft" }, toDisplayString(unref(t)("admin.workflow.scheduleHelp")), 1),
                createVNode(_sfc_main$b, {
                  label: unref(t)("admin.workflow.publishAt"),
                  error: local.value || __props.error,
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$f, {
                      modelValue: value.value,
                      "onUpdate:modelValue": ($event) => value.value = $event,
                      type: "datetime-local",
                      ltr: "",
                      "data-autofocus": ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["label", "error"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ScheduleDialog.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowBar",
  __ssrInlineRender: true,
  props: {
    status: {},
    allowed: {},
    prefix: {},
    can: { type: Function },
    publishAt: {},
    createdByMe: { type: Boolean },
    firstRequiredField: {},
    transition: { type: Function },
    schedule: { type: Function },
    dirty: { type: Boolean }
  },
  emits: ["jump"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t, locale } = useI18n();
    const busy = ref(null);
    const failure = ref(null);
    const scheduleOpen = ref(false);
    const scheduleError = ref("");
    const actions = computed(() => workflowActions({ status: props.status, allowedTransitions: props.allowed, prefix: props.prefix, can: props.can }));
    const showSchedule = computed(() => canSchedule({ status: props.status, prefix: props.prefix, can: props.can }));
    async function run(to) {
      busy.value = to;
      failure.value = null;
      try {
        await props.transition(to);
      } catch (e) {
        failure.value = classifyTransitionError(e, { to, prefix: props.prefix, can: props.can });
      } finally {
        busy.value = null;
      }
    }
    async function doSchedule(iso) {
      busy.value = "schedule";
      scheduleError.value = "";
      try {
        await props.schedule(iso);
        scheduleOpen.value = false;
      } catch (e) {
        const f = classifyTransitionError(e, { to: "published", prefix: props.prefix, can: props.can });
        if (f.kind === "problems") {
          scheduleOpen.value = false;
          failure.value = f;
        } else scheduleError.value = f.message || t("errors.generic");
      } finally {
        busy.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<section${ssrRenderAttrs(mergeProps({
        "aria-label": unref(t)("admin.workflow.title"),
        class: "space-y-3 rounded-lg border border-line bg-surface p-4",
        "data-testid": "workflow-bar"
      }, _attrs))}><div class="flex flex-wrap items-center gap-3"><p class="flex items-center gap-2 font-medium">${ssrInterpolate(unref(t)("admin.workflow.status"))}: `);
      _push(ssrRenderComponent(_sfc_main$1$1, { status: __props.status }, null, _parent));
      _push(`</p>`);
      if (__props.status === "approved" && __props.publishAt) {
        _push(`<p class="text-sm text-ink-soft">${ssrInterpolate(unref(t)("admin.workflow.scheduledFor", { date: unref(formatDateTime)(__props.publishAt, unref(locale)) }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(actions.value, (a) => {
        _push(ssrRenderComponent(_sfc_main$3$1, {
          key: a.to,
          variant: a.tone,
          loading: busy.value === a.to,
          disabled: !!busy.value,
          "data-action": a.to,
          onClick: ($event) => run(a.to)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)(a.labelKey))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)(a.labelKey)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      if (showSchedule.value) {
        _push(ssrRenderComponent(_sfc_main$3$1, {
          variant: "secondary",
          disabled: !!busy.value,
          "data-action": "schedule",
          onClick: ($event) => scheduleOpen.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.workflow.schedule"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.workflow.schedule")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (!actions.value.length && !showSchedule.value) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.workflow.noActions"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.dirty) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.workflow.unsavedFirst"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.createdByMe && __props.status === "review" && __props.can(`${__props.prefix}.review`)) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.workflow.fourEyesHint"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div aria-live="polite">`);
      if (((_a = failure.value) == null ? void 0 : _a.kind) === "problems") {
        _push(ssrRenderComponent(_sfc_main$8, {
          problems: failure.value.problems,
          "first-required-field": __props.firstRequiredField,
          onJump: ($event) => emit("jump", $event)
        }, null, _parent));
      } else if (((_b = failure.value) == null ? void 0 : _b.kind) === "four_eyes") {
        _push(ssrRenderComponent(_sfc_main$9, {
          tone: "warning",
          title: unref(t)("admin.workflow.fourEyesTitle")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.workflow.fourEyes"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.workflow.fourEyes")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (((_c = failure.value) == null ? void 0 : _c.kind) === "forbidden") {
        _push(ssrRenderComponent(_sfc_main$9, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(failure.value.message || unref(t)("admin.common.forbidden"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(failure.value.message || unref(t)("admin.common.forbidden")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (failure.value) {
        _push(ssrRenderComponent(_sfc_main$9, { tone: "danger" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(failure.value.message || unref(t)("errors.generic"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(failure.value.message || unref(t)("errors.generic")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_sfc_main$7, {
        open: scheduleOpen.value,
        busy: busy.value === "schedule",
        error: scheduleError.value,
        onClose: ($event) => scheduleOpen.value = false,
        onSubmit: doSchedule
      }, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/WorkflowBar.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
function allAttrFields(m) {
  return [...COMMON_FIELDS.filter((f) => !(m.hideSlug && f.key === "slug")), ...m.attributes, ...m.place ? PLACE_FIELDS : [], ...m.noSource ? [] : SOURCE_FIELDS];
}
const emptyTr = (f) => f.type === "text" || f.type === "textarea" ? "" : [];
function emptyForm(m) {
  const attrs = {};
  for (const f of allAttrFields(m)) attrs[f.key] = f.type === "multiselect" || f.relation === "offices" ? [] : "";
  const translations = Object.fromEntries(LOCALE_CODES.map((l) => [l, Object.fromEntries(m.translatable.map((f) => [f.key, emptyTr(f)]))]));
  return { attrs, translations };
}
const newBracket = () => ({ up_to: "", rate: "" });
function bracketsFromApi(v) {
  return Array.isArray(v) ? v.map((b) => ({ up_to: (b == null ? void 0 : b.up_to) === null || (b == null ? void 0 : b.up_to) === void 0 ? "" : String(b.up_to), rate: (b == null ? void 0 : b.rate) === null || (b == null ? void 0 : b.rate) === void 0 ? "" : String(b.rate) })) : [];
}
function parseBrackets(json) {
  try {
    const v = JSON.parse(String(json != null ? json : "[]"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
const str = (v) => v === null || v === void 0 ? "" : String(v);
const newBlock = () => ({ key: "", info_type: "general_guidance", sort_order: "0", source_name: "", source_url: "", source_type: "", last_verified_at: "", translations: { ar: { title: "", body: "" }, en: { title: "", body: "" }, it: { title: "", body: "" } } });
function blocksFromApi(v) {
  if (!Array.isArray(v)) return [];
  return v.map((b) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const out = newBlock();
    out.key = str(b.key);
    out.info_type = str(b.info_type) || "general_guidance";
    out.sort_order = str((_a = b.sort_order) != null ? _a : 0);
    out.source_name = str((_b = b.source) == null ? void 0 : _b.name);
    out.source_url = str((_c = b.source) == null ? void 0 : _c.url);
    out.source_type = str((_d = b.source) == null ? void 0 : _d.type);
    out.last_verified_at = str((_e = b.source) == null ? void 0 : _e.last_verified_at).slice(0, 10);
    for (const l of LOCALE_CODES) out.translations[l] = { title: str((_g = (_f = b.translations) == null ? void 0 : _f[l]) == null ? void 0 : _g.title), body: str((_i = (_h = b.translations) == null ? void 0 : _h[l]) == null ? void 0 : _i.body) };
    return out;
  });
}
function parseBlocks(json) {
  try {
    const v = JSON.parse(String(json != null ? json : "[]"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function fromItem(m, item) {
  var _a, _b;
  const s = emptyForm(m);
  const source = (_a = item.source) != null ? _a : {};
  const sourceMap = { source_name: source.name, source_url: source.url, source_type: source.type, last_verified_at: source.last_verified_at };
  for (const f of allAttrFields(m)) {
    const v = f.key in sourceMap ? sourceMap[f.key] : item[f.key];
    if (f.type === "multiselect" || f.relation === "offices") s.attrs[f.key] = Array.isArray(v) ? v.map(String) : [];
    else if (f.type === "bool") s.attrs[f.key] = v === true ? "true" : v === false ? "false" : "";
    else if (f.type === "tags") s.attrs[f.key] = Array.isArray(v) ? v.map(String).join(", ") : "";
    else if (f.type === "json") s.attrs[f.key] = v && typeof v === "object" ? JSON.stringify(v, null, 2) : "";
    else if (f.type === "blocks") s.attrs[f.key] = JSON.stringify(blocksFromApi(v));
    else if (f.type === "brackets") s.attrs[f.key] = JSON.stringify(bracketsFromApi(v));
    else s.attrs[f.key] = str(v);
  }
  const tr = Array.isArray(item.translations) ? {} : (_b = item.translations) != null ? _b : {};
  for (const loc of LOCALE_CODES) {
    const src = tr[loc];
    if (!src) continue;
    for (const f of m.translatable) {
      const v = src[f.key];
      if (f.type === "text" || f.type === "textarea") s.translations[loc][f.key] = str(v);
      else if (f.type === "list") s.translations[loc][f.key] = Array.isArray(v) ? v.map(str) : [];
      else if (f.type === "steps") s.translations[loc][f.key] = Array.isArray(v) ? v.map((x) => ({ title: str(x == null ? void 0 : x.title), text: str(x == null ? void 0 : x.text) })) : [];
      else s.translations[loc][f.key] = Array.isArray(v) ? v.map((x) => {
        var _a2;
        return Object.fromEntries(((_a2 = f.itemFields) != null ? _a2 : []).map((i) => [i.key, str(x == null ? void 0 : x[i.key])]));
      }) : [];
    }
  }
  return s;
}
function parseTranslationErrorKey(key) {
  const m = /^translations\.(ar|en|it)\.([^.]+)/.exec(key);
  return m ? { locale: m[1], field: m[2] } : null;
}
function translationErrors(errors) {
  var _a, _b, _c, _d, _e;
  const out = {};
  for (const [k, v] of Object.entries(errors)) {
    const p = parseTranslationErrorKey(k);
    if (p) (_e = (_c = (_b = out[_a = p.locale]) != null ? _b : out[_a] = {})[_d = p.field]) != null ? _e : _c[_d] = v;
  }
  return out;
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "BlocksEditor",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const blocks = ref(parseBlocks(props.modelValue));
    const loc = ref("ar");
    watch(blocks, (v) => emit("update:modelValue", JSON.stringify(v)), { deep: true });
    watch(() => props.modelValue, (v) => {
      if (String(v) !== JSON.stringify(blocks.value)) blocks.value = parseBlocks(v);
    });
    const keyOptions = computed(() => ENUMS.cityBlockKey.map((v) => ({ value: v, label: t(`admin.enums.cityBlockKey.${v}`) })));
    const infoOptions = computed(() => ENUMS.infoType.map((v) => ({ value: v, label: t(`admin.enums.infoType.${v}`) })));
    const srcOptions = computed(() => ENUMS.sourceType.map((v) => ({ value: v, label: t(`admin.enums.sourceType.${v}`) })));
    const locOptions = computed(() => LOCALE_CODES.map((l) => ({ value: l, label: t(`languages.${l}`) })));
    const add = () => {
      if (blocks.value.length < 12) blocks.value.push(newBlock());
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiFormField = _sfc_main$b;
      const _component_UiSelect = _sfc_main$c;
      const _component_UiTextInput = _sfc_main$f;
      const _component_UiTextarea = _sfc_main$h;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiFormField, {
        label: unref(t)("admin.blocks.editLocale"),
        class: "max-w-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiSelect, {
              modelValue: unref(loc),
              "onUpdate:modelValue": ($event) => isRef(loc) ? loc.value = $event : null,
              options: unref(locOptions)
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiSelect, {
                modelValue: unref(loc),
                "onUpdate:modelValue": ($event) => isRef(loc) ? loc.value = $event : null,
                options: unref(locOptions)
              }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!unref(blocks).length) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.blocks.none"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(blocks), (b, i) => {
        _push(`<fieldset class="space-y-3 rounded-md border border-line p-3"><legend class="px-2 font-semibold">${ssrInterpolate(unref(t)("admin.blocks.block", { n: i + 1 }))}</legend><div class="grid gap-3 sm:grid-cols-3">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.blocks.key"),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: b.key,
                "onUpdate:modelValue": ($event) => b.key = $event,
                options: unref(keyOptions),
                placeholder: unref(t)("admin.common.choose"),
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: b.key,
                  "onUpdate:modelValue": ($event) => b.key = $event,
                  options: unref(keyOptions),
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.blocks.infoType")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: b.info_type,
                "onUpdate:modelValue": ($event) => b.info_type = $event,
                options: unref(infoOptions),
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: b.info_type,
                  "onUpdate:modelValue": ($event) => b.info_type = $event,
                  options: unref(infoOptions),
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.sort_order")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: b.sort_order,
                "onUpdate:modelValue": ($event) => b.sort_order = $event,
                type: "number",
                ltr: "",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: b.sort_order,
                  "onUpdate:modelValue": ($event) => b.sort_order = $event,
                  type: "number",
                  ltr: "",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.blocks.title"),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: b.translations[unref(loc)].title,
                "onUpdate:modelValue": ($event) => b.translations[unref(loc)].title = $event,
                maxlength: 200,
                dir: unref(loc) === "ar" ? "rtl" : "ltr",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: b.translations[unref(loc)].title,
                  "onUpdate:modelValue": ($event) => b.translations[unref(loc)].title = $event,
                  maxlength: 200,
                  dir: unref(loc) === "ar" ? "rtl" : "ltr",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.blocks.body"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextarea, {
                modelValue: b.translations[unref(loc)].body,
                "onUpdate:modelValue": ($event) => b.translations[unref(loc)].body = $event,
                rows: 5,
                maxlength: 2e4,
                dir: unref(loc) === "ar" ? "rtl" : "ltr",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextarea, {
                  modelValue: b.translations[unref(loc)].body,
                  "onUpdate:modelValue": ($event) => b.translations[unref(loc)].body = $event,
                  rows: 5,
                  maxlength: 2e4,
                  dir: unref(loc) === "ar" ? "rtl" : "ltr",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "dir", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<p class="text-sm text-muted">${ssrInterpolate(b.info_type === "official_info" ? unref(t)("admin.blocks.officialNote") : unref(t)("admin.blocks.generalNote"))}</p><div class="grid gap-3 sm:grid-cols-2">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.source_name"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: b.source_name,
                "onUpdate:modelValue": ($event) => b.source_name = $event,
                maxlength: 255,
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: b.source_name,
                  "onUpdate:modelValue": ($event) => b.source_name = $event,
                  maxlength: 255,
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.source_url"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: b.source_url,
                "onUpdate:modelValue": ($event) => b.source_url = $event,
                type: "url",
                ltr: "",
                maxlength: 2048,
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: b.source_url,
                  "onUpdate:modelValue": ($event) => b.source_url = $event,
                  type: "url",
                  ltr: "",
                  maxlength: 2048,
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.source_type"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiSelect, {
                modelValue: b.source_type,
                "onUpdate:modelValue": ($event) => b.source_type = $event,
                options: unref(srcOptions),
                placeholder: unref(t)("admin.common.choose"),
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiSelect, {
                  modelValue: b.source_type,
                  "onUpdate:modelValue": ($event) => b.source_type = $event,
                  options: unref(srcOptions),
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "placeholder", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.fields.last_verified_at"),
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: b.last_verified_at,
                "onUpdate:modelValue": ($event) => b.last_verified_at = $event,
                type: "date",
                ltr: "",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: b.last_verified_at,
                  "onUpdate:modelValue": ($event) => b.last_verified_at = $event,
                  type: "date",
                  ltr: "",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div>`);
        if (!__props.disabled) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            onClick: ($event) => unref(blocks).splice(i, 1)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "trash",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("admin.blocks.remove"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "trash",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.blocks.remove")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</fieldset>`);
      });
      _push(`<!--]-->`);
      if (!__props.disabled && unref(blocks).length < 12) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          onClick: add
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "plus",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("admin.blocks.add"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "plus",
                  size: 16
                }),
                createTextVNode(toDisplayString(unref(t)("admin.blocks.add")), 1)
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
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/BlocksEditor.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BracketsEditor",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const rows = ref(parseBrackets(props.modelValue));
    watch(rows, (v) => emit("update:modelValue", JSON.stringify(v)), { deep: true });
    watch(() => props.modelValue, (v) => {
      if (String(v) !== JSON.stringify(rows.value)) rows.value = parseBrackets(v);
    });
    const add = () => {
      if (rows.value.length < 20) rows.value.push(newBracket());
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiFormField = _sfc_main$b;
      const _component_UiTextInput = _sfc_main$f;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "data-testid": "brackets-editor"
      }, _attrs))}>`);
      if (!unref(rows).length) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.brackets.none"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<ol class="space-y-3"><!--[-->`);
      ssrRenderList(unref(rows), (r, i) => {
        _push(`<li class="grid items-end gap-3 rounded-md border border-line p-3 sm:grid-cols-[1fr_1fr_auto]">`);
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.brackets.upTo", { n: i + 1 }),
          hint: i === unref(rows).length - 1 ? unref(t)("admin.brackets.lastHint") : void 0,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: r.up_to,
                "onUpdate:modelValue": ($event) => r.up_to = $event,
                type: "number",
                inputmode: "decimal",
                ltr: "",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: r.up_to,
                  "onUpdate:modelValue": ($event) => r.up_to = $event,
                  type: "number",
                  inputmode: "decimal",
                  ltr: "",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_UiFormField, {
          label: unref(t)("admin.brackets.rate", { n: i + 1 }),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiTextInput, {
                modelValue: r.rate,
                "onUpdate:modelValue": ($event) => r.rate = $event,
                type: "number",
                inputmode: "decimal",
                ltr: "",
                disabled: __props.disabled
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiTextInput, {
                  modelValue: r.rate,
                  "onUpdate:modelValue": ($event) => r.rate = $event,
                  type: "number",
                  inputmode: "decimal",
                  ltr: "",
                  disabled: __props.disabled
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"])
              ];
            }
          }),
          _: 2
        }, _parent));
        if (!__props.disabled) {
          _push(ssrRenderComponent(_component_UiButton, {
            variant: "ghost",
            "aria-label": unref(t)("admin.brackets.remove", { n: i + 1 }),
            onClick: ($event) => unref(rows).splice(i, 1)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiIcon, {
                  name: "trash",
                  size: 16
                }, null, _parent2, _scopeId));
                _push2(`${ssrInterpolate(unref(t)("admin.blocks.remove"))}`);
              } else {
                return [
                  createVNode(_component_UiIcon, {
                    name: "trash",
                    size: 16
                  }),
                  createTextVNode(toDisplayString(unref(t)("admin.blocks.remove")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ol>`);
      if (!__props.disabled && unref(rows).length < 20) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          onClick: add
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "plus",
                size: 16
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("admin.brackets.add"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "plus",
                  size: 16
                }),
                createTextVNode(toDisplayString(unref(t)("admin.brackets.add")), 1)
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
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/BracketsEditor.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AttrField",
  __ssrInlineRender: true,
  props: {
    field: {},
    modelValue: {},
    error: {},
    disabled: { type: Boolean },
    today: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t, te } = useI18n();
    const label = computed(() => t(`admin.fields.${props.field.key}`));
    const hint = computed(() => props.field.help ? t(`admin.help.${props.field.key}`) : void 0);
    const enumOptions = computed(() => props.field.enum ? ENUMS[props.field.enum].map((v) => ({ value: v, label: te(`admin.enums.${props.field.enum}.${v}`) ? t(`admin.enums.${props.field.enum}.${v}`) : v })) : []);
    const boolOptions = computed(() => [{ value: "true", label: t("admin.common.true") }, { value: "false", label: t("admin.common.false") }]);
    const rel = props.field.relation ? useRelationOptions(props.field.relation) : null;
    const q = ref("");
    const shownOffices = computed(() => {
      var _a;
      return ((_a = rel == null ? void 0 : rel.options.value) != null ? _a : []).filter((o) => !q.value || o.label.toLowerCase().includes(q.value.toLowerCase()));
    });
    const arr = computed(() => Array.isArray(props.modelValue) ? props.modelValue : []);
    const str2 = computed(() => Array.isArray(props.modelValue) ? "" : props.modelValue);
    const toggle = (v, on) => emit("update:modelValue", on ? [...arr.value, v] : arr.value.filter((x) => x !== v));
    const inputType = computed(() => {
      var _a;
      return (_a = { number: "number", date: "date", url: "url", email: "email" }[props.field.type]) != null ? _a : "text";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiFormField = _sfc_main$b;
      const _component_UiTextInput = _sfc_main$f;
      const _component_UiCheckbox = _sfc_main$g;
      const _component_AdminBlocksEditor = _sfc_main$5;
      const _component_AdminBracketsEditor = _sfc_main$4;
      const _component_UiSelect = _sfc_main$c;
      const _component_UiTextarea = _sfc_main$h;
      _push(`<div${ssrRenderAttrs(mergeProps({
        "data-admin-field": __props.field.key
      }, _attrs))}>`);
      if (__props.field.type === "multiselect" || __props.field.relation === "offices") {
        _push(ssrRenderComponent(_component_UiFormField, {
          group: "",
          label: label.value,
          hint: hint.value,
          error: __props.error,
          optional: !__props.field.required
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b, _c, _d;
            if (_push2) {
              if (__props.field.relation === "offices") {
                _push2(`<!--[-->`);
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  modelValue: q.value,
                  "onUpdate:modelValue": ($event) => q.value = $event,
                  type: "search",
                  placeholder: unref(t)("admin.common.filterList"),
                  class: "mb-2"
                }, null, _parent2, _scopeId));
                if ((_a = unref(rel)) == null ? void 0 : _a.pending.value) {
                  _push2(`<p class="text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("common.loading"))}</p>`);
                } else if ((_b = unref(rel)) == null ? void 0 : _b.failed.value) {
                  _push2(`<p class="text-sm text-danger" role="alert"${_scopeId}>${ssrInterpolate(unref(t)("admin.common.relationFailed"))}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="max-h-56 overflow-y-auto rounded-md border border-line p-2"${_scopeId}><!--[-->`);
                ssrRenderList(shownOffices.value, (o) => {
                  _push2(ssrRenderComponent(_component_UiCheckbox, {
                    key: o.value,
                    "model-value": arr.value.includes(o.value),
                    label: o.label,
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => toggle(o.value, $event)
                  }, null, _parent2, _scopeId));
                });
                _push2(`<!--]--></div><p class="mt-1 text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.common.selectedCount", { count: arr.value.length }))}</p><!--]-->`);
              } else {
                _push2(`<div class="flex flex-wrap gap-x-4"${_scopeId}><!--[-->`);
                ssrRenderList(enumOptions.value, (o) => {
                  _push2(ssrRenderComponent(_component_UiCheckbox, {
                    key: o.value,
                    "model-value": arr.value.includes(o.value),
                    label: o.label,
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => toggle(o.value, $event)
                  }, null, _parent2, _scopeId));
                });
                _push2(`<!--]--></div>`);
              }
            } else {
              return [
                __props.field.relation === "offices" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createVNode(_component_UiTextInput, {
                    modelValue: q.value,
                    "onUpdate:modelValue": ($event) => q.value = $event,
                    type: "search",
                    placeholder: unref(t)("admin.common.filterList"),
                    class: "mb-2"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"]),
                  ((_c = unref(rel)) == null ? void 0 : _c.pending.value) ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-muted"
                  }, toDisplayString(unref(t)("common.loading")), 1)) : ((_d = unref(rel)) == null ? void 0 : _d.failed.value) ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-sm text-danger",
                    role: "alert"
                  }, toDisplayString(unref(t)("admin.common.relationFailed")), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "max-h-56 overflow-y-auto rounded-md border border-line p-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(shownOffices.value, (o) => {
                      return openBlock(), createBlock(_component_UiCheckbox, {
                        key: o.value,
                        "model-value": arr.value.includes(o.value),
                        label: o.label,
                        disabled: __props.disabled,
                        "onUpdate:modelValue": ($event) => toggle(o.value, $event)
                      }, null, 8, ["model-value", "label", "disabled", "onUpdate:modelValue"]);
                    }), 128))
                  ]),
                  createVNode("p", { class: "mt-1 text-xs text-muted" }, toDisplayString(unref(t)("admin.common.selectedCount", { count: arr.value.length })), 1)
                ], 64)) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "flex flex-wrap gap-x-4"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(enumOptions.value, (o) => {
                    return openBlock(), createBlock(_component_UiCheckbox, {
                      key: o.value,
                      "model-value": arr.value.includes(o.value),
                      label: o.label,
                      disabled: __props.disabled,
                      "onUpdate:modelValue": ($event) => toggle(o.value, $event)
                    }, null, 8, ["model-value", "label", "disabled", "onUpdate:modelValue"]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.field.type === "blocks") {
        _push(ssrRenderComponent(_component_UiFormField, {
          group: "",
          label: label.value,
          hint: hint.value,
          error: __props.error,
          optional: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminBlocksEditor, {
                "model-value": str2.value,
                disabled: __props.disabled,
                "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminBlocksEditor, {
                  "model-value": str2.value,
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (__props.field.type === "brackets") {
        _push(ssrRenderComponent(_component_UiFormField, {
          group: "",
          label: label.value,
          hint: hint.value,
          error: __props.error,
          optional: !__props.field.required
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminBracketsEditor, {
                "model-value": str2.value,
                disabled: __props.disabled,
                "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminBracketsEditor, {
                  "model-value": str2.value,
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_UiFormField, {
          label: label.value,
          hint: hint.value,
          error: __props.error,
          required: __props.field.required,
          optional: !__props.field.required
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              if (__props.field.type === "select") {
                _push2(ssrRenderComponent(_component_UiSelect, {
                  "model-value": str2.value,
                  options: enumOptions.value,
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, _parent2, _scopeId));
              } else if (__props.field.type === "bool") {
                _push2(ssrRenderComponent(_component_UiSelect, {
                  "model-value": str2.value,
                  options: boolOptions.value,
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, _parent2, _scopeId));
              } else if (__props.field.type === "relation") {
                _push2(`<!--[-->`);
                if (unref(rel) && !unref(rel).failed.value) {
                  _push2(ssrRenderComponent(_component_UiSelect, {
                    "model-value": str2.value,
                    options: unref(rel).options.value,
                    placeholder: unref(rel).pending.value ? unref(t)("common.loading") : unref(t)("admin.common.choose"),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!--[-->`);
                  _push2(ssrRenderComponent(_component_UiTextInput, {
                    "model-value": str2.value,
                    type: "number",
                    inputmode: "numeric",
                    ltr: "",
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                  }, null, _parent2, _scopeId));
                  _push2(`<p class="mt-1 text-xs text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.common.relationFailed"))}</p><!--]-->`);
                }
                _push2(`<!--]-->`);
              } else if (__props.field.type === "textarea" || __props.field.type === "json") {
                _push2(ssrRenderComponent(_component_UiTextarea, {
                  "model-value": str2.value,
                  rows: __props.field.type === "json" ? 8 : (_a = __props.field.rows) != null ? _a : 3,
                  maxlength: __props.field.maxLength,
                  ltr: __props.field.type === "json" || __props.field.ltr,
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  "model-value": str2.value,
                  type: inputType.value,
                  inputmode: __props.field.type === "number" ? "numeric" : void 0,
                  maxlength: __props.field.maxLength,
                  ltr: __props.field.ltr || ["number", "date", "url", "email"].includes(__props.field.type),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, _parent2, _scopeId));
              }
            } else {
              return [
                __props.field.type === "select" ? (openBlock(), createBlock(_component_UiSelect, {
                  key: 0,
                  "model-value": str2.value,
                  options: enumOptions.value,
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "options", "placeholder", "disabled", "onUpdate:modelValue"])) : __props.field.type === "bool" ? (openBlock(), createBlock(_component_UiSelect, {
                  key: 1,
                  "model-value": str2.value,
                  options: boolOptions.value,
                  placeholder: unref(t)("admin.common.choose"),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "options", "placeholder", "disabled", "onUpdate:modelValue"])) : __props.field.type === "relation" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                  unref(rel) && !unref(rel).failed.value ? (openBlock(), createBlock(_component_UiSelect, {
                    key: 0,
                    "model-value": str2.value,
                    options: unref(rel).options.value,
                    placeholder: unref(rel).pending.value ? unref(t)("common.loading") : unref(t)("admin.common.choose"),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                  }, null, 8, ["model-value", "options", "placeholder", "disabled", "onUpdate:modelValue"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                    createVNode(_component_UiTextInput, {
                      "model-value": str2.value,
                      type: "number",
                      inputmode: "numeric",
                      ltr: "",
                      disabled: __props.disabled,
                      "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                    }, null, 8, ["model-value", "disabled", "onUpdate:modelValue"]),
                    createVNode("p", { class: "mt-1 text-xs text-muted" }, toDisplayString(unref(t)("admin.common.relationFailed")), 1)
                  ], 64))
                ], 64)) : __props.field.type === "textarea" || __props.field.type === "json" ? (openBlock(), createBlock(_component_UiTextarea, {
                  key: 3,
                  "model-value": str2.value,
                  rows: __props.field.type === "json" ? 8 : (_b = __props.field.rows) != null ? _b : 3,
                  maxlength: __props.field.maxLength,
                  ltr: __props.field.type === "json" || __props.field.ltr,
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "rows", "maxlength", "ltr", "disabled", "onUpdate:modelValue"])) : (openBlock(), createBlock(_component_UiTextInput, {
                  key: 4,
                  "model-value": str2.value,
                  type: inputType.value,
                  inputmode: __props.field.type === "number" ? "numeric" : void 0,
                  maxlength: __props.field.maxLength,
                  ltr: __props.field.ltr || ["number", "date", "url", "email"].includes(__props.field.type),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => emit("update:modelValue", $event)
                }, null, 8, ["model-value", "type", "inputmode", "maxlength", "ltr", "disabled", "onUpdate:modelValue"]))
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
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AttrField.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ListEditor",
  __ssrInlineRender: true,
  props: {
    field: {},
    modelValue: {},
    locale: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const dir = localeDir(props.locale);
    const full = () => props.field.maxItems !== void 0 && props.modelValue.length >= props.field.maxItems;
    const set = (v) => emit("update:modelValue", v);
    const setKey = (i, key, v) => set(props.modelValue.map((r, x) => x === i ? { ...r, [key]: v } : r));
    const setStr = (i, v) => set(props.modelValue.map((r, x) => x === i ? v : r));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "space-y-3",
        "data-list": __props.field.key
      }, _attrs))}>`);
      if (!__props.modelValue.length) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.editor.emptyList"))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<ol class="space-y-3"><!--[-->`);
      ssrRenderList(__props.modelValue, (row, i) => {
        _push(`<li class="rounded-md border border-line bg-canvas p-3"><div class="mb-2 flex items-center justify-between gap-2"><span class="text-sm font-semibold text-ink-soft">${ssrInterpolate(unref(t)("admin.editor.entry", { n: i + 1 }))}</span><span class="flex"><button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md hover:bg-sunken disabled:opacity-40"${ssrIncludeBooleanAttr(__props.disabled || i === 0) ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(t)("admin.editor.moveUp", { n: i + 1 }))}>`);
        _push(ssrRenderComponent(_sfc_main$5$1, {
          name: "chevron-down",
          class: "rotate-180"
        }, null, _parent));
        _push(`</button><button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md hover:bg-sunken disabled:opacity-40"${ssrIncludeBooleanAttr(__props.disabled || i === __props.modelValue.length - 1) ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(t)("admin.editor.moveDown", { n: i + 1 }))}>`);
        _push(ssrRenderComponent(_sfc_main$5$1, { name: "chevron-down" }, null, _parent));
        _push(`</button><button type="button" class="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-danger hover:bg-danger-soft disabled:opacity-40"${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrRenderAttr("aria-label", unref(t)("admin.editor.remove", { n: i + 1 }))}>`);
        _push(ssrRenderComponent(_sfc_main$5$1, { name: "trash" }, null, _parent));
        _push(`</button></span></div>`);
        if (__props.field.type === "list") {
          _push(ssrRenderComponent(_sfc_main$b, {
            label: unref(t)("admin.editor.entry", { n: i + 1 })
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$f, {
                  "model-value": row,
                  maxlength: __props.field.max,
                  dir: unref(dir),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => setStr(i, $event)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$f, {
                    "model-value": row,
                    maxlength: __props.field.max,
                    dir: unref(dir),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setStr(i, $event)
                  }, null, 8, ["model-value", "maxlength", "dir", "disabled", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
        } else if (__props.field.type === "steps") {
          _push(`<div class="space-y-2">`);
          _push(ssrRenderComponent(_sfc_main$b, {
            label: unref(t)("admin.fields.step_title")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$f, {
                  "model-value": (_a = row.title) != null ? _a : "",
                  maxlength: __props.field.titleMax,
                  dir: unref(dir),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => setKey(i, "title", $event)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$f, {
                    "model-value": (_b = row.title) != null ? _b : "",
                    maxlength: __props.field.titleMax,
                    dir: unref(dir),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setKey(i, "title", $event)
                  }, null, 8, ["model-value", "maxlength", "dir", "disabled", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_sfc_main$b, {
            label: unref(t)("admin.fields.step_text")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$h, {
                  "model-value": (_a = row.text) != null ? _a : "",
                  rows: 2,
                  maxlength: __props.field.max,
                  dir: unref(dir),
                  disabled: __props.disabled,
                  "onUpdate:modelValue": ($event) => setKey(i, "text", $event)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$h, {
                    "model-value": (_b = row.text) != null ? _b : "",
                    rows: 2,
                    maxlength: __props.field.max,
                    dir: unref(dir),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setKey(i, "text", $event)
                  }, null, 8, ["model-value", "maxlength", "dir", "disabled", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="grid gap-2 sm:grid-cols-2"><!--[-->`);
          ssrRenderList(__props.field.itemFields, (f) => {
            _push(ssrRenderComponent(_sfc_main$b, {
              key: f.key,
              label: unref(t)(`admin.fields.item_${f.key}`),
              required: f.required
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a, _b;
                if (_push2) {
                  _push2(ssrRenderComponent(_sfc_main$f, {
                    "model-value": (_a = row[f.key]) != null ? _a : "",
                    maxlength: f.max,
                    dir: f.italian ? "ltr" : unref(dir),
                    lang: f.italian ? "it" : void 0,
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setKey(i, f.key, $event)
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_sfc_main$f, {
                      "model-value": (_b = row[f.key]) != null ? _b : "",
                      maxlength: f.max,
                      dir: f.italian ? "ltr" : unref(dir),
                      lang: f.italian ? "it" : void 0,
                      disabled: __props.disabled,
                      "onUpdate:modelValue": ($event) => setKey(i, f.key, $event)
                    }, null, 8, ["model-value", "maxlength", "dir", "lang", "disabled", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ol><button type="button" class="inline-flex min-h-touch items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-medium hover:bg-sunken disabled:opacity-50"${ssrIncludeBooleanAttr(__props.disabled || full()) ? " disabled" : ""}>`);
      _push(ssrRenderComponent(_sfc_main$5$1, {
        name: "plus",
        size: 18
      }, null, _parent));
      _push(`${ssrInterpolate(unref(t)("admin.editor.add"))}</button>`);
      if (__props.field.maxItems) {
        _push(`<p class="text-xs text-muted">${ssrInterpolate(unref(t)("admin.editor.maxItems", { count: __props.modelValue.length, max: __props.field.maxItems }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ListEditor.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TranslationEditor",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    fields: {},
    primary: {},
    requiredLocales: {},
    missingLocales: {},
    errors: {},
    disabled: { type: Boolean },
    active: {}
  },
  emits: ["update:modelValue", "update:active"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const uid = useId();
    const tabId = (l) => `${uid}-tab-${l}`;
    const panelId = (l) => `${uid}-panel-${l}`;
    const typed = (l) => {
      var _a;
      const v = (_a = props.modelValue[l]) == null ? void 0 : _a[props.primary];
      return typeof v === "string" && v.trim() !== "";
    };
    const isMissing = (l) => props.missingLocales.includes(l) && !typed(l);
    const hasError = (l) => {
      var _a;
      return !!((_a = props.errors) == null ? void 0 : _a[l]) && Object.keys(props.errors[l]).length > 0;
    };
    function setField(l, key, v) {
      emit("update:modelValue", { ...props.modelValue, [l]: { ...props.modelValue[l], [key]: v } });
    }
    ref({});
    const len = (v) => typeof v === "string" ? v.length : 0;
    const near = (v, max) => len(v) >= max * 0.9;
    const tabs = computed(() => LOCALE_CODES.map((l) => ({ l, missing: isMissing(l), required: props.requiredLocales.includes(l), error: hasError(l) })));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ "data-testid": "translation-editor" }, _attrs))}><div role="tablist"${ssrRenderAttr("aria-label", unref(t)("admin.translation.tabs"))} class="flex flex-wrap gap-1 border-b border-line"><!--[-->`);
      ssrRenderList(tabs.value, (x) => {
        _push(`<button${ssrRenderAttr("id", tabId(x.l))} type="button" role="tab"${ssrRenderAttr("data-locale", x.l)}${ssrRenderAttr("aria-selected", __props.active === x.l)}${ssrRenderAttr("aria-controls", panelId(x.l))}${ssrRenderAttr("tabindex", __props.active === x.l ? 0 : -1)} class="${ssrRenderClass([__props.active === x.l ? "border-line bg-surface text-primary-strong" : "border-transparent text-ink-soft hover:bg-sunken", "inline-flex min-h-touch flex-wrap items-center gap-x-2 gap-y-1 rounded-t-md border border-b-0 px-3 py-1 font-medium"])}"><span>${ssrInterpolate(unref(t)(`languages.${x.l}`))}</span>`);
        if (x.required) {
          _push(ssrRenderComponent(_sfc_main$i, {
            tone: "accent",
            "data-testid": "required-marker"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("admin.translation.requiredToPublish"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("admin.translation.requiredToPublish")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (x.missing) {
          _push(ssrRenderComponent(_sfc_main$i, {
            tone: "warning",
            "data-testid": "missing-marker"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("admin.translation.missing"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("admin.translation.missing")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (x.error) {
          _push(ssrRenderComponent(_sfc_main$i, { tone: "danger" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("admin.translation.hasErrors"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("admin.translation.hasErrors")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList(unref(LOCALE_CODES), (l) => {
        _push(`<div${ssrRenderAttr("id", panelId(l))} role="tabpanel"${ssrRenderAttr("aria-labelledby", tabId(l))}${ssrRenderAttr("dir", unref(localeDir)(l))}${ssrRenderAttr("lang", l)}${ssrRenderAttr("data-locale-panel", l)} class="space-y-4 rounded-b-md border border-line bg-surface p-4" style="${ssrRenderStyle(__props.active === l ? null : { display: "none" })}"><p class="text-sm text-muted" dir="auto">${ssrInterpolate(unref(t)("admin.translation.plainTextHint"))}</p><!--[-->`);
        ssrRenderList(__props.fields, (f) => {
          var _a, _b;
          _push(`<div${ssrRenderAttr("data-admin-field", `tr:${l}:${f.key}`)}>`);
          _push(ssrRenderComponent(_sfc_main$b, {
            label: unref(t)(`admin.fields.${f.key}`),
            error: (_b = (_a = __props.errors) == null ? void 0 : _a[l]) == null ? void 0 : _b[f.key],
            required: f.key === __props.primary && __props.requiredLocales.includes(l),
            optional: f.key !== __props.primary && !f.requiredToPublish,
            hint: f.requiredToPublish && __props.requiredLocales.includes(l) ? unref(t)("admin.translation.fieldRequiredToPublish") : void 0
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2, _c, _d, _e, _f, _g, _h;
              if (_push2) {
                if (f.type === "text") {
                  _push2(ssrRenderComponent(_sfc_main$f, {
                    "model-value": (_a2 = __props.modelValue[l][f.key]) != null ? _a2 : "",
                    maxlength: f.max,
                    dir: unref(localeDir)(l),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, _parent2, _scopeId));
                } else if (f.type === "textarea") {
                  _push2(ssrRenderComponent(_sfc_main$h, {
                    "model-value": (_b2 = __props.modelValue[l][f.key]) != null ? _b2 : "",
                    rows: (_c = f.rows) != null ? _c : 4,
                    maxlength: f.max,
                    dir: unref(localeDir)(l),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(ssrRenderComponent(_sfc_main$2, {
                    field: f,
                    locale: l,
                    "model-value": (_d = __props.modelValue[l][f.key]) != null ? _d : [],
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, _parent2, _scopeId));
                }
              } else {
                return [
                  f.type === "text" ? (openBlock(), createBlock(_sfc_main$f, {
                    key: 0,
                    "model-value": (_e = __props.modelValue[l][f.key]) != null ? _e : "",
                    maxlength: f.max,
                    dir: unref(localeDir)(l),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, 8, ["model-value", "maxlength", "dir", "disabled", "onUpdate:modelValue"])) : f.type === "textarea" ? (openBlock(), createBlock(_sfc_main$h, {
                    key: 1,
                    "model-value": (_f = __props.modelValue[l][f.key]) != null ? _f : "",
                    rows: (_g = f.rows) != null ? _g : 4,
                    maxlength: f.max,
                    dir: unref(localeDir)(l),
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, 8, ["model-value", "rows", "maxlength", "dir", "disabled", "onUpdate:modelValue"])) : (openBlock(), createBlock(_sfc_main$2, {
                    key: 2,
                    field: f,
                    locale: l,
                    "model-value": (_h = __props.modelValue[l][f.key]) != null ? _h : [],
                    disabled: __props.disabled,
                    "onUpdate:modelValue": ($event) => setField(l, f.key, $event)
                  }, null, 8, ["field", "locale", "model-value", "disabled", "onUpdate:modelValue"]))
                ];
              }
            }),
            _: 2
          }, _parent));
          if (f.type === "text" || f.type === "textarea") {
            _push(`<p class="${ssrRenderClass([near(__props.modelValue[l][f.key], f.max) ? "text-warning font-semibold" : "text-muted", "mt-1 text-end text-xs tabular-nums"])}"${ssrRenderAttr("data-counter", `${l}:${f.key}`)} dir="ltr">${ssrInterpolate(len(__props.modelValue[l][f.key]))}/${ssrInterpolate(f.max)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/TranslationEditor.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ContentForm",
  __ssrInlineRender: true,
  props: {
    module: {},
    initial: {}
  },
  emits: ["saved", "deleted"],
  setup(__props, { emit: __emit }) {
    var _a;
    const props = __props;
    const emit = __emit;
    const { t, locale } = useI18n();
    const { request } = useApi();
    const toast = useToast();
    const auth = useAuthStore();
    const { can } = usePermissions();
    const m = props.module;
    const item = ref(props.initial);
    const form = reactive(item.value ? fromItem(m, item.value) : emptyForm(m));
    const baseline = ref(JSON.stringify(form));
    const dirty = computed(() => JSON.stringify(form) !== baseline.value);
    const errors = ref({});
    const formError = ref("");
    const problems = ref([]);
    const saving = ref(false);
    const confirmDelete = ref(false);
    const active = ref("ar");
    const creating = computed(() => !item.value);
    const status = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = item.value) == null ? void 0 : _a2.status) != null ? _b : "draft";
    });
    const state = computed(() => creating.value ? can(`${m.permission}.create`) ? "editable" : "readonly" : editState(status.value, m.permission, can));
    const disabled = computed(() => state.value !== "editable" || saving.value);
    const warning = computed(() => creating.value ? null : editWarning(status.value, can(`${m.permission}.publish`)));
    const trErrors = computed(() => translationErrors(errors.value));
    const firstRequired = (_a = m.translatable.find((f) => f.requiredToPublish)) == null ? void 0 : _a.key;
    const label = (k) => t(`admin.fields.${k}`);
    const msg = (k) => k.startsWith("admin.") ? t(k) : k;
    const attrError = (k) => {
      const v = errors.value[k];
      return v ? msg(v) : void 0;
    };
    const { regions, cities } = usePlaces();
    const cityOptions = computed(() => cities.value.filter((c) => !form.attrs.region_id || String(c.region.id) === form.attrs.region_id).map((c) => ({ value: String(c.id), label: c.name })));
    const regionOptions = computed(() => regions.value.map((r) => ({ value: String(r.id), label: r.name })));
    function setRegion(v) {
      form.attrs.region_id = v;
      const c = cities.value.find((x) => String(x.id) === form.attrs.city_id);
      if (c && v && String(c.region.id) !== v) form.attrs.city_id = "";
    }
    function setCity(v) {
      form.attrs.city_id = v;
      const c = cities.value.find((x) => String(x.id) === v);
      if (c) form.attrs.region_id = String(c.region.id);
    }
    function replaceFrom(next) {
      item.value = next;
      Object.assign(form, fromItem(m, next));
      baseline.value = JSON.stringify(form);
    }
    function jump(target) {
      var _a2;
      if (target.kind === "none") return;
      let sel;
      if (target.kind === "translation") {
        active.value = target.locale;
        sel = `[data-admin-field="tr:${target.locale}:${(_a2 = target.field) != null ? _a2 : m.primary}"]`;
      } else sel = `[data-admin-field="${target.field}"]`;
      nextTick(() => {
        var _a3;
        const root = (void 0).querySelector(sel);
        root == null ? void 0 : root.scrollIntoView({ block: "center" });
        (_a3 = root == null ? void 0 : root.querySelector("input,select,textarea,button")) == null ? void 0 : _a3.focus();
      });
    }
    async function transition(to) {
      const res = await request(`${m.endpoint}/${item.value.id}/transition`, { method: "POST", body: { to } });
      if (dirty.value) item.value = res.data;
      else replaceFrom(res.data);
      toast.success(t("admin.workflow.done"));
    }
    async function schedule(iso) {
      const res = await request(`${m.endpoint}/${item.value.id}/schedule`, { method: "POST", body: { publish_at: iso } });
      if (dirty.value) item.value = res.data;
      else replaceFrom(res.data);
      toast.success(t("admin.workflow.scheduled"));
    }
    async function remove() {
      try {
        await request(`${m.endpoint}/${item.value.id}`, { method: "DELETE" });
        toast.success(t("admin.content.deleted"));
        emit("deleted");
      } catch (e) {
        confirmDelete.value = false;
        formError.value = isApiError(e) ? e.message : t("errors.generic");
      }
    }
    const canDelete = computed(() => !creating.value && ["draft", "archived"].includes(status.value) && can(`${m.permission}.delete`));
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b;
      const _component_AdminWorkflowBar = _sfc_main$6;
      const _component_UiAlert = _sfc_main$9;
      const _component_AdminProblemsChecklist = _sfc_main$8;
      const _component_UiCard = _sfc_main$a;
      const _component_AdminAttrField = _sfc_main$3;
      const _component_UiFormField = _sfc_main$b;
      const _component_UiSelect = _sfc_main$c;
      const _component_AdminFreshnessBadge = _sfc_main$d;
      const _component_AdminTranslationEditor = _sfc_main$1;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5$1;
      const _component_UiConfirmInline = _sfc_main$e;
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "space-y-6",
        novalidate: ""
      }, _attrs))}>`);
      if (item.value) {
        _push(ssrRenderComponent(_component_AdminWorkflowBar, {
          status: status.value,
          allowed: (_a2 = item.value.allowed_transitions) != null ? _a2 : [],
          prefix: unref(m).permission,
          can: unref(can),
          "publish-at": item.value.publish_at,
          "created-by-me": item.value.created_by === ((_b = unref(auth).user) == null ? void 0 : _b.id),
          "first-required-field": unref(firstRequired),
          transition,
          schedule,
          dirty: dirty.value,
          onJump: jump
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (state.value === "readonly") {
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
      } else if (state.value === "locked") {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "info" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.content.locked"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.content.locked")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (warning.value === "review_reset") {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.content.warnReview"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.content.warnReview")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else if (warning.value === "live_revalidate") {
        _push(ssrRenderComponent(_component_UiAlert, { tone: "warning" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.content.warnLive"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.content.warnLive")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div aria-live="polite">`);
      if (problems.value.length) {
        _push(ssrRenderComponent(_component_AdminProblemsChecklist, {
          problems: problems.value,
          "first-required-field": unref(firstRequired),
          onJump: jump
        }, null, _parent));
      } else if (formError.value) {
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
      _push(ssrRenderComponent(_component_UiCard, {
        as: "section",
        "aria-labelledby": "sec-general"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 id="sec-general" class="mb-4 text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.content.general"))}</h2><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><!--[-->`);
            ssrRenderList([...unref(COMMON_FIELDS).filter((c) => !(unref(m).hideSlug && c.key === "slug")), ...unref(m).attributes], (f) => {
              _push2(ssrRenderComponent(_component_AdminAttrField, {
                key: f.key,
                modelValue: form.attrs[f.key],
                "onUpdate:modelValue": ($event) => form.attrs[f.key] = $event,
                field: f,
                error: attrError(f.key),
                disabled: disabled.value,
                class: f.relation === "offices" || ["multiselect", "textarea", "json", "blocks", "brackets"].includes(f.type) ? "sm:col-span-2" : ""
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("h2", {
                id: "sec-general",
                class: "mb-4 text-lg font-bold"
              }, toDisplayString(unref(t)("admin.content.general")), 1),
              createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                (openBlock(true), createBlock(Fragment, null, renderList([...unref(COMMON_FIELDS).filter((c) => !(unref(m).hideSlug && c.key === "slug")), ...unref(m).attributes], (f) => {
                  return openBlock(), createBlock(_component_AdminAttrField, {
                    key: f.key,
                    modelValue: form.attrs[f.key],
                    "onUpdate:modelValue": ($event) => form.attrs[f.key] = $event,
                    field: f,
                    error: attrError(f.key),
                    disabled: disabled.value,
                    class: f.relation === "offices" || ["multiselect", "textarea", "json", "blocks", "brackets"].includes(f.type) ? "sm:col-span-2" : ""
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "field", "error", "disabled", "class"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(m).place) {
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "sec-place"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 id="sec-place" class="mb-1 text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.content.place"))}</h2><p class="mb-4 text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(t)("admin.content.placeHelp"))}</p><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><div data-admin-field="region_id"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: label("region_id"),
                optional: "",
                error: attrError("region_id")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      "model-value": form.attrs.region_id,
                      options: regionOptions.value,
                      placeholder: unref(t)("admin.common.noneNational"),
                      disabled: disabled.value,
                      "onUpdate:modelValue": setRegion
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        "model-value": form.attrs.region_id,
                        options: regionOptions.value,
                        placeholder: unref(t)("admin.common.noneNational"),
                        disabled: disabled.value,
                        "onUpdate:modelValue": setRegion
                      }, null, 8, ["model-value", "options", "placeholder", "disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div data-admin-field="city_id"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UiFormField, {
                label: label("city_id"),
                optional: "",
                error: attrError("city_id")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UiSelect, {
                      "model-value": form.attrs.city_id,
                      options: cityOptions.value,
                      placeholder: unref(t)("admin.common.noneNational"),
                      disabled: disabled.value,
                      "onUpdate:modelValue": setCity
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UiSelect, {
                        "model-value": form.attrs.city_id,
                        options: cityOptions.value,
                        placeholder: unref(t)("admin.common.noneNational"),
                        disabled: disabled.value,
                        "onUpdate:modelValue": setCity
                      }, null, 8, ["model-value", "options", "placeholder", "disabled"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("h2", {
                  id: "sec-place",
                  class: "mb-1 text-lg font-bold"
                }, toDisplayString(unref(t)("admin.content.place")), 1),
                createVNode("p", { class: "mb-4 text-sm text-muted" }, toDisplayString(unref(t)("admin.content.placeHelp")), 1),
                createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                  createVNode("div", { "data-admin-field": "region_id" }, [
                    createVNode(_component_UiFormField, {
                      label: label("region_id"),
                      optional: "",
                      error: attrError("region_id")
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          "model-value": form.attrs.region_id,
                          options: regionOptions.value,
                          placeholder: unref(t)("admin.common.noneNational"),
                          disabled: disabled.value,
                          "onUpdate:modelValue": setRegion
                        }, null, 8, ["model-value", "options", "placeholder", "disabled"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"])
                  ]),
                  createVNode("div", { "data-admin-field": "city_id" }, [
                    createVNode(_component_UiFormField, {
                      label: label("city_id"),
                      optional: "",
                      error: attrError("city_id")
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UiSelect, {
                          "model-value": form.attrs.city_id,
                          options: cityOptions.value,
                          placeholder: unref(t)("admin.common.noneNational"),
                          disabled: disabled.value,
                          "onUpdate:modelValue": setCity
                        }, null, 8, ["model-value", "options", "placeholder", "disabled"])
                      ]),
                      _: 1
                    }, 8, ["label", "error"])
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
      if (!unref(m).noSource) {
        _push(ssrRenderComponent(_component_UiCard, {
          as: "section",
          "aria-labelledby": "sec-source"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b2, _c, _d;
            if (_push2) {
              _push2(`<div class="mb-4 flex flex-wrap items-center justify-between gap-2"${_scopeId}><h2 id="sec-source" class="text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.content.source"))}</h2>`);
              if (item.value) {
                _push2(ssrRenderComponent(_component_AdminFreshnessBadge, {
                  freshness: (_b2 = (_a3 = item.value.source) == null ? void 0 : _a3.freshness) != null ? _b2 : "unverified"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><p class="mb-4 text-sm text-muted"${_scopeId}>${ssrInterpolate(unref(m).sourceRequired ? unref(t)("admin.content.sourceRequired") : unref(t)("admin.content.sourceOptional"))}</p><div class="grid gap-4 sm:grid-cols-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(SOURCE_FIELDS), (f) => {
                _push2(ssrRenderComponent(_component_AdminAttrField, {
                  key: f.key,
                  modelValue: form.attrs[f.key],
                  "onUpdate:modelValue": ($event) => form.attrs[f.key] = $event,
                  field: f,
                  error: attrError(f.key),
                  disabled: disabled.value
                }, null, _parent2, _scopeId));
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "mb-4 flex flex-wrap items-center justify-between gap-2" }, [
                  createVNode("h2", {
                    id: "sec-source",
                    class: "text-lg font-bold"
                  }, toDisplayString(unref(t)("admin.content.source")), 1),
                  item.value ? (openBlock(), createBlock(_component_AdminFreshnessBadge, {
                    key: 0,
                    freshness: (_d = (_c = item.value.source) == null ? void 0 : _c.freshness) != null ? _d : "unverified"
                  }, null, 8, ["freshness"])) : createCommentVNode("", true)
                ]),
                createVNode("p", { class: "mb-4 text-sm text-muted" }, toDisplayString(unref(m).sourceRequired ? unref(t)("admin.content.sourceRequired") : unref(t)("admin.content.sourceOptional")), 1),
                createVNode("div", { class: "grid gap-4 sm:grid-cols-2" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(SOURCE_FIELDS), (f) => {
                    return openBlock(), createBlock(_component_AdminAttrField, {
                      key: f.key,
                      modelValue: form.attrs[f.key],
                      "onUpdate:modelValue": ($event) => form.attrs[f.key] = $event,
                      field: f,
                      error: attrError(f.key),
                      disabled: disabled.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "field", "error", "disabled"]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UiCard, {
        as: "section",
        "aria-labelledby": "sec-tr"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a3, _b2, _c, _d;
          if (_push2) {
            _push2(`<h2 id="sec-tr" class="mb-1 text-lg font-bold"${_scopeId}>${ssrInterpolate(unref(t)("admin.content.translations"))}</h2>`);
            if (errors.value.translations) {
              _push2(`<p class="mb-2 font-medium text-danger" role="alert"${_scopeId}>${ssrInterpolate(msg(errors.value.translations))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_AdminTranslationEditor, {
              modelValue: form.translations,
              "onUpdate:modelValue": ($event) => form.translations = $event,
              active: active.value,
              "onUpdate:active": ($event) => active.value = $event,
              fields: unref(m).translatable,
              primary: unref(m).primary,
              "required-locales": unref(m).requiredLocales,
              "missing-locales": (_b2 = (_a3 = item.value) == null ? void 0 : _a3.missing_locales) != null ? _b2 : ["ar", "en", "it"],
              errors: trErrors.value,
              disabled: disabled.value
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("h2", {
                id: "sec-tr",
                class: "mb-1 text-lg font-bold"
              }, toDisplayString(unref(t)("admin.content.translations")), 1),
              errors.value.translations ? (openBlock(), createBlock("p", {
                key: 0,
                class: "mb-2 font-medium text-danger",
                role: "alert"
              }, toDisplayString(msg(errors.value.translations)), 1)) : createCommentVNode("", true),
              createVNode(_component_AdminTranslationEditor, {
                modelValue: form.translations,
                "onUpdate:modelValue": ($event) => form.translations = $event,
                active: active.value,
                "onUpdate:active": ($event) => active.value = $event,
                fields: unref(m).translatable,
                primary: unref(m).primary,
                "required-locales": unref(m).requiredLocales,
                "missing-locales": (_d = (_c = item.value) == null ? void 0 : _c.missing_locales) != null ? _d : ["ar", "en", "it"],
                errors: trErrors.value,
                disabled: disabled.value
              }, null, 8, ["modelValue", "onUpdate:modelValue", "active", "onUpdate:active", "fields", "primary", "required-locales", "missing-locales", "errors", "disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (item.value) {
        _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.content.updatedAt", { date: unref(formatDateTime)(item.value.updated_at, unref(locale)) }))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">`);
      _push(ssrRenderComponent(_component_UiButton, {
        type: "submit",
        loading: saving.value,
        disabled: state.value !== "editable"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(creating.value ? unref(t)("admin.content.create") : unref(t)("admin.content.saveChanges"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(creating.value ? unref(t)("admin.content.create") : unref(t)("admin.content.saveChanges")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiButton, {
        variant: "secondary",
        to: `/admin/content/${unref(m).key}`
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(t)("common.cancel"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (dirty.value) {
        _push(`<span class="text-sm text-muted" role="status">${ssrInterpolate(unref(t)("admin.content.unsaved"))}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (canDelete.value && !confirmDelete.value) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "ghost",
          class: "ms-auto",
          onClick: ($event) => confirmDelete.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "trash",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("common.delete"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "trash",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("common.delete")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (confirmDelete.value) {
        _push(ssrRenderComponent(_component_UiConfirmInline, {
          message: unref(t)("admin.content.confirmDelete"),
          "confirm-label": unref(t)("common.delete"),
          onCancel: ($event) => confirmDelete.value = false,
          onConfirm: remove
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ContentForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ContentForm-BY8XCqFs.mjs.map
