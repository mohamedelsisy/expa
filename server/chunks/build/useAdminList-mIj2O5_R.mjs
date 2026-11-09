import { _ as _sfc_main$1 } from './FormField-DFtov8VK.mjs';
import { _ as _sfc_main$2 } from './TextInput-BI4efS3_.mjs';
import { _ as _sfc_main$3 } from './Select-BjjHKxeN.mjs';
import { _ as _sfc_main$4 } from './Checkbox-PDAPbGXG.mjs';
import { f as useRoute, u as useI18n, _ as _sfc_main$3$1, d as _sfc_main$5, n as navigateTo } from './server.mjs';
import { computed, defineComponent, reactive, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { p as parseListQuery, t as toApiQuery, n as nextSort, w as withPage, a as withSort, b as withFilter, c as toRouteQuery } from './DataTable--nNCrVdv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Filters",
  __ssrInlineRender: true,
  props: {
    fields: {},
    filters: {},
    label: {}
  },
  emits: ["set", "clear"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useI18n();
    const draft = reactive({});
    watch(() => props.filters, (f) => {
      var _a;
      for (const x of props.fields) draft[x.key] = (_a = f[x.key]) != null ? _a : "";
    }, { immediate: true, deep: true });
    const active = computed(() => Object.keys(props.filters).length > 0);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiFormField = _sfc_main$1;
      const _component_UiTextInput = _sfc_main$2;
      const _component_UiSelect = _sfc_main$3;
      const _component_UiCheckbox = _sfc_main$4;
      const _component_UiButton = _sfc_main$3$1;
      const _component_UiIcon = _sfc_main$5;
      _push(`<form${ssrRenderAttrs(mergeProps({
        role: "search",
        "aria-label": (_a = __props.label) != null ? _a : unref(t)("admin.common.filters"),
        class: "mb-4 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      }, _attrs))}><!--[-->`);
      ssrRenderList(__props.fields, (f) => {
        _push(`<!--[-->`);
        if (f.type === "search") {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: f.label
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  modelValue: draft[f.key],
                  "onUpdate:modelValue": ($event) => draft[f.key] = $event,
                  type: "search",
                  inputmode: "search",
                  placeholder: f.placeholder,
                  ltr: f.ltr
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextInput, {
                    modelValue: draft[f.key],
                    "onUpdate:modelValue": ($event) => draft[f.key] = $event,
                    type: "search",
                    inputmode: "search",
                    placeholder: f.placeholder,
                    ltr: f.ltr
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "ltr"])
                ];
              }
            }),
            _: 2
          }, _parent));
        } else if (f.type === "select") {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: f.label
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b, _c, _d;
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiSelect, {
                  "model-value": (_a2 = __props.filters[f.key]) != null ? _a2 : "",
                  options: (_b = f.options) != null ? _b : [],
                  placeholder: unref(t)("admin.common.all"),
                  "onUpdate:modelValue": ($event) => emit("set", f.key, $event)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiSelect, {
                    "model-value": (_c = __props.filters[f.key]) != null ? _c : "",
                    options: (_d = f.options) != null ? _d : [],
                    placeholder: unref(t)("admin.common.all"),
                    "onUpdate:modelValue": ($event) => emit("set", f.key, $event)
                  }, null, 8, ["model-value", "options", "placeholder", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
        } else if (f.type === "date") {
          _push(ssrRenderComponent(_component_UiFormField, {
            label: f.label
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b;
              if (_push2) {
                _push2(ssrRenderComponent(_component_UiTextInput, {
                  "model-value": (_a2 = __props.filters[f.key]) != null ? _a2 : "",
                  type: "date",
                  ltr: "",
                  "onUpdate:modelValue": ($event) => emit("set", f.key, $event)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UiTextInput, {
                    "model-value": (_b = __props.filters[f.key]) != null ? _b : "",
                    type: "date",
                    ltr: "",
                    "onUpdate:modelValue": ($event) => emit("set", f.key, $event)
                  }, null, 8, ["model-value", "onUpdate:modelValue"])
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_UiCheckbox, {
            "model-value": __props.filters[f.key] === "1",
            label: f.label,
            "onUpdate:modelValue": ($event) => emit("set", f.key, $event ? "1" : "")
          }, null, _parent));
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--><div class="flex flex-wrap gap-2">`);
      if (__props.fields.some((f) => f.type === "search")) {
        _push(ssrRenderComponent(_component_UiButton, { type: "submit" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiIcon, {
                name: "search",
                size: 18
              }, null, _parent2, _scopeId));
              _push2(`${ssrInterpolate(unref(t)("admin.common.search"))}`);
            } else {
              return [
                createVNode(_component_UiIcon, {
                  name: "search",
                  size: 18
                }),
                createTextVNode(toDisplayString(unref(t)("admin.common.search")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (active.value) {
        _push(ssrRenderComponent(_component_UiButton, {
          variant: "secondary",
          onClick: ($event) => emit("clear")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("admin.common.clear"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("admin.common.clear")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/Filters.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
function useAdminList(cfg) {
  const route = useRoute();
  const state = computed(() => parseListQuery(route.query, cfg));
  const apiQuery = computed(() => toApiQuery(state.value, cfg));
  const go = (next, replace = false) => navigateTo({ path: route.path, query: toRouteQuery(next, cfg) }, { replace });
  return {
    state,
    apiQuery,
    hasFilters: computed(() => Object.keys(state.value.filters).length > 0),
    setFilter: (key, value) => go(withFilter(state.value, key, value), true),
    setSort: (column) => go(withSort(state.value, column)),
    setPage: (page) => go(withPage(state.value, page)),
    clear: () => go({ page: 1, sort: cfg.defaultSort, filters: {} }),
    nextSort
  };
}

export { _sfc_main as _, useAdminList as u };
//# sourceMappingURL=useAdminList-mIj2O5_R.mjs.map
