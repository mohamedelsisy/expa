import { u as useAdminSeo, _ as _sfc_main$2 } from './useAdminSeo-DuRYEU0h.mjs';
import { u as useAdminList, _ as _sfc_main$3 } from './useAdminList-mIj2O5_R.mjs';
import { _ as _sfc_main$4 } from './Skeleton-BTnKIEst.mjs';
import { u as useI18n, g as useApi, i as _sfc_main$2$1, j as isApiError, h as formatDateTime } from './server.mjs';
import { _ as _sfc_main$5 } from './EmptyState-N2xvHts8.mjs';
import { _ as _sfc_main$6 } from './DataTable--nNCrVdv.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, openBlock, createBlock, Fragment, renderList, createVNode, toDisplayString, createTextVNode, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _sfc_main$7 } from './Pagination-DA28GIFv.mjs';
import { u as useAsyncData } from './asyncData-bKJD5Wmv.mjs';
import './Breadcrumbs-C7SaJcTR.mjs';
import './useSeo-BU4sLOnV.mjs';
import './safe-B2eSdAXJ.mjs';
import './FormField-DFtov8VK.mjs';
import './TextInput-BI4efS3_.mjs';
import './Select-BjjHKxeN.mjs';
import './Checkbox-PDAPbGXG.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChangeValue",
  __ssrInlineRender: true,
  props: {
    v: {}
  },
  setup(__props) {
    const { t } = useI18n();
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.v.type === "redacted") {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "text-muted" }, _attrs))}>${ssrInterpolate(unref(t)("admin.audit.redacted"))}</span>`);
      } else if (__props.v.type === "null") {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "text-muted" }, _attrs))}>${ssrInterpolate(unref(t)("admin.audit.empty"))}</span>`);
      } else if (__props.v.type === "bool") {
        _push(`<span${ssrRenderAttrs(_attrs)}>${ssrInterpolate(unref(t)(__props.v.value ? "admin.common.true" : "admin.common.false"))}</span>`);
      } else {
        _push(`<span${ssrRenderAttrs(mergeProps({
          dir: "auto",
          class: "rounded-sm bg-sunken px-1"
        }, _attrs))}>${ssrInterpolate(__props.v.text)}</span>`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ChangeValue.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SENSITIVE = /pass(word)?|token|secret|authorization|api[_-]?key|cookie|otp|signature|credential|header|\bcode\b|hash/i;
const isSensitiveKey = (key) => SENSITIVE.test(key);
function disp(v, key) {
  if (isSensitiveKey(key)) return { type: "redacted" };
  if (v === null || v === void 0 || v === "") return { type: "null" };
  if (typeof v === "boolean") return { type: "bool", value: v };
  if (typeof v === "number") return { type: "text", text: String(v) };
  if (typeof v === "string") return { type: "text", text: v.length > 200 ? `${v.slice(0, 200)}\u2026` : v };
  if (Array.isArray(v)) {
    const parts = v.filter((x) => ["string", "number"].includes(typeof x)).map(String);
    return parts.length === v.length ? { type: "text", text: parts.join(", ") || "" } : { type: "text", text: `[${v.length}]` };
  }
  return { type: "text", text: "{\u2026}" };
}
const isDiff = (v) => typeof v === "object" && v !== null && !Array.isArray(v) && ("old" in v || "new" in v) && Object.keys(v).every((k) => k === "old" || k === "new");
function formatChanges(changes, depth = 0, prefix = "") {
  if (changes === null || typeof changes !== "object" || Array.isArray(changes)) return [];
  const rows = [];
  for (const [k, v] of Object.entries(changes)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isDiff(v)) rows.push({ key, mode: "diff", old: disp(v.old, k), new: disp(v.new, k) });
    else if (v && typeof v === "object" && !Array.isArray(v) && depth < 2 && !isSensitiveKey(k)) rows.push(...formatChanges(v, depth + 1, key));
    else rows.push({ key, mode: "value", new: disp(v, k) });
  }
  return rows;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, te, locale } = useI18n();
    const { request } = useApi();
    useAdminSeo(() => t("admin.audit.title"));
    const list = useAdminList({ filterKeys: ["action", "actor_id", "subject_type", "subject_id", "from", "to"], defaultSort: "-id", defaultPerPage: 25 });
    const { data, error, refresh, status: st } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("admin-audit", () => request("admin/audit-logs", { query: Object.fromEntries(Object.entries(list.apiQuery.value).filter(([k]) => k !== "sort")) }), { watch: [list.apiQuery] })), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.data) != null ? _b : [];
    });
    const meta = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.meta;
    });
    const fields = computed(() => [
      { key: "action", type: "search", label: t("admin.audit.action"), placeholder: t("admin.audit.actionHelp"), ltr: true },
      { key: "actor_id", type: "search", label: t("admin.audit.actor"), ltr: true },
      { key: "subject_type", type: "search", label: t("admin.audit.subjectType"), ltr: true },
      { key: "subject_id", type: "search", label: t("admin.audit.subjectId"), ltr: true },
      { key: "from", type: "date", label: t("admin.dash.from") },
      { key: "to", type: "date", label: t("admin.dash.to") }
    ]);
    const cols = computed(() => [{ key: "created_at", label: t("admin.audit.when") }, { key: "action", label: t("admin.audit.action") }, { key: "actor_id", label: t("admin.audit.actor") }, { key: "subject", label: t("admin.audit.subject") }, { key: "changes", label: t("admin.audit.changes") }]);
    const actionLabel = (a) => {
      const k = `admin.audit.actions.${a.replace(/\./g, "_")}`;
      return te(k) ? t(k) : a;
    };
    const rowsOf = (c) => formatChanges(c);
    const keyLabel = (k) => te(`admin.audit.keys.${k}`) ? t(`admin.audit.keys.${k}`) : k;
    const subject = (l) => {
      var _a;
      return l.subject_type ? `${l.subject_type.split("\\").pop()} #${(_a = l.subject_id) != null ? _a : ""}` : "\u2014";
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_AdminPageHeader = _sfc_main$2;
      const _component_AdminFilters = _sfc_main$3;
      const _component_UiSkeleton = _sfc_main$4;
      const _component_UiErrorState = _sfc_main$2$1;
      const _component_UiEmptyState = _sfc_main$5;
      const _component_AdminDataTable = _sfc_main$6;
      const _component_AdminChangeValue = _sfc_main$1;
      const _component_UiPagination = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(t)("admin.audit.title"),
        description: unref(t)("admin.audit.subtitle"),
        crumbs: [{ label: unref(t)("admin.title"), to: "/admin" }, { label: unref(t)("admin.audit.title") }]
      }, null, _parent));
      _push(ssrRenderComponent(_component_AdminFilters, {
        fields: unref(fields),
        filters: unref(list).state.value.filters,
        onSet: unref(list).setFilter,
        onClear: unref(list).clear
      }, null, _parent));
      if (unref(st) === "pending" && !unref(data)) {
        _push(ssrRenderComponent(_component_UiSkeleton, { lines: 6 }, null, _parent));
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UiErrorState, {
          message: unref(isApiError)(unref(error)) ? unref(error).message : void 0,
          retry: "",
          onRetry: ($event) => unref(refresh)()
        }, null, _parent));
      } else if (!unref(rows).length) {
        _push(ssrRenderComponent(_component_UiEmptyState, {
          title: unref(t)("admin.common.noResults"),
          description: unref(t)("admin.common.noResultsHelp"),
          icon: "list"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminDataTable, {
          columns: unref(cols),
          rows: unref(rows),
          "row-key": "id",
          caption: unref(t)("admin.audit.title")
        }, {
          "cell-created_at": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<time${ssrRenderAttr("datetime", (_a2 = row.created_at) != null ? _a2 : void 0)} class="text-sm"${_scopeId}>${ssrInterpolate(unref(formatDateTime)(row.created_at, unref(locale)))}</time>`);
            } else {
              return [
                createVNode("time", {
                  datetime: (_b2 = row.created_at) != null ? _b2 : void 0,
                  class: "text-sm"
                }, toDisplayString(unref(formatDateTime)(row.created_at, unref(locale))), 9, ["datetime"])
              ];
            }
          }),
          "cell-action": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-medium"${_scopeId}>${ssrInterpolate(actionLabel(row.action))}</span><span class="block text-xs text-muted" dir="ltr"${_scopeId}>${ssrInterpolate(row.action)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-medium" }, toDisplayString(actionLabel(row.action)), 1),
                createVNode("span", {
                  class: "block text-xs text-muted",
                  dir: "ltr"
                }, toDisplayString(row.action), 1)
              ];
            }
          }),
          "cell-actor_id": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span dir="ltr"${_scopeId}>${ssrInterpolate((_a2 = row.actor_id) != null ? _a2 : unref(t)("admin.audit.system"))}</span>`);
            } else {
              return [
                createVNode("span", { dir: "ltr" }, toDisplayString((_b2 = row.actor_id) != null ? _b2 : unref(t)("admin.audit.system")), 1)
              ];
            }
          }),
          "cell-subject": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span dir="ltr" class="text-sm"${_scopeId}>${ssrInterpolate(subject(row))}</span>`);
            } else {
              return [
                createVNode("span", {
                  dir: "ltr",
                  class: "text-sm"
                }, toDisplayString(subject(row)), 1)
              ];
            }
          }),
          "cell-changes": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (!rowsOf(row.changes).length) {
                _push2(`<span class="text-muted"${_scopeId}>\u2014</span>`);
              } else {
                _push2(`<ul class="space-y-0.5 text-sm"${_scopeId}><!--[-->`);
                ssrRenderList(rowsOf(row.changes), (c) => {
                  _push2(`<li${_scopeId}><span class="font-medium"${_scopeId}>${ssrInterpolate(keyLabel(c.key))}:</span>`);
                  if (c.mode === "diff") {
                    _push2(`<!--[-->`);
                    _push2(ssrRenderComponent(_component_AdminChangeValue, {
                      v: c.old
                    }, null, _parent2, _scopeId));
                    _push2(` <span aria-hidden="true"${_scopeId}>\u2192</span><span class="sr-only"${_scopeId}>${ssrInterpolate(unref(t)("admin.audit.to"))}</span> `);
                    _push2(ssrRenderComponent(_component_AdminChangeValue, {
                      v: c.new
                    }, null, _parent2, _scopeId));
                    _push2(`<!--]-->`);
                  } else {
                    _push2(ssrRenderComponent(_component_AdminChangeValue, {
                      v: c.new
                    }, null, _parent2, _scopeId));
                  }
                  _push2(`</li>`);
                });
                _push2(`<!--]--></ul>`);
              }
            } else {
              return [
                !rowsOf(row.changes).length ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-muted"
                }, "\u2014")) : (openBlock(), createBlock("ul", {
                  key: 1,
                  class: "space-y-0.5 text-sm"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(rowsOf(row.changes), (c) => {
                    return openBlock(), createBlock("li", {
                      key: c.key
                    }, [
                      createVNode("span", { class: "font-medium" }, toDisplayString(keyLabel(c.key)) + ":", 1),
                      c.mode === "diff" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(_component_AdminChangeValue, {
                          v: c.old
                        }, null, 8, ["v"]),
                        createTextVNode(),
                        createVNode("span", { "aria-hidden": "true" }, "\u2192"),
                        createVNode("span", { class: "sr-only" }, toDisplayString(unref(t)("admin.audit.to")), 1),
                        createTextVNode(),
                        createVNode(_component_AdminChangeValue, {
                          v: c.new
                        }, null, 8, ["v"])
                      ], 64)) : (openBlock(), createBlock(_component_AdminChangeValue, {
                        key: 1,
                        v: c.new
                      }, null, 8, ["v"]))
                    ]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-4 space-y-2 text-center">`);
        if (((_a = unref(meta)) == null ? void 0 : _a.total) !== void 0) {
          _push(`<p class="text-sm text-muted">${ssrInterpolate(unref(t)("admin.common.results", { count: unref(meta).total }))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiPagination, {
          page: (_c = (_b = unref(meta)) == null ? void 0 : _b.page) != null ? _c : 1,
          "last-page": (_e = (_d = unref(meta)) == null ? void 0 : _d.last_page) != null ? _e : 1,
          onChange: unref(list).setPage
        }, null, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/audit-logs/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CIPNgA15.mjs.map
